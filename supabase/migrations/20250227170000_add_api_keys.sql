/*
  # Add API Keys to Profiles
  Adds columns to store OpenAI and Gemini API keys in the user's profile.

  ## Query Description:
  Adds `openai_api_key` and `gemini_api_key` text columns to the `profiles` table.
  
  ## Metadata:
  - Schema-Category: "Data"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true
  
  ## Structure Details:
  - Table: profiles
  - New Columns: openai_api_key (TEXT), gemini_api_key (TEXT)
  
  ## Security Implications:
  - RLS: Existing policies on `profiles` restrict access to the user themselves, ensuring keys remain private.
*/

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'openai_api_key') THEN
        ALTER TABLE profiles ADD COLUMN openai_api_key TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'gemini_api_key') THEN
        ALTER TABLE profiles ADD COLUMN gemini_api_key TEXT;
    END IF;
END $$;
