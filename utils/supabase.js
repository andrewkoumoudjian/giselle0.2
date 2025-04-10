import { createClient } from '@supabase/supabase-js';
import config from './config';

// Initialize Supabase client
const supabaseUrl = config.supabase.url;
const supabaseKey = config.supabase.key;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or key. Please check your environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
