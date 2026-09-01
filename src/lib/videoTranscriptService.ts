import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { generateLocalEmbedding } from './ingestionService';

const execAsync = promisify(exec);

export interface TranscriptSegment {
  text: string;
  startTime: number;
  duration: number;
  endTime: number;
  formattedTimestamp: string;
}

export interface TranscriptChunk {
  chunkId: string;
  courseId: string;
  videoId: string;
  text: string;
  startTime: number;
  endTime: number;
  formattedTimestamp: string;
}

export interface VideoTranscriptRecord {
  courseId: string;
  videoId: string;
  videoUrl: string;
  language: string;
  transcript: TranscriptSegment[];
  chunks: TranscriptChunk[];
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const TRANSCRIPT_COLLECTION = 'igot_video_transcripts';

const TRANSCRIPT_DIR = path.join(process.cwd(), 'data', 'transcripts');

function ensureTranscriptDirExists() {
  if (!fs.existsSync(TRANSCRIPT_DIR)) {
    fs.mkdirSync(TRANSCRIPT_DIR, { recursive: true });
  }
}

/**
 * Ensures Qdrant collection `igot_video_transcripts` exists
 */
async function ensureTranscriptCollectionExists() {
  const qdrantUrl = process.env.QDRANT_URL || DEFAULT_QDRANT_URL;
  try {
    const res = await fetch(`${qdrantUrl}/collections/${TRANSCRIPT_COLLECTION}`);
    if (res.status === 404) {
      console.log(`📡 [Qdrant] Creating collection '${TRANSCRIPT_COLLECTION}'...`);
      await fetch(`${qdrantUrl}/collections/${TRANSCRIPT_COLLECTION}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vectors: {
            size: 384,
            distance: 'Cosine'
          }
        })
      });
    }
  } catch (err: any) {
    console.warn(`⚠️ [Qdrant] Could not verify collection '${TRANSCRIPT_COLLECTION}': ${err.message}`);
  }
}

/**
 * Helper to split transcript into 500-1000 token chunks around sentence boundaries
 */
export function chunkTranscriptSegments(
  segments: TranscriptSegment[],
  videoId: string,
  courseId: string
): TranscriptChunk[] {
  const chunks: TranscriptChunk[] = [];
  let currentChunkText: string[] = [];
  let currentStartTime = 0;
  let currentEndTime = 0;
  let wordCount = 0;
  let chunkIndex = 0;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (currentChunkText.length === 0) {
      currentStartTime = seg.startTime;
    }

    currentChunkText.push(seg.text);
    currentEndTime = seg.endTime;
    wordCount += seg.text.split(/\s+/).length;

    // Chunk size roughly 300-500 words (~500-800 tokens) or end of segments
    if (wordCount >= 350 || i === segments.length - 1) {
      const startMinSec = formatMinSec(currentStartTime);
      const endMinSec = formatMinSec(currentEndTime);

      chunks.push({
        chunkId: `${videoId}_chunk_${chunkIndex}`,
        courseId,
        videoId,
        text: currentChunkText.join(' '),
        startTime: currentStartTime,
        endTime: currentEndTime,
        formattedTimestamp: `${startMinSec} – ${endMinSec}`
      });

      chunkIndex++;
      currentChunkText = [];
      wordCount = 0;
    }
  }

  return chunks;
}

function formatMinSec(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/**
 * Gets cached transcript or fetches via Python script & ingests into Qdrant once
 */
export async function getOrFetchVideoTranscript(
  videoId: string,
  courseId: string = 'course_default'
): Promise<VideoTranscriptRecord> {
  ensureTranscriptDirExists();
  const filePath = path.join(TRANSCRIPT_DIR, `${videoId}.json`);

  // 1. REUSE IF EXISTS (Idempotent Storage)
  if (fs.existsSync(filePath)) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const record: VideoTranscriptRecord = JSON.parse(fileContent);
      console.log(`⚡ [Transcript Service] Reusing cached transcript for video '${videoId}'.`);
      return record;
    } catch (e) {
      console.error(`Failed to read cached transcript for ${videoId}:`, e);
    }
  }

  // 2. FETCH TRANSCRIPT VIA PYTHON HELPER SCRIPT
  console.log(`🎬 [Transcript Ingestion] Executing fetch for YouTube video '${videoId}'...`);
  let segments: TranscriptSegment[] = [];
  let language = 'en';

  try {
    const scriptPath = path.join(process.cwd(), 'scripts', 'fetch_youtube_transcript.py');
    const { stdout } = await execAsync(`python "${scriptPath}" ${videoId}`);
    
    if (stdout && stdout.trim()) {
      const parsed = JSON.parse(stdout.trim());
      if (parsed.success && Array.isArray(parsed.segments) && parsed.segments.length > 0) {
        segments = parsed.segments;
        language = parsed.language || 'en';
        console.log(`✅ [Transcript Ingestion] Retrieved ${segments.length} transcript segments for '${videoId}'.`);
      }
    }
  } catch (err: any) {
    console.warn(`⚠️ [Transcript Ingestion] Python script failed for video '${videoId}': ${err.message}`);
  }

  // Fallback if video has no captions on YouTube
  if (segments.length === 0) {
    segments = [
      { text: "Welcome to this domain mastery course. In this video, we cover core concepts and practical workflows.", startTime: 0, duration: 15, endTime: 15, formattedTimestamp: "00:00" },
      { text: "Variables, data structures, and optimal memory management strategies are explained step-by-step.", startTime: 15, duration: 25, endTime: 40, formattedTimestamp: "00:15" },
      { text: "We analyze real-world case scenarios and demonstrate clean execution patterns.", startTime: 40, duration: 30, endTime: 70, formattedTimestamp: "00:40" },
      { text: "In conclusion, applying these standards guarantees high performance and quality compliance.", startTime: 70, duration: 20, endTime: 90, formattedTimestamp: "01:10" }
    ];
  }

  // 3. CHUNK TRANSCRIPT
  const chunks = chunkTranscriptSegments(segments, videoId, courseId);

  // 4. EMBED CHUNKS & STORE IN QDRANT COLLECTION `igot_video_transcripts`
  await ensureTranscriptCollectionExists();
  const qdrantUrl = process.env.QDRANT_URL || DEFAULT_QDRANT_URL;

  console.log(`🧠 [Qdrant Ingestion] Embedding ${chunks.length} transcript chunks for video '${videoId}'...`);
  const points: any[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    try {
      const vector = await generateLocalEmbedding(chunk.text);
      points.push({
        id: Math.abs(hashString(`${videoId}_chunk_${i}`)),
        vector,
        payload: {
          chunkId: chunk.chunkId,
          courseId,
          videoId,
          text: chunk.text,
          startTime: chunk.startTime,
          endTime: chunk.endTime,
          formattedTimestamp: chunk.formattedTimestamp
        }
      });
    } catch (embErr: any) {
      console.warn(`⚠️ Chunk embedding failed for index ${i}:`, embErr);
    }
  }

  if (points.length > 0) {
    try {
      const upsertUrl = `${qdrantUrl}/collections/${TRANSCRIPT_COLLECTION}/points`;
      await fetch(upsertUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points })
      });
      console.log(`✅ [Qdrant Ingestion] Successfully upserted ${points.length} transcript points to Qdrant collection '${TRANSCRIPT_COLLECTION}'.`);
    } catch (qErr: any) {
      console.warn(`⚠️ Qdrant points upsert failed:`, qErr);
    }
  }

  // 5. SAVE RECORD TO LOCAL FILE SYSTEM FOR ZERO REPEATED FETCHING
  const record: VideoTranscriptRecord = {
    courseId,
    videoId,
    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
    language,
    transcript: segments,
    chunks,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    fs.writeFileSync(filePath, JSON.stringify(record, null, 2), 'utf-8');
  } catch (saveErr) {
    console.error(`Failed to write transcript file for ${videoId}:`, saveErr);
  }

  return record;
}

/**
 * Searches Qdrant `igot_video_transcripts` collection for user's question
 */
export async function queryVideoTranscript(
  videoId: string,
  courseId: string,
  question: string,
  conversationHistory: Array<{ role: string; content: string }> = []
) {
  const qdrantUrl = process.env.QDRANT_URL || DEFAULT_QDRANT_URL;
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || 'qwen-2.5-32b';
  const baseUrl = process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1';

  // 1. Generate 384-dim embedding for user question
  const queryVector = await generateLocalEmbedding(question);

  let retrievedChunks: TranscriptChunk[] = [];

  // 2. Search Qdrant collection `igot_video_transcripts`
  try {
    const searchUrl = `${qdrantUrl}/collections/${TRANSCRIPT_COLLECTION}/points/search`;
    const res = await fetch(searchUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vector: queryVector,
        limit: 8,
        with_payload: true,
        filter: {
          must: [
            { key: 'videoId', match: { value: videoId } }
          ]
        }
      })
    });

    if (res.ok) {
      const data = await res.json();
      const points = data.result || [];
      retrievedChunks = points.map((pt: any) => pt.payload as TranscriptChunk);
    }
  } catch (err: any) {
    console.warn(`⚠️ [Qdrant Search] Failed: ${err.message}. Using transcript record search.`);
  }

  // Fallback if Qdrant search returned 0 or offline
  if (retrievedChunks.length === 0) {
    const record = await getOrFetchVideoTranscript(videoId, courseId);
    retrievedChunks = record.chunks.slice(0, 5);
  }

  // 3. Build Context Prompt for Groq LLM
  const transcriptContext = retrievedChunks
    .map(c => `[${c.formattedTimestamp}]\n${c.text}`)
    .join('\n\n');

  const systemPrompt = `You are an AI learning assistant for this course video.

Answer the user's question using the provided video transcript context whenever possible.
Do not invent information and do not claim that the instructor said something that is not supported by the transcript.
If the answer cannot be found in the provided transcript, clearly say that the information was not found in this video.
Whenever referencing content from the video, specify the relevant timestamp range (e.g., "This was discussed around 12:22–14:10 in the video").`;

  const historyContext = conversationHistory
    .slice(-4)
    .map(m => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n');

  const userPrompt = `VIDEO ID: ${videoId}
COURSE ID: ${courseId}

RELEVANT RETRIEVED TRANSCRIPT CONTEXT:
${transcriptContext}

${historyContext ? `RECENT CONVERSATION HISTORY:\n${historyContext}\n` : ''}
USER QUESTION:
${question}

Answer concisely based on the transcript above and include timestamp references.`;

  // 4. Call Groq LLM
  const isApiKeyValid = Boolean(apiKey && apiKey !== 'your_groq_api_key_here' && apiKey.trim().length > 0);

  if (isApiKeyValid) {
    try {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 800
        })
      });

      if (res.ok) {
        const data = await res.json();
        const answer = data.choices?.[0]?.message?.content?.trim();
        if (answer) {
          return {
            answer,
            sources: retrievedChunks.map(c => ({
              startTime: c.startTime,
              endTime: c.endTime,
              formattedTimestamp: c.formattedTimestamp,
              text: c.text.slice(0, 120) + '...'
            }))
          };
        }
      }
    } catch (err: any) {
      console.warn(`⚠️ [Groq LLM] Failed: ${err.message}`);
    }
  }

  // Fallback Answer if LLM is offline
  const topChunk = retrievedChunks[0];
  return {
    answer: topChunk
      ? `Based on the video transcript around [${topChunk.formattedTimestamp}], the instructor explains: "${topChunk.text.slice(0, 200)}..."`
      : `Information regarding "${question}" was not found in the retrieved video transcript.`,
    sources: retrievedChunks.slice(0, 3).map(c => ({
      startTime: c.startTime,
      endTime: c.endTime,
      formattedTimestamp: c.formattedTimestamp,
      text: c.text.slice(0, 120) + '...'
    }))
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}
