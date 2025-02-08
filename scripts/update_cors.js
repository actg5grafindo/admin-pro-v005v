const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function updateCorsSettings() {
  try {
    const { data, error } = await supabase.auth.updateConfig({
      external: {
        allowedOrigins: [
          'http://localhost:5050', 
          'https://admin-pro-two.vercel.app'
        ]
      }
    });

    if (error) {
      console.error('Error updating CORS settings:', error);
    } else {
      console.log('CORS settings updated successfully:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

updateCorsSettings();
