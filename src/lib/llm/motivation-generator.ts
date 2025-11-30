import { createOpenRouterClient } from '@/lib/openrouter';
import type { MoodType, MotivationScript, MotivationPart, ToneLevel } from '@/types/motivation';
import { BACKGROUND_TRACKS } from '@/config/motivation.config';

const openrouter = createOpenRouterClient();

const MOTIVATION_SYSTEM_PROMPT = `You are an elite drill sergeant motivational coach. Your job is to provide tough-love, no-nonsense motivation that pushes people past their limits.

CORE PRINCIPLES:
- Be direct and commanding, not soft
- Acknowledge their struggle briefly, then PUSH them forward
- Use second person ("YOU", "YOUR") exclusively
- Build intensity strategically from low → high → MAX
- No fluff, no clichés, pure raw motivation
- Make it personal based on what they shared

TONE LEVELS EXPLAINED:
- LOW: Reflective, acknowledging their pain/struggle (calm but firm)
- MEDIUM: Building energy, questioning their limits, transitioning
- HIGH: Commanding, emphatic, raising voice intensity
- MAX: EXPLOSIVE, breakthrough moments, peak intensity (use sparingly - 1-2 times max)

STRUCTURE RULES:
- Generate 5-7 parts total for 30-60 second audio
- Start with low or medium to meet them where they are
- Build to at least ONE "max" moment (your climax)
- End on high or max tone for lasting impact
- Each part should be 1-3 sentences

OUTPUT FORMAT:
Return ONLY valid JSON with this exact structure:
{
  "parts": [
    { "tone": "low", "text": "..." },
    { "tone": "medium", "text": "..." },
    { "tone": "high", "text": "..." },
    { "tone": "max", "text": "..." }
  ]
}`;

interface ClaudePart { tone: ToneLevel; text: string }

export async function generateMotivationScript(userText: string, mood: MoodType): Promise<MotivationScript> {
  try {
    const params = {
      extractedText: userText,
      style: mood,
    };

    // Use OpenRouter client to create a motivation prompt/script. The OpenRouter response
    // often contains a JSON payload embedded in the text — extract JSON from the returned prompt.
    const result = await openrouter.generateSongPrompt(params as any);
    const responseText = result.prompt || '';

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Failed to extract JSON from OpenRouter response');

    const parsed = JSON.parse(jsonMatch[0]) as { parts: ClaudePart[] };
    if (!parsed.parts || !Array.isArray(parsed.parts) || parsed.parts.length === 0) {
      throw new Error('Invalid motivation script structure from Claude');
    }

    // estimate durations (approx 150 wpm)
    const partsWithDuration: MotivationPart[] = parsed.parts.map((p) => {
      const wordCount = p.text.split(/\s+/).filter(Boolean).length;
      const estimatedDuration = Math.max(1000, (wordCount / 150) * 60 * 1000);
      return { tone: p.tone, text: p.text.trim(), estimatedDuration };
    });

    const totalEstimatedDuration = partsWithDuration.reduce((s, p) => s + (p.estimatedDuration || 0), 0);
    const backgroundTracks = BACKGROUND_TRACKS[mood] || BACKGROUND_TRACKS.drill;
    const backgroundTrack = backgroundTracks[Math.floor(Math.random() * backgroundTracks.length)];

    return { parts: partsWithDuration, totalEstimatedDuration, mood, backgroundTrack };
  } catch (err) {
    console.error('Error generating motivation script:', err);
    throw err;
  }
}
