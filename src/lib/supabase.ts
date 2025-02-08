import { createClient } from '@supabase/supabase-js';
import { performSupabaseDiagnostics } from '@/utils/supabaseDiagnostics';

// Enhanced error handling fetch implementation
const enhancedFetch = async (input: RequestInfo, init?: RequestInit) => {
  console.log('🌐 Fetch Request:', {
    url: input,
    method: init?.method || 'GET',
    headers: init?.headers
  });

  try {
    const response = await fetch(input, {
      ...init,
      headers: {
        ...init?.headers,
        'Origin': window.location.origin,
        'Access-Control-Request-Method': init?.method || 'GET',
        'x-client-info': 'admin-pro/v1.0'
      },
      mode: 'cors',
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('❌ Fetch Error:', {
        status: response.status,
        statusText: response.statusText,
        url: input
      });

      // Detailed error parsing
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
    }

    return response;
  } catch (error) {
    console.error('🚨 Network Fetch Error:', error);
    throw error;
  }
};

// Validate environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ixtjeocobjqcqladeaqg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4dGplb2NvYmpxY3FsYWRlYXFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDY5NTM2MDAsImV4cCI6MjAyMjUyOTYwMH0.Ld8Ek4sCPFPwVXRGn-ZLkqJqMlNlYzIxZDBlNDY3YzM';

// Singleton Supabase Client
export class SupabaseClientSingleton {
  private static instance: ReturnType<typeof createClient> | null = null;

  private constructor() {}

  public static getInstance() {
    if (!this.instance) {
      this.instance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
        },
        global: {
          headers: {
            'x-client-info': 'admin-pro/v1.0'
          }
        },
        db: {
          schema: 'public'
        },
        fetch: enhancedFetch as any
      });

      // Add error logging
      console.log('🌐 Supabase Client Initialized');
    }
    return this.instance;
  }

  public static resetInstance() {
    this.instance = null;
  }
}

// Export the singleton Supabase client
export const supabase = SupabaseClientSingleton.getInstance();

// Admin client for advanced operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  },
  global: {
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }
});

// Comprehensive connectivity diagnostic function
export async function checkSupabaseConnection() {
  console.log('🔍 Starting Comprehensive Supabase Connectivity Check...');
  
  try {
    // Check Supabase URL and Keys
    console.log('🌐 Supabase Configuration:', {
      url: supabaseUrl,
      anonKeyPresent: !!supabaseAnonKey,
      serviceRoleKeyPresent: !!import.meta.env.SUPABASE_SERVICE_ROLE_KEY
    });

    // Attempt to ping Supabase
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (error) {
      console.error('❌ Supabase Connection Error:', {
        message: error.message,
        details: error
      });
      return { 
        success: false, 
        error: `Database Connection Failed: ${error.message}` 
      };
    }

    console.log('✅ Supabase Connection Successful');
    return { 
      success: true, 
      message: 'Supabase connection and basic query working' 
    };
  } catch (unexpectedError) {
    console.error('🚨 Unexpected Supabase Connection Error:', unexpectedError);
    return { 
      success: false, 
      error: `Unexpected Error: ${unexpectedError instanceof Error ? unexpectedError.message : 'Unknown error'}` 
    };
  }
}

// Run diagnostics on client initialization
if (import.meta.env.DEV) {
  checkSupabaseConnection().then(result => {
    if (!result.success) {
      console.warn('⚠️ Supabase Connectivity Issues Detected:', result.error);
    }
  });
}

export { enhancedFetch };

// Export diagnostic function for manual checks
export { performSupabaseDiagnostics };

// Comprehensive Supabase signup diagnostics
export async function performSupabaseSignupDiagnostics(email: string, username: string, phoneNumber?: string) {
  console.log('🔍 Starting Comprehensive Supabase Signup Diagnostics...');
  
  try {
    // Check email uniqueness
    const emailQuery = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .or(`metadata->email.eq."${email}",email.eq."${email}"`)
      .limit(1);

    console.log('📧 Email Uniqueness Check:', {
      exists: emailQuery.count > 0,
      data: emailQuery.data,
      error: emailQuery.error
    });

    // Check username uniqueness
    const usernameQuery = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .or(`display_name.eq."${username}",metadata->username.eq."${username}"`)
      .limit(1);

    console.log('👤 Username Uniqueness Check:', {
      exists: usernameQuery.count > 0,
      data: usernameQuery.data,
      error: usernameQuery.error
    });

    // Check phone number uniqueness if provided
    let phoneQuery = { count: 0, data: null, error: null };
    if (phoneNumber) {
      phoneQuery = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('phone_number', phoneNumber)
        .limit(1);

      console.log('📱 Phone Number Uniqueness Check:', {
        exists: phoneQuery.count > 0,
        data: phoneQuery.data,
        error: phoneQuery.error
      });
    }

    return {
      success: true,
      diagnostics: {
        emailExists: emailQuery.count > 0,
        usernameExists: usernameQuery.count > 0,
        phoneExists: phoneQuery.count > 0
      }
    };
  } catch (unexpectedError) {
    console.error('🚨 Unexpected Signup Diagnostic Error:', unexpectedError);
    return { 
      success: false, 
      error: `Unexpected Error: ${unexpectedError instanceof Error ? unexpectedError.message : 'Unknown error'}` 
    };
  }
}
