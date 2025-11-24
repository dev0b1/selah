import { NextRequest, NextResponse } from 'next/server';
import { saveDailyCheckIn, getUserStreak, getUserPreferences, getUserSubscriptionStatus, getTodayCheckIn, getUserCredits, deductCredit, incrementAudioNudgeCount, saveAudioNudge, enqueueAudioJob, reserveCredit, pickNextDemoVariantForUser } from '@/lib/db-service';

const MOTIVATIONS: Record<string, string> = {
  hurting: "Listen… it's okay to hurt. But don't let that pain define you. They couldn't handle your energy, your growth, your realness. You're not broken — you're becoming. Keep choosing yourself. You're literally unstoppable right now.",
  confidence: "You know what? You're doing better than you think. Every day without them is a day you choose YOU. They're out there questioning everything while you're out here leveling up. Keep that crown on. You earned it.",
  angry: "Channel that anger into power. They thought they could play you? Watch you turn that rage into motivation. Every workout, every win, every glow-up is a reminder: you're the catch they couldn't keep. Now go be unstoppable.",
  unstoppable: "THAT'S the energy! You're not just moving on — you're moving UP. They're somewhere crying while you're out here thriving. You didn't lose a partner — you lost a liability. Keep choosing yourself. Elite behavior only."
};

export async function POST(request: NextRequest) {
  try {
  const body = await request.json();
  const { userId, mood, message, preferAudio } = body;

    if (!userId || !mood || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Prevent double check-in: bail early if there's already a check-in today
    const existing = await getTodayCheckIn(userId);
    if (existing) {
      return NextResponse.json({ error: 'already_checked_in', message: 'User already checked in today' }, { status: 409 });
    }

    const motivation = MOTIVATIONS[mood] || MOTIVATIONS.unstoppable;

    // For daily check-ins we use local demo templates (no server audio generation).
    let motivationAudioUrl: string | undefined = undefined;
    let audioLimitReached = false;
    let audioLimitReason: string | null = null;

    // Choose a demo audio file based on mood. Prefer a random variant if multiple
    // files exist (e.g. hurting-1.mp3, hurting-2.mp3). Look in public/demo-nudges.
    try {
      const fs = await import('fs');
      const path = await import('path');
      const demoDir = path.join(process.cwd(), 'public', 'demo-nudges');
      const files = fs.readdirSync(demoDir).filter((f: string) => f.toLowerCase().endsWith('.mp3'));

      // Normalize special mood name
      const baseMood = mood === 'unstoppable' ? 'feeling-unstoppable' : (mood || 'hurting');

      // Match files that start with baseMood (e.g. hurting.mp3, hurting-1.mp3)
      const candidates = files.filter((f: string) => f.toLowerCase().startsWith(baseMood));

      if (candidates.length > 0) {
        // Pick the next variant for this user using round-robin (per-user order)
        const userPick = await pickNextDemoVariantForUser(userId, candidates);
        const pick = userPick || candidates[Math.floor(Math.random() * candidates.length)];
        motivationAudioUrl = `/demo-nudges/${pick}`;
      } else {
        // Fallback to the simple mapping
        const fallback = baseMood;
        motivationAudioUrl = `/demo-nudges/${fallback}.mp3`;
      }
    } catch (e) {
      // If filesystem access fails, fall back to default mapping
      const fallback = mood === 'unstoppable' ? 'feeling-unstoppable' : (mood || 'hurting');
      motivationAudioUrl = `/demo-nudges/${fallback}.mp3`;
    }

    const savedCheckInId = await saveDailyCheckIn({
      userId,
      mood,
      message,
      motivationText: motivation,
      motivationAudioUrl
    });

    if (!savedCheckInId) {
      return NextResponse.json({ error: 'already_checked_in', message: 'User already checked in today' }, { status: 409 });
    }

  // We do not generate audio server-side for daily check-ins. The saved check-in
  // already contains a demo template audio URL (motivationAudioUrl) that the UI
  // will surface immediately. This avoids enqueueing audio generation jobs.

  const sub = await getUserSubscriptionStatus(userId);
  const streakData = await getUserStreak(userId);

    // If user row missing or streak still 0 after saving, report a client-visible streak of 1
    // so the UI reflects the first-day check-in even if the users table hasn't been initialized.
    const reportedStreak = (streakData?.currentStreak && streakData.currentStreak > 0) ? streakData.currentStreak : 1;

    // Always instruct client to limit preview to 15s. For unsubscribed/free users return a
    // thumbnail (low-fidelity visual) that can be shown behind the player as an upsell.
    const previewDuration = 15; // seconds
  const thumbnailUrl = (!sub?.isPro) ? `/demo-nudges/thumbs/${mood}.svg` : null;

    return NextResponse.json({
      success: true,
      motivation,
      motivationAudioUrl: motivationAudioUrl || null,
      streak: reportedStreak,
      previewDuration,
      thumbnailUrl,
      audioLimitReached,
      audioLimitReason
    });
  } catch (error) {
    console.error('Error generating motivation:', error);
    return NextResponse.json(
      { error: 'Failed to generate motivation' },
      { status: 500 }
    );
  }
}
