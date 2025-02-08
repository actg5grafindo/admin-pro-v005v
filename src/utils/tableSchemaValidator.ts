import { createClient } from '@supabase/supabase-js';

interface TableSchemaValidationResult {
  tableName: string;
  exists: boolean;
  columnCount?: number;
  columns?: string[];
  primaryKeyExists?: boolean;
  uniqueConstraints?: string[];
  foreignKeyConstraints?: Array<{
    column: string;
    referencedTable: string;
    referencedColumn: string;
  }>;
  error?: string;
}

export async function validateTableSchema(tableName: string): Promise<TableSchemaValidationResult> {
  console.group(`🔍 Validating Schema for Table: ${tableName}`);
  
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL || '',
    import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  );

  try {
    // Check table existence
    const { data, error: selectError } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (selectError) {
      console.error(`❌ Table ${tableName} does not exist or is inaccessible`);
      return { 
        tableName, 
        exists: false, 
        error: selectError.message 
      };
    }

    // Fetch table columns
    const { data: columnsData, error: columnsError } = await supabase.rpc('get_table_columns', { 
      table_name: tableName 
    });

    if (columnsError) {
      console.error(`❌ Could not retrieve columns for ${tableName}`);
      return { 
        tableName, 
        exists: true, 
        error: columnsError.message 
      };
    }

    // Analyze columns
    const columns = columnsData.map((col: any) => col.column_name);
    const columnTypes = columnsData.reduce((acc: any, col: any) => {
      acc[col.column_name] = col.data_type;
      return acc;
    }, {});

    // Check primary key and unique constraints
    const { data: constraintsData, error: constraintsError } = await supabase.rpc('get_table_constraints', { 
      table_name: tableName 
    });

    if (constraintsError) {
      console.error(`❌ Could not retrieve constraints for ${tableName}`);
      return { 
        tableName, 
        exists: true, 
        columns,
        error: constraintsError.message 
      };
    }

    const primaryKeyExists = constraintsData.some((constraint: any) => 
      constraint.constraint_type === 'PRIMARY KEY'
    );

    const uniqueConstraints = constraintsData
      .filter((constraint: any) => constraint.constraint_type === 'UNIQUE')
      .map((constraint: any) => constraint.column_name);

    const foreignKeyConstraints = constraintsData
      .filter((constraint: any) => constraint.constraint_type === 'FOREIGN KEY')
      .map((constraint: any) => ({
        column: constraint.column_name,
        referencedTable: constraint.referenced_table_name,
        referencedColumn: constraint.referenced_column_name
      }));

    console.log('📊 Table Schema Details:', {
      columns,
      columnTypes,
      primaryKeyExists,
      uniqueConstraints,
      foreignKeyConstraints
    });

    console.groupEnd();

    return {
      tableName,
      exists: true,
      columnCount: columns.length,
      columns,
      primaryKeyExists,
      uniqueConstraints,
      foreignKeyConstraints
    };
  } catch (error) {
    console.error('🚨 Unexpected Schema Validation Error:', error);
    console.groupEnd();
    return { 
      tableName, 
      exists: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function validateProjectSchemas() {
  const tablesToValidate = ['users', 'profiles', 'email_verification_otps'];
  
  const results = await Promise.all(
    tablesToValidate.map(tableName => validateTableSchema(tableName))
  );

  return results;
}

export default validateProjectSchemas;
