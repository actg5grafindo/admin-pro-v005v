# PostgreSQL Database Diagnostic Script

# Configuration
$pgBinDir = "K:\App\PostgreSQL-17\bin"
$dbName = "adminpro_db"
$dbUser = "adminpro_user"
$postgresUser = "postgres"
$env:PGPASSWORD = "6PLYXHccuGsD8@H"

# Function to run psql command
function Run-PsqlCommand {
    param(
        [string]$Command,
        [string]$Username = $postgresUser,
        [string]$Database = "postgres"
    )

    & "$pgBinDir\psql.exe" -h localhost -U $Username -d $Database -c "$Command"
}

# Diagnostic Steps
Write-Host "🔍 PostgreSQL Database Diagnostic" -ForegroundColor Cyan

# 1. List All Databases
Write-Host "`n1. Listing All Databases:" -ForegroundColor Yellow
Run-PsqlCommand -Command "\l"

# 2. Check Specific Database
Write-Host "`n2. Checking $dbName Database:" -ForegroundColor Yellow
try {
    $dbCheck = Run-PsqlCommand -Command "SELECT datname FROM pg_database WHERE datname = '$dbName';" -Database "postgres"
    if ($dbCheck) {
        Write-Host "✅ Database $dbName Exists" -ForegroundColor Green
    } else {
        Write-Host "❌ Database $dbName Not Found" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ Database Check Error: $_" -ForegroundColor Red
}

# 3. Check Database Connection
Write-Host "`n3. Testing Database Connection:" -ForegroundColor Yellow
try {
    $connectionTest = Run-PsqlCommand -Command "SELECT NOW();" -Username $dbUser -Database $dbName
    if ($connectionTest) {
        Write-Host "✅ Database Connection Successful" -ForegroundColor Green
    } else {
        Write-Host "❌ Database Connection Failed" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ Connection Error: $_" -ForegroundColor Red
}

# 4. List Users
Write-Host "`n4. Listing Database Users:" -ForegroundColor Yellow
Run-PsqlCommand -Command "\du"

# 5. Check User Permissions
Write-Host "`n5. Checking User Permissions:" -ForegroundColor Yellow
try {
    $userPermissions = Run-PsqlCommand -Command "SELECT rolname, rolsuper, rolcreatedb FROM pg_roles WHERE rolname = '$dbUser';"
    if ($userPermissions) {
        Write-Host "✅ User $dbUser Permissions:" -ForegroundColor Green
        Write-Host $userPermissions
    } else {
        Write-Host "❌ User $dbUser Not Found" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ User Permissions Check Error: $_" -ForegroundColor Red
}

Write-Host "`n🎉 PostgreSQL Diagnostic Complete" -ForegroundColor Cyan
pause
