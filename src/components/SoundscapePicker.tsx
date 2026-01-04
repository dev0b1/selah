import React from 'react';
import { Switch } from '@/components/ui/switch';

interface SoundscapePickerProps {
  isEnabled: boolean;
  isLoading: boolean;
  onToggle: (enabled: boolean) => void;
}

export function SoundscapePicker({ isEnabled, isLoading, onToggle }: SoundscapePickerProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Background Sound
      </h3>

      <div className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggle(!isEnabled)}
            className={`w-12 h-6 rounded-full transition-colors ${isEnabled ? 'bg-[#D4A574]' : 'bg-[#8B9DC3]/30'}`}
            aria-pressed={isEnabled}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`} />
          </button>
          <div>
            <div className="text-sm font-medium">Heavenly Sound</div>
            <div className="text-xs text-muted-foreground">Soft ambient background for prayer</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isLoading && <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
        </div>
      </div>
    </div>
  );
}

