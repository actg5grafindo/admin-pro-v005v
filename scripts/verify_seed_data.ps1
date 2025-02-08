# PostgreSQL Seed Data Verification

# Set PostgreSQL environment
$env:PGPASSWORD = 'strong_password'

# Run psql command to verify seeded data
& "C:\Program Files\PostgreSQL\14\bin\psql.exe" `
    -h localhost `
    -p 5432 `
    -U adminpro_user `
    -d adminpro_db `
    -f "k:\App\project\admprov002\adm-pro-v003-main\adm-pro-v002-main\scripts\verify_seed_data.sql"

pause
