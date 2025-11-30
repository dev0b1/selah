import { NextRequest, NextResponse } from 'next/server';
import { generateMotivationScript } from '@/lib/llm/motivation-generator';
import { convertToSSML, calculateTimingData } from '@/lib/audio/ssml-converter';
import { generateTTS } from '@/lib/audio/elevenlabs-tts';
import { mixAudio } from '@/lib/audio/ffmpeg-mixer';
import type { GenerateMotivationRequest, GenerateMotivationResponse } from '@/types/motivation';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateMotivationRequest = await request.json();
    if (!body.text || !body.text.trim()) return NextResponse.json({ success: false, error: 'Vent text is required' }, { status: 400 });
    if (!body.mood) return NextResponse.json({ success: false, error: 'Mood is required' }, { status: 400 });

    const { text, mood } = body;
    console.log('📝 Generating motivation script...');
    const script = await generateMotivationScript(text, mood);

    console.log('🎵 Converting to SSML...');
    const ssml = convertToSSML(script.parts);

    console.log('🎤 Generating speech...');
    const ttsBuffer = await generateTTS(ssml);

    console.log('⏱️ Calculating timing data...');
    const timingData = calculateTimingData(script.parts);

    console.log('🎚️ Mixing audio...');
    const finalAudioBuffer = await mixAudio({ ttsBuffer, backgroundPath: script.backgroundTrack, timingData, totalDuration: script.totalEstimatedDuration });

    console.log('✅ Audio generation complete!');

    const bodyUint8 = new Uint8Array(finalAudioBuffer);

    return new NextResponse(bodyUint8, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(finalAudioBuffer.length),
        'Content-Disposition': `attachment; filename="motivation-${Date.now()}.mp3"`,
      },
    });
  } catch (err) {
    console.error('❌ Error in generate-motivation API:', err);
    const response: GenerateMotivationResponse = { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    return NextResponse.json(response, { status: 500 });
  }
}

export const runtime = 'nodejs';
export const maxDuration = 60;
