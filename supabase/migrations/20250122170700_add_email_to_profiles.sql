-- Add email column to profiles table
ALTER TABLE profiles ADD COLUMN email TEXT;

-- Copy existing user_email data to new email column
UPDATE profiles SET email = user_email;

-- Add not null constraint and unique constraint
ALTER TABLE profiles ALTER COLUMN email SET NOT NULL;
ALTER TABLE profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);

-- Add RLS policy for email field
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own email" ON profiles
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own email" ON profiles
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
