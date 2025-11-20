import { NextRequest, NextResponse } from 'next/server';
import { saveDailyCheckIn, getUserStreak } from '@/lib/db-service';

const MOTIVATIONS: Record<string, string> = {
  hurting: "Listen… it's okay to hurt. But don't let that pain define you. They couldn't handle your energy, your growth, your realness. You're not broken — you're becoming. Keep choosing yourself. You're literally unstoppable right now.",
  confidence: "You know what? You're doing better than you think. Every day without them is a day you choose YOU. They're out there questioning everything while you're out here leveling up. Keep that crown on. You earned it.",
  angry: "Channel that anger into power. They thought they could play you? Watch you turn that rage into motivation. Every workout, every win, every glow-up is a reminder: you're the catch they couldn't keep. Now go be unstoppable.",
  unstoppable: "THAT'S the energy! You're not just moving on — you're moving UP. They're somewhere crying while you're out here thriving. You didn't lose a partner — you lost a liability. Keep choosing yourself. Elite behavior only."
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, mood, message } = body;

    if (!userId || !mood || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const motivation = MOTIVATIONS[mood] || MOTIVATIONS.unstoppable;

    const saved = await saveDailyCheckIn({
      userId,
      mood,
      message,
      motivationText: motivation
    });

    if (!saved) {
      return NextResponse.json(
        { error: 'Already checked in today or failed to save' },
        { status: 400 }
      );
    }

    const streakData = await getUserStreak(userId);

    return NextResponse.json({
      success: true,
      motivation,
      streak: streakData.currentStreak
    });
  } catch (error) {
    console.error('Error generating motivation:', error);
    return NextResponse.json(
      { error: 'Failed to generate motivation' },
      { status: 500 }
    );
  }
}
