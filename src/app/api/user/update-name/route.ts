import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { users } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, displayName } = body;

    if (!userId || !displayName) {
      return NextResponse.json(
        { error: 'User ID and display name required' },
        { status: 400 }
      );
    }

    // Update user's display name
    await db
      .update(users)
      .set({
        displayName: displayName,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user name:', error);
    return NextResponse.json(
      { error: 'Failed to update name' },
      { status: 500 }
    );
  }
}

