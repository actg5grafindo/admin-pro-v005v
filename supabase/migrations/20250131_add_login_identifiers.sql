-- Create a view to support flexible login
CREATE OR REPLACE VIEW login_identifiers AS
SELECT 
  id, 
  email, 
  username, 
  phone_number
FROM users;

-- Function to validate unique identifiers
CREATE OR REPLACE FUNCTION validate_unique_identifiers()
RETURNS TRIGGER AS $$
BEGIN
  -- Check unique username
  IF NEW.username IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM users WHERE username = NEW.username AND id != NEW.id) THEN
      RAISE EXCEPTION 'Username already exists';
    END IF;
  END IF;

  -- Check unique phone number
  IF NEW.phone_number IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM users WHERE phone_number = NEW.phone_number AND id != NEW.id) THEN
      RAISE EXCEPTION 'Phone number already exists';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce unique identifiers
CREATE TRIGGER enforce_unique_identifiers
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION validate_unique_identifiers();
