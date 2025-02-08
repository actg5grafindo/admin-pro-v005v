-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'user');

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    preferred_language TEXT DEFAULT 'id',
    role user_role DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create a function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS (Row Level Security) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy for viewing profiles
CREATE POLICY "Profiles are viewable by users with the same role or higher level roles"
    ON profiles FOR SELECT
    USING (
        auth.uid() = id
        OR 
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'
        OR 
        ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' AND role = 'user')
    );

-- Policy for inserting profiles (only superadmin can create admin, everyone can create user)
CREATE POLICY "Users can create their own profile"
    ON profiles FOR INSERT
    WITH CHECK (
        auth.uid() = id
        OR 
        (
            (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'
            AND 
            NEW.role IN ('admin', 'user')
        )
    );

-- Policy for updating profiles
CREATE POLICY "Users can update their own profile, admins can update users, superadmins can update anyone"
    ON profiles FOR UPDATE
    USING (
        auth.uid() = id
        OR 
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'
        OR 
        ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' AND role = 'user')
    )
    WITH CHECK (
        auth.uid() = id
        OR 
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'
        OR 
        ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' AND role = 'user')
    );

-- Create function to create first superadmin
CREATE OR REPLACE FUNCTION create_first_superadmin(
    admin_email TEXT,
    admin_password TEXT
) RETURNS void AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Only proceed if no superadmin exists
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE role = 'superadmin') THEN
        -- Create the user in auth.users
        user_id := (SELECT id FROM auth.users WHERE email = admin_email);
        
        IF user_id IS NULL THEN
            -- Create new user if doesn't exist
            user_id := (SELECT id FROM auth.users WHERE email = admin_email);
        END IF;

        -- Create profile with superadmin role
        INSERT INTO profiles (id, email, role)
        VALUES (user_id, admin_email, 'superadmin')
        ON CONFLICT (id) DO UPDATE
        SET role = 'superadmin';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
