const { createClient } = require('@supabase/supabase-js');

async function runSupabaseDiagnostics() {
  console.log('🔍 Supabase Configuration Diagnostics');
  console.log('-----------------------------------');

  // Retrieve configuration from environment
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  console.log('Configuration Check:');
  console.log(`- Supabase URL: ${supabaseUrl}`);
  console.log(`- Supabase Anon Key: ${supabaseAnonKey ? 'Present' : 'Missing'}`);

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase configuration. Check your .env file.');
    return;
  }

  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Network Connectivity Check
    console.log('\n🌐 Network Connectivity:');
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
        .single();

      if (error) {
        console.warn('⚠️ Table Access Issue:', error);
      } else {
        console.log('✅ Successfully connected to Supabase');
      }
    } catch (networkError) {
      console.error('❌ Network Error:', networkError);
    }

    // Table Schema Check
    console.log('\n💾 Table Schema Diagnostics:');
    const requiredColumns = ['id', 'full_name', 'email', 'username'];
    const optionalColumns = ['email_verified', 'phone_number', 'language'];

    try {
      const { data: tableInfo, error } = await supabase
        .from('profiles')
        .select(requiredColumns.join(', '))
        .limit(1)
        .single();

      if (error) {
        console.error('❌ Table Schema Error:', error);
      } else {
        console.log('✅ Required Columns Present');
        
        // Check optional columns
        const missingOptionalColumns = optionalColumns.filter(
          col => !(col in tableInfo)
        );

        if (missingOptionalColumns.length > 0) {
          console.warn('⚠️ Missing Optional Columns:', missingOptionalColumns);
        }
      }
    } catch (schemaError) {
      console.error('❌ Schema Validation Error:', schemaError);
    }

  } catch (clientError) {
    console.error('❌ Supabase Client Initialization Error:', clientError);
  }
}

// Load environment variables from .env file
require('dotenv').config({ path: '../.env' });

// Run diagnostics
runSupabaseDiagnostics();
