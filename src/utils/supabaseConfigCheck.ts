import { createClient } from '@supabase/supabase-js';

interface SupabaseConfigCheckResult {
  success: boolean;
  authSettings?: {
    emailSignupEnabled: boolean;
    emailConfirmationEnabled: boolean;
    signupRateLimit?: number;
    externalProviders: string[];
  };
  environmentConfig?: {
    supabaseUrl: string;
    anonKeyPresent: boolean;
    serviceRoleKeyPresent: boolean;
  };
  tableSchemas?: {
    users: boolean;
    profiles: boolean;
  };
  error?: string;
}

export async function performSupabaseConfigCheck(): Promise<SupabaseConfigCheckResult> {
  console.group('🔍 Comprehensive Supabase Configuration Check');
  
  try {
    // Initialize Supabase client
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL || '',
      import.meta.env.VITE_SUPABASE_ANON_KEY || ''
    );

    // Environment Configuration Check
    const environmentConfig = {
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'NOT SET',
      anonKeyPresent: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      serviceRoleKeyPresent: !!import.meta.env.SUPABASE_SERVICE_ROLE_KEY
    };
    console.log('🌐 Environment Configuration:', environmentConfig);

    // Table Schema Verification
    const tableSchemas = {
      users: await checkTableExists(supabase, 'users'),
      profiles: await checkTableExists(supabase, 'profiles')
    };
    console.log('📊 Table Schemas:', tableSchemas);

    // Authentication Settings (simulated, as direct API might not be available)
    const authSettings = {
      emailSignupEnabled: true, // Manually verify in Supabase dashboard
      emailConfirmationEnabled: true, // Manually verify in Supabase dashboard
      signupRateLimit: 5, // Default assumption
      externalProviders: ['email'] // Modify based on your actual configuration
    };
    console.log('🔐 Authentication Settings:', authSettings);

    console.groupEnd();

    return {
      success: true,
      environmentConfig,
      tableSchemas,
      authSettings
    };
  } catch (error) {
    console.error('🚨 Supabase Configuration Check Error:', error);
    console.groupEnd();
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function checkTableExists(supabase: any, tableName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('id')
      .limit(1);

    return !error;
  } catch {
    return false;
  }
}

export default performSupabaseConfigCheck;

// Run check on import for immediate feedback
performSupabaseConfigCheck().then(result => {
  console.log('Supabase Configuration Check Result:', result);
});
