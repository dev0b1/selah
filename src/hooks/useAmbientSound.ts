import { useState, useRef, useCallback, useEffect } from 'react';

export interface Soundscape {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
}

export const soundscapes: Soundscape[] = [
  {
    id: 'piano',
    name: 'Peaceful Piano',
    description: 'Gentle piano for worship',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
    icon: '🎹',
  },
  {
    id: 'ambient',
    name: 'Heavenly Ambience',
    description: 'Soft celestial atmosphere',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3',
    icon: '✨',
  },
  {
    id: 'rain',
    name: 'Gentle Rain',
    description: 'Soft rainfall for peaceful reflection',
    url: 'https://cdn.pixabay.com/download/audio/2022/02/23/audio_ea70ad08e6.mp3',
    icon: '🌧️',
  },
  {
    id: 'nature',
    name: 'Nature Sounds',
    description: 'Birds and gentle breeze',
    url: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_8c9b67d658.mp3',
    icon: '🌿',
  },
  {
    id: 'silence',
    name: 'Silence',
    description: 'No background sound',
    url: '',
    icon: '🤫',
  },
];

interface UseAmbientSoundOptions {
  volume?: number;
  fadeInDuration?: number;
  fadeOutDuration?: number;
}

export function useAmbientSound(options: UseAmbientSoundOptions = {}) {
  const { volume = 0.3, fadeInDuration = 2000, fadeOutDuration = 1000 } = options;
  
  const [currentSoundscape, setCurrentSoundscape] = useState<Soundscape | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(volume);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<number | null>(null);

  const clearFadeInterval = () => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  };

  const fadeIn = useCallback((audio: HTMLAudioElement, targetVolume: number) => {
    clearFadeInterval();
    audio.volume = 0;
    
    const steps = 20;
    const stepDuration = fadeInDuration / steps;
    const volumeStep = targetVolume / steps;
    let currentStep = 0;

    fadeIntervalRef.current = window.setInterval(() => {
      currentStep++;
      audio.volume = Math.min(volumeStep * currentStep, targetVolume);
      
      if (currentStep >= steps) {
        clearFadeInterval();
      }
    }, stepDuration);
  }, [fadeInDuration]);

  const fadeOut = useCallback((audio: HTMLAudioElement) => {
    return new Promise<void>((resolve) => {
      clearFadeInterval();
      
      const startVolume = audio.volume;
      const steps = 20;
      const stepDuration = fadeOutDuration / steps;
      const volumeStep = startVolume / steps;
      let currentStep = 0;

      fadeIntervalRef.current = window.setInterval(() => {
        currentStep++;
        audio.volume = Math.max(startVolume - volumeStep * currentStep, 0);
        
        if (currentStep >= steps) {
          clearFadeInterval();
          audio.pause();
          resolve();
        }
      }, stepDuration);
    });
  }, [fadeOutDuration]);

  const play = useCallback(async (soundscape: Soundscape) => {
    if (soundscape.id === 'silence') {
      if (audioRef.current) {
        await fadeOut(audioRef.current);
        audioRef.current = null;
      }
      setCurrentSoundscape(soundscape);
      setIsPlaying(false);
      return;
    }

    // Stop current audio if playing
    if (audioRef.current) {
      await fadeOut(audioRef.current);
    }

    setIsLoading(true);
    const audio = new Audio(soundscape.url);
    audio.loop = true;
    audioRef.current = audio;

    audio.oncanplaythrough = () => {
      setIsLoading(false);
      audio.play();
      fadeIn(audio, currentVolume);
      setIsPlaying(true);
    };

    audio.onerror = () => {
      setIsLoading(false);
      console.error('Failed to load soundscape');
    };

    setCurrentSoundscape(soundscape);
  }, [currentVolume, fadeIn, fadeOut]);

  const stop = useCallback(async () => {
    if (audioRef.current) {
      await fadeOut(audioRef.current);
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, [fadeOut]);

  const setVolume = useCallback((newVolume: number) => {
    setCurrentVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearFadeInterval();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return {
    soundscapes,
    currentSoundscape,
    isPlaying,
    isLoading,
    volume: currentVolume,
    play,
    stop,
    setVolume,
  };
}

