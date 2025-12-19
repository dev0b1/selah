# Selah - Faith-based Prayer App

## Overview
Selah is a faith-based prayer app that helps users reconnect with God through daily Bible verses, personalized spoken prayers, and AI-generated worship songs.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Supabase Auth
- **Payments**: DodoPayments / Paddle
- **AI Services**: OpenRouter (prayer text), ElevenLabs (TTS), Suno (music generation)
- **Styling**: Tailwind CSS

## Project Structure
- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - React UI components
- `src/lib/` - Utility libraries and service clients
- `src/db/` - Drizzle ORM schema and database connection
- `components/` - Additional shared components
- `public/` - Static assets and PWA manifest

## Development
- **Port**: 5000 (bound to 0.0.0.0 for Replit proxy)
- **Database**: Uses Replit's built-in PostgreSQL

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push Drizzle schema changes to database

## Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection (auto-configured by Replit)
- `SUPABASE_URL` and `SUPABASE_ANON_KEY` - Supabase project credentials
- `ELEVENLABS_API_KEY` - For text-to-speech prayers
- `OPENROUTER_API_KEY` - For AI prayer generation
- `SUNO_API_KEY` - For AI music generation (optional)
- `SITE_DOMAIN` - Public URL for webhooks
