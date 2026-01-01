import React, { useEffect, useState } from 'react';
import { Prayer } from '@/data/prayers';
import { useBrowserTTS } from '@/hooks/useBrowserTTS';
import { useAmbientSound, Soundscape } from '@/hooks/useAmbientSound';
import { SoundscapePicker } from './SoundscapePicker';
import { ShareablePrayerCard } from './ShareablePrayerCard';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Square, Volume2, ArrowLeft, Share2 } from 'lucide-react';

interface PrayerPlayerProps {
  prayer: Prayer;
  onClose: () => void;
  forFriend?: string;
  userName: string;
}

export function PrayerPlayer({ prayer, onClose, forFriend, userName }: PrayerPlayerProps) {
  const { isSpeaking, isPaused, speak, pause, resume, stop, isSupported } = useBrowserTTS({ rate: 0.85 });
  const { currentSoundscape, isPlaying: isSoundPlaying, isLoading, volume, play: playSound, stop: stopSound, setVolume } = useAmbientSound({ volume: 0.25 });
  const [hasStarted, setHasStarted] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  // Personalize the prayer text
  const personalizedText = prayer.text.replace(/{name}/g, userName);

  const handlePlay = () => {
    if (!hasStarted) {
      setHasStarted(true);
      speak(personalizedText);
    } else if (isPaused) {
      resume();
    } else {
      pause();
    }
  };

  const handleStop = () => {
    stop();
    setHasStarted(false);
  };

  const handleSoundscapeSelect = (soundscape: Soundscape) => {
    playSound(soundscape);
  };

  // Stop everything when leaving
  useEffect(() => {
    return () => {
      stop();
      stopSound();
    };
  }, [stop, stopSound]);

  return (
    <div className="min-h-screen gradient-celestial flex flex-col relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 gradient-nebula opacity-50" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl breathing-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-accent/5 blur-3xl breathing-glow" style={{ animationDelay: '2s' }} />

      {/* Header */}
      <header className="relative z-10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display text-xl font-medium text-foreground">{prayer.title}</h1>
            <p className="text-sm text-muted-foreground">{prayer.duration}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowShareDialog(true)}
          className="text-muted-foreground hover:text-foreground"
        >
          <Share2 className="w-5 h-5" />
        </Button>
      </header>

      {/* Main content */}
      <main className="flex-1 relative z-10 px-6 py-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Prayer text */}
          <div className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary/50 to-transparent rounded-full" />
            <div className="pl-6 space-y-4">
              {personalizedText.split('\n\n').map((paragraph, index) => (
                <p
                  key={index}
                  className="text-lg md:text-xl leading-relaxed text-foreground/90 font-body"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Soundscape picker */}
          <div className="pt-6 border-t border-border/30">
            <SoundscapePicker
              currentSoundscape={currentSoundscape}
              isPlaying={isSoundPlaying}
              isLoading={isLoading}
              onSelect={handleSoundscapeSelect}
            />
          </div>

          {/* Volume control for ambient sound */}
          {currentSoundscape && currentSoundscape.id !== 'silence' && isSoundPlaying && (
            <div className="flex items-center gap-4">
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
      </main>

      {/* Player controls */}
      <footer className="relative z-10 p-6 border-t border-border/30 bg-card/50 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto">
          {!isSupported ? (
            <p className="text-center text-muted-foreground">
              Voice narration is not supported in your browser
            </p>
          ) : (
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={handleStop}
                disabled={!hasStarted}
                className="w-12 h-12 rounded-full border-border/50"
              >
                <Square className="w-5 h-5" />
              </Button>

              <Button
                onClick={handlePlay}
                className="w-16 h-16 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity pulse-soft"
              >
                {isSpeaking && !isPaused ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </Button>

              <div className="w-12" /> {/* Spacer for symmetry */}
            </div>
          )}

          {isSpeaking && (
            <div className="mt-4 flex justify-center">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 h-6 bg-primary rounded-full animate-pulse"
                    style={{
                      animationDelay: `${i * 0.1}s`,
                      height: `${12 + Math.sin(i) * 8}px`,
                    }}
                  />
                ))}
                <span className="ml-3 text-sm text-muted-foreground">Speaking...</span>
              </div>
            </div>
          )}
        </div>
      </footer>

      {/* Share Dialog */}
      <ShareablePrayerCard
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        prayerTitle={prayer.title}
        prayerText={personalizedText}
        forFriend={forFriend}
      />
    </div>
  );
}

