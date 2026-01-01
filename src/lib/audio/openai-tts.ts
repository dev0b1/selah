// OpenAI TTS configuration for Selah prayer audio
const OPENAI_TTS_CONFIG = {
  model: 'tts-1', // or 'tts-1-hd' for higher quality
  voice: 'alloy' as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer', // Default: alloy (neutral, calm)
  speed: 1.0, // 0.25 to 4.0, default 1.0
};

export async function generateTTS(text: string): Promise<Buffer> {
  try {
    const key = process.env.OPENAI_API_KEY || '';
    if (!key) {
      throw new Error('OPENAI_API_KEY not set');
    }

    // Remove SSML tags if present (OpenAI TTS doesn't support SSML)
    const cleanText = text.replace(/<speak>|<\/speak>/g, '').trim();

    const resp = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_TTS_CONFIG.model,
        input: cleanText,
        voice: OPENAI_TTS_CONFIG.voice,
        speed: OPENAI_TTS_CONFIG.speed,
        response_format: 'mp3',
      }),
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      throw new Error(`OpenAI TTS API error ${resp.status}: ${errorText}`);
    }

    const arrayBuffer = await resp.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    console.error('Error generating TTS with OpenAI:', err);
    throw err;
  }
}

