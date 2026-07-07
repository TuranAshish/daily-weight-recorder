# Daily Weight Recorder

A modern, responsive, no-ads weight tracking app built with Next.js, TypeScript, Tailwind CSS, shadcn-style UI components, Recharts, localStorage fallback, and optional Supabase cloud sync.

## Why Vercel alone did not sync across devices

The first version used `localStorage`. That means data is saved inside one browser only. Vercel deploys the website, but it does not automatically create a shared database. To sync phone + laptop + other devices, this version supports Supabase Auth + Database.

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

### 1. Create a Supabase account and project

1. Go to https://supabase.com
2. Click **Start your project** or **Sign in**
3. Continue with GitHub or email
4. Click **New project**
5. Create/select an organization
6. Enter a project name, for example `daily-weight-recorder`
7. Set a strong database password and save it somewhere safe
8. Choose a nearby region
9. Click **Create new project**
10. Wait until the project is ready

### 2. Create the database table

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Click **New query**
4. Open this project file: `supabase.sql`
5. Copy everything from `supabase.sql`
6. Paste it into Supabase SQL Editor
7. Click **Run**

This creates a private `weight_entries` table with Row Level Security. Each signed-in user can only read/write their own records.

### 3. Get Supabase URL and key

In Supabase dashboard, open the **Connect** dialog or **Project Settings > API Keys**.

You need:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here
```

Older projects may show an anon/public key instead. This app supports both names:

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Use only the public/publishable/anon key in the browser. Never put a `service_role` or secret key in this Next.js frontend.

### 4. Add environment variables locally

Create `.env.local` in the project root:

```bash
cp .env.example .env.local
```

Open `.env.local` and paste your real values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here
```

Then restart:

```bash
pnpm dev
```

You will now see a sign-in/sync panel in the app.

### 5. Add environment variables on Vercel

In Vercel:

```text
Project > Settings > Environment Variables
```

Add these variables for Production, Preview, and Development:

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

If your Supabase dashboard only gives an anon key, add this instead:

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Then redeploy the project.

## How sync works

- Without Supabase env variables: local-only mode
- With Supabase env variables: users can create account/sign in
- Same email/password on any device = same synced records
- Existing local records are merged and uploaded after sign-in
- Multiple weights on the same date are supported

## Build for production

```bash
pnpm build
```

## Date and weight limits

The app allows past, present, and future dates. Weight values are accepted from 1 kg to 1000 kg.

## Multiple weights on one date

This version supports many weight records on the same date. This is useful for morning/evening checks or repeated measurements.

If you already created the Supabase table with an older version, run this migration in Supabase SQL Editor:

```sql
alter table public.weight_entries
  drop constraint if exists weight_entries_user_id_date_key;

create index if not exists weight_entries_user_date_created_idx
  on public.weight_entries (user_id, date, created_at);
```

After this, the same signed-in user can save unlimited entries for the same date.
