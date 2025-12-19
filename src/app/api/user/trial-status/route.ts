import { NextRequest, NextResponse } from 'next/server';
import { checkTrialStatus } from '@/lib/db-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const trialStatus = await checkTrialStatus(userId);
    
    if (!trialStatus) {
      return NextResponse.json({
        hasTrial: false,
        isExpired: false,
        daysRemaining: 0,
      });
    }

    return NextResponse.json(trialStatus);
  } catch (error) {
    console.error('Error checking trial status:', error);
    return NextResponse.json(
      { error: 'Failed to check trial status' },
      { status: 500 }
    );
  }
}

