# PostgreSQL Database Diagnostic

# Set PostgreSQL environment
$env:PGPASSWORD = 'strong_password'

# Run diagnostic SQL
& "C:\Program Files\PostgreSQL\14\bin\psql.exe" `
    -h localhost `
    -p 5432 `
    -U adminpro_user `
    -d adminpro_db `
    -f "k:\App\project\admprov002\adm-pro-v003-main\adm-pro-v002-main\scripts\database_diagnostic.sql" `
    -o "k:\App\project\admprov002\adm-pro-v003-main\adm-pro-v002-main\database_diagnostic_output.txt"

# Open the output file
notepad "k:\App\project\admprov002\adm-pro-v003-main\adm-pro-v002-main\database_diagnostic_output.txt"
