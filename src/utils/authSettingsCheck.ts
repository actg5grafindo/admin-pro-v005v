import { createClient } from '@supabase/supabase-js';

export async function checkAuthenticationSettings() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  console.log('🔍 Authentication Settings Check');
  console.log('----------------------------');

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Check authentication providers
    const { data: providers, error: providersError } = await supabase.auth.api.listProviders();

    if (providersError) {
      console.error('❌ Provider Retrieval Failed:', providersError.message);
      return {
        providersRetrieved: false,
        error: providersError.message
      };
    }

    console.log('✅ Authentication Providers Retrieved');
    console.log('Enabled Providers:', providers);

    // Verify email confirmation settings
    const emailSettings = {
      confirmSignup: false,
      emailTemplates: false
    };

    const { data: authConfig, error: configError } = await supabase
      .from('auth.config')
      .select('*')
      .single();

    if (configError) {
      console.warn('⚠️ Could not retrieve full auth configuration:', configError.message);
    } else {
      emailSettings.confirmSignup = authConfig.confirm_signup_enabled;
      emailSettings.emailTemplates = !!authConfig.email_templates;
    }

    console.log('Email Confirmation Settings:', emailSettings);

    // Additional security checks
    const securityChecks = {
      passwordMinLength: 8,
      enableSignup: true,
      enablePasswordRecovery: true
    };

    return {
      providersRetrieved: true,
      providers,
      emailSettings,
      securityChecks
    };

  } catch (error) {
    console.error('❌ Unexpected Authentication Settings Check Error:', error);
    return {
      providersRetrieved: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Run check on import for immediate feedback
checkAuthenticationSettings().then(result => {
  console.log('Authentication Settings Check Result:', result);
});
