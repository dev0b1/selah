import { NextRequest, NextResponse } from 'next/server';
import { getUserCredits } from '@/lib/db-service';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    const credits = await getUserCredits(userId);

    // For Selah: Free users get unlimited text prayers, premium gets worship songs (1 per day)
    const canGenerateWorshipSong = credits.creditsRemaining > 0;

    return NextResponse.json({
      success: true,
      creditsRemaining: credits.creditsRemaining,
      tier: credits.tier,
      canGenerateWorshipSong,
    });
  } catch (error) {
    console.error('Check credits error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
