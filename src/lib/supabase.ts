import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Robust fallback to prevent app crash if env vars are missing or placeholders
// This allows the UI to render even if Supabase isn't fully connected yet.
const url = supabaseUrl && supabaseUrl.startsWith('http') 
  ? supabaseUrl 
  : 'https://placeholder.supabase.co';

const key = supabaseAnonKey || 'placeholder';

export const supabase = createClient(url, key);
