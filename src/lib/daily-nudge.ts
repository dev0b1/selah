export function getDailySavageQuote(dayNumber: number = 1): string {
  try {
    // Lazy-load fallback motivation so this function remains client-safe.
    const { getFallbackMotivation } = require('@/lib/daily-motivations');
    return getFallbackMotivation(dayNumber);
  } catch (e) {
    return "You're the plot twist they didn't see coming.";
  }
}
