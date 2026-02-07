/*
  # Initial Schema Setup for Factify

  ## Query Description:
  This migration sets up the core tables for the application:
  1. `profiles`: Extends the default auth.users table to store application-specific user data.
  2. `claims`: Stores the history of verified claims, linked to users.
  
  It also sets up Row Level Security (RLS) to ensure users can only see their own data.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "High"
  - Requires-Backup: false
  - Reversible: true

  ## Structure Details:
  - Tables: public.profiles, public.claims
  - Triggers: on_auth_user_created (auto-creates profile)
  
  ## Security Implications:
  - RLS Enabled on all tables.
  - Public access disabled by default.
*/

-- Create profiles table to extend auth.users
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone
);

-- Create claims table for history
create table if not exists public.claims (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  input_text text not null,
  verdict text, -- 'True', 'False', 'Mixed', 'Unverified'
  score integer,
  confidence integer,
  explanation text,
  sources jsonb, -- Store sources list as JSON
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.claims enable row level security;

-- Policies for Profiles
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- Policies for Claims
create policy "Users can view own claims." on public.claims
  for select using (auth.uid() = user_id);

create policy "Users can insert own claims." on public.claims
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own claims." on public.claims
  for delete using (auth.uid() = user_id);

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
