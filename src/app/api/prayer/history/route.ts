import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { prayers } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // Fetch user's prayers from database
    const userPrayers = await db
      .select()
      .from(prayers)
      .where(eq(prayers.userId, userId))
      .orderBy(desc(prayers.createdAt))
      .limit(50);

    return NextResponse.json({
      success: true,
      prayers: userPrayers,
    });
  } catch (error) {
    console.error('Error fetching prayer history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prayer history' },
      { status: 500 }
    );
  }
}
