/*
  # Secure Claims Table
  
  ## Query Description:
  This migration enables Row Level Security (RLS) on the 'claims' table and adds policies
  to ensure users can only create and view their own verification history.
  
  ## Metadata:
  - Schema-Category: "Safe"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true
  
  ## Security Implications:
  - RLS Status: Enabled
  - Policy Changes: Adds INSERT and SELECT policies linked to auth.uid()
*/

-- 1. Ensure RLS is enabled
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts during re-runs
DROP POLICY IF EXISTS "Users can insert their own claims" ON claims;
DROP POLICY IF EXISTS "Users can view their own claims" ON claims;

-- 3. Create Policy: Allow users to save their verification results
CREATE POLICY "Users can insert their own claims"
ON claims FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 4. Create Policy: Allow users to see their own history
CREATE POLICY "Users can view their own claims"
ON claims FOR SELECT
USING (auth.uid() = user_id);
