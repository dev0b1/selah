import { useState, useEffect, useCallback, useRef } from 'react';

interface UseBrowserTTSOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: string;
}

export function useBrowserTTS(options: UseBrowserTTSOptions = {}) {
  const { rate = 0.85, pitch = 1, volume = 1, voice: preferredVoice } = options;
  
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
      
      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices();
        setVoices(availableVoices);
        
        // Prefer a calm, natural-sounding English voice
        const preferred = availableVoices.find(
          v => preferredVoice && v.name.toLowerCase().includes(preferredVoice.toLowerCase())
        ) || availableVoices.find(
          v => v.lang.startsWith('en') && v.name.includes('Google')
        ) || availableVoices.find(
          v => v.lang.startsWith('en') && v.localService
        ) || availableVoices.find(
          v => v.lang.startsWith('en')
        );
        
        if (preferred) {
          setCurrentVoice(preferred);
        }
      };

      loadVoices();
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [preferredVoice]);

  const speak = useCallback((text: string) => {
    if (!isSupported) return;

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    
    if (currentVoice) {
      utterance.voice = currentVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [isSupported, rate, pitch, volume, currentVoice]);

  const pause = useCallback(() => {
    if (isSupported && isSpeaking) {
      speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSupported, isSpeaking]);

  const resume = useCallback(() => {
    if (isSupported && isPaused) {
      speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isSupported, isPaused]);

  const stop = useCallback(() => {
    if (isSupported) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, [isSupported]);

  const selectVoice = useCallback((voiceName: string) => {
    const voice = voices.find(v => v.name === voiceName);
    if (voice) {
      setCurrentVoice(voice);
    }
  }, [voices]);

  return {
    isSupported,
    isSpeaking,
    isPaused,
    voices,
    currentVoice,
    speak,
    pause,
    resume,
    stop,
    selectVoice,
  };
}
