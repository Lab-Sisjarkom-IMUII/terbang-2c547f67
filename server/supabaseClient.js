import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  // Silent fail - don't log warning as it may be captured and returned as response
  // console.warn('SUPABASE_URL or SUPABASE_SERVICE_KEY not set. Server supabase client disabled.');
} else {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false },
    });
  } catch (err) {
    // Silent fail
    supabase = null;
  }
}

export { supabase };
