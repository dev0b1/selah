import { generateTTS } from '@/lib/audio/openai-tts';
import { mixAudio } from '@/lib/audio/ffmpeg-mixer';
import { uploadPreviewAudio } from '@/lib/file-storage';

export interface NudgeGenerationParams {
  userStory: string;
  dayNumber?: number;
  mood?: string;
  motivationText?: string;
}

export interface NudgeGenerationResult {
  id: string;
  audioUrl: string;
  motivationText: string;
  duration: number;
}

export class ElevenNudgeAPI {
  async generateDailyNudge(params: { userStory: string; mood?: string; motivationText?: string; dayNumber?: number; userName?: string; }): Promise<NudgeGenerationResult> {
    // For Selah: motivationText should always be provided (prayer text)
    // If not provided, use the userStory (prayer text) as fallback
    const motivationText = params.motivationText || params.userStory || 'Heavenly Father, we lift up Your child in prayer. In Jesus\' name, Amen.';

    try {
      // Estimate duration from text (limit to ~60 seconds max)
      const wordCount = motivationText.split(/\s+/).length;
      const estimatedSec = Math.min(60, Math.max(10, (wordCount / 150) * 60));
      const targetDuration = Math.round(estimatedSec);

      // Generate TTS audio using OpenAI
      const ttsBuffer = await generateTTS(motivationText);

      // Mix with pre-generated background music (reusable, subtle)
      // Background music file: public/bg/prayer-background.mp3 (will need to be added)
      // For now, if file doesn't exist, use TTS only
      let finalAudioBuffer: Buffer = ttsBuffer;
      
      try {
        // Randomly select from available background music files
        const fs = await import('fs/promises');
        const path = await import('path');
        const bgDir = path.join(process.cwd(), 'public', 'bg');
        
        // Get all MP3 files in bg folder
        const files = await fs.readdir(bgDir);
        const mp3Files = files.filter(f => f.toLowerCase().endsWith('.mp3') && f !== 'README.md');
        
        if (mp3Files.length === 0) {
          console.warn('No background music files found in public/bg, using TTS only');
          throw new Error('No background files found');
        }
        
        // Randomly select one file
        const randomFile = mp3Files[Math.floor(Math.random() * mp3Files.length)];
        const backgroundPath = randomFile;
        
        console.log(`[ElevenNudge] Using background music: ${backgroundPath}`);
        
        // Create timing data for background volume (subtle, -18dB for peaceful atmosphere)
        const timingData = [
          { startTime: 0, endTime: targetDuration * 1000, backgroundVolume: -18 }
        ];

        const mixedBuffer = await mixAudio({
          ttsBuffer,
          backgroundPath,
          timingData,
          totalDuration: targetDuration * 1000,
        });
        
        finalAudioBuffer = mixedBuffer;
        console.log('[ElevenNudge] Successfully mixed TTS with background music');
      } catch (mixError) {
        console.warn('Background music mixing failed, using TTS only:', mixError);
        // Continue with TTS only if mixing fails
      }

      // Upload final audio
      const filename = `prayer-${crypto.randomUUID()}.mp3`;
      const publicPath = await uploadPreviewAudio(finalAudioBuffer, filename);
      
      return {
        id: crypto.randomUUID(),
        audioUrl: publicPath || '/audio/placeholder-preview.mp3',
        motivationText,
        duration: targetDuration,
      };
    } catch (err) {
      console.warn('ElevenNudgeAPI.generateDailyNudge failed, falling back to text-only', err);
      return {
        id: crypto.randomUUID(),
        audioUrl: '/audio/placeholder-preview.mp3',
        motivationText,
        duration: 60,
      };
    }
  }
}

export function createElevenNudgeClient(): ElevenNudgeAPI {
  return new ElevenNudgeAPI();
}
