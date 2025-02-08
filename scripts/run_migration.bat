@echo off
REM Supabase Migration Runner

echo Checking Supabase CLI installation...
supabase --version

IF %ERRORLEVEL% NEQ 0 (
    echo Supabase CLI not found. Please install using:
    echo npm install -g supabase-cli
    exit /b 1
)

echo Running Supabase Migrations...
supabase migration up

IF %ERRORLEVEL% EQU 0 (
    echo Migration successful!
) ELSE (
    echo Migration failed. Check error messages above.
)

set PGPASSWORD=6PLYXHccuGsD8@H
set PGBIN=K:\App\PostgreSQL-17\bin
set MIGRATION_SCRIPT=k:\App\project\admprov002\adm-pro-v003-main\adm-pro-v002-main\supabase\migrations\20250205_create_full_schema.sql

echo Running Database Migration...
"%PGBIN%\psql.exe" -h localhost -U adminpro_user -d adminpro_db -f "%MIGRATION_SCRIPT%"

if %ERRORLEVEL% equ 0 (
    echo Migration completed successfully.
) else (
    echo Migration failed. Check error messages above.
)

pause
