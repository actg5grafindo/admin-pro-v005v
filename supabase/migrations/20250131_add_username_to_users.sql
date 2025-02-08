-- Add username column to users table
ALTER TABLE users ADD COLUMN username TEXT UNIQUE;

-- Create a function to validate unique username
CREATE OR REPLACE FUNCTION validate_unique_username()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.username IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM users WHERE username = NEW.username) THEN
      RAISE EXCEPTION 'Username already exists';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce unique username
CREATE TRIGGER enforce_unique_username
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION validate_unique_username();
