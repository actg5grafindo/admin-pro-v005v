-- Manual Migration Script for Profiles Table

-- Ensure UUID extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create or modify profiles table
DO $$
BEGIN
    -- Check if table exists, if not create it
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'profiles'
    ) THEN
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
            phone_number TEXT UNIQUE,
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
    ELSE
        -- Add any missing columns
        BEGIN
            ALTER TABLE profiles 
            ADD COLUMN IF NOT EXISTS display_name TEXT,
            ADD COLUMN IF NOT EXISTS metadata JSONB,
            ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'id',
            ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'light';
        EXCEPTION 
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not add columns: %', SQLERRM;
        END;
    END IF;
END $$;

-- Create or replace function to create profile for new user
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_display_name TEXT;
BEGIN
    -- Generate a default display name if not provided
    default_display_name := COALESCE(
        NEW.username, 
        SPLIT_PART(NEW.email, '@', 1)
    );

    -- Check if a profile already exists to prevent duplicates
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = NEW.id) THEN
        INSERT INTO profiles (
            id, 
            user_id, 
            first_name, 
            last_name, 
            phone_number, 
            display_name,
            username,
            metadata,
            language,
            theme_preference
        )
        VALUES (
            NEW.id,  -- Use the same ID as the user
            NEW.id,  -- Explicitly set user_id
            NULLIF(NEW.first_name, ''),  -- Use first name from users table, convert empty string to NULL
            NULLIF(NEW.last_name, ''),   -- Use last name from users table, convert empty string to NULL
            NEW.phone_number,  -- Use phone number from users table
            default_display_name,    -- Use username or email prefix as display name
            NEW.username,    -- Username
            JSON_BUILD_OBJECT(
                'email', NEW.email,
                'username', NEW.username
            ),
            'id',  -- Default language
            'light'  -- Default theme
        )
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS create_profile_trigger ON users;
CREATE TRIGGER create_profile_trigger
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_profile_for_new_user();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON profiles(display_name);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);
