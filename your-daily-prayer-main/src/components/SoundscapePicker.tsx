import React from 'react';
import { Soundscape, soundscapes } from '@/hooks/useAmbientSound';
import { cn } from '@/lib/utils';

interface SoundscapePickerProps {
  currentSoundscape: Soundscape | null;
  isPlaying: boolean;
  isLoading: boolean;
  onSelect: (soundscape: Soundscape) => void;
}

export function SoundscapePicker({ currentSoundscape, isPlaying, isLoading, onSelect }: SoundscapePickerProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Background Sound
      </h3>
      <div className="flex flex-wrap gap-2">
        {soundscapes.map((soundscape) => {
          const isSelected = currentSoundscape?.id === soundscape.id;
          const isCurrentlyLoading = isLoading && isSelected;

          return (
            <button
              key={soundscape.id}
              onClick={() => onSelect(soundscape)}
              disabled={isCurrentlyLoading}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200',
                isSelected
                  ? 'bg-primary/20 border-primary text-foreground'
                  : 'bg-card/50 border-border/50 text-muted-foreground hover:bg-card hover:border-border hover:text-foreground'
              )}
            >
              <span className="text-lg">{soundscape.icon}</span>
              <span className="text-sm font-medium">{soundscape.name}</span>
              {isCurrentlyLoading && (
                <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
              {isSelected && isPlaying && soundscape.id !== 'silence' && (
                <div className="flex gap-0.5">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-0.5 h-3 bg-primary rounded-full animate-pulse"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
