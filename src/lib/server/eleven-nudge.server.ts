import { generateMusicWithEleven } from '@/lib/eleven';
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
      const res = await generateMusicWithEleven(motivationText, 'voiceover', params.mood || 'confidence', 15);

      if (res.audioUrl) {
        return {
          id: crypto.randomUUID(),
          audioUrl: res.audioUrl,
          motivationText,
          duration: 15,
        };
      }

      if (res.audioBuffer) {
        const filename = `${crypto.randomUUID()}.mp3`;
        const publicPath = await uploadPreviewAudio(res.audioBuffer, filename);
        return {
          id: crypto.randomUUID(),
          audioUrl: publicPath || '/audio/placeholder-preview.mp3',
          motivationText,
          duration: 15,
        };
      }

      return {
        id: crypto.randomUUID(),
        audioUrl: '/audio/placeholder-preview.mp3',
        motivationText,
        duration: 15,
      };
    } catch (err) {
      console.warn('ElevenNudgeAPI.generateDailyNudge failed, falling back to text-only', err);
      return {
        id: crypto.randomUUID(),
        audioUrl: '/audio/placeholder-preview.mp3',
        motivationText,
        duration: 15,
      };
    }
  }
}

export function createElevenNudgeClient(): ElevenNudgeAPI {
  return new ElevenNudgeAPI();
}
