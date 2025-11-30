import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ success: false, error: 'Song endpoints removed for DailyMotiv' }, { status: 410 });
}
