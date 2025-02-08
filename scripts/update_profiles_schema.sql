        -- Update profiles table to add new columns and make username nullable
        DO $$
        BEGIN
            -- Add columns if not exists
            IF NOT EXISTS (SELECT column_name 
                           FROM information_schema.columns 
                           WHERE table_name='profiles' AND column_name='display_name') THEN
                ALTER TABLE profiles ADD COLUMN display_name VARCHAR(100);
            END IF;

            IF NOT EXISTS (SELECT column_name 
                           FROM information_schema.columns 
                           WHERE table_name='profiles' AND column_name='theme') THEN
                ALTER TABLE profiles ADD COLUMN theme VARCHAR(20) DEFAULT 'light';
            END IF;

            IF NOT EXISTS (SELECT column_name 
                           FROM information_schema.columns 
                           WHERE table_name='profiles' AND column_name='metadata') THEN
                ALTER TABLE profiles ADD COLUMN metadata JSONB;
            END IF;

            -- Make username nullable if it's not already
            IF EXISTS (SELECT column_name 
                       FROM information_schema.columns 
                       WHERE table_name='profiles' AND column_name='username' AND is_nullable='NO') THEN
                ALTER TABLE profiles ALTER COLUMN username DROP NOT NULL;
            END IF;
        END $$;

        -- Modify the existing trigger function to handle username sync more robustly
        CREATE OR REPLACE FUNCTION update_profile_username()
        RETURNS TRIGGER AS $$
        DECLARE
            existing_profile_username VARCHAR(50);
        BEGIN
            -- Check if a profile exists for this user
            SELECT username INTO existing_profile_username 
            FROM profiles 
            WHERE user_id = NEW.id;

            -- If no username in profile, or current profile username is different
            IF existing_profile_username IS NULL OR existing_profile_username != NEW.username THEN
                -- Update or insert username in profile
                INSERT INTO profiles (user_id, username)
                VALUES (NEW.id, NEW.username)
                ON CONFLICT (user_id) 
                DO UPDATE SET username = NEW.username;
            END IF;

            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Recreate the trigger to ensure it works correctly
        DROP TRIGGER IF EXISTS sync_username_to_profile ON users;
        CREATE TRIGGER sync_username_to_profile
        AFTER INSERT OR UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_profile_username();
