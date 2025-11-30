// Lightweight OCR helpers (stubs for build-time). Replace with real OCR logic.
export async function extractTextFromImage(image: string | ArrayBuffer | Uint8Array | null) {
  // Basic stub: if provided a data URL, return it as 'cleaned' text for dev.
  const text = typeof image === 'string' ? image : '';
  return {
    text,
    cleanedText: (text || '').replace(/\s+/g, ' ').trim(),
    confidence: 0.5,
  };
}

export function validateChatScreenshot(cleanedText: string | null) {
  // Return an object with `isValid` and optional `reason` to match callers.
  const text = cleanedText || '';
  if (text.length < 10) {
    return { isValid: false, reason: 'OCR did not extract enough text' };
  }
  return { isValid: true };
}

export default {
  extractTextFromImage,
  validateChatScreenshot,
};
