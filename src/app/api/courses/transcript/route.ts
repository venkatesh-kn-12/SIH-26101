import { NextResponse } from 'next/server';
import { getOrFetchVideoTranscript } from '@/lib/videoTranscriptService';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get('videoId') || 't2_Q2BRzeEE';
    const courseId = searchParams.get('courseId') || 'course_default';

    const record = await getOrFetchVideoTranscript(videoId, courseId);
    return NextResponse.json({
      success: true,
      transcriptRecord: record
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { videoId = 't2_Q2BRzeEE', courseId = 'course_default' } = body;

    const record = await getOrFetchVideoTranscript(videoId, courseId);
    return NextResponse.json({
      success: true,
      transcriptRecord: record
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
