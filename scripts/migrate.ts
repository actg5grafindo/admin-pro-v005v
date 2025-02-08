import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '..', 'postgres_config.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false  // Disable SSL for local development
});

async function runMigrations() {
  console.log('🚀 Starting PostgreSQL Migrations');
  console.log('Database URL:', process.env.DATABASE_URL);

  const migrationFiles = [
    '20250131_create_users_table.sql',
    '20250131_create_profiles_table.sql',
    '20250205_create_full_schema.sql'  // New comprehensive schema
  ];

  const client = await pool.connect();

  try {
    // Drop existing tables if they exist
    const dropTablesSQL = `
      DROP TABLE IF EXISTS tasks CASCADE;
      DROP TABLE IF EXISTS projects CASCADE;
      DROP TABLE IF EXISTS profiles CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS permissions CASCADE;
      DROP TABLE IF EXISTS user_roles CASCADE;
      DROP TABLE IF EXISTS role_permissions CASCADE;
      DROP TABLE IF EXISTS audit_logs CASCADE;
    `;
    await client.query(dropTablesSQL);
    console.log('✅ Existing tables dropped successfully');

    for (const file of migrationFiles) {
      console.log(`🔍 Processing migration: ${file}`);
      const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', file);
      
      if (!fs.existsSync(migrationPath)) {
        console.error(`❌ Migration file not found: ${migrationPath}`);
        continue;
      }

      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      try {
        // Replace Supabase-specific syntax with PostgreSQL standard
        const adaptedSQL = migrationSQL
          .replace(/CREATE EXTENSION IF NOT EXISTS "uuid-ossp"/g, 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
          .replace(/uuid_generate_v4\(\)/g, 'gen_random_uuid()');

        await client.query(adaptedSQL);
        console.log(`✅ Successfully migrated: ${file}`);
      } catch (queryError) {
        console.error(`❌ Error migrating ${file}:`, queryError);
        throw queryError;  // Rethrow to stop migration process
      }
    }

    // Verify table creation
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    const tablesResult = await client.query(tablesQuery);
    console.log('📊 Created Tables:');
    tablesResult.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });

  } catch (error) {
    console.error('❌ Migration process error:', error);
    throw error;
  } finally {
    client.release();
  }
}

runMigrations().then(() => {
  console.log('🎉 Migration process completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
