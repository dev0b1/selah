import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { db } from '@/server/db';
import { transactions } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          }
        }
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'not_authenticated' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const songId = body?.songId || null;
    const transactionId = body?.transactionId || null;

    if (!songId && !transactionId) {
      return NextResponse.json({ success: false, error: 'missing_identifier' }, { status: 400 });
    }

    // Find transaction by transactionId or by songId
    let txRows: any[] = [];
    if (transactionId) {
      txRows = await db.select().from(transactions).where(eq(transactions.id, transactionId)).limit(1);
    } else if (songId) {
      txRows = await db.select().from(transactions).where(eq(transactions.songId, songId)).orderBy().limit(1);
      // Note: orderBy omitted in case DB doesn't support orderBy without args; we'll pick first if present
    }

    if (!txRows || txRows.length === 0) {
      return NextResponse.json({ success: false, error: 'transaction_not_found' }, { status: 404 });
    }

    const tx = txRows[0];

    // Ensure the transaction is completed/paid
    const status = (tx.status || '').toLowerCase();
    if (!(status === 'transaction.completed' || status === 'paid' || status === 'completed' || status === 'transaction.paid')) {
      return NextResponse.json({ success: false, error: 'transaction_not_completed' }, { status: 400 });
    }

    // If transaction already has a user, skip or error
    if (tx.userId) {
      if (tx.userId === user.id) {
        return NextResponse.json({ success: true, message: 'already_claimed' });
      }
      return NextResponse.json({ success: false, error: 'already_claimed_by_other' }, { status: 409 });
    }

    // Attach transaction to this user
    await db.update(transactions).set({ userId: user.id }).where(eq(transactions.id, tx.id));

    // If this transaction unlocked a song, the songs model has been removed in Selah.
    // We attach the transaction to the user and skip song assignment.

    return NextResponse.json({ success: true, claimed: true, transactionId: tx.id });
  } catch (error) {
    console.error('Claim credits error:', error);
    return NextResponse.json({ success: false, error: 'internal_error' }, { status: 500 });
  }
}
