export interface CourseDocument {
  id: string;
  numericId: number;
  title: string;
  level: string;
  competency: string;
  domain: string;
  description: string;
  embedText?: string;
}

const DEFAULT_QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const DEFAULT_COLLECTION = process.env.QDRANT_COLLECTION || 'igot_courses';
const DEFAULT_SOURCE_URL = process.env.COURSE_SOURCE_URL || 'https://sih-project-4v4d.onrender.com/api/domains';

/**
 * Generates local 384-dimensional dense embeddings using @xenova/transformers (sentence-transformers/all-MiniLM-L6-v2)
 */
let extractorPipeline: any = null;

export async function generateLocalEmbedding(text: string): Promise<number[]> {
  try {
    if (typeof window === 'undefined') {
      if (!extractorPipeline) {
        const { pipeline } = await import('@xenova/transformers');
        extractorPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      }
      const output = await extractorPipeline(text, { pooling: 'mean', normalize: true });
      return Array.from(output.data);
    }
    return generateDeterministicVector(text, 384);
  } catch (error) {
    console.warn('Xenova local embedding fallback triggered:', error);
    return generateDeterministicVector(text, 384);
  }
}

function generateDeterministicVector(text: string, dimensions: number = 384): number[] {
  const vector = new Array(dimensions).fill(0);
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const index = (charCode * 31 + i) % dimensions;
    vector[index] = (vector[index] + (charCode / 255)) % 1;
  }
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
  return vector.map(val => Number((val / magnitude).toFixed(6)));
}

/**
 * Fetches course data from source API, parses domain structure, updates content-list-data.json,
 * generates local embeddings, and upserts into Qdrant.
 */
export async function runCourseIngestion() {
  const sourceUrl = process.env.COURSE_SOURCE_URL || DEFAULT_SOURCE_URL;
  const qdrantUrl = process.env.QDRANT_URL || DEFAULT_QDRANT_URL;
  const collectionName = process.env.QDRANT_COLLECTION || DEFAULT_COLLECTION;

  console.log(`[Ingestion] Fetching courses from source API: ${sourceUrl}`);
  const res = await fetch(sourceUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch course data from ${sourceUrl}: ${res.statusText}`);
  }

  const domainsData = await res.json();
  const courses: CourseDocument[] = [];

  if (Array.isArray(domainsData)) {
    domainsData.forEach((domain: any) => {
      const domainName = domain.domainName || domain.domainId || 'General';
      const competencies = domain.competencies || [];
      competencies.forEach((comp: any) => {
        const compName = comp.competencyName || comp.competencyId || 'General Skill';
        const compCourses = comp.courses || [];
        compCourses.forEach((c: any) => {
          courses.push({
            id: c.id || `course-${c.numericId || courses.length + 1}`,
            numericId: c.numericId || courses.length + 1,
            title: c.title || 'Untitled Course',
            level: c.level || 'Beginner',
            competency: c.competency || compName,
            domain: c.domain || domainName,
            description: c.description || ''
          });
        });
      });
    });
  }

  console.log(`[Ingestion] Parsed ${courses.length} courses from API.`);

  // 1. Completely replace legacy public/content-list-data.json in Node/Server environment
  if (typeof window === 'undefined') {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const jsonPath = path.join(process.cwd(), 'public', 'content-list-data.json');
      fs.writeFileSync(jsonPath, JSON.stringify({ content: courses }, null, 2), 'utf-8');
      console.log(`[Ingestion] Successfully replaced public/content-list-data.json with ${courses.length} domain courses.`);
    } catch (err) {
      console.error('[Ingestion] Failed to write content-list-data.json:', err);
    }
  }

  // 2. Qdrant Vector Store Upsert
  let qdrantConnected = false;
  try {
    const collectionUrl = `${qdrantUrl}/collections/${collectionName}`;
    const checkRes = await fetch(collectionUrl);

    if (!checkRes.ok) {
      console.log(`[Ingestion] Creating Qdrant collection '${collectionName}' at ${qdrantUrl}...`);
      const createRes = await fetch(collectionUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vectors: {
            size: 384,
            distance: 'Cosine'
          }
        })
      });
      if (createRes.ok) {
        console.log(`[Ingestion] Qdrant collection '${collectionName}' created.`);
      }
    }

    // Embed and upsert points
    const points = [];
    for (let idx = 0; idx < courses.length; idx++) {
      const c = courses[idx];
      const embedText = `Course Title: ${c.title}\n\nDescription: ${c.description}\n\nSkills: ${c.competency}\n\nLevel: ${c.level}\n\nCategory: ${c.domain}`;
      const vector = await generateLocalEmbedding(embedText);
      const pointId = c.numericId || (idx + 1);

      points.push({
        id: pointId,
        vector,
        payload: {
          course_id: c.id,
          numericId: c.numericId,
          title: c.title,
          level: c.level,
          competency: c.competency,
          domain: c.domain,
          description: c.description,
          embed_text: embedText
        }
      });
    }

    const upsertUrl = `${qdrantUrl}/collections/${collectionName}/points`;
    const upsertRes = await fetch(upsertUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ points })
    });

    if (upsertRes.ok) {
      qdrantConnected = true;
      console.log(`[Ingestion] Upserted ${points.length} vectors into Qdrant.`);
    }
  } catch (qdrantErr) {
    console.warn('[Ingestion] Qdrant connection offline or unavailable, static dataset updated:', qdrantErr);
  }

  return {
    success: true,
    totalCourses: courses.length,
    qdrantConnected,
    courses
  };
}
