import ffmpeg from 'fluent-ffmpeg';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import { path as ffprobePath } from '@ffprobe-installer/ffprobe';
import path from 'path';
import fs from 'fs/promises';
import { writeFile } from 'fs/promises';
import type { AudioMixConfig, TimingData } from '@/types/motivation';
import { AUDIO_SETTINGS } from '@/config/motivation.config';

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

    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(tempTTSPath)
        .input(fullBackgroundPath)
        .inputOptions(['-stream_loop', '-1'])
        .complexFilter([
          `[1:a]${volumeFilter},atrim=duration=${totalDuration / 1000}[bg]`,
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
