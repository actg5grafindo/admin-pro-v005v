const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Supabase Configuration Check');
console.log('-----------------------------');
console.log('Supabase URL:', SUPABASE_URL);
console.log('Supabase Anon Key:', SUPABASE_KEY ? 'Loaded ✅' : '❌ Missing');

try {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  console.log('\n🌐 Connection Test:');
  console.log('Supabase client created successfully ✅');
} catch (error) {
  console.error('❌ Error creating Supabase client:', error);
}

console.log('\n📝 Recommended Redirect URLs:');
const recommendedUrls = [
  'http://localhost:5050',
  'http://localhost:5050/login',
  'http://localhost:5050/register',
  'https://admin-pro-two.vercel.app',
  'https://admin-pro-two.vercel.app/login',
  'https://admin-pro-two.vercel.app/register'
];

recommendedUrls.forEach(url => console.log(`- ${url}`));
