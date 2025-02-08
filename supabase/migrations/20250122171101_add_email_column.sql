-- Add email column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'profiles' 
                  AND column_name = 'email') THEN
        ALTER TABLE profiles ADD COLUMN email TEXT;
        -- Add unique constraint
        ALTER TABLE profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);
        -- Create index
        CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles (email);
    END IF;
END $$;
