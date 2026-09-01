import { NextResponse } from 'next/server';
import { queryVideoTranscript } from '@/lib/videoTranscriptService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      videoId = 't2_Q2BRzeEE',
      courseId = 'course_default',
      question = '',
      conversationHistory = []
    } = body;

    if (!question || question.trim().length === 0) {
      return NextResponse.json({ error: 'Question cannot be empty' }, { status: 400 });
    }

    const result = await queryVideoTranscript(videoId, courseId, question, conversationHistory);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
