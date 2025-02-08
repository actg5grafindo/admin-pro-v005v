-- Comprehensive Database Diagnostic Script

-- Check available extensions
DO $$
BEGIN
    RAISE NOTICE 'Available Extensions:';
    FOR ext IN 
        SELECT extname FROM pg_extension 
        ORDER BY extname 
    LOOP
        RAISE NOTICE '- %', ext;
    END LOOP;
END $$;

-- Ensure UUID extension is explicitly created
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Diagnostic information about schema and tables
DO $$
DECLARE
    current_schema TEXT;
BEGIN
    -- Get current schema
    current_schema := current_schema();
    RAISE NOTICE 'Current Schema: %', current_schema;

    -- List all tables in the current schema
    RAISE NOTICE 'Tables in current schema:';
    FOR tbl IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = current_schema 
        ORDER BY tablename 
    LOOP
        RAISE NOTICE '- %', tbl;
    END LOOP;
END $$;

-- Forceful Users Table Creation with Comprehensive Logging
DO $$
BEGIN
    -- Explicitly drop table if it exists to reset
    DROP TABLE IF EXISTS users CASCADE;

    -- Create users table with comprehensive error handling
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
        first_name TEXT,
        last_name TEXT,
        date_of_birth DATE,
        is_active BOOLEAN DEFAULT TRUE,
        is_blocked BOOLEAN DEFAULT FALSE
    );

    -- Create indexes
    CREATE INDEX idx_users_email ON users(email);
    CREATE INDEX idx_users_username ON users(username);
    CREATE INDEX idx_users_phone_number ON users(phone_number);

    RAISE NOTICE 'Users table created successfully with comprehensive schema';
EXCEPTION 
    WHEN OTHERS THEN
        RAISE EXCEPTION 'CRITICAL ERROR creating users table: %', SQLERRM;
END $$;

-- Verify table creation
DO $$
BEGIN
    ASSERT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
    ), 'Users table was not created successfully';

    RAISE NOTICE 'Users table verified successfully';
END $$;
