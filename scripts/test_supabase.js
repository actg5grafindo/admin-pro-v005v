const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('profiles')  // Replace with an existing table in your Supabase project
      .select('*')
      .limit(1);

    if (error) {
      console.error('Supabase Error:', error);
    } else {
      console.log('Supabase Connection Successful!');
      console.log('Sample Data:', data);
    }
  } catch (err) {
    console.error('Connection Test Failed:', err);
  }
}

testSupabaseConnection();
