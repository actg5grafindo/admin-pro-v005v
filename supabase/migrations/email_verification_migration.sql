-- Add email verification columns to profiles table if not exists
DO $$
BEGIN
    -- Check and add email_verified column if it doesn't exist
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='email_verified'
    ) THEN
        ALTER TABLE profiles 
        ADD COLUMN email_verified BOOLEAN DEFAULT false;
    END IF;

    -- Check and add verification_attempts column if it doesn't exist
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='verification_attempts'
    ) THEN
        ALTER TABLE profiles 
        ADD COLUMN verification_attempts INTEGER DEFAULT 0;
    END IF;

    -- Check and add last_verification_attempt column if it doesn't exist
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='last_verification_attempt'
    ) THEN
        ALTER TABLE profiles 
        ADD COLUMN last_verification_attempt TIMESTAMP;
    END IF;
END $$;

-- Drop existing email_verification_tokens table if it exists
DROP TABLE IF EXISTS email_verification_tokens;

-- Create email verification tokens table
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    email TEXT NOT NULL,
    token TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '15 minutes'
);

-- Create Row Level Security for email verification tokens
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can manage their own verification tokens" ON email_verification_tokens;

-- Create policy for email verification tokens
CREATE POLICY "Users can manage their own verification tokens"
ON email_verification_tokens
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_email ON email_verification_tokens(email);
