import PostgreSQLConnection from '../src/lib/database/postgres-connection';

async function testDatabaseConnection() {
  console.log('🔍 Testing PostgreSQL Connection');
  
  try {
    const connectionResult = await PostgreSQLConnection.testConnection();
    
    if (connectionResult) {
      console.log('✅ Database Connection Successful');
      process.exit(0);
    } else {
      console.error('❌ Database Connection Failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Database Connection Error:', error);
    process.exit(1);
  }
}

testDatabaseConnection();
