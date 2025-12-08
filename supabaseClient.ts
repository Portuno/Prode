import { createClient } from '@supabase/supabase-js';

// Safely access env to prevent crash if import.meta.env is undefined
const env = (import.meta as any).env || {};

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase credentials missing! Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file or Vercel project settings.');
}

export const supabase = createClient(
  SUPABASE_URL || '', 
  SUPABASE_ANON_KEY || ''
);
