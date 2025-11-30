# DailyMotiv

DailyMotiv is a lightweight Next.js app for short daily check-ins, motivational nudges, and saved personal history. This repository is a pivot from the original Breakup-music project — key differences and setup notes are below.

## Features

- Quick daily check-ins and history saving
- Motivational AI nudges (ElevenLabs TTS + OpenRouter prompts)
- Supabase authentication and storage
- Paddle billing for paid tiers and subscriptions
- Shareable previews and downloadable tracks for paid users
- Mobile-first UI with Tailwind and Framer Motion

## Tech Stack

- **Framework**: Next.js (App Router)
- **DB/ORM**: Drizzle + Postgres (migrations in `migrations/`)
- **Auth/Storage**: Supabase
- **Payments**: Paddle
- **TTS / Audio**: ElevenLabs (synchronous nudges); legacy Suno worker retired
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 20+ and `npm`
- A Postgres database for Drizzle (or local dev DB)

### Install

```bash
git clone https://github.com/dev0b1/daily-motiv.git
cd daily-motiv
npm install
cp .env.example .env
```

### Important environment variables

- `SUPABASE_URL` and `SUPABASE_ANON_KEY` — Supabase project
- `DATABASE_URL` — Postgres connection for Drizzle
- `PADDLE_API_KEY` and `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` — Paddle
- `ELEVENLABS_API_KEY` — ElevenLabs TTS
- `SITE_DOMAIN` — used to build callback/webhook URLs

### Development

```bash
npm run dev
```

Open http://localhost:5000

### Database migrations & seeds

Drizzle is configured via `drizzle.config.ts` and migrations live in `migrations/`.

To push schema changes (dev):

```bash
npm run db:push
npm run db:seed
```

## Notes about audio & providers

- The Suno-based background worker and some Suno API routes have been retired for this pivot — the app uses ElevenLabs for short TTS nudges and OpenRouter for prompt shaping.
- For preview/paid-generation flows, the codebase contains compatibility stubs and a migration that archives legacy `songs`/`audio_generation_jobs` tables.

## Project layout (high level)

- `src/app/` — App Router pages & API routes
- `src/components/` — UI components
- `lib/` — thin provider clients and helpers (Eleven, OpenRouter, file-storage, db-service)
- `server/` — background worker (archived/stubbed)
- `migrations/` — Drizzle migrations

## Deployment

- Push the `main` branch to GitHub and connect the repo to Vercel (or your host of choice).
- Ensure environment variables are set in the deployment environment.
- Switch Paddle to production keys and update webhook URLs (`SITE_DOMAIN/api/*`).

## Contributing

- Keep changes small and focused.
- Preserve the insert-then-enqueue pattern used for async generation flows unless intentionally reworking the pipeline.

---

Maintainers: `dev0b1` — if you'd like a different README structure, tell me what to add.

