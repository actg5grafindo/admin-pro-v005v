-- Resolve Profiles Table Constraints

-- Drop existing constraints if they exist
DO $$
BEGIN
    -- Drop unique constraints on user_id
    BEGIN
        ALTER TABLE profiles 
        DROP CONSTRAINT IF EXISTS unique_user_id;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not drop unique_user_id constraint';
    END;

    -- Drop any other problematic constraints
    BEGIN
        ALTER TABLE profiles 
        DROP CONSTRAINT IF EXISTS profiles_user_id_unique;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not drop profiles_user_id_unique constraint';
    END;

    -- Re-add the unique constraint safely
    ALTER TABLE profiles 
    ADD CONSTRAINT unique_user_id UNIQUE (user_id);

EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'Error in constraint resolution: %', SQLERRM;
END $$;

-- Optional: Cleanup any orphaned or duplicate records
WITH duplicates AS (
    SELECT 
        user_id, 
        ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY id) AS rn
    FROM profiles
)
DELETE FROM profiles p
WHERE EXISTS (
    SELECT 1 
    FROM duplicates d 
    WHERE d.user_id = p.user_id AND d.rn > 1
);

-- Ensure referential integrity
ALTER TABLE profiles 
ADD CONSTRAINT fk_user_id 
FOREIGN KEY (user_id) 
REFERENCES users(id) 
ON DELETE CASCADE;
