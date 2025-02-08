-- Drop existing profiles table if it exists
DROP TABLE IF EXISTS profiles;

-- Drop existing user_role type if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        DROP TYPE user_role CASCADE;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not drop user_role type';
END $$;

-- Create enum for user roles
CREATE TYPE user_role AS ENUM (
    'user',        -- Regular user with basic access
    'admin',       -- Administrator with full system access
    'manager',     -- Manager with elevated permissions
    'superadmin',  -- Super administrator with highest level of access
    'editor',      -- User with content editing capabilities
    'viewer'       -- User with read-only access
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    email TEXT UNIQUE,
    preferred_language TEXT NOT NULL DEFAULT 'id',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT preferred_language_check CHECK (preferred_language IN ('id', 'en')),
    CONSTRAINT valid_user_role CHECK (role IN ('user', 'admin', 'manager', 'superadmin', 'editor', 'viewer'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles (username);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles (email);
CREATE INDEX IF NOT EXISTS profiles_phone_idx ON profiles (phone);

-- Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create more permissive policies
CREATE POLICY "Allow authenticated users to insert profiles" ON profiles
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL AND 
        auth.uid() = id AND 
        auth.uid() = user_id
    );

CREATE POLICY "Allow users to read their own profiles" ON profiles
    FOR SELECT 
    USING (
        auth.uid() = user_id OR 
        auth.uid() = id
    );

CREATE POLICY "Allow users to update their own profiles" ON profiles
    FOR UPDATE 
    USING (
        auth.uid() = user_id OR 
        auth.uid() = id
    )
    WITH CHECK (
        auth.uid() = user_id OR 
        auth.uid() = id
    );

-- Additional policy to ensure signup works
CREATE POLICY "Enable profile creation during signup" ON profiles
    FOR INSERT 
    WITH CHECK (true);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION moddatetime()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION moddatetime();
