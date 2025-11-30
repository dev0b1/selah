import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ success: false, error: 'audio_generation_disabled' }, { status: 410 });
}
