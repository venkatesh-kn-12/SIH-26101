import { NextResponse } from 'next/server';
import { executeRecommendationPipeline } from '@/lib/recommendationEngine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      user = {},
      onboardingData = {},
      assessmentResults = {},
      courseProgressData = {}
    } = body;

    // Execute full end-to-end recommendation pipeline:
    // User Profile -> Competency Engine -> Skill Gap Analysis -> Qdrant Semantic Search -> Groq LLM Reranking -> Validated Output
    const pipelineResult = await executeRecommendationPipeline(
      user,
      onboardingData,
      assessmentResults,
      courseProgressData
    );

    return NextResponse.json(pipelineResult);
  } catch (error: any) {
    console.error('❌ [Recommendations API Error]:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Skill-Gap Course Recommendation API is active. Send POST request with user profile context.'
  });
}
