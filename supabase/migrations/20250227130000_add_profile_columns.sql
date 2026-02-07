/*
# Add missing columns to profiles table

## Query Description:
This migration adds 'website', 'full_name', and 'avatar_url' columns to the 'profiles' table if they don't exist.
This fixes the error encountered on the Profile page where the app tries to fetch these fields.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Table: public.profiles
- Columns added: website (text), full_name (text), avatar_url (text)
*/

DO $$
BEGIN
    -- Add website column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'website') THEN
        ALTER TABLE public.profiles ADD COLUMN website text;
    END IF;

    -- Add full_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'full_name') THEN
        ALTER TABLE public.profiles ADD COLUMN full_name text;
    END IF;

    -- Add avatar_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url text;
    END IF;
END $$;
