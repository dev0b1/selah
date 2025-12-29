# Background Music for Prayers

This folder contains background music files that are mixed with ElevenLabs TTS audio for prayer playback.

## File Structure

Place your background music files here:
- `prayer-background.mp3` - Default background music for all prayers (required)
- `prayer-peace.mp3` - Optional: Background for peace-themed prayers
- `prayer-guidance.mp3` - Optional: Background for guidance-themed prayers
- `prayer-strength.mp3` - Optional: Background for strength-themed prayers
- etc.

## Requirements

- **Format**: MP3 (recommended) or WAV
- **Duration**: Should be at least 60 seconds (will loop if needed)
- **Volume**: Keep background music subtle (-18dB to -15dB when mixed)
- **Style**: Gentle, peaceful, non-distracting instrumental music
- **Bitrate**: 192kbps or higher recommended

## Usage

The system will automatically:
1. Generate TTS audio from prayer text
2. Mix it with the background music at -18dB
3. Normalize and compress the final audio
4. Upload to storage

## Upload Instructions

1. Prepare your background music file (MP3 format, 60+ seconds)
2. Name it `prayer-background.mp3` for the default
3. Place it in this folder: `public/bg/prayer-background.mp3`
4. The system will automatically use it for all prayer audio generation

## Optional: Mood-Specific Backgrounds

You can extend the system to use different backgrounds based on prayer mood by modifying `src/lib/server/eleven-nudge.server.ts` to select different files based on the `mood` parameter.
