import React from 'react';
import { useUser } from '@/contexts/UserContext';
import { useAmbientSound, Soundscape } from '@/hooks/useAmbientSound';
import { Button } from '@/components/ui/button';
import { SoundscapePicker } from '@/components/SoundscapePicker';
import { Slider } from '@/components/ui/slider';
import { LogOut, User, Volume2 } from 'lucide-react';
import { Moon } from '@/components/Moon';

export function ProfileTab() {
  const { userName, resetOnboarding } = useUser();
  const { currentSoundscape, isPlaying, isLoading, volume, play, setVolume } = useAmbientSound({ volume: 0.25 });

  const handleSoundscapeSelect = (soundscape: Soundscape) => {
    play(soundscape);
  };

  return (
    <div className="px-4 pt-6 pb-28">
      <header className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <Moon className="scale-75" />
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-semibold text-gradient-golden">
          {userName}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Your sacred space
        </p>
      </header>

      {/* Profile Card */}
      <div className="mb-6 p-5 rounded-2xl bg-card/60 border border-border/30 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h2 className="font-display font-medium text-foreground">{userName}</h2>
            <p className="text-sm text-muted-foreground">Seeker of peace</p>
          </div>
        </div>
      </div>

      {/* Ambient Sound Settings */}
      <div className="mb-6 p-5 rounded-2xl bg-card/60 border border-border/30 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <Volume2 className="w-5 h-5 text-primary" />
          <h2 className="font-display font-medium text-foreground">Ambient Sounds</h2>
        </div>
        <SoundscapePicker
          currentSoundscape={currentSoundscape}
          isPlaying={isPlaying}
          isLoading={isLoading}
          onSelect={handleSoundscapeSelect}
        />
        {currentSoundscape && currentSoundscape.id !== 'silence' && isPlaying && (
          <div className="flex items-center gap-4 mt-4">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={[volume * 100]}
              onValueChange={([val]) => setVolume(val / 100)}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground w-10">{Math.round(volume * 100)}%</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button
          variant="outline"
          onClick={resetOnboarding}
          className="w-full justify-start border-border/50 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Start Fresh
        </Button>
      </div>
    </div>
  );
}
