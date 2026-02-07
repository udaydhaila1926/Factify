/*
  # Add Google Fact Check API Key
  
  ## Query Description:
  Adds a new column to the profiles table to store the Google Fact Check Tools API key.
  
  ## Metadata:
  - Schema-Category: "Safe"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true
  
  ## Structure Details:
  - Table: profiles
  - Column: google_fact_check_key (TEXT)
*/

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'google_fact_check_key') THEN
        ALTER TABLE profiles ADD COLUMN google_fact_check_key TEXT;
    END IF;
END $$;
