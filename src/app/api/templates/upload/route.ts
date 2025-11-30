import { NextRequest, NextResponse } from 'next/server';
import { uploadTemplateAudio } from '@/lib/file-storage';
import { createTemplate } from '@/lib/db-service';

export async function POST(request: NextRequest) {
  return NextResponse.json({ success: false, error: 'Templates API is deprecated for DailyMotiv' }, { status: 410 });
}
