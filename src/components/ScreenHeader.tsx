"use client";

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
  onBack?: () => void;
}

export function ScreenHeader({
  title,
  showBack = true,
  rightElement,
  onBack,
}: ScreenHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Back Button */}
        {showBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        {!showBack && <div className="w-10" />}

        {/* Center: Title */}
        <h1 className="text-lg font-display font-semibold text-foreground flex-1 text-center">
          {title}
        </h1>

        {/* Right: Custom Element or Spacer */}
        <div className="w-10 flex items-center justify-end">
          {rightElement}
        </div>
      </div>
    </header>
  );
}
