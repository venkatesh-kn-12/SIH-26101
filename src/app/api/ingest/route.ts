import { NextResponse } from 'next/server';
import { runCourseIngestion } from '@/lib/ingestionService';

export async function POST() {
  try {
    const result = await runCourseIngestion();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = await runCourseIngestion();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
