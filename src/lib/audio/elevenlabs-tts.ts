import { ELEVENLABS_CONFIG } from '@/config/motivation.config';

export async function generateTTS(ssml: string): Promise<Buffer> {
  try {
    const key = process.env.ELEVENLABS_API_KEY || '';
    const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_CONFIG.voiceId}`, {
      method: 'POST',
      headers: {
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': key,
      },
      body: JSON.stringify({ text: ssml, model_id: ELEVENLABS_CONFIG.model, voice_settings: { stability: ELEVENLABS_CONFIG.stability, similarity_boost: ELEVENLABS_CONFIG.similarityBoost, style: ELEVENLABS_CONFIG.style } }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      throw new Error(`ElevenLabs API error ${resp.status}: ${t}`);
    }

    const ab = await resp.arrayBuffer();
    return Buffer.from(ab);
  } catch (err) {
    console.error('Error generating TTS:', err);
    throw err;
  }
}
