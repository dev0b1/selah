# Selah

Selah is a faith-based prayer app that helps you pause and reconnect with God through a daily Bible verse, personalized spoken prayers, and optional AI-generated worship songs that speak your name.

## Features

- **Daily Bible Verse** - 365 pre-selected KJV verses, one per day, rotating yearly
- **Personalized Prayers** - AI-generated prayers with your name, unlimited text prayers for free users
- **Voice Prayers (Premium)** - Text-to-speech prayers with soft worship background music
- **AI Worship Songs (Premium)** - One AI-generated worship song per day, personalized with your name
- **Prayer History** - Full access to past prayers and songs (Premium)
- **3-Day Free Trial** - Try premium features before subscribing
- **DodoPayments** - Subscription billing ($9.99/month)
- **Mobile-First PWA** - Optimized for mobile web with add-to-home-screen support

## Tech Stack

- **Framework**: Next.js (App Router)
- **DB/ORM**: Drizzle + Postgres (migrations in `migrations/`)
- **Auth/Storage**: Supabase
- **Payments**: DodoPayments
- **TTS / Audio**: ElevenLabs (voice prayers)
- **Music Generation**: Suno API (worship songs)
- **AI**: OpenRouter/Claude (prayer text generation)
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
- `NEXT_PUBLIC_DODO_API_KEY` and `NEXT_PUBLIC_DODO_ENVIRONMENT` — DodoPayments
- `NEXT_PUBLIC_DODO_PRICE_MONTHLY` — Subscription price ID ($9.99/month)
- `ELEVENLABS_API_KEY` — ElevenLabs TTS for voice prayers
- `OPENROUTER_API_KEY` — OpenRouter for AI prayer text generation
- `SUNO_API_KEY` and `SUNO_API_URL` — Suno API for worship song generation (optional)
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
```

## Project layout (high level)

- `src/app/` — App Router pages & API routes
- `src/components/` — UI components
- `lib/` — provider clients and helpers (ElevenLabs, OpenRouter, db-service)
- `migrations/` — Drizzle migrations

## Deployment

- Push the `main` branch to GitHub and connect the repo to Vercel (or your host of choice).
- Ensure environment variables are set in the deployment environment.
- Switch DodoPayments to production keys and update webhook URLs (`SITE_DOMAIN/api/*`).

## Contributing

- Keep changes small and focused.
- Maintain the faith-first, calm, and personal tone throughout the app.

---

Maintainers: `dev0b1`
