import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../postgres_config.env') });

class PostgreSQLConnection {
  private static instance: Pool;

  private constructor() {}

  public static getInstance(): Pool {
    if (!this.instance) {
      const config: PoolConfig = {
        connectionString: process.env.DATABASE_URL,
        ssl: false,  // Disable SSL for local development
        max: 20,     // Maximum number of clients in the pool
        idleTimeoutMillis: 30000,  // Close idle clients after 30 seconds
        connectionTimeoutMillis: 2000  // Return an error after 2 seconds if connection cannot be established
      };

      this.instance = new Pool(config);

      // Optional: Add error handling for connection pool
      this.instance.on('error', (err) => {
        console.error('Unexpected PostgreSQL client error', err);
      });
    }

    return this.instance;
  }

  // Method to test connection
  public static async testConnection(): Promise<boolean> {
    try {
      const client = await this.getInstance().connect();
      const result = await client.query('SELECT NOW() as current_time');
      client.release();
      console.log('Database Connection Successful:', result.rows[0].current_time);
      return true;
    } catch (error) {
      console.error('Database Connection Failed:', error);
      return false;
    }
  }
}

export default PostgreSQLConnection;
