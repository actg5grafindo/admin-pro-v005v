-- Alter existing profiles table to add or modify columns

-- Add new columns if they don't exist
DO $$
BEGIN
    -- Add first_name if not exists
    BEGIN
        ALTER TABLE profiles ADD COLUMN first_name TEXT;
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'Column first_name already exists';
    END;

    -- Add last_name if not exists
    BEGIN
        ALTER TABLE profiles ADD COLUMN last_name TEXT;
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'Column last_name already exists';
    END;

    -- Add display_name if not exists
    BEGIN
        ALTER TABLE profiles ADD COLUMN display_name TEXT;
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'Column display_name already exists';
    END;

    -- Add gender if not exists
    BEGIN
        ALTER TABLE profiles ADD COLUMN gender TEXT 
        CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say'));
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'Column gender already exists';
    END;

    -- Add theme_preference if not exists
    BEGIN
        ALTER TABLE profiles ADD COLUMN theme_preference TEXT DEFAULT 'light';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'Column theme_preference already exists';
    END;

    -- Add metadata if not exists
    BEGIN
        ALTER TABLE profiles ADD COLUMN metadata JSONB;
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'Column metadata already exists';
    END;
END $$;

-- Update or create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON profiles(display_name);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles(gender);

-- Update function to create profile if not exists
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

-- Recreate trigger to ensure it exists
DROP TRIGGER IF EXISTS create_profile_trigger ON users;
CREATE TRIGGER create_profile_trigger
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_profile_for_new_user();
