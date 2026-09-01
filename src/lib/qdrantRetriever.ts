import catalogData from '../../public/content-list-data.json';
import { generateLocalEmbedding, CourseDocument } from './ingestionService';
import { SkillGapAnalysis } from './skillGapService';

export interface CourseRecommendationItem {
  course_id: string;
  numericId: number;
  title: string;
  level: string;
  competency: string;
  domain: string;
  description: string;
  reason: string;
  score?: number;
}

export interface RecommendationPipelineOutput {
  retrieverSource: string;
  embeddingModel: string;
  statusMessage: string;
  candidateCourses: CourseDocument[];
  recommendations: CourseRecommendationItem[];
}

const DEFAULT_QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const DEFAULT_COLLECTION = process.env.QDRANT_COLLECTION || 'igot_courses';
const DEFAULT_EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'sentence-transformers/all-MiniLM-L6-v2';

export async function retrieveAndRankCourses(
  analysis: SkillGapAnalysis,
  completedCourseIds: string[] = [],
  topK: number = 10
): Promise<RecommendationPipelineOutput> {
  const qdrantUrl = process.env.QDRANT_URL || DEFAULT_QDRANT_URL;
  const collectionName = process.env.QDRANT_COLLECTION || DEFAULT_COLLECTION;

  console.log(`\n==================================================`);
  console.log(`🧠 [Local Embeddings] Generating 384-dim dense vector for semantic query...`);
  console.log(`   Model: ${DEFAULT_EMBEDDING_MODEL}`);
  console.log(`   Target Goal: ${analysis.career_goal}`);
  console.log(`   Identified Skill Gaps: ${analysis.skill_gaps.join(', ')}`);
  console.log(`   Completed Course Exclusions: ${completedCourseIds.length > 0 ? completedCourseIds.join(', ') : 'None'}`);

  const queryVector = await generateLocalEmbedding(analysis.semantic_query);
  console.log(`   Vector generated successfully (Dimensions: ${queryVector.length}).`);

  let candidatePoints: Array<{ id: any; score: number; payload: any }> = [];
  let retrieverSource = 'Qdrant Vector Database';
  let isQdrantSuccess = false;

  // 1. QUERY QDRANT VECTOR STORE FOR CANDIDATES (Retrieve top 15-20)
  try {
    const searchUrl = `${qdrantUrl}/collections/${collectionName}/points/search`;
    console.log(`📡 [Qdrant Vector Store] Searching collection '${collectionName}' at ${qdrantUrl}...`);

    const res = await fetch(searchUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vector: queryVector,
        limit: 20,
        with_payload: true
      })
    });

    if (res.ok) {
      const data = await res.json();
      candidatePoints = data.result || [];
      isQdrantSuccess = candidatePoints.length > 0;
      console.log(`✅ [Qdrant Vector Store] Successfully retrieved ${candidatePoints.length} candidate courses from Qdrant vector database.`);
    } else {
      console.warn(`⚠️ [Qdrant Vector Store] Search returned HTTP status ${res.status}: ${res.statusText}`);
    }
  } catch (err: any) {
    console.warn(`\n==================================================`);
    console.warn(`⚠️ [Qdrant Vector Store] Qdrant connection offline at ${qdrantUrl}: ${err.message}`);
    console.warn(`⚠️ Executing Fallback Catalog Search on public/content-list-data.json...`);
    console.warn(`==================================================\n`);
  }

  // 2. PARSE CANDIDATES & EXCLUDE COMPLETED COURSES
  let candidates: CourseDocument[] = [];

  if (isQdrantSuccess && candidatePoints.length > 0) {
    retrieverSource = `Qdrant Vector Database (${qdrantUrl})`;
    candidates = candidatePoints.map(pt => ({
      id: pt.payload.course_id || `course-${pt.payload.numericId}`,
      numericId: pt.payload.numericId,
      title: pt.payload.title,
      level: pt.payload.level,
      competency: pt.payload.competency,
      domain: pt.payload.domain,
      description: pt.payload.description
    }));
  } else {
    retrieverSource = `Local Ingested Catalog Fallback (Qdrant Offline)`;
    candidates = (catalogData as any).content || [];
  }

  // EXCLUDE COMPLETED COURSES
  const filteredCandidates = candidates.filter(c => {
    const isCompleted = completedCourseIds.some(
      comp => comp.toLowerCase() === c.id.toLowerCase() || comp.toLowerCase() === `course-${c.numericId}`.toLowerCase()
    );
    return !isCompleted;
  });

  console.log(`ℹ️ [Course Filter] ${candidates.length - filteredCandidates.length} completed courses excluded. ${filteredCandidates.length} candidates remaining.`);

  // 3. RANK CANDIDATES WITH PER-SKILL LEVEL AWARENESS
  const rankedCourses = rankCandidatesWithSkillGapAwareness(filteredCandidates, analysis);
  const finalTopRecommendations = rankedCourses.slice(0, topK);

  const statusMessage = isQdrantSuccess
    ? `✅ Retrieved candidate courses via Qdrant Vector Database (${qdrantUrl}).`
    : `⚠️ Qdrant offline. Retrieved candidate courses via local dataset fallback.`;

  return {
    retrieverSource,
    embeddingModel: DEFAULT_EMBEDDING_MODEL,
    statusMessage,
    candidateCourses: filteredCandidates,
    recommendations: finalTopRecommendations
  };
}

