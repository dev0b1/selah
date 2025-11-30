#!/usr/bin/env bash
set -euo pipefail

# Simple helper to create short placeholder MP3s in public/bg/ for local testing.
# Requires ffmpeg available on PATH or @ffmpeg-installer/ffmpeg installed globally.

OUT_DIR="public/bg"
mkdir -p "$OUT_DIR"

echo "Generating placeholder background tracks in $OUT_DIR"

# 5-second silent audio (anullsrc) encoded to mp3
ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=stereo -t 5 -q:a 9 "$OUT_DIR/ambient-1.mp3" </dev/null >/dev/null 2>&1 || {
  echo "ffmpeg not found on PATH. If you installed @ffmpeg-installer/ffmpeg, run the script via node or ensure ffmpeg is available.";
  exit 1;
}

# Sine tone as a gentle ambient (demo)
ffmpeg -y -f lavfi -i "sine=frequency=220:duration=5" -q:a 9 "$OUT_DIR/calm-1.mp3" </dev/null >/dev/null 2>&1 || true

# Slightly higher tone for energetic sample
ffmpeg -y -f lavfi -i "sine=frequency=440:duration=5" -q:a 9 "$OUT_DIR/energetic-1.mp3" </dev/null >/dev/null 2>&1 || true

echo "Created ambient-1.mp3, calm-1.mp3, energetic-1.mp3 (5s each)"
