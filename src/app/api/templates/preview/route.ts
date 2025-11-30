import { NextRequest, NextResponse } from 'next/server';
import { uploadPreviewAudio } from '@/lib/file-storage';
import { readFile } from 'fs/promises';
import path from 'path';

// This route requires server-side dependencies
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  return NextResponse.json({ success: false, error: 'Templates API is deprecated for DailyMotiv' }, { status: 410 });
}
