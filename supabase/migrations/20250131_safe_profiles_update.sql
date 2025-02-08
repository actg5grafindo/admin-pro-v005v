-- Safely update profiles table with minimal risk

-- Add new columns only if they don't exist
DO $$
BEGIN
    -- Safely add first_name
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='first_name'
    ) THEN
        ALTER TABLE profiles ADD COLUMN first_name TEXT;
    END IF;

    -- Safely add last_name
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='last_name'
    ) THEN
        ALTER TABLE profiles ADD COLUMN last_name TEXT;
    END IF;

    -- Safely add display_name
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='display_name'
    ) THEN
        ALTER TABLE profiles ADD COLUMN display_name TEXT;
    END IF;

    -- Safely add gender with check constraint
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='gender'
    ) THEN
        ALTER TABLE profiles ADD COLUMN gender TEXT;
        ALTER TABLE profiles ADD CONSTRAINT gender_check 
        CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say'));
    END IF;

    -- Safely add theme preference
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='theme_preference'
    ) THEN
        ALTER TABLE profiles ADD COLUMN theme_preference TEXT DEFAULT 'light';
    END IF;

    -- Safely add metadata
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='metadata'
    ) THEN
        ALTER TABLE profiles ADD COLUMN metadata JSONB;
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_display_name ON profiles(display_name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_gender ON profiles(gender);

-- Update function to create profile safely
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert profile only if it doesn't already exist
    INSERT INTO profiles (
        user_id, 
        first_name, 
        last_name, 
        phone_number
    )
    SELECT 
        NEW.id, 
        NEW.first_name, 
        NEW.last_name, 
        NEW.phone_number
    WHERE NOT EXISTS (
        SELECT 1 FROM profiles WHERE user_id = NEW.id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure trigger exists without dropping existing one
CREATE OR REPLACE TRIGGER create_profile_trigger
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_profile_for_new_user();
