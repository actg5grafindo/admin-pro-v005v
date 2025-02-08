import { supabase } from '@/lib/supabase';

export async function performComprehensiveSignupDiagnostics(
  email: string, 
  username: string, 
  phoneNumber?: string
) {
  console.group('🔍 Comprehensive Signup Diagnostics');
  
  try {
    // 1. Check Authentication Configuration
    console.log('🔐 Authentication Environment Check');
    const authConfig = {
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      anonKeyPresent: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    };
    console.table(authConfig);

    // 2. Validate Input Constraints
    console.log('📝 Input Validation');
    const validations = {
      emailValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      usernameValid: username.length >= 3 && username.length <= 20,
      phoneValid: phoneNumber ? /^\d{10,14}$/.test(phoneNumber) : true
    };
    console.table(validations);

    // 3. Check Existing Records
    console.log('🕵️ Existing Record Check');
    const existingChecks = {
      email: await checkExistingRecord('profiles', 'metadata->email', email),
      username: await checkExistingRecord('profiles', 'display_name', username),
      phoneNumber: phoneNumber 
        ? await checkExistingRecord('profiles', 'phone_number', phoneNumber)
        : { exists: false }
    };
    console.table(existingChecks);

    // 4. Test RLS Policy Insertion
    console.log('🔒 RLS Policy Test');
    const rlsTestResult = await testRlsPolicyInsertion(email, username, phoneNumber);

    console.groupEnd();

    return {
      success: true,
      authConfig,
      validations,
      existingChecks,
      rlsTestResult
    };
  } catch (error) {
    console.error('🚨 Signup Diagnostics Error:', error);
    console.groupEnd();
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function checkExistingRecord(
  table: string, 
  column: string, 
  value: string
) {
  try {
    // More robust query construction
    const query = column.includes('metadata->') 
      ? supabase
          .from(table)
          .select('*', { count: 'exact' })
          // Use direct column comparison for metadata
          .eq(column.replace('metadata->', ''), value)
          .limit(1)
      : supabase
          .from(table)
          .select('*', { count: 'exact' })
          .eq(column, value)
          .limit(1);

    const { data, error, count } = await query;

    // Detailed error logging with fallback checks
    if (error) {
      console.error(`🚨 Existing Record Check Error for ${table}.${column}:`, {
        fullError: error,
        query: column,
        value,
        errorMessage: error.message,
        errorDetails: error.details,
        // Attempt alternative queries
        fallbackQueries: column.includes('metadata->') 
          ? [
              `Trying direct email column check`,
              `Trying JSON string comparison`
            ]
          : []
      });

      // Fallback: Try direct email column check
      if (column === 'metadata->email') {
        const fallbackQuery = await supabase
          .from(table)
          .select('*', { count: 'exact' })
          .eq('email', value)
          .limit(1);

        if (!fallbackQuery.error) {
          return {
            exists: fallbackQuery.count > 0,
            count: fallbackQuery.count,
            error: 'Fallback query used',
            fallbackUsed: true
          };
        }
      }
    }

    return {
      exists: count > 0,
      count,
      error: error?.message,
      fullError: error
    };
  } catch (error) {
    console.error(`🚨 Unexpected Error in checkExistingRecord:`, error);
    return {
      exists: false,
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function testRlsPolicyInsertion(
  email: string, 
  username: string, 
  phoneNumber?: string
) {
  try {
    // More robust RLS policy test with detailed error handling
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        display_name: username,
        // Use a safer metadata insertion
        metadata: {
          email: email,
          username: username
        },
        phone_number: phoneNumber || null,
        // Add placeholder for user_id to satisfy potential constraints
        user_id: null  
      });

    // Detailed error logging
    if (profileError) {
      console.error('🚨 RLS Policy Insertion Test Error:', {
        fullError: profileError,
        message: profileError.message,
        details: profileError.details,
        context: {
          email,
          username,
          phoneNumber
        }
      });
    }

    return {
      allowInsertion: !profileError,
      error: profileError?.message,
      fullError: profileError
    };
  } catch (error) {
    console.error('🚨 RLS Policy Insertion Test Unexpected Error:', error);
    return {
      allowInsertion: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export default performComprehensiveSignupDiagnostics;
