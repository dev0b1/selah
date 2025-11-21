"use client";

import React from "react";

interface DailyCheckInTabProps {
  userId?: string;
  onStreakUpdate?: (newStreak: number) => void;
  hasCheckedInToday?: boolean;
}

export function DailyCheckInTab(_props: DailyCheckInTabProps) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white/5 border-2 border-white/10 rounded-lg p-6 text-center text-white">
        <h3 className="text-xl font-black">Daily Check-In</h3>
        <p className="text-sm text-gray-300 mt-2">Temporary compact view while we finish edits.</p>
      </div>
    </div>
  );
}
