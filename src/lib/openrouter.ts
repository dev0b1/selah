// Lightweight OpenRouter client. Uses the OpenRouter chat completions endpoint.
// Requires `OPENROUTER_API_KEY` in env. Optionally set `OPENROUTER_MODEL`.
export function createOpenRouterClient() {
  const key = process.env.OPENROUTER_API_KEY || '';
  const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

  async function generateSongPrompt(params: any) {
    if (!key) throw new Error('OPENROUTER_API_KEY not set');

    const userText = params?.extractedText || params?.text || '';
    const style = params?.style || params?.mood || 'neutral';

    const system = `You are an elite drill sergeant motivational coach. Produce a JSON object ONLY with the shape { "parts": [ { "tone": "low|medium|high|max", "text": "..." }, ... ] } suitable for a 30-60 second motivational audio. Use 5-7 parts and include 1 MAX moment. Make it personal based on the user's input.`;

    const user = `User shared: "${userText.replace(/"/g, '\\"')}". Style/mood: ${style}. Return only valid JSON with the described structure.`;

    const body = {
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.6,
      max_tokens: 600,
    } as any;

    const resp = await fetch('https://api.openrouter.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`OpenRouter API error ${resp.status}: ${txt}`);
    }

    const data = await resp.json();

    // Try to extract content from common places
    const content =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      (typeof data === 'string' ? data : undefined) ||
      JSON.stringify(data);

    return { prompt: content };
  }

  return { generateSongPrompt };
}

export default { createOpenRouterClient };
