const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
require('dotenv').config();

async function debugSupabaseCORS() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  console.log('🔍 Supabase CORS Debugging');
  console.log('---------------------------');
  console.log('Supabase URL:', supabaseUrl);

  try {
    // Direct Fetch Test
    console.log('\n1. Direct Fetch Test:');
    const fetchResponse = await fetch(supabaseUrl, {
      method: 'HEAD',
      headers: {
        'Origin': 'http://localhost:5050'
      }
    });
    console.log('Fetch Status:', fetchResponse.status);
    console.log('Fetch Headers:', Object.fromEntries(fetchResponse.headers));
  } catch (fetchError) {
    console.error('Fetch Error:', fetchError.message);
  }

  try {
    // Axios Test
    console.log('\n2. Axios Request Test:');
    const axiosResponse = await axios.head(supabaseUrl, {
      headers: {
        'Origin': 'http://localhost:5050'
      }
    });
    console.log('Axios Status:', axiosResponse.status);
    console.log('Axios Headers:', axiosResponse.headers);
  } catch (axiosError) {
    console.error('Axios Error:', axiosError.message);
  }

  try {
    // Supabase Client Test
    console.log('\n3. Supabase Client Test:');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data, error } = await supabase
      .from('profiles')  // Replace with an existing table
      .select('*')
      .limit(1);

    if (error) {
      console.error('Supabase Query Error:', error);
    } else {
      console.log('Supabase Query Successful:', data);
    }
  } catch (supabaseError) {
    console.error('Supabase Client Error:', supabaseError);
  }
}

debugSupabaseCORS();
