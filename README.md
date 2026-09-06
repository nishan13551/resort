# ধানসিঁড়ি রেস্ট হাউজ — Dhansiri Rest House Management

A mobile-first, bilingual (বাংলা / English) booking & guest management system for Dhansiri Rest House.
Built with Next.js 16 (App Router), Tailwind CSS, and Supabase (Postgres + Realtime).

## Features

- Two roles: **Admin** (Rasel) and **Caretaker**
  - Logins: `admin@dhansiri.com` / `admin123` and `caretaker@dhansiri.com` / `caretaker123`
- Rooms, bookings, check-in/check-out, payments, history, calendar and reports
- Rocket billing rates: বিডব্লিউডিবি ৳70, অন্যান্য সরকারি অফিস ৳280, এনজিও / সাধারণ ৳600 (per day)
- Full Bangla + English i18n with language toggle
- Mobile-first bottom navigation, drawer, and dark-friendly UI

## Data storage

Two modes, automatic:

- **Online (Supabase)** — active when `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` are present. Reads/writes through PostgREST and
  syncs live across devices via Supabase Realtime.
- **Local (demo)** — otherwise falls back to `localStorage` so the app always runs.

## Local setup

```bash
# 1. Install
npm install

# 2. Create the database tables (once, in Supabase SQL Editor)
#    paste supabase/schema.sql and run it.

# 3. Add your project keys (never commit .env.local)
cp .env.example .env.local
#    fill NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# 4. Seed/reset data (rooms + sample bookings)
npm run seed:supabase

# 5. Run
npm run dev
```

## Deploy

Import the repo on [Vercel](https://vercel.com/new), add the same two
`NEXT_PUBLIC_*` env vars (Production, type Config), and deploy.

Production: https://resort-bice.vercel.app