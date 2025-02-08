const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function verifySupabaseConfig() {
  try {
    console.log('🔍 Verifying Supabase Configuration:\n');
    
    // Check Authentication Settings
    const { data: authConfig, error: authError } = await supabase.auth.getConfig();
    
    if (authError) {
      console.error('❌ Error fetching auth config:', authError);
      return;
    }

    console.log('Authentication Configuration:');
    console.log('-------------------------');
    console.log('Site URL:', authConfig.site_url);
    console.log('Redirect URLs:', authConfig.additional_redirect_urls || 'Not set');
    console.log('Allowed Callback URLs:', authConfig.additional_redirect_urls || 'Not set');
    
    // Recommended Configuration Check
    const recommendedUrls = [
      'http://localhost:5050',
      'https://admin-pro-two.vercel.app'
    ];

    const missingUrls = recommendedUrls.filter(url => 
      !authConfig.additional_redirect_urls?.includes(url)
    );

    if (missingUrls.length > 0) {
      console.warn('⚠️ Recommended URLs not found:');
      missingUrls.forEach(url => console.warn(`   - ${url}`));
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

verifySupabaseConfig();
