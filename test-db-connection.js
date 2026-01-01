import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

async function testConnection() {
  console.log('Testing Supabase connection...');
  console.log('URL:', SUPABASE_URL);

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Test simple query
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Database Query Error:', error.message);
      console.error('Error details:', error);
    } else {
      console.log('✅ Database Connected Successfully!');
      console.log('Sample data:', data);
    }
  } catch (err) {
    console.error('❌ Connection Error:', err.message);
  }
}

testConnection();
