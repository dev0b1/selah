import { NextRequest, NextResponse } from 'next/server';
import { getTodayCheckIn } from '@/lib/db-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ checkIn: null }, { status: 200 });
    }

    const checkIn = await getTodayCheckIn(userId);
    
    return NextResponse.json({ checkIn }, { status: 200 });
  } catch (error) {
    console.error('Error fetching today check-in:', error);
    return NextResponse.json({ error: 'Failed to fetch check-in' }, { status: 500 });
  }
}
