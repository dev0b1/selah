import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  cleanedText: string;
}

export async function extractTextFromImage(
  imageData: string | File,
  onProgress?: (progress: number) => void
): Promise<OCRResult> {
  try {
    const result = await Tesseract.recognize(imageData, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(Math.round(m.progress * 100));
        }
      },
    });

    const rawText = result.data.text;
    const confidence = result.data.confidence;
    const cleanedText = cleanExtractedText(rawText);

    return {
      text: rawText,
      confidence,
      cleanedText,
    };
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from image. Please try a clearer screenshot.');
  }
}

export function cleanExtractedText(text: string): string {
  let cleaned = text;

  cleaned = cleaned.replace(/\d{1,2}:\d{2}\s?(AM|PM|am|pm)?/g, '');
  
  cleaned = cleaned.replace(/\d{1,2}\/\d{1,2}\/\d{2,4}/g, '');
  cleaned = cleaned.replace(/\d{4}-\d{2}-\d{2}/g, '');
  
  cleaned = cleaned.replace(/Read\s+\d+:\d{2}\s?(AM|PM)?/gi, '');
  cleaned = cleaned.replace(/Delivered|Read|Sent|Typing\.\.\./gi, '');
  
  cleaned = cleaned.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
  cleaned = cleaned.replace(/[\u{2600}-\u{27BF}]/gu, '');
  
  cleaned = cleaned.replace(/^[A-Za-z\s]+:/gm, '');
  
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  cleaned = cleaned.replace(/^\s+|\s+$/gm, '');
  
  cleaned = cleaned.trim();

  return cleaned;
}

export function validateChatScreenshot(text: string): {
  isValid: boolean;
  reason?: string;
} {
  if (!text || text.trim().length < 10) {
    return {
      isValid: false,
      reason: 'Not enough text detected. Please upload a clearer screenshot.',
    };
  }

  const wordCount = text.split(/\s+/).length;
  if (wordCount < 5) {
    return {
      isValid: false,
      reason: 'Screenshot appears too short. Make sure the chat messages are visible.',
    };
  }

  return { isValid: true };
}