-- Ensure UUID extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Wrap table creation in a transaction with error handling
DO $$
BEGIN
    -- Check if table already exists
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
    ) THEN
        -- Create users table with multiple login identifiers
        CREATE TABLE users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          email TEXT UNIQUE NOT NULL,
          username TEXT UNIQUE,
          phone_number TEXT UNIQUE,
          password_hash TEXT,
          email_verified BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          last_login TIMESTAMPTZ,
          role TEXT DEFAULT 'user',
          profile_picture_url TEXT,
          
          -- Additional user metadata
          first_name TEXT,
          last_name TEXT,
          date_of_birth DATE,
          
          -- Account status
          is_active BOOLEAN DEFAULT TRUE,
          is_blocked BOOLEAN DEFAULT FALSE
        );

        -- Create an index for faster lookups
        CREATE INDEX idx_users_email ON users(email);
        CREATE INDEX idx_users_username ON users(username);
        CREATE INDEX idx_users_phone_number ON users(phone_number);

        -- Function to automatically update the updated_at timestamp
        CREATE OR REPLACE FUNCTION update_modified_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';

        -- Trigger to automatically update updated_at
        CREATE TRIGGER update_users_modtime
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_modified_column();

        RAISE NOTICE 'Users table created successfully';
    ELSE
        RAISE NOTICE 'Users table already exists';
    END IF;
EXCEPTION 
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error creating users table: %', SQLERRM;
END $$;
