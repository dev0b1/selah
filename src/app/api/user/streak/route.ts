import { NextRequest, NextResponse } from 'next/server';
import { getUserStreak } from '@/lib/db-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        currentStreak: 0,
        longestStreak: 0,
        lastCheckInDate: null
      }, { status: 200 });
    }

    const streakData = await getUserStreak(userId);
    
    return NextResponse.json(streakData, { status: 200 });
  } catch (error) {
    console.error('Error fetching user streak:', error);
    return NextResponse.json(
      { error: 'Failed to fetch streak' },
      { status: 500 }
    );
  }
}
