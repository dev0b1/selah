import type { MotivationPart, TimingData } from '@/types/motivation';
import { TONE_SSML_CONFIG, BACKGROUND_VOLUME_ADJUSTMENTS } from '@/config/motivation.config';

export function convertToSSML(parts: MotivationPart[]): string {
  const ssmlParts = parts.map((part) => {
    const config = TONE_SSML_CONFIG[part.tone];
    const text = escapeXML(part.text);

    let prosodyContent = text;
    if (config.emphasis) prosodyContent = `<emphasis level="${config.emphasis}">${text}</emphasis>`;

    const breakTime = part.tone === 'max' ? '600ms' : '400ms';

    return `<prosody volume="${config.volume}" rate="${config.rate}">${prosodyContent}</prosody><break time="${breakTime}"/>`;
  });

  const fullSSML = `<speak>${ssmlParts.join('')}</speak>`;
  if (!isValidSSML(fullSSML)) throw new Error('Generated invalid SSML structure');
  return fullSSML;
}

function escapeXML(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function isValidSSML(ssml: string): boolean {
  return ssml.includes('<speak>') && ssml.includes('</speak>') && ssml.indexOf('<speak>') < ssml.indexOf('</speak>');
}

export function calculateTimingData(parts: MotivationPart[]): TimingData[] {
  let currentTime = 0;
  const timingData: TimingData[] = [];

  parts.forEach((part) => {
    const duration = part.estimatedDuration || 3000;
    const startTime = currentTime;
    const endTime = currentTime + duration;
    timingData.push({ startTime, endTime, tone: part.tone, backgroundVolume: BACKGROUND_VOLUME_ADJUSTMENTS[part.tone] });
    currentTime = endTime;
  });

  return timingData;
}
