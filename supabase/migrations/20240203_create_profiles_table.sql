-- Create or modify profiles table with required columns

-- Ensure the table exists
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE
);

-- Add columns safely with transactional approach
DO $$
BEGIN
    -- Check and add email_verified column
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'email_verified'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN email_verified BOOLEAN DEFAULT false;
    END IF;

    -- Check and add phone_number column
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'phone_number'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN phone_number TEXT;
    END IF;

    -- Check and add language column
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'language'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN language TEXT DEFAULT 'en';
    END IF;
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding columns: %', SQLERRM;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies to protect user data
DO $$
BEGIN
    -- Policy to allow users to view and update their own profile
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'users_can_view_own_profile'
    ) THEN
        CREATE POLICY users_can_view_own_profile ON public.profiles
        FOR SELECT USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'users_can_update_own_profile'
    ) THEN
        CREATE POLICY users_can_update_own_profile ON public.profiles
        FOR UPDATE USING (auth.uid() = id);
    END IF;
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating policies: %', SQLERRM;
END $$;

-- Add comments to help with documentation
COMMENT ON TABLE public.profiles IS 'Stores user profile information';
COMMENT ON COLUMN public.profiles.email_verified IS 'Indicates whether the user''s email has been verified';
COMMENT ON COLUMN public.profiles.language IS 'User''s preferred language for the application';
