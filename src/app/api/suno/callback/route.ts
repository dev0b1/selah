import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ success: false, error: 'Suno callbacks disabled. Suno integration removed.' }, { status: 410 });
}

