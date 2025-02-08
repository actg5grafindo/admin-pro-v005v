-- Synchronize Users and Profiles Tables

-- Ensure UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure users table exists with correct schema
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
    END IF;
END $$;

-- Recreate profiles table with correct foreign key
DO $$
BEGIN
    -- Drop existing profiles table if needed
    DROP TABLE IF EXISTS profiles CASCADE;

    -- Recreate profiles table
    CREATE TABLE profiles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        
        -- Personal Information
        first_name TEXT,
        last_name TEXT,
        display_name TEXT,
        date_of_birth DATE,
        gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
        
        -- Contact Information
        phone_number TEXT,
        alternative_email TEXT,
        
        -- Profile Details
        bio TEXT,
        profile_picture_url TEXT,
        cover_picture_url TEXT,
        
        -- Location Information
        country TEXT,
        city TEXT,
        timezone TEXT,
        language TEXT DEFAULT 'id',
        
        -- Professional Information
        occupation TEXT,
        organization TEXT,
        
        -- Social Links
        website_url TEXT,
        linkedin_url TEXT,
        twitter_url TEXT,
        facebook_url TEXT,
        instagram_url TEXT,
        
        -- Account Preferences
        theme_preference TEXT DEFAULT 'light',
        notification_settings JSONB,
        
        -- Timestamps
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        
        -- Additional Metadata
        metadata JSONB
    );

    -- Create indexes
    CREATE INDEX idx_profiles_user_id ON profiles(user_id);
    CREATE INDEX idx_profiles_display_name ON profiles(display_name);
    CREATE INDEX idx_profiles_country ON profiles(country);
    CREATE INDEX idx_profiles_city ON profiles(city);

EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating profiles table: %', SQLERRM;
END $$;

-- Optional: Migrate existing users to profiles
-- This is a placeholder and might need customization based on your exact data
INSERT INTO profiles (
    user_id, 
    first_name, 
    last_name, 
    display_name, 
    phone_number
)
SELECT 
    id, 
    first_name, 
    last_name, 
    username, 
    phone_number
FROM users
ON CONFLICT (user_id) DO NOTHING;
