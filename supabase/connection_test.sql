-- Connection and Basic Diagnostics
DO $$
BEGIN
    -- Check current database
    RAISE NOTICE 'Current Database: %', current_database();
    
    -- Check if users table exists
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
    ) THEN
        RAISE NOTICE 'Users table exists';
    ELSE
        RAISE NOTICE 'Users table does not exist';
    END IF;

    -- Check if UUID extension is available
    IF EXISTS (
        SELECT * FROM pg_extension 
        WHERE extname = 'uuid-ossp'
    ) THEN
        RAISE NOTICE 'UUID extension is available';
    ELSE
        RAISE NOTICE 'UUID extension is NOT available';
    END IF;
END $$;
