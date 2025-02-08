# PostgreSQL Table Listing Script

# Set environment variables
$env:PGPASSWORD = 'strong_password'

# PostgreSQL binary path
$psqlPath = "C:\Program Files\PostgreSQL\14\bin\psql.exe"

# Command to list tables
& "$psqlPath" `
    -h localhost `
    -p 5432 `
    -U adminpro_user `
    -d adminpro_db `
    -c "\dt"

# Pause to view output
pause
