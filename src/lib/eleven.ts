// ElevenLabs wrapper that uses the low-level TTS helper in `audio/elevenlabs-tts`.
import { generateTTS } from '@/lib/audio/elevenlabs-tts';

export async function generateMusicWithEleven(text: string, style = 'voiceover', mood = 'confidence', durationSec = 30) {
  try {
    // If caller provided SSML, use it. Otherwise wrap plain text in a simple <speak> tag.
    const isSSML = /<speak[\s\S]*?>[\s\S]*<\/speak>/i.test(text.trim());
    const ssml = isSSML ? text : `<speak>${text}</speak>`;

    const audioBuffer = await generateTTS(ssml);

    // Estimate duration: words / 150 wpm * 60
    const plain = text.replace(/<[^>]+>/g, ' ');
    const wordCount = plain.split(/\s+/).filter(Boolean).length || 1;
    const estimatedSec = Math.max(1, (wordCount / 150) * 60);

    return {
      audioBuffer,
      audioUrl: '',
      duration: Math.round(estimatedSec),
    } as { audioBuffer: Buffer; audioUrl: string; duration: number };
  } catch (err) {
    console.error('ElevenLabs wrapper error:', err);
    throw err;
  }
}

export default { generateMusicWithEleven };
