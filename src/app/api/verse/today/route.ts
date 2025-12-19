import { NextResponse } from 'next/server';
import { getTodaysVerse } from '@/lib/bible-verses';

export async function GET() {
  try {
    const verse = getTodaysVerse();
    return NextResponse.json(verse);
  } catch (error) {
    console.error('Error fetching today\'s verse:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verse' },
      { status: 500 }
    );
  }
}

