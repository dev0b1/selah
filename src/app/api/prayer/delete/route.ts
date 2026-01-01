import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { prayers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { prayerId, userId } = body;

    if (!prayerId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Delete prayer only if it belongs to the user
    await db
      .delete(prayers)
      .where(
        and(
          eq(prayers.id, prayerId),
          eq(prayers.userId, userId)
        )
      );

    return NextResponse.json({
      success: true,
      message: 'Prayer deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting prayer:', error);
    return NextResponse.json(
      { error: 'Failed to delete prayer' },
      { status: 500 }
    );
  }
}
