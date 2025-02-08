import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '..', 'postgres_config.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function seedDatabase() {
  console.log('🌱 Starting Database Seeding');
  const client = await pool.connect();

  try {
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash('adminPassword123!', saltRounds);

    // Insert Admin User
    const userQuery = `
      INSERT INTO users (email, password_hash, username, role) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id
    `;
    const userValues = [
      'admin@adminpro.com', 
      passwordHash, 
      'adminuser', 
      'admin'
    ];
    const userResult = await client.query(userQuery, userValues);
    const adminUserId = userResult.rows[0].id;

    // Insert Admin Profile
    const profileQuery = `
      INSERT INTO profiles (user_id, first_name, last_name, phone_number) 
      VALUES ($1, $2, $3, $4)
    `;
    const profileValues = [
      adminUserId, 
      'Admin', 
      'User', 
      '+62123456789'
    ];
    await client.query(profileQuery, profileValues);

    // Insert Sample Projects
    const projectQuery = `
      INSERT INTO projects (name, description, status, owner_id) 
      VALUES 
        ($1, $2, $3, $4),
        ($5, $6, $7, $8)
    `;
    const projectValues = [
      'Project Alpha', 'Initial project for testing', 'active', adminUserId,
      'Project Beta', 'Secondary project for development', 'planning', adminUserId
    ];
    await client.query(projectQuery, projectValues);

    // Insert Sample Tasks
    const taskQuery = `
      INSERT INTO tasks (project_id, title, description, status, assigned_to, created_by) 
      VALUES (
        (SELECT id FROM projects WHERE name = 'Project Alpha'),
        $1, $2, $3, $4, $5
      )
    `;
    const taskValues = [
      'Initial Setup', 
      'Configure development environment', 
      'todo', 
      adminUserId, 
      adminUserId
    ];
    await client.query(taskQuery, taskValues);

    console.log('🎉 Database Seeding Completed Successfully');
  } catch (error) {
    console.error('❌ Seeding Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase().catch(console.error);