/**
 * Ranks candidate courses based on per-skill gap matching and level awareness
 */
function rankCandidatesWithSkillGapAwareness(
  candidates: CourseDocument[],
  analysis: SkillGapAnalysis
): CourseRecommendationItem[] {
  const scoredList = candidates.map(course => {
    let score = 10;
    const compNorm = (course.competency || '').toLowerCase();
    const titleNorm = (course.title || '').toLowerCase();
    const descNorm = (course.description || '').toLowerCase();
    const courseLevelNorm = (course.level || 'Beginner').toLowerCase();

    // Check match against structured skill gaps
    const matchedGapItem = analysis.structuredGaps?.find(gapItem => {
      const g = gapItem.skill.toLowerCase();
      return compNorm.includes(g) || titleNorm.includes(g) || descNorm.includes(g) ||
             g.split(' ').some(word => word.length > 3 && (titleNorm.includes(word) || compNorm.includes(word)));
    });

    let matchedGapName = matchedGapItem ? matchedGapItem.skill : '';

    if (!matchedGapItem) {
      // Secondary check against skill gaps list
      const gapMatch = analysis.skill_gaps.find(g => {
        const gl = g.toLowerCase();
        return compNorm.includes(gl) || titleNorm.includes(gl) || descNorm.includes(gl);
      });
      if (gapMatch) matchedGapName = gapMatch;
    }

    if (matchedGapName) {
      score += 35;
      if (matchedGapItem?.priority === 'high') score += 15;
    }

    // Per-Skill Level Match
    const targetLevel = matchedGapItem ? matchedGapItem.currentLevel.toLowerCase() : 'beginner';
    if (courseLevelNorm === targetLevel) score += 20;
    else if (courseLevelNorm === 'beginner' && targetLevel === 'intermediate') score += 10;
    else if (courseLevelNorm === 'advanced' && targetLevel === 'beginner') score -= 25;

    let reason = '';
    if (matchedGapName) {
      reason = `Addresses high-priority skill gap "${matchedGapName}" for your ${analysis.career_goal} role path.`;
    } else {
      reason = `Builds essential ${course.competency} knowledge aligned with your career goal.`;
    }

    return {
      course_id: course.id,
      numericId: course.numericId,
      title: course.title,
      level: course.level,
      competency: course.competency,
      domain: course.domain,
      description: course.description,
      reason,
      score
    };
  });

  scoredList.sort((a, b) => (b.score || 0) - (a.score || 0));

  const seenIds = new Set<string>();
  const uniqueRanked: CourseRecommendationItem[] = [];

  for (const item of scoredList) {
    if (!seenIds.has(item.course_id)) {
      seenIds.add(item.course_id);
      uniqueRanked.push(item);
    }
  }

  return uniqueRanked;
}
