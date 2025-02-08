-- Add preferred_language column to profiles table
ALTER TABLE profiles ADD COLUMN preferred_language TEXT DEFAULT 'en';

-- Create an index for faster querying
CREATE INDEX IF NOT EXISTS profiles_preferred_language_idx ON profiles (preferred_language);

-- Update policy to allow users to update their preferred language
CREATE POLICY "Users can update their own preferred language" ON profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
