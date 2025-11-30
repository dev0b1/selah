import { NextRequest, NextResponse } from 'next/server';
import { getAllTemplates } from '@/lib/db-service';

export async function GET(request: NextRequest) {
  return NextResponse.json({ success: false, error: 'Templates API is deprecated for DailyMotiv' }, { status: 410 });
}
