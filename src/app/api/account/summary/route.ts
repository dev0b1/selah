import { NextRequest, NextResponse } from 'next/server';
import { getUserSubscriptionStatus, getUserHistory } from '@/lib/db-service';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId required' }, { status: 400 });
    }

    const [history, subscription] = await Promise.all([
      getUserHistory(userId, 30),
      getUserSubscriptionStatus(userId),
    ]);

    return NextResponse.json({ 
      success: true, 
      history,
      subscription 
    });
  } catch (err) {
    console.error('Account summary error', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
