const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
require('dotenv').config();

async function performNetworkDiagnostics() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  console.log('🔍 Comprehensive Supabase Network Diagnostics');
  console.log('-------------------------------------------');
  console.log(`🌐 Checking URL: ${supabaseUrl}`);

  // 1. Basic URL Validation
  try {
    const parsedUrl = new URL(supabaseUrl);
    console.log(`✅ URL Parsed Successfully: ${parsedUrl.hostname}`);
  } catch (urlError) {
    console.error('❌ Invalid URL:', urlError);
    return;
  }

  // 2. Fetch Connectivity Check
  try {
    const fetchResponse = await fetch(supabaseUrl, {
      method: 'HEAD',
      headers: {
        'Origin': 'http://localhost:5050',
        'Access-Control-Request-Method': 'GET'
      }
    });
    console.log('✅ Fetch Response Status:', fetchResponse.status);
    console.log('Fetch Headers:', Object.fromEntries(fetchResponse.headers));
  } catch (fetchError) {
    console.error('❌ Fetch Error:', fetchError);
  }

  // 3. Axios Connectivity Check
  try {
    const axiosResponse = await axios.head(supabaseUrl, {
      headers: {
        'Origin': 'http://localhost:5050',
        'Access-Control-Request-Method': 'GET'
      }
    });
    console.log('✅ Axios Response Status:', axiosResponse.status);
    console.log('Axios Headers:', axiosResponse.headers);
  } catch (axiosError) {
    console.error('❌ Axios Error:', axiosError.message);
  }

  // 4. Supabase Client Initialization Test
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false
      }
    });

    console.log('✅ Supabase Client Created Successfully');

    // Test a simple query
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Supabase Query Error:', error);
    } else {
      console.log('✅ Supabase Query Successful');
    }
  } catch (supabaseError) {
    console.error('❌ Supabase Client Initialization Error:', supabaseError);
  }

  // 5. Network Fallback Check
  try {
    const fallbackResponse = await fetch('https://www.google.com', {
      method: 'HEAD',
      mode: 'no-cors'
    });
    console.log('✅ Fallback Network Connectivity: Successful');
  } catch (fallbackError) {
    console.error('❌ Fallback Network Check Failed:', fallbackError);
  }
}

performNetworkDiagnostics();
