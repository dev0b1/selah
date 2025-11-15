import axios from 'axios';

export interface OpenRouterParams {
  extractedText: string;
  style: string;
}

export interface OpenRouterResult {
  prompt: string;
  title: string;
  tags: string;
}

export class OpenRouterAPI {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateSongPrompt(params: OpenRouterParams): Promise<OpenRouterResult> {
    if (!this.apiKey || this.apiKey === '') {
      throw new Error('OpenRouter API key not configured');
    }

    const styleDescriptions = {
      sad: 'sad, melancholic, heartbreak, emotional, slow tempo',
      savage: 'empowering, confident, revenge, upbeat, sassy',
      healing: 'hopeful, uplifting, growth, peaceful, moving on',
      vibe: 'chill, smooth, atmospheric, laid-back',
      meme: 'funny, quirky, humorous, playful, ironic',
    };

    const systemPrompt = `You are a creative AI that converts breakup stories into song lyrics and metadata for AI music generation. 

Your task is to analyze the breakup story and create:
1. A catchy song title (max 50 characters)
2. Music genre/style tags (max 80 characters) - be specific with musical styles
3. Full song lyrics (3-5 verses with chorus, around 200-400 words)

The lyrics should capture the emotional essence of the story and match the requested style: ${params.style} (${styleDescriptions[params.style as keyof typeof styleDescriptions] || 'emotional'})

Return your response in this exact JSON format:
{
  "title": "Song Title Here",
  "tags": "genre, style, mood, tempo",
  "prompt": "Full lyrics here with verse/chorus structure"
}`;

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'anthropic/claude-3.5-sonnet',
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: `Create a ${params.style} breakup song based on this story:\n\n${params.extractedText}`,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.8,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://breakupsongs.app',
            'X-Title': 'Breakup Song Generator',
          },
        }
      );

      const content = response.data.choices[0].message.content;
      let parsed;

      try {
        parsed = JSON.parse(content);
      } catch (parseError) {
        console.error('Failed to parse OpenRouter response as JSON:', content);
        throw new Error('Invalid response format from AI model');
      }

      if (!parsed || typeof parsed !== 'object') {
        throw new Error('AI returned invalid data structure');
      }

      const defaultTags = styleDescriptions[params.style as keyof typeof styleDescriptions] || 'emotional';
      
      return {
        prompt: parsed.prompt || parsed.lyrics || parsed.lyric || '',
        title: parsed.title || `${params.style.charAt(0).toUpperCase() + params.style.slice(1)} Breakup Song`,
        tags: parsed.tags || parsed.genre || defaultTags,
      };
    } catch (error: any) {
      console.error('OpenRouter API Error:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        throw new Error('Invalid OpenRouter API key. Please check your configuration.');
      }
      
      if (error.response?.status === 402) {
        throw new Error('Insufficient OpenRouter credits. Please add more credits.');
      }

      throw new Error(
        `Failed to generate prompt with OpenRouter: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }
}

export function createOpenRouterClient(): OpenRouterAPI {
  const apiKey = process.env.OPENROUTER_API_KEY || '';
  return new OpenRouterAPI(apiKey);
}
