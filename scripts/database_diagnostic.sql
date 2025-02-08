-- Database Schema Diagnostic

-- Check Current Database
SELECT current_database();

-- List All Schemas
SELECT schema_name FROM information_schema.schemata;

-- List Tables in Public Schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Detailed Table Information
SELECT 
    table_schema, 
    table_name, 
    table_type
FROM information_schema.tables
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_schema, table_name;

-- Check Table Columns
SELECT 
    table_schema, 
    table_name, 
    column_name, 
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- Check Permissions
SELECT 
    grantee, 
    table_schema, 
    table_name, 
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public';
