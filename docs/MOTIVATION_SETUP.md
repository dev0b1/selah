Motivation generation: dependencies & environment

This project includes a server-side pipeline that:
- Generates a motivation script via an LLM (OpenRouter)
- Converts script to SSML
- Synthesizes speech via ElevenLabs
- Mixes TTS with background music using ffmpeg

Required environment variables
- `OPENROUTER_API_KEY` — API key for OpenRouter
- `ELEVENLABS_API_KEY` — API key for ElevenLabs (Xi API key)
- `ELEVEN_VOICE_ID` — (optional) ElevenLabs voice id to use; default voice currently in code
- `SITE_DOMAIN` — (optional) public site domain, used for callbacks if needed

NPM packages to install (if not already present)

```bash
# project root
npm install fluent-ffmpeg @ffmpeg-installer/ffmpeg @ffprobe-installer/ffprobe
# If you plan to run the OpenRouter client or other node requests, ensure fetch/axios is available
npm install node-fetch
```

FFmpeg runtime

The mixer uses `ffmpeg` at runtime. The script above installs `@ffmpeg-installer/ffmpeg` which provides a platform binary for Node usage. For local testing you can also install a system ffmpeg:

macOS (Homebrew):
```bash
brew install ffmpeg
```

Ubuntu/Debian:
```bash
sudo apt update && sudo apt install ffmpeg -y
```

Windows (choco):
```bash
choco install ffmpeg
```

Generating placeholder background tracks (local testing)

The repo includes a helper script `scripts/generate-placeholder-bg.sh` that uses `ffmpeg` to create a few short MP3s in `public/bg/`. Run it from the project root:

```bash
bash scripts/generate-placeholder-bg.sh
```

The script will create `public/bg/ambient-1.mp3`, `public/bg/calm-1.mp3`, and `public/bg/energetic-1.mp3` (5 seconds each) so the mixer can run without needing curated music files.

Testing the API (smoke test)

After setting env vars and generating placeholders, you can POST to the route to generate a mixed MP3 (requires valid `OPENROUTER_API_KEY` and `ELEVENLABS_API_KEY`):

```bash
curl -X POST http://localhost:3000/api/generate-motivation \
  -H "Content-Type: application/json" \
  -d '{"text":"I need motivation to keep going","mood":"confidence"}' --output motivation.mp3
```

Notes & troubleshooting
- If the API fails at TTS step, ensure `ELEVENLABS_API_KEY` is set and the voice ID (if required) exists.
- If ffmpeg cannot be found, install `@ffmpeg-installer/ffmpeg` (npm) or a system `ffmpeg` and ensure it's in PATH.
- For production deployments, ensure server runtime allows the Node `child_process`/ffmpeg usage or use a managed audio service.
