    -- Disable RLS and Re-enable for specific tables
-- email_verification_otps table policies
ALTER TABLE email_verification_otps DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_otps ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$
BEGIN
    -- Attempt to drop existing policies
    BEGIN
        DROP POLICY IF EXISTS "Prevent direct updates" ON email_verification_otps;
        DROP POLICY IF EXISTS "Users can delete their own OTP" ON email_verification_otps;
        DROP POLICY IF EXISTS "Users can insert their own OTP" ON email_verification_otps;
        DROP POLICY IF EXISTS "Users can select their own OTP" ON email_verification_otps;

        -- email_verification_tokens policies
        DROP POLICY IF EXISTS "Users can manage their own verification tokens" ON email_verification_tokens;

        -- login_activity policies
        DROP POLICY IF EXISTS "Users can insert their own login activity" ON login_activity;
        DROP POLICY IF EXISTS "Users can view their own login activity" ON login_activity;

        -- profiles policies
        DROP POLICY IF EXISTS "Allow authenticated users to insert profiles" ON profiles;
        DROP POLICY IF EXISTS "Allow users to read their own profiles" ON profiles;
        DROP POLICY IF EXISTS "Allow users to update their own profiles" ON profiles;
        DROP POLICY IF EXISTS "Enable profile creation during signup" ON profiles;
        DROP POLICY IF EXISTS "users_can_update_own_profile" ON profiles;
        DROP POLICY IF EXISTS "users_can_view_own_profile" ON profiles;
    EXCEPTION 
        WHEN OTHERS THEN 
            RAISE NOTICE 'Error dropping existing policies: %', SQLERRM;
    END;
END $$;

-- Ensure required extensions are available
DO $$
BEGIN
    -- Check and create UUID extension if not exists
    IF NOT EXISTS (
        SELECT FROM pg_extension 
        WHERE extname = 'uuid-ossp'
    ) THEN
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        RAISE NOTICE 'UUID extension created';
    END IF;
END $$;

-- Verify table existence before policy creation
DO $$
DECLARE 
    table_exists BOOLEAN;
BEGIN
    -- Check if users table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
    ) INTO table_exists;

    IF NOT table_exists THEN
        RAISE EXCEPTION 'Users table does not exist. Please run users table migration first.';
    END IF;
END $$;

-- Prevent direct updates for email_verification_otps
DO $$
BEGIN
    -- Check if policy already exists before creating
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'email_verification_otps' 
        AND policyname = 'Prevent direct updates'
    ) THEN
        CREATE POLICY "Prevent direct updates" ON email_verification_otps
            FOR UPDATE 
            USING (false);
    END IF;
END $$;

-- Users can delete their own OTP
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'email_verification_otps' 
        AND policyname = 'Users can delete their own OTP'
    ) THEN
        CREATE POLICY "Users can delete their own OTP" ON email_verification_otps
            FOR DELETE 
            USING (
                -- Verify the email belongs to the current authenticated user
                EXISTS (
                    SELECT 1 
                    FROM profiles 
                    WHERE profiles.metadata->>'email' = email_verification_otps.email
                    AND auth.uid() = profiles.user_id
                )
            );
    END IF;
END $$;

-- Users can insert their own OTP
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'email_verification_otps' 
        AND policyname = 'Users can insert their own OTP'
    ) THEN
        CREATE POLICY "Users can insert their own OTP" ON email_verification_otps
            FOR INSERT 
            WITH CHECK (
                -- Verify the email belongs to the current authenticated user
                EXISTS (
                    SELECT 1 
                    FROM profiles 
                    WHERE profiles.metadata->>'email' = email_verification_otps.email
                    AND auth.uid() = profiles.user_id
                )
            );
    END IF;
END $$;

-- Users can select their own OTP
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'email_verification_otps' 
        AND policyname = 'Users can select their own OTP'
    ) THEN
        CREATE POLICY "Users can select their own OTP" ON email_verification_otps
            FOR SELECT 
            USING (
                -- Verify the email belongs to the current authenticated user
                EXISTS (
                    SELECT 1 
                    FROM profiles 
                    WHERE profiles.metadata->>'email' = email_verification_otps.email
                    AND auth.uid() = profiles.user_id
                )
            );
    END IF;
END $$;

-- email_verification_tokens table policies
ALTER TABLE email_verification_tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- Users can manage their own verification tokens
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'email_verification_tokens' 
        AND policyname = 'Users can manage their own verification tokens'
    ) THEN
        CREATE POLICY "Users can manage their own verification tokens" ON email_verification_tokens
            FOR ALL 
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- login_activity table policies
ALTER TABLE login_activity DISABLE ROW LEVEL SECURITY;
ALTER TABLE login_activity ENABLE ROW LEVEL SECURITY;

-- Users can insert their own login activity
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'login_activity' 
        AND policyname = 'Users can insert their own login activity'
    ) THEN
        CREATE POLICY "Users can insert their own login activity" ON login_activity
            FOR INSERT 
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Users can view their own login activity
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'login_activity' 
        AND policyname = 'Users can view their own login activity'
    ) THEN
        CREATE POLICY "Users can view their own login activity" ON login_activity
            FOR SELECT 
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- profiles table policies
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Modify profiles table policies for more flexible user creation
DO $$
BEGIN
    -- Allow inserting profiles during signup process
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Allow profile creation during signup'
    ) THEN
        CREATE POLICY "Allow profile creation during signup" ON profiles
            FOR INSERT 
            WITH CHECK (
                -- Allow insertion with minimal constraints
                display_name IS NOT NULL AND 
                (
                    metadata->>'email' IS NOT NULL OR 
                    phone_number IS NOT NULL
                )
            );
    END IF;

    -- Modify existing policies to be more permissive during signup
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Allow initial profile setup'
    ) THEN
        CREATE POLICY "Allow initial profile setup" ON profiles
            FOR INSERT 
            WITH CHECK (
                -- Very permissive policy for initial signup
                true
            );
    END IF;
END $$;

-- Ensure UUID extension is available
DO $$
BEGIN
    -- Check and create UUID extension if not exists
    IF NOT EXISTS (
        SELECT FROM pg_extension 
        WHERE extname = 'uuid-ossp'
    ) THEN
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        RAISE NOTICE 'UUID extension created';
    END IF;
END $$;

-- Fallback users table creation if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
    ) THEN
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

        RAISE NOTICE 'Users table created as fallback';
    END IF;
END $$;

-- Modify the users table policy creation block
DO $$
BEGIN
    -- Safely create policies only if the table exists
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
    ) THEN
        BEGIN
            -- Allow user creation with minimal constraints
            IF NOT EXISTS (
                SELECT 1 
                FROM pg_policies 
                WHERE tablename = 'users' 
                AND policyname = 'Allow user creation during signup'
            ) THEN
                CREATE POLICY "Allow user creation during signup" ON users
                    FOR INSERT 
                    WITH CHECK (
                        email IS NOT NULL AND 
                        username IS NOT NULL
                    );
                
                RAISE NOTICE 'Users signup policy created successfully';
            END IF;
        EXCEPTION 
            WHEN OTHERS THEN
                RAISE WARNING 'Error creating users policy: %', SQLERRM;
        END;
    ELSE
        RAISE WARNING 'Users table does not exist. Skipping policy creation.';
    END IF;
END $$;

-- Allow authenticated users to insert profiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Allow authenticated users to insert profiles'
    ) THEN
        CREATE POLICY "Allow authenticated users to insert profiles" ON profiles
            FOR INSERT 
            WITH CHECK (
                auth.uid() IS NOT NULL AND 
                (auth.uid() = id OR auth.uid() = user_id)
            );
    END IF;
END $$;

-- Allow users to read their own profiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Allow users to read their own profiles'
    ) THEN
        CREATE POLICY "Allow users to read their own profiles" ON profiles
            FOR SELECT 
            USING (
                auth.uid() = id OR 
                auth.uid() = user_id
            );
    END IF;
END $$;

-- Allow users to update their own profiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Allow users to update their own profiles'
    ) THEN
        CREATE POLICY "Allow users to update their own profiles" ON profiles
            FOR UPDATE 
            USING (
                auth.uid() = id OR 
                auth.uid() = user_id
            )
            WITH CHECK (
                auth.uid() = id OR 
                auth.uid() = user_id
            );
    END IF;
END $$;

-- Specific named policies for compatibility
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'users_can_update_own_profile'
    ) THEN
        CREATE POLICY "users_can_update_own_profile" ON profiles
            FOR UPDATE 
            USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'users_can_view_own_profile'
    ) THEN
        CREATE POLICY "users_can_view_own_profile" ON profiles
            FOR SELECT 
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- Disable RLS for initial signup setup
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Create extremely permissive policies for signup
DO $$
BEGIN
    -- Permissive users table policy
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'Allow all user insertions'
    ) THEN
        CREATE POLICY "Allow all user insertions" ON users
            FOR INSERT 
            WITH CHECK (true);
    END IF;

    -- Permissive profiles table policy
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Allow all profile insertions'
    ) THEN
        CREATE POLICY "Allow all profile insertions" ON profiles
            FOR INSERT 
            WITH CHECK (true);
    END IF;
END $$;

-- Re-enable RLS with the new policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
