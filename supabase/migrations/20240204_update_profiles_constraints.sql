-- Add unique constraints to profiles table
ALTER TABLE profiles 
ADD CONSTRAINT unique_username UNIQUE (username),
ADD CONSTRAINT unique_email UNIQUE (email);

-- Add check constraints for validation
ALTER TABLE profiles 
ADD CONSTRAINT check_username_length CHECK (length(username) >= 3),
ADD CONSTRAINT check_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
ADD CONSTRAINT check_phone_format CHECK (phone_number ~* '^08\d{8,}$');
