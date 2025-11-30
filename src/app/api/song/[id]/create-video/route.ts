import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ success: false, error: 'Create-video endpoint deprecated: songs and job queue removed.' }, { status: 410 });
}
