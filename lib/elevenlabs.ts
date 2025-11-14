import axios from 'axios';

export type MusicStyle = 'sad' | 'savage' | 'healing' | 'vibe' | 'meme';

export interface MusicGenerationParams {
  prompt: string;
  title: string;
  style: MusicStyle;
  duration?: number;
}

export interface GeneratedMusic {
  audioUrl: string;
  songId: string;
  duration: number;
}

const styleDescriptors: Record<MusicStyle, string> = {
  sad: 'melancholic, slow tempo, emotional piano and strings, heartbreak ballad',
  savage: 'confident, upbeat, strong bass, empowering pop with attitude',
  healing: 'uplifting, hopeful, warm acoustic guitar, inspirational indie pop',
  vibe: 'chill, lo-fi, laid-back R&B beats, modern bedroom pop',
  meme: 'comedic, quirky, playful synths, viral TikTok comedy song',
};

export class ElevenLabsMusicAPI {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateSong(params: MusicGenerationParams): Promise<GeneratedMusic> {
    if (!this.apiKey || this.apiKey === 'your_elevenlabs_api_key_here') {
      throw new Error('ElevenLabs API key not configured');
    }

    const fullPrompt = `${params.prompt}. Musical style: ${styleDescriptors[params.style]}`;

    try {
      const response = await axios.post(
        `${this.baseUrl}/text-to-sound-effects`,
        {
          text: fullPrompt,
          duration_seconds: params.duration || 30,
          prompt_influence: 0.8,
        },
        {
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
        }
      );

      const audioBase64 = Buffer.from(response.data).toString('base64');
      const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

      return {
        audioUrl,
        songId: `song_${Date.now()}`,
        duration: params.duration || 30,
      };
    } catch (error: any) {
      console.error('ElevenLabs API Error:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        throw new Error('Invalid ElevenLabs API key. Please check your configuration.');
      }
      
      if (error.response?.status === 429) {
        throw new Error('ElevenLabs API rate limit exceeded. Please try again later.');
      }

      throw new Error(
        'Failed to generate music with ElevenLabs. Using fallback placeholder audio.'
      );
    }
  }
}

export function createElevenLabsClient(): ElevenLabsMusicAPI {
  const apiKey = process.env.ELEVENLABS_API_KEY || '';
  return new ElevenLabsMusicAPI(apiKey);
}
