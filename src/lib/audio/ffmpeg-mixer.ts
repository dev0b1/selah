import ffmpeg from 'fluent-ffmpeg';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import { path as ffprobePath } from '@ffprobe-installer/ffprobe';
import path from 'path';
import fs from 'fs/promises';
import { writeFile } from 'fs/promises';

// Audio settings for Selah prayer mixing
const AUDIO_SETTINGS = {
  bitrate: '192k',
  sampleRate: 44100,
};

// Type definitions for audio mixing
export interface TimingData {
  startTime: number;
  endTime: number;
  backgroundVolume: number;
}

export interface AudioMixConfig {
  ttsBuffer: Buffer;
  backgroundPath: string;
  timingData: TimingData[];
  totalDuration: number;
}

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

export async function mixAudio(config: AudioMixConfig): Promise<Buffer> {
  const { ttsBuffer, backgroundPath, timingData, totalDuration } = config;
  const tempDir = path.join(process.cwd(), 'temp');
  await fs.mkdir(tempDir, { recursive: true });

  const tempTTSPath = path.join(tempDir, `tts-${Date.now()}.mp3`);
  const tempOutputPath = path.join(tempDir, `output-${Date.now()}.mp3`);
  const fullBackgroundPath = path.join(process.cwd(), 'public', 'bg', backgroundPath);

  try {
    await writeFile(tempTTSPath, ttsBuffer);

    const volumeFilter = generateVolumeFilter(timingData, totalDuration);

    // Use only first 60 seconds of background music, loop if needed for longer prayers
    const maxBackgroundDuration = 60; // Use only first 60 seconds
    const prayerDuration = totalDuration / 1000; // Prayer duration in seconds
    
    await new Promise<void>((resolve, reject) => {
      // First, trim background to 60 seconds, then loop if prayer is longer
      const bgFilter = prayerDuration > maxBackgroundDuration
        ? `[1:a]atrim=0:${maxBackgroundDuration},aloop=loop=-1:size=2e+09,atrim=0:${prayerDuration}[bg_trimmed]`
        : `[1:a]atrim=0:${prayerDuration}[bg_trimmed]`;
      
      ffmpeg()
        .input(tempTTSPath)
        .input(fullBackgroundPath)
        .complexFilter([
          bgFilter,
          `[bg_trimmed]${volumeFilter}[bg]`,
          '[0:a][bg]amix=inputs=2:duration=first:weights=1.5 0.5',
          'loudnorm=I=-16:TP=-1.5:LRA=11',
          'acompressor=threshold=-20dB:ratio=4:attack=5:release=50',
        ])
        .audioCodec('libmp3lame')
        .audioBitrate(AUDIO_SETTINGS.bitrate)
        .audioChannels(2)
        .audioFrequency(AUDIO_SETTINGS.sampleRate)
        .output(tempOutputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });

    const outputBuffer = await fs.readFile(tempOutputPath);
    await Promise.all([fs.unlink(tempTTSPath).catch(() => {}), fs.unlink(tempOutputPath).catch(() => {})]);
    return outputBuffer;
  } catch (err) {
    await Promise.all([fs.unlink(tempTTSPath).catch(() => {}), fs.unlink(tempOutputPath).catch(() => {})]);
    console.error('Error mixing audio:', err);
    throw err;
  }
}

function generateVolumeFilter(timingData: TimingData[], totalDuration: number): string {
  // Create simple chained if expressions to map time to volume multiplier
  let expr = "volume='";
  timingData.forEach((t, i) => {
    const end = t.endTime / 1000;
    const mult = Math.pow(10, t.backgroundVolume / 20);
    if (i === 0) expr += `if(lt(t,${end}),${mult}`;
    else expr += `,if(lt(t,${end}),${mult}`;
  });
  // close parens
  expr += ')'.repeat(Math.max(0, timingData.length - 1));
  expr += "'";
  return expr;
}
