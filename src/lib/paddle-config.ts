// Minimal paddle-config mapping used by webhook handling.
export function mapPriceIdToAction(priceId: string) {
  // Simple mapping stub. Replace with real product mappings.
  if (!priceId) return { type: 'unknown' };
  if (priceId === process.env.NEXT_PADDLE_PRICE_ID_SINGLE) return { type: 'single' };
  if (priceId === process.env.NEXT_PADDLE_PRICE_ID_PREMIUM) return { type: 'premium' };
  return { type: 'unknown' };
}

export default { mapPriceIdToAction };
