import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ success: false, error: 'Audio job endpoints removed. Worker queue deprecated.' }, { status: 410 });
}
