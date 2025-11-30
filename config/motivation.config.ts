import type { MoodType, ToneLevel, SSMLConfig } from '@/types/motivation';

export const TONE_SSML_CONFIG: Record<ToneLevel, SSMLConfig> = {
  low: {
    tone: 'low',
    volume: '-10%',
    rate: '90%',
  },
  medium: {
    tone: 'medium',
    volume: '0%',
    rate: '95%',
  },
  high: {
    tone: 'high',
    volume: '+15%',
    rate: '95%',
    emphasis: 'strong',
  },
  max: {
    tone: 'max',
    volume: '+25%',
    rate: '90%',
    emphasis: 'strong',
  },
};

export const BACKGROUND_TRACKS: Record<MoodType, string[]> = {
  drill: ['drill1.mp3', 'drill2.mp3', 'drill-intense.mp3'],
  epic: ['epic-orchestral.mp3', 'epic-cinematic.mp3'],
  calm: ['calm-ambient.mp3', 'rain-focus.mp3'],
  intense: ['intense-gym.mp3', 'intense-heartbeat.mp3'],
  overcome: ['overcome-rise.mp3', 'overcome-triumph.mp3'],
};

export const BACKGROUND_VOLUME_ADJUSTMENTS: Record<ToneLevel, number> = {
  low: -20,
  medium: -15,
  high: -8,
  max: -3,
};

export const ELEVENLABS_CONFIG = {
  model: 'eleven_multilingual_v2',
  voiceId: 'pNInz6obpgDQGcFmaJgB',
  stability: 0.5,
  similarityBoost: 0.75,
  style: 0.8,
};

export const AUDIO_SETTINGS = {
  sampleRate: 44100,
  bitrate: '192k',
  format: 'mp3',
  normalize: true,
  compression: 'medium',
};
