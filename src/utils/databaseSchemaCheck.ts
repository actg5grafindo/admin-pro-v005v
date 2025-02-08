import { createClient } from '@supabase/supabase-js';

export async function checkDatabaseSchema() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  console.log('🔍 Database Schema Check');
  console.log('----------------------------');

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Define columns, making some optional
    const requiredColumns = ['id', 'full_name', 'email', 'username', 'email_verified'];
    const optionalColumns = ['phone_number', 'language'];

    // Fetch a single row to check column existence
    const { data: sampleRow, error: rowError } = await supabase
      .from('profiles')
      .select(requiredColumns.join(', '))
      .limit(1)
      .single();

    if (rowError) {
      console.warn('⚠️ Could not verify table columns:', rowError.message);
      return {
        profilesTableExists: false,
        columnsVerified: false,
        error: rowError.message
      };
    }

    const missingColumns = requiredColumns.filter(
      col => !(col in (sampleRow || {}))
    );

    if (missingColumns.length > 0) {
      console.error('❌ Missing Required Columns:', missingColumns);
      return {
        profilesTableExists: true,
        columnsVerified: false,
        missingColumns
      };
    }

    // Check optional columns and log if missing
    const missingOptionalColumns = optionalColumns.filter(
      col => !(col in (sampleRow || {}))
    );

    if (missingOptionalColumns.length > 0) {
      console.warn('⚠️ Missing Optional Columns:', missingOptionalColumns);
    }

    console.log('✅ All Required Columns Present');

    return {
      profilesTableExists: true,
      columnsVerified: true,
      missingOptionalColumns: missingOptionalColumns.length > 0 ? missingOptionalColumns : undefined
    };

  } catch (error) {
    console.error('❌ Unexpected Database Schema Check Error:', error);
    return {
      profilesTableExists: false,
      columnsVerified: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Run check on import for immediate feedback
checkDatabaseSchema().then(result => {
  console.log('Database Schema Check Result:', result);
});
