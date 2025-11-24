import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { subscriptions } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { refillCredits } from '@/lib/db-service';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Accepts POST { credits: number }
// Requires the user to be authenticated via Supabase session cookies.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const credits = Number(body?.credits || 0);
    if (!credits || credits <= 0) {
      return NextResponse.json({ ok: false, message: 'Invalid credits' }, { status: 400 });
    }

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
    if (!user) {
      return NextResponse.json({ ok: false, message: 'Not authenticated' }, { status: 401 });
    }

    const userId = user.id;

    // If the user already has a subscription record, refill. Otherwise create a one-time subscription
    const existing = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
    if (existing && existing.length > 0) {
      await refillCredits(userId, credits);
    } else {
      await db.insert(subscriptions).values({ userId, tier: 'one-time', status: 'active', creditsRemaining: credits });
    }

    return NextResponse.json({ ok: true, credited: credits });
  } catch (err) {
    console.error('Local claim error', err);
    return NextResponse.json({ ok: false, message: 'Internal error' }, { status: 500 });
  }
}
