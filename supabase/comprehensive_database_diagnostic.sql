-- Comprehensive Database Diagnostic Script

-- Section 1: Extension and Permission Check
DO $$
DECLARE
    current_user_name TEXT;
    current_schema_name TEXT;
BEGIN
    current_user_name := CURRENT_USER;
    current_schema_name := CURRENT_SCHEMA;
    
    RAISE NOTICE '🔍 Database Diagnostic Report';
    RAISE NOTICE '------------------------';
    RAISE NOTICE 'Current User: %', current_user_name;
    RAISE NOTICE 'Current Schema: %', current_schema_name;
    
    -- Check UUID Extension
    IF NOT EXISTS (SELECT FROM pg_extension WHERE extname = 'uuid-ossp') THEN
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        RAISE NOTICE '✅ UUID Extension created';
    ELSE
        RAISE NOTICE '✅ UUID Extension already exists';
    END IF;
END $$;

-- Section 2: Existing Tables Check
DO $$
DECLARE
    table_count INTEGER;
    tbl_record RECORD;
BEGIN
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = CURRENT_SCHEMA;
    
    RAISE NOTICE '📊 Total Tables in Schema: %', table_count;
    
    RAISE NOTICE 'Existing Tables:';
    FOR tbl_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = CURRENT_SCHEMA 
        ORDER BY tablename 
    LOOP
        RAISE NOTICE '- %', tbl_record.tablename;
    END LOOP;
END $$;

-- Section 3: Users Table Creation with Comprehensive Error Handling
DO $$
BEGIN
    -- Attempt to drop existing users table
    BEGIN
        DROP TABLE IF EXISTS users CASCADE;
        RAISE NOTICE '🗑️ Existing users table dropped successfully';
    EXCEPTION 
        WHEN OTHERS THEN
            RAISE WARNING 'Error dropping existing users table: %', SQLERRM;
    END;

    -- Create users table with robust error handling
    BEGIN
        CREATE TABLE users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

        -- Create supporting indexes
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
        CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);

        RAISE NOTICE '✅ Users table created successfully';
    EXCEPTION 
        WHEN OTHERS THEN
            RAISE EXCEPTION '❌ Failed to create users table: %', SQLERRM;
    END;

    -- Test UUID and Record Insertion
    BEGIN
        WITH test_insert AS (
            INSERT INTO users (email, username) 
            VALUES ('diagnostic@test.com', 'diagnosticuser')
            RETURNING *
        )
        SELECT * FROM test_insert;
        
        RAISE NOTICE '✅ Test record inserted successfully';
    EXCEPTION 
        WHEN OTHERS THEN
            RAISE WARNING '❌ Failed to insert test record: %', SQLERRM;
    END;
END $$;

-- Section 4: Permissions Check
DO $$
DECLARE
    current_user_name TEXT;
BEGIN
    current_user_name := CURRENT_USER;
    
    RAISE NOTICE '🔐 User Permissions Check for %', current_user_name;
    
    -- Check table creation permissions
    BEGIN
        EXECUTE 'CREATE TEMPORARY TABLE temp_permission_test (id INT)';
        DROP TABLE temp_permission_test;
        RAISE NOTICE '✅ Table creation permission: GRANTED';
    EXCEPTION 
        WHEN OTHERS THEN
            RAISE WARNING '❌ Table creation permission: DENIED';
    END;
END $$;

-- Final Verification
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM 
    information_schema.columns 
WHERE 
    table_name = 'users'
ORDER BY 
    ordinal_position;
