// Minimal fallback motivations used when generation isn't available.
export function getFallbackMotivation(dayNumber: number = 1): string {
  const messages = [
    "You're the plot twist they didn't see coming.",
    "Move like your life depends on it — because it does.",
    "Every excuse is a chain. Break it.",
    "If not you, who? If not now, when?",
    "Today you outwork yesterday."
  ];

  const idx = Math.max(0, (dayNumber - 1) % messages.length);
  return messages[idx];
}

export default {
  getFallbackMotivation,
};
