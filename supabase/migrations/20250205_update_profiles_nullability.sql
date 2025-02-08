-- Update profiles table to allow more nullable fields

ALTER TABLE profiles 
ALTER COLUMN first_name DROP NOT NULL,
ALTER COLUMN last_name DROP NOT NULL,
ALTER COLUMN display_name DROP NOT NULL,
ALTER COLUMN phone_number DROP NOT NULL;

-- Optional: Add default values for some columns
ALTER TABLE profiles 
ALTER COLUMN theme_preference SET DEFAULT 'light',
ALTER COLUMN language SET DEFAULT 'id';
