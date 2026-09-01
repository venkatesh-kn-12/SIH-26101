import catalogData from '../../public/content-list-data.json';
import { buildUserLearningProfile, UserLearningProfile } from './competencyService';
import { analyzeSkillGapFromProfile, SkillGapAnalysis, SkillGapItem } from './skillGapService';
import { retrieveAndRankCourses, CourseRecommendationItem, RecommendationPipelineOutput } from './qdrantRetriever';
import { CourseDocument } from './ingestionService';

export interface StructuredLLMRecommendation {
  courseId: string;
  priority: number;
  reason: string;
}

export interface StructuredRecommendationResponse {
  targetRole: string;
  userLearningProfile: UserLearningProfile;
  skillGaps: SkillGapItem[];
  retrieverSource: string;
  embeddingModel: string;
  statusMessage: string;
  llmReranked: boolean;
  recommendations: Array<{
    courseId: string;
    priority: number;
    reason: string;
    course: CourseDocument;
  }>;
}

export async function executeRecommendationPipeline(
  user: any,
  onboardingData: any,
  assessmentResults: any,
  courseProgressData: any = {}
): Promise<StructuredRecommendationResponse> {
  // 1. BUILD USER LEARNING PROFILE (Aggregating diagnostic exam, assessment, self-reported skills & quizzes)
  const learningProfile: UserLearningProfile = buildUserLearningProfile(
    user,
    onboardingData,
    assessmentResults,
    courseProgressData
  );

  // 2. CALCULATE SKILL GAPS & BUILD SEMANTIC RETRIEVAL QUERY
  const skillGapAnalysis: SkillGapAnalysis = analyzeSkillGapFromProfile(learningProfile);

  // 3. RETRIEVE CANDIDATE COURSES FROM QDRANT (Filtering out completed courses)
  const pipelineOutput: RecommendationPipelineOutput = await retrieveAndRankCourses(
    skillGapAnalysis,
    learningProfile.completedCourseIds,
    15 // candidate set limit
  );

  const candidateCourses = pipelineOutput.candidateCourses || [];
  const validCourseMap = new Map<string, CourseDocument>();
  
  candidateCourses.forEach(c => {
    validCourseMap.set(c.id.toLowerCase(), c);
    validCourseMap.set(`course-${c.numericId}`.toLowerCase(), c);
  });

  // Also index fallback catalog
  const catalogList: CourseDocument[] = (catalogData as any).content || [];
  catalogList.forEach(c => {
    if (!validCourseMap.has(c.id.toLowerCase())) {
      validCourseMap.set(c.id.toLowerCase(), c);
      validCourseMap.set(`course-${c.numericId}`.toLowerCase(), c);
    }
  });

  // 4. GROQ LLM STRUCTURED RERANKER
  let llmRecommendations: StructuredLLMRecommendation[] = [];
  let llmReranked = false;

  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || 'qwen-2.5-32b';
  const baseUrl = process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1';

  const isApiKeyValid = Boolean(apiKey && apiKey !== 'your_groq_api_key_here' && apiKey.trim().length > 0);

  if (isApiKeyValid && candidateCourses.length > 0) {
    try {
      console.log(`🤖 [LLM Reranker] Invoking Groq LLM (${model}) to rerank Qdrant candidates...`);

      const prompt = `You are a Course Recommendation Reranking Engine for StatPath AI.

User Profile Context:
- Target Career Role: ${learningProfile.targetRole}
- Identified Skill Gaps: ${JSON.stringify(skillGapAnalysis.structuredGaps, null, 2)}
- Completed / Excluded Courses: ${learningProfile.completedCourseIds.join(', ') || 'None'}

Retrieved Qdrant Candidate Courses (ONLY RERANK THESE COURSES):
${JSON.stringify(candidateCourses.map(c => ({
  courseId: c.id,
  title: c.title,
  level: c.level,
  competency: c.competency,
  description: c.description
})), null, 2)}

STRICT RERANKING RULES:
1. Select the top 5 most relevant courses from the provided candidates to help the user close their skill gaps.
2. DO NOT invent any course IDs, titles, URLs, or metadata. Every courseId in your output MUST match an exact courseId from the candidates list.
3. Return ONLY a valid JSON object matching this schema (no markdown formatting, no code blocks):

{
  "recommendations": [
    {
      "courseId": "string (exact candidate courseId)",
      "priority": number (1 to 5),
      "reason": "string (justifying why this course closes a specific skill gap)"
    }
  ]
}
`;

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are an AI reranker that outputs raw JSON objects matching the specified schema, without markdown formatting.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2,
          max_tokens: 1500
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content) {
          const jsonStr = content.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
          const parsed = JSON.parse(jsonStr);
          if (parsed && Array.isArray(parsed.recommendations)) {
            llmRecommendations = parsed.recommendations;
            llmReranked = true;
            console.log(`✅ [LLM Reranker] Groq LLM successfully reranked ${llmRecommendations.length} courses.`);
          }
        }
      }
    } catch (err: any) {
      console.warn(`⚠️ [LLM Reranker] Exception calling Groq LLM: ${err.message}. Using Qdrant candidate score ranking.`);
    }
  }

  // 5. VALIDATE LLM OUTPUT & RESOLVE COURSE OBJECTS
  const finalRecommendations: Array<{
    courseId: string;
    priority: number;
    reason: string;
    course: CourseDocument;
  }> = [];

  const addedIds = new Set<string>();

  if (llmReranked && llmRecommendations.length > 0) {
    llmRecommendations.forEach((rec, idx) => {
      const cleanId = rec.courseId.toLowerCase();
      const resolvedCourse = validCourseMap.get(cleanId);
      
      // STRICT RULE: Only accept course IDs that exist in the retrieved Qdrant candidate set!
      if (resolvedCourse && !addedIds.has(resolvedCourse.id)) {
        addedIds.add(resolvedCourse.id);
        finalRecommendations.push({
          courseId: resolvedCourse.id,
          priority: rec.priority || (idx + 1),
          reason: rec.reason || `Addresses identified skill gap for ${learningProfile.targetRole}.`,
          course: resolvedCourse
        });
      } else {
        console.warn(`⚠️ [LLM Validation] Discarded invalid or unknown courseId from LLM response: "${rec.courseId}"`);
      }
    });
  }

  // Fallback if LLM was skipped or returned empty/invalid IDs: Use Qdrant ranked candidates directly
  if (finalRecommendations.length === 0) {
    pipelineOutput.recommendations.slice(0, 5).forEach((recItem, idx) => {
      const resolvedCourse = validCourseMap.get(recItem.course_id.toLowerCase()) || {
        id: recItem.course_id,
        numericId: recItem.numericId,
        title: recItem.title,
        level: recItem.level,
        competency: recItem.competency,
        domain: recItem.domain,
        description: recItem.description
      };

      if (!addedIds.has(resolvedCourse.id)) {
        addedIds.add(resolvedCourse.id);
        finalRecommendations.push({
          courseId: resolvedCourse.id,
          priority: idx + 1,
          reason: recItem.reason,
          course: resolvedCourse
        });
      }
    });
  }

  return {
    targetRole: learningProfile.targetRole,
    userLearningProfile: learningProfile,
    skillGaps: skillGapAnalysis.structuredGaps,
    retrieverSource: pipelineOutput.retrieverSource,
    embeddingModel: pipelineOutput.embeddingModel,
    statusMessage: pipelineOutput.statusMessage,
    llmReranked,
    recommendations: finalRecommendations
  };
}

export function getOrderedRoleRecommendations(
  role: string = 'Statistical Officer',
  customAssessmentResults?: any
) {
  const rawList: CourseDocument[] = Array.isArray((catalogData as any).content)
    ? (catalogData as any).content
    : [];

  return rawList.map((c, idx) => ({
    phase: idx + 1,
    phaseName: `Phase ${idx + 1}: ${c.competency || c.domain || 'Domain Skill'}`,
    targetCompetency: c.competency || 'Core Competency',
    recommendationReason: c.description || `Builds foundational proficiency for ${c.level || 'Beginner'} level.`,
    estimatedHours: '2 Hours',
    course: {
      identifier: c.id,
      name: c.title,
      description: c.description,
      duration: '7200',
      appIcon: '',
      posterImage: '',
      primaryCategory: c.domain || 'Course',
      source: c.domain || 'Official Competency Portal',
      level: c.level,
      competency: c.competency,
      domain: c.domain
    }
  }));
}
