-- Run this in Supabase Dashboard > SQL Editor before using cloud sync.
-- It creates a private table where each signed-in user can only access their own weight records.

create table if not exists public.weight_entries (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  weight_kg numeric(6, 1) not null check (weight_kg >= 1 and weight_kg <= 1000),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.weight_entries enable row level security;

drop policy if exists "Users can read their own weight entries" on public.weight_entries;
drop policy if exists "Users can insert their own weight entries" on public.weight_entries;
drop policy if exists "Users can update their own weight entries" on public.weight_entries;
drop policy if exists "Users can delete their own weight entries" on public.weight_entries;

create policy "Users can read their own weight entries"
on public.weight_entries
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own weight entries"
on public.weight_entries
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own weight entries"
on public.weight_entries
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own weight entries"
on public.weight_entries
for delete
to authenticated
using (auth.uid() = user_id);


-- Migration for older versions of this app:
-- Run this if your existing table was created with one record per date.
alter table public.weight_entries
  drop constraint if exists weight_entries_user_id_date_key;

create index if not exists weight_entries_user_date_created_idx
  on public.weight_entries (user_id, date, created_at);
