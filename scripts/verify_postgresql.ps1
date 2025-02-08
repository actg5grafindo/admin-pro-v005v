# PostgreSQL Verification Script

# PostgreSQL Configuration
$dbName = "adminpro_db"
$dbUser = "adminpro_user"
$pgBinDir = "K:\App\PostgreSQL-17\bin"
$env:PGPASSWORD = "6PLYXHccuGsD8@H"

# Test Database Connection
Write-Host "Testing Database Connection..." -ForegroundColor Yellow
& "$pgBinDir\psql.exe" -h localhost -U $dbUser -d $dbName -c "SELECT NOW() as current_time;"

# List Databases
Write-Host "`nListing Databases:" -ForegroundColor Yellow
& "$pgBinDir\psql.exe" -U postgres -c "\l"

# List Users
Write-Host "`nListing Users:" -ForegroundColor Yellow
& "$pgBinDir\psql.exe" -U postgres -c "\du"
