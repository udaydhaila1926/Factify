/*
  # Add NewsAPI Key
  Adds a column to store the user's NewsAPI key for real-time context fetching.

  ## Metadata:
  - Schema-Category: "Safe"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true
*/

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'news_api_key') THEN
        ALTER TABLE profiles ADD COLUMN news_api_key TEXT;
    END IF;
END $$;
