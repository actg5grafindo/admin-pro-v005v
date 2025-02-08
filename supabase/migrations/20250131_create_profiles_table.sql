-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
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
  language TEXT DEFAULT 'id',  -- Default to Indonesian
  
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

-- Alter existing profiles table if needed
DO $$
BEGIN
    -- Add columns if they don't exist
    BEGIN
        ALTER TABLE profiles 
        ADD COLUMN IF NOT EXISTS display_name TEXT,
        ADD COLUMN IF NOT EXISTS metadata JSONB,
        ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'id';
    EXCEPTION 
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not add columns to profiles table: %', SQLERRM;
    END;

    -- Update existing trigger function
    BEGIN
        -- Drop existing trigger and function if they exist
        DROP TRIGGER IF EXISTS create_profile_trigger ON users;
        DROP FUNCTION IF EXISTS create_profile_for_new_user();
    EXCEPTION 
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not drop existing trigger or function: %', SQLERRM;
    END;
END $$;

-- Alter profiles table to make columns nullable
DO $$
BEGIN
    -- Modify columns to be nullable
    BEGIN
        ALTER TABLE profiles 
        ALTER COLUMN first_name DROP NOT NULL,
        ALTER COLUMN last_name DROP NOT NULL,
        ALTER COLUMN display_name DROP NOT NULL,
        ALTER COLUMN username DROP NOT NULL;
    EXCEPTION 
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not modify column nullability: %', SQLERRM;
    END;
END $$;

-- Recreate the function to create profiles with more flexible insertion
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
CREATE TRIGGER create_profile_trigger
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_profile_for_new_user();

-- Ensure unique constraints and indexes
DO $$
DECLARE
    constraint_exists BOOLEAN;
BEGIN
    -- Check if unique constraint exists
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'profiles' 
        AND constraint_type = 'UNIQUE' 
        AND constraint_name = 'unique_user_id'
    ) INTO constraint_exists;

    -- Add constraint only if it doesn't exist
    IF NOT constraint_exists THEN
        EXECUTE 'ALTER TABLE profiles ADD CONSTRAINT unique_user_id UNIQUE (user_id)';
    END IF;

    -- Safely add columns
    BEGIN
        EXECUTE 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT';
        EXECUTE 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT';
    EXCEPTION 
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not add country or city columns: %', SQLERRM;
    END;

    -- Create indexes
    BEGIN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id)';
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON profiles(display_name)';
        
        -- Conditional index creation
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'country'
        ) THEN
            EXECUTE 'CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country)';
        END IF;
        
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'city'
        ) THEN
            EXECUTE 'CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city)';
        END IF;
    EXCEPTION 
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not create indexes: %', SQLERRM;
    END;
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'Error in migration: %', SQLERRM;
END $$;

-- Optional: Migrate existing users without profiles
DO $$
BEGIN
    INSERT INTO profiles (
        id, 
        user_id, 
        first_name, 
        last_name, 
        phone_number, 
        display_name,
        metadata,
        language
    )
    SELECT 
        id, 
        id, 
        first_name, 
        last_name, 
        phone_number, 
        username,
        JSON_BUILD_OBJECT(
            'email', email,
            'username', username
        ),
        'id'
    FROM users u
    WHERE NOT EXISTS (
        SELECT 1 
        FROM profiles p 
        WHERE p.user_id = u.id
    )
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Migrated existing users to profiles table';
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'Error migrating existing users: %', SQLERRM;
END $$;

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_profiles_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_profiles_modtime
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_profiles_modified_column();
