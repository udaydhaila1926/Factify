/*
  # Fix Profile Schema and RLS

  ## Query Description:
  1. Ensures 'profiles' table has 'website', 'full_name', 'avatar_url' columns.
  2. Enables RLS.
  3. Recreates policies to ensure users can view all profiles but only edit their own.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Medium"
  - Requires-Backup: false
  - Reversible: true
  
  ## Structure Details:
  - Table: profiles
  - Columns: website (TEXT), full_name (TEXT), avatar_url (TEXT)
  
  ## Security Implications:
  - RLS Status: Enabled
  - Policy Changes: Yes (Recreated for SELECT, INSERT, UPDATE)
*/

-- 1. Ensure the profiles table exists and has the correct columns
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT
);

-- 2. Add columns if they are missing (Idempotent fix)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'website') THEN
        ALTER TABLE public.profiles ADD COLUMN website TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
        ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- 3. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies (Drop existing to avoid conflicts)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone." 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile." 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile." 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);
