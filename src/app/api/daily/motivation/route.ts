import { NextRequest, NextResponse } from 'next/server';
import { saveDailyCheckIn, getUserStreak, getUserPreferences, getUserSubscriptionStatus, getTodayCheckIn, getUserCredits, deductCredit, incrementAudioNudgeCount, saveAudioNudge, enqueueAudioJob, reserveCredit, pickNextDemoVariantForUser } from '@/lib/db-service';
import { createElevenNudgeClient } from '@/lib/server/eleven-nudge.server';

const MOTIVATIONS: Record<string, string> = {
  hurting: "Listen… it's okay to hurt. But don't let that pain define you. You're not broken — you're becoming. Keep choosing yourself.",
  confidence: "You know what? You're doing better than you think. Every day without them is a day you choose YOU. Keep that crown on — you earned it.",
  frustrated: "Channel that energy into power. Use it to move forward — workouts, wins, small victories. Turn the heat into momentum.",
  unstoppable: "THAT'S the energy! You're not just moving on — you're moving UP. Keep choosing yourself and thrive.",
  anxious: "Breathe. This moment doesn't define your future. Small steps, steady breaths — you have what it takes to keep moving forward.",
  calm: "Find a quiet moment to breathe and reset. You're allowed rest — it's part of getting stronger. Center, then continue."
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

    // Choose a demo audio file based on mood. Prefer files inside the
    // per-mood subfolder (e.g. /demo-nudges/hurting/...) and fall back to
    // root-named variants (e.g. hurting-1.mp3). This recursively scans
    // `public/demo-nudges` so subfolder assets are authoritative.
    try {
      const fs = await import('fs');
      const path = await import('path');
      const demoDir = path.join(process.cwd(), 'public', 'demo-nudges');

      // Recursively walk demoDir and return relative paths (POSIX-friendly)
      function walk(dir: string, rel = ''): string[] {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        let out: string[] = [];
        for (const ent of entries) {
          const name = ent.name;
          const full = path.join(dir, name);
          const relPath = rel ? `${rel}/${name}` : name;
          if (ent.isDirectory()) {
            out = out.concat(walk(full, relPath));
          } else if (ent.isFile() && name.toLowerCase().endsWith('.mp3')) {
            out.push(relPath);
          }
        }
        return out;
      }

      const allMp3 = walk(demoDir); // e.g. ['hurting/hurting.mp3', 'hurting-1.mp3']

      // Normalize special mood name
      const baseMood = mood === 'unstoppable' ? 'feeling-unstoppable' : (mood || 'hurting');

      // Prefer files within the mood subfolder (e.g. 'hurting/...' )
      const folderCandidates = allMp3.filter(p => p.toLowerCase().startsWith(`${baseMood.toLowerCase()}/`));

      let candidates: string[] = [];
      if (folderCandidates.length > 0) {
        candidates = folderCandidates;
      } else {
        // Otherwise accept files whose filename starts with the mood (root or nested)
        candidates = allMp3.filter(p => {
          const filename = path.basename(p).toLowerCase();
          return filename.startsWith(baseMood.toLowerCase());
        });
      }

      if (candidates.length > 0) {
        const userPick = await pickNextDemoVariantForUser(userId, candidates);
        const pick = userPick || candidates[Math.floor(Math.random() * candidates.length)];
        motivationAudioUrl = `/demo-nudges/${pick}`;
      } else {
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

  // Optionally generate a custom audio nudge via ElevenLabs when the user
  // requested audio and is eligible (e.g., pro users). We pass the selected
  // mood plus the user's message as the prompt to the generator.
  try {
    const sub = await getUserSubscriptionStatus(userId);
    if (preferAudio && sub?.isPro) {
      try {
        const nudgeClient = createElevenNudgeClient();
        const gen = await nudgeClient.generateDailyNudge({ userStory: message, mood, motivationText: message || motivation });
        if (gen?.audioUrl) {
          motivationAudioUrl = gen.audioUrl;
          // Persist generated nudge for user's history
          await saveAudioNudge(userId, message, 1, gen.audioUrl, gen.motivationText || (message || motivation), 0);
        }
      } catch (e) {
        console.warn('Daily audio generation failed, falling back to demo audio', e);
      }
    }
  } catch (err) {
    console.warn('Error checking subscription for audio generation', err);
  }

  const sub = await getUserSubscriptionStatus(userId);
  const streakData = await getUserStreak(userId);

    // If user row missing or streak still 0 after saving, report a client-visible streak of 1
    // so the UI reflects the first-day check-in even if the users table hasn't been initialized.
    const reportedStreak = (streakData?.currentStreak && streakData.currentStreak > 0) ? streakData.currentStreak : 1;

    // Always instruct client to limit preview to 15s. For unsubscribed/free users return a
    // thumbnail (low-fidelity visual) that can be shown behind the player as an upsell.
    const previewDuration = 15; // seconds
  const thumbnailUrl = (!sub?.isPro) ? `/demo-nudges/thumbs/${mood}.svg` : null;

    // Enforce free-user audio limit: max 3 audio nudges per week.
    // - Pro users: unaffected
    // - Free users: if they already used 3 this week, remove audio and tell client
    //   to show upgrade option. Otherwise, increment their weekly audio count
    //   and persist the delivered audio nudge (creditsUsed = 0).
    try {
      if (!sub?.isPro) {
        const credits = await getUserCredits(userId);
        const usedThisWeek = credits.audioNudgesThisWeek || 0;
        if (usedThisWeek >= 3) {
          // limit reached — remove audio deliverable
          audioLimitReached = true;
          audioLimitReason = 'weekly_limit_exceeded';
          motivationAudioUrl = undefined;
        } else {
          // Increment the user's weekly audio nudge count and persist the nudge
          try {
            await incrementAudioNudgeCount(userId);
            // Save audio nudge record for analytics/history. Use reportedStreak as dayNumber.
            if (motivationAudioUrl) {
              await saveAudioNudge(userId, message, reportedStreak, motivationAudioUrl, motivation, 0);
            }
          } catch (e) {
            console.warn('Failed to increment/save audio nudge counter for user', userId, e);
          }
        }
      }
    } catch (err) {
      console.warn('Error enforcing audio limit:', err);
    }

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
