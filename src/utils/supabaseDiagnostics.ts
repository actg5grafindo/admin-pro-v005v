import { createClient } from '@supabase/supabase-js';

// Diagnostic function to check Supabase connectivity
export async function performSupabaseDiagnostics() {
  console.log('🔍 Starting Supabase Diagnostics...');

  // Validate environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase Environment Variables');
    return {
      success: false,
      message: 'Environment variables are not configured correctly'
    };
  }

  console.log(`📍 Supabase URL: ${supabaseUrl}`);

  try {
    // Create Supabase client with extended timeout
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true
      },
      global: {
        headers: { 
          'x-diagnostic-check': 'connection-test',
          'Origin': 'http://localhost:5050'
        }
      }
    });

    // Test connection with a simple query
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .single();

    if (error) {
      console.error('❌ Supabase Query Error:', error);
      return {
        success: false,
        message: 'Failed to query Supabase',
        details: error
      };
    }

    console.log('✅ Supabase Connection Successful!');
    return {
      success: true,
      message: 'Supabase is fully operational',
      data: data
    };

  } catch (networkError) {
    console.error('❌ Network Connection Error:', networkError);
    return {
      success: false,
      message: 'Network connectivity issue',
      details: networkError
    };
  }
}

// Run diagnostics immediately if script is executed directly
if (import.meta.env.DEV) {
  performSupabaseDiagnostics().then(result => {
    console.log('Diagnostic Result:', result);
  });
}
