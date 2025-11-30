import { NextResponse } from 'next/server';

export async function GET() {
  // Suno streaming endpoint removed. The project uses OpenRouter + ElevenLabs + ffmpeg.
  return NextResponse.json({ success: false, error: 'Suno streaming disabled. Use /api/generate-motivation instead.' }, { status: 410 });
}
