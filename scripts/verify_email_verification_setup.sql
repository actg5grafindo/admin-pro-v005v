-- Verify Profiles Table Structure
SELECT 
    column_name, 
    data_type, 
    column_default
FROM 
    information_schema.columns
WHERE 
    table_name = 'profiles'
    AND column_name IN ('email_verified', 'verification_attempts', 'last_verification_attempt');

-- Check Email Verification Tokens Table
SELECT 
    column_name, 
    data_type
FROM 
    information_schema.columns
WHERE 
    table_name = 'email_verification_tokens';

-- Check Existing Policies
SELECT 
    polname, 
    polrelid::regclass, 
    polcmd, 
    polqual
FROM 
    pg_policy
WHERE 
    polrelid::regclass = 'email_verification_tokens'::regclass;
