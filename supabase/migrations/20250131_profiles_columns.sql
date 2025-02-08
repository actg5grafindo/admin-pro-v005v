-- Safely add columns to profiles table

-- Add first_name column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='first_name'
    ) THEN
        ALTER TABLE profiles ADD COLUMN first_name TEXT;
    END IF;

    -- Add last_name column if not exists
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='last_name'
    ) THEN
        ALTER TABLE profiles ADD COLUMN last_name TEXT;
    END IF;

    -- Add display_name column if not exists
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='display_name'
    ) THEN
        ALTER TABLE profiles ADD COLUMN display_name TEXT;
    END IF;

    -- Add gender column if not exists
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='gender'
    ) THEN
        ALTER TABLE profiles ADD COLUMN gender TEXT;
    END IF;

    -- Add theme_preference column if not exists
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='theme_preference'
    ) THEN
        ALTER TABLE profiles ADD COLUMN theme_preference TEXT DEFAULT 'light';
    END IF;

    -- Add metadata column if not exists
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='metadata'
    ) THEN
        ALTER TABLE profiles ADD COLUMN metadata JSONB;
    END IF;
END $$;

-- Add gender check constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name='profiles' AND constraint_name='gender_check'
    ) THEN
        ALTER TABLE profiles 
        ADD CONSTRAINT gender_check 
        CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say'));
    END IF;
END $$;
