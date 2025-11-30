export type MoodType = 'drill' | 'epic' | 'calm' | 'intense' | 'overcome';

export type ToneLevel = 'low' | 'medium' | 'high' | 'max';

export interface MotivationPart {
  tone: ToneLevel;
  text: string;
  estimatedDuration?: number; // milliseconds
}

export interface MotivationScript {
  parts: MotivationPart[];
  totalEstimatedDuration: number;
  mood: MoodType;
  backgroundTrack: string;
}

export interface SSMLConfig {
  tone: ToneLevel;
  volume: string;
  rate: string;
  emphasis?: 'strong' | 'moderate';
}

export interface AudioMixConfig {
  ttsBuffer: Buffer;
  backgroundPath: string;
  timingData: TimingData[];
  totalDuration: number;
}

export interface TimingData {
  startTime: number; // milliseconds
  endTime: number;
  tone: ToneLevel;
  backgroundVolume: number; // dB adjustment
}

export interface GenerateMotivationRequest {
  text: string;
  mood: MoodType;
  userId?: string;
}

export interface GenerateMotivationResponse {
  success: boolean;
  audioUrl?: string;
  audioBuffer?: Buffer;
  duration?: number;
  error?: string;
}
