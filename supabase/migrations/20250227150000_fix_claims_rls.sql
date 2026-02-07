/*
  # Fix Claims Table Security
  
  ## Query Description:
  This migration ensures the 'claims' table has proper Row Level Security (RLS) policies.
  It fixes the "RLS Enabled No Policy" security advisory by explicitly defining who can access data.
  
  ## Security Implications:
  - Enables RLS on 'claims' table
  - Adds policy for INSERT: Users can only create claims for themselves
  - Adds policy for SELECT: Users can only view their own claims
*/

-- 1. Enable RLS
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own claims" ON claims;
DROP POLICY IF EXISTS "Users can insert own claims" ON claims;

-- 3. Create Policies
CREATE POLICY "Users can view own claims" 
ON claims FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own claims" 
ON claims FOR INSERT 
WITH CHECK (auth.uid() = user_id);
