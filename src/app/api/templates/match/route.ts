import { NextRequest, NextResponse } from 'next/server';
import { getAllTemplates } from '@/lib/db-service';
import { matchTemplate } from '@/lib/template-matcher';
import { LYRICS_DATA } from '@/lib/lyrics-data';

export async function POST(request: NextRequest) {
  return NextResponse.json({ success: false, error: 'Templates API is deprecated for DailyMotiv' }, { status: 410 });
}
