import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
const envPath = path.resolve(__dirname, '..', 'postgres_config.env');
console.log('Loading environment from:', envPath);

if (!fs.existsSync(envPath)) {
  console.error('Environment file not found!');
  process.exit(1);
}

dotenv.config({ path: envPath });

async function testDatabaseConnection() {
  console.log('Database URL:', process.env.DATABASE_URL);

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set in the environment!');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false  // Disable SSL for local development
  });

  try {
    console.log('Attempting to connect to database...');
    const client = await pool.connect();
    console.log('✅ Database connection successful!');

    // Test a simple query
    const result = await client.query('SELECT NOW() as current_time');
    console.log('🕒 Current Database Time:', result.rows[0].current_time);

    // Check table existence
    const tablesQuery = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    
    console.log('📊 Existing Tables:');
    tablesQuery.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });

    // Detailed table schema check
    for (const table of tablesQuery.rows) {
      const columnsQuery = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = '${table.table_name}'
      `);
      
      console.log(`\n📝 Columns for ${table.table_name}:`);
      columnsQuery.rows.forEach(column => {
        console.log(`  - ${column.column_name}: ${column.data_type}`);
      });
    }

    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testDatabaseConnection();
