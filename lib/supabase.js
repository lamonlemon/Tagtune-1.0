import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  if (typeof window === 'undefined') {
    console.error('Missing Supabase credentials in environment variables');
  }
}

export const supabase = createClient(supabaseUrl, supabaseKey);
