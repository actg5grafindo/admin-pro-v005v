const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function configureSupabaseEmail() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('❌ Missing Supabase credentials');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  console.log('🔧 Configuring Supabase Email Settings');
  console.log('------------------------------------');

  try {
    // Update Auth Config
    const { data: authConfig, error: configError } = await supabase.auth.updateConfig({
      // Site URL for redirects
      site_url: 'https://admin-pro-two.vercel.app',
      
      // Additional redirect URLs
      additional_redirect_urls: [
        'http://localhost:5050',
        'http://localhost:5050/login',
        'http://localhost:5050/register',
        'http://localhost:5050/verify-email',
        'https://admin-pro-two.vercel.app',
        'https://admin-pro-two.vercel.app/login',
        'https://admin-pro-two.vercel.app/register',
        'https://admin-pro-two.vercel.app/verify-email'
      ],

      // Email template settings
      email_template_config: {
        // Customize email verification template
        verification_template: {
          subject: 'Verify Your Email for AdminPro',
          content_type: 'text/html',
          body: `
            <h1>Email Verification</h1>
            <p>Your verification code is: {{.Token}}</p>
            <p>This code will expire in 1 hour.</p>
          `
        }
      }
    });

    if (configError) throw configError;

    console.log('✅ Auth Configuration Updated Successfully');

    // SMTP Configuration (optional, if you want to use custom SMTP)
    const { data, error } = await supabase.auth.updateConfig({
      smtp_settings: {
        host: 'smtp.resend.com',
        port: 465,
        secure: true,
        sender: 'AdminPro <actg.grafindotu@gmail.com>'
      }
    });

    if (error) throw error;

    console.log('✅ SMTP Settings Configured');

  } catch (err) {
    console.error('❌ Configuration Error:', err);
  }
}

configureSupabaseEmail();
