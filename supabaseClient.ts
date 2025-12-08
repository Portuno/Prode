
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vcmzlgnhkexorpfzznme.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjbXpsZ25oa2V4b3JwZnp6bm1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxODYxOTQsImV4cCI6MjA4MDc2MjE5NH0.IpLzTIuilWglOi9oMo-oDIJSnyzJ6nRVbS3N44n5EYY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
