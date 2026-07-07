# Daily Weight Recorder

A modern, responsive, no-ads weight tracking app built with Next.js, TypeScript, Tailwind CSS, shadcn-style UI components, Recharts, localStorage, and optional Supabase cloud sync.

## Why your Vercel app did not sync across devices

The first version used `localStorage`. That means data is saved inside one browser only. Vercel deploys the website, but it does not automatically create a shared database. To sync phone + laptop + other devices, this updated version supports Supabase Auth + Database.

## Run locally

```bash
pnpm install
pnpm dev
```

Open:

```bash
http://localhost:3000
```

## Enable cloud sync with Supabase

### 1. Create a Supabase project

Go to Supabase and create a new project.

### 2. Create the database table

Open Supabase Dashboard > SQL Editor and run the SQL from:

```text
supabase.sql
```

This creates a private `weight_entries` table with Row Level Security. Each user can only read/write their own records.

### 3. Add environment variables locally

Create `.env.local` in the project root:

```bash
cp .env.example .env.local
```

Then paste your Supabase values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Get these from Supabase Dashboard > Project Settings > API.

### 4. Restart the local server

```bash
pnpm dev
```

You will now see a sign-in/sync panel in the app.

### 5. Add the same environment variables on Vercel

In Vercel:

Project > Settings > Environment Variables

Add:

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Then redeploy the project.

## How sync works

- Without Supabase env variables: local-only mode
- With Supabase env variables: users can create account/sign in
- Same email/password on any device = same synced records
- Existing local records are merged and uploaded after sign-in

## Build for production

```bash
pnpm build
```

## Tech stack

- Next.js
- TypeScript
- Tailwind CSS
- Recharts
- Supabase Auth + Database
- localStorage fallback


## Date and weight limits

The app now allows past, present, and future dates in the date picker. Weight values are accepted from 1 kg to 1000 kg. If you are using Supabase and already created the database before this update, run the migration below in Supabase SQL Editor:

```sql
alter table public.weight_entries
  alter column weight_kg type numeric(6, 1);

alter table public.weight_entries
  drop constraint if exists weight_entries_weight_kg_check;

alter table public.weight_entries
  add constraint weight_entries_weight_kg_check check (weight_kg >= 1 and weight_kg <= 1000);
```
