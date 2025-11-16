import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromImage, validateChatScreenshot } from '@/lib/ocr';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'No image provided' },
        { status: 400 }
      );
    }

    if (!image.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'File must be an image' },
        { status: 400 }
      );
    }

    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${image.type};base64,${base64}`;

    const ocrResult = await extractTextFromImage(dataUrl);

    const validation = validateChatScreenshot(ocrResult.cleanedText);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.reason },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      rawText: ocrResult.text,
      cleanedText: ocrResult.cleanedText,
      confidence: ocrResult.confidence,
    });
  } catch (error) {
    console.error('OCR API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process image',
      },
      { status: 500 }
    );
  }
}
