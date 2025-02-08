-- Add unique constraints to profiles table
ALTER TABLE profiles 
ADD CONSTRAINT unique_username UNIQUE (username),
ADD CONSTRAINT unique_email UNIQUE (email);

-- Add check constraints for validation
ALTER TABLE profiles 
ADD CONSTRAINT check_username_length CHECK (length(username) >= 3),
ADD CONSTRAINT check_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
ADD CONSTRAINT check_phone_format CHECK (phone_number ~* '^08\d{8,}$');

-- Optional: Add a trigger to ensure username and email are lowercase
CREATE OR REPLACE FUNCTION lowercase_username_email()
RETURNS TRIGGER AS $$
BEGIN
    NEW.username = LOWER(NEW.username);
    NEW.email = LOWER(NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_lowercase_username_email
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION lowercase_username_email();
