import { createClient } from '@supabase/supabase-js';

interface SignupErrorDiagnosticResult {
  success: boolean;
  diagnostics: {
    authConfigValid: boolean;
    tableAccessible: boolean;
    rlsPoliciesAllowInsertion: boolean;
    uniqueConstraintViolations?: string[];
  };
  error?: string;
  errorDetails?: any;
}

export async function diagnoseSignupError(
  email: string, 
  username: string, 
  phoneNumber?: string
): Promise<SignupErrorDiagnosticResult> {
  console.group('🕵️ Comprehensive Signup Error Diagnosis');
  
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL || '',
    import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  );

  try {
    // 1. Authentication Configuration Check
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    const authConfigValid = !authError;

    console.log('🔐 Authentication Configuration:', { 
      valid: authConfigValid, 
      error: authError 
    });

    // 2. Table Accessibility Check
    const tableChecks = await Promise.all([
      checkTableAccess(supabase, 'users'),
      checkTableAccess(supabase, 'profiles')
    ]);

    const tableAccessible = tableChecks.every(check => check.accessible);

    console.log('📊 Table Accessibility:', tableChecks);

    // 3. RLS Policy Insertion Test
    const rlsTestResults = await testRlsPolicyInsertion(supabase, email, username, phoneNumber);

    console.log('🔒 RLS Policy Test:', rlsTestResults);

    // 4. Unique Constraint Violation Check
    const uniqueConstraintViolations = await checkUniqueConstraintViolations(
      supabase, 
      email, 
      username, 
      phoneNumber
    );

    console.log('🚫 Unique Constraint Violations:', uniqueConstraintViolations);

    console.groupEnd();

    return {
      success: authConfigValid && tableAccessible && rlsTestResults.allowInsertion,
      diagnostics: {
        authConfigValid,
        tableAccessible,
        rlsPoliciesAllowInsertion: rlsTestResults.allowInsertion,
        uniqueConstraintViolations
      }
    };
  } catch (error) {
    console.error('🚨 Signup Error Diagnosis Failed:', error);
    console.groupEnd();
    return { 
      success: false, 
      diagnostics: {
        authConfigValid: false,
        tableAccessible: false,
        rlsPoliciesAllowInsertion: false
      },
      error: error instanceof Error ? error.message : 'Unknown error',
      errorDetails: error
    };
  }
}

async function checkTableAccess(supabase: any, tableName: string) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('id')
      .limit(1);

    return {
      tableName,
      accessible: !error,
      error: error?.message
    };
  } catch (err) {
    return {
      tableName,
      accessible: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}

async function testRlsPolicyInsertion(
  supabase: any, 
  email: string, 
  username: string, 
  phoneNumber?: string
) {
  try {
    // Test insertion into profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        metadata: { email },
        display_name: username,
        phone_number: phoneNumber || null
      });

    // Test insertion into users table
    const { error: userError } = await supabase
      .from('users')
      .insert({
        email,
        username,
        phone_number: phoneNumber || null
      });

    return {
      allowInsertion: !profileError && !userError,
      profileInsertionError: profileError,
      userInsertionError: userError
    };
  } catch (err) {
    return {
      allowInsertion: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}

async function checkUniqueConstraintViolations(
  supabase: any, 
  email: string, 
  username: string, 
  phoneNumber?: string
) {
  const violations: string[] = [];

  // Check email uniqueness
  const { data: emailData, error: emailError } = await supabase
    .from('users')
    .select('email')
    .eq('email', email)
    .limit(1);

  if (emailData?.length) violations.push('email');

  // Check username uniqueness
  const { data: usernameData, error: usernameError } = await supabase
    .from('users')
    .select('username')
    .eq('username', username)
    .limit(1);

  if (usernameData?.length) violations.push('username');

  // Check phone number uniqueness if provided
  if (phoneNumber) {
    const { data: phoneData, error: phoneError } = await supabase
      .from('users')
      .select('phone_number')
      .eq('phone_number', phoneNumber)
      .limit(1);

    if (phoneData?.length) violations.push('phone_number');
  }

  return violations;
}

export default diagnoseSignupError;
