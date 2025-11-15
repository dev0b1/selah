import axios from 'axios';

export interface SunoGenerationParams {
  prompt: string;
  title: string;
  style: string;
  tags?: string;
  make_instrumental?: boolean;
}

export interface SunoGenerationResult {
  id: string;
  audioUrl: string;
  videoUrl?: string;
  lyrics?: string;
  duration?: number;
  status: string;
}

export class SunoAPI {
  private apiKey: string;
  private baseUrl = 'https://api.sunoapi.org/v1/suno';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateSong(params: SunoGenerationParams): Promise<SunoGenerationResult> {
    if (!this.apiKey || this.apiKey === '') {
      throw new Error('Suno API key not configured');
    }

    try {
      console.log('Creating song with Suno AI...');
      
      const createResponse = await axios.post(
        `${this.baseUrl}/create`,
        {
          custom_mode: true,
          title: params.title,
          tags: params.tags || params.style,
          prompt: params.prompt,
          make_instrumental: params.make_instrumental || false,
          mv: 'chirp-v4',
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const taskId = createResponse.data.data?.id || createResponse.data.id;
      
      if (!taskId) {
        throw new Error('No task ID returned from Suno API');
      }

      console.log('Song task created, polling for completion...');
      
      const result = await this.pollForCompletion(taskId);
      
      return result;
    } catch (error: any) {
      console.error('Suno API Error:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        throw new Error('Invalid Suno API key. Please check your configuration.');
      }
      
      if (error.response?.status === 402) {
        throw new Error('Insufficient Suno API credits. Please add more credits.');
      }
      
      if (error.response?.status === 429) {
        throw new Error('Suno API rate limit exceeded. Please try again later.');
      }

      throw new Error(
        `Failed to generate music with Suno: ${error.response?.data?.error || error.message}`
      );
    }
  }

  private async pollForCompletion(taskId: string, maxAttempts = 60): Promise<SunoGenerationResult> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await this.sleep(3000);

      try {
        const response = await axios.get(
          `${this.baseUrl}/get?id=${taskId}`,
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
            },
          }
        );

        const songs = response.data.data || response.data;
        const song = Array.isArray(songs) ? songs[0] : songs;

        if (song && song.status === 'complete' && song.audio_url) {
          console.log('Song generation complete!');
          
          const audioUrl = song.audio_url;
          const videoUrl = song.video_url || audioUrl;
          
          return {
            id: song.id,
            audioUrl: audioUrl,
            videoUrl: videoUrl,
            lyrics: song.lyric || song.prompt,
            duration: song.duration || 60,
            status: 'complete',
          };
        }

        if (song && song.status === 'error') {
          throw new Error('Song generation failed');
        }

        console.log(`Polling attempt ${attempt + 1}/${maxAttempts}...`);
      } catch (error: any) {
        if (attempt === maxAttempts - 1) {
          throw error;
        }
      }
    }

    throw new Error('Song generation timed out');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export function createSunoClient(): SunoAPI {
  const apiKey = process.env.SUNO_API_KEY || '';
  return new SunoAPI(apiKey);
}
