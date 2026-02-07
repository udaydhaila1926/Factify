/*
  # Initial Schema Setup for Factify

  ## Query Description: 
  Sets up the 'profiles' and 'claims' tables to store user data and verification history.
  Includes Row Level Security (RLS) to ensure users only see their own data.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "High"
  - Requires-Backup: false
  - Reversible: true

  ## Structure Details:
  - Table: profiles (Linked to auth.users)
  - Table: claims (Stores verification results)
  - Triggers: Auto-create profile on user signup
*/

-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Create claims table
create table if not exists public.claims (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  input_text text not null,
  verdict text not null,
  credibility_score integer not null,
  confidence_level integer default 0,
  explanation text,
  sources jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on claims
alter table public.claims enable row level security;

-- Policies for Profiles
create policy "Users can view own profiles" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profiles" on public.profiles
  for update using (auth.uid() = id);

-- Policies for Claims
create policy "Users can view own claims" on public.claims
  for select using (auth.uid() = user_id);

create policy "Users can insert own claims" on public.claims
  for insert with check (auth.uid() = user_id);

-- Trigger for new users (Handle Profile Creation)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid duplication errors on re-runs
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
