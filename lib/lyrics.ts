import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type SongStyle = 'sad' | 'savage' | 'healing' | 'vibe' | 'meme';

export interface LyricsGenerationParams {
  story: string;
  style: SongStyle;
}

export interface GeneratedLyrics {
  title: string;
  lyrics: string;
  genre: string;
  mood: string;
}

const stylePrompts: Record<SongStyle, string> = {
  sad: 'Create emotional, melancholic lyrics about heartbreak with themes of loss, longing, and sadness. Use poetic imagery and vulnerable language. Think slow ballad or acoustic.',
  savage: 'Create fierce, confident, empowering lyrics about moving on and being better off. Use bold, sassy language with attitude. Think upbeat pop or hip-hop with strong beats.',
  healing: 'Create uplifting, hopeful lyrics about self-growth and healing after heartbreak. Focus on self-love, resilience, and positive outlook. Think inspirational pop or indie.',
  vibe: 'Create chill, modern, relatable lyrics about the breakup experience with a laid-back tone. Use conversational language. Think lo-fi, R&B, or bedroom pop vibes.',
  meme: 'Create humorous, self-aware, internet-culture lyrics that make fun of the breakup situation. Use memes, slang, and comedic exaggeration. Think TikTok-viral comedy song.',
};

export async function generateLyrics(
  params: LyricsGenerationParams
): Promise<GeneratedLyrics> {
  const { story, style } = params;

  const systemPrompt = `You are an expert songwriter specializing in breakup songs. Generate creative, emotionally resonant lyrics based on the user's breakup story.

${stylePrompts[style]}

IMPORTANT INSTRUCTIONS:
- Create lyrics for a 30-60 second song (1 verse + 1 chorus, about 8-16 lines total)
- Make it personal and specific to the story provided
- Use vivid imagery and emotional language
- Ensure lyrics are singable and have good rhythm
- Return response as JSON with: title, lyrics, genre, mood

Example JSON format:
{
  "title": "Song Title Here",
  "lyrics": "Verse 1:\\nLine 1\\nLine 2\\n\\nChorus:\\nLine 1\\nLine 2",
  "genre": "Pop Ballad",
  "mood": "Melancholic"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Create breakup song lyrics in a ${style} style based on this story:\n\n${story}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_completion_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    if (!result.title || !result.lyrics) {
      throw new Error('Invalid lyrics format received from AI');
    }

    return {
      title: result.title,
      lyrics: result.lyrics,
      genre: result.genre || 'Pop',
      mood: result.mood || style,
    };
  } catch (error) {
    console.error('Lyrics generation error:', error);
    throw new Error('Failed to generate lyrics. Please try again.');
  }
}

export function summarizeStory(story: string): string {
  const words = story.split(/\s+/);
  if (words.length <= 50) return story;
  
  return words.slice(0, 50).join(' ') + '...';
}
