-- Run this in your Supabase SQL Editor

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Create Profiles table (extends default auth.users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Claims table (History)
create table public.claims (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  input_text text not null,
  verdict text check (verdict in ('True', 'False', 'Mixed', 'Unverified')),
  score integer check (score >= 0 and score <= 100),
  confidence integer,
  summary text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create Sources table (for detailed analysis storage)
create table public.sources (
  id uuid default uuid_generate_v4() primary key,
  claim_id uuid references public.claims(id) on delete cascade not null,
  name text not null,
  url text,
  credibility text check (credibility in ('High', 'Medium', 'Low'))
);

-- 5. Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.claims enable row level security;
alter table public.sources enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);

create policy "Users can see their own claims." on public.claims for select using (auth.uid() = user_id);
create policy "Users can insert their own claims." on public.claims for insert with check (auth.uid() = user_id);

create policy "Users can see sources for their claims." on public.sources for select using (
  exists ( select 1 from public.claims where claims.id = sources.claim_id and claims.user_id = auth.uid() )
);
