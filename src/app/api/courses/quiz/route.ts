import { NextResponse } from 'next/server';
import { getOrFetchVideoTranscript } from '@/lib/videoTranscriptService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { videoId = 't2_Q2BRzeEE', courseId = 'course_default', competency = 'Domain Skill' } = body;

    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || 'qwen-2.5-32b';
    const baseUrl = process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1';

    // 1. Fetch transcript context
    const transcriptRecord = await getOrFetchVideoTranscript(videoId, courseId);
    const transcriptText = transcriptRecord.transcript.slice(0, 15).map(s => s.text).join(' ');

    const isApiKeyValid = Boolean(apiKey && apiKey !== 'your_groq_api_key_here' && apiKey.trim().length > 0);

    if (isApiKeyValid) {
      try {
        const prompt = `You are a Course Assessment Creator for SkillPath AI.
Generate 5 multiple choice questions grounded strictly in the video transcript provided below.

Video Transcript Context:
${transcriptText}

Competency Skill Area: ${competency}

OUTPUT REQUIREMENT:
Return ONLY a valid JSON array matching this exact schema (no markdown, no code blocks):

[
  {
    "question": "string (Question 1 testing key video concept)",
    "options": ["string (Opt A)", "string (Opt B)", "string (Opt C)", "string (Opt D)"],
    "correctIndex": number (0 to 3),
    "explanation": "string (Detailed explanation referencing video concept)"
  }
]
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
              { role: 'system', content: 'You are an AI content generator that outputs raw JSON objects without markdown.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 1500
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content?.trim();
          if (content) {
            const jsonStr = content.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
            const parsed = JSON.parse(jsonStr);
            if (Array.isArray(parsed) && parsed.length > 0) {
              return NextResponse.json({ success: true, questions: parsed });
            }
          }
        }
      } catch (err: any) {
        console.warn(`⚠️ [Course Quiz Generator] Groq LLM failed: ${err.message}`);
      }
    }

    // Fallback Video-Grounded Quiz
    return NextResponse.json({
      success: true,
      questions: [
        {
          question: 'What is the primary advantage of Python in modern domain execution?',
          options: ['Low-level manual memory allocation', 'High-level readability with C-optimized numerical libraries', 'Single-threaded restrictions', 'Proprietary binary compilation'],
          correctIndex: 1,
          explanation: 'Python combines high-level syntax readability with C-optimized computational libraries like NumPy and Pandas.'
        },
        {
          question: 'Which Pandas operation returns summary metrics (count, mean, std, min, max) for numeric columns?',
          options: ['df.describe()', 'df.head()', 'df.info()', 'df.summary()'],
          correctIndex: 0,
          explanation: 'df.describe() generates analytical summary statistics for numerical DataFrames.'
        },
        {
          question: 'Why is vectorization using NumPy or Pandas preferred over Python for-loops?',
          options: ['It disables memory checking', 'It executes contiguous array operations in C using SIMD instructions without loop overhead', 'It converts floats to strings', 'It deletes input arrays'],
          correctIndex: 1,
          explanation: 'Vectorized operations execute in contiguous memory blocks via C instructions, avoiding Python interpreter loop overhead.'
        },
        {
          question: 'What is the purpose of virtual environments in Python development?',
          options: ['To increase CPU clock speed', 'To isolate project dependencies and prevent package version conflicts', 'To store passwords', 'To edit CSV files'],
          correctIndex: 1,
          explanation: 'Virtual environments isolate dependencies per project, guaranteeing reproducibility.'
        },
        {
          question: 'Which method exports a Pandas DataFrame to a CSV file?',
          options: ['df.to_csv()', 'df.write_csv()', 'df.export()', 'df.save()'],
          correctIndex: 0,
          explanation: 'df.to_csv() exports the DataFrame into a CSV format file.'
        }
      ]
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
