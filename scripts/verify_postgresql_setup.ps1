# PostgreSQL Setup Verification Script

# Configuration
$dbName = "adminpro_db"
$dbUser = "adminpro_user"
$postgresUser = "postgres"
$dbPassword = "6PLYXHccuGsD8@H"

# PostgreSQL Binary Path
$pgBinDir = "K:\App\PostgreSQL-17\bin"

# Function to run psql command
function Run-PsqlCommand {
    param(
        [string]$Command,
        [string]$Username = $postgresUser,
        [string]$Database = "postgres"
    )

    $env:PGPASSWORD = $dbPassword
    & "$pgBinDir\psql.exe" -U $Username -d $Database -c "$Command"
}

# Verification Steps
Write-Host "🔍 PostgreSQL Setup Verification" -ForegroundColor Cyan

# 1. Check Database Connection
Write-Host "`n1. Checking Database Connection..." -ForegroundColor Yellow
try {
    $connectionTest = Run-PsqlCommand -Command "SELECT NOW();" -Username $dbUser -Database $dbName
    if ($connectionTest) {
        Write-Host "✅ Database Connection Successful" -ForegroundColor Green
    } else {
        Write-Host "❌ Database Connection Failed" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ Database Connection Error: $_" -ForegroundColor Red
}

# 2. List Databases
Write-Host "`n2. Listing Databases..." -ForegroundColor Yellow
Run-PsqlCommand -Command "\l"

# 3. List Users
Write-Host "`n3. Listing Database Users..." -ForegroundColor Yellow
Run-PsqlCommand -Command "\du"

# 4. Verify Specific Database
Write-Host "`n4. Verifying $dbName Database..." -ForegroundColor Yellow
try {
    $dbExists = Run-PsqlCommand -Command "SELECT 1 FROM pg_database WHERE datname = '$dbName';"
    if ($dbExists) {
        Write-Host "✅ Database $dbName Exists" -ForegroundColor Green
    } else {
        Write-Host "❌ Database $dbName Not Found" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ Database Verification Error: $_" -ForegroundColor Red
}

# 5. Check User Permissions
Write-Host "`n5. Checking User Permissions..." -ForegroundColor Yellow
try {
    $userPermissions = Run-PsqlCommand -Command "SELECT rolname, rolsuper, rolcreatedb FROM pg_roles WHERE rolname = '$dbUser';"
    if ($userPermissions) {
        Write-Host "✅ User $dbUser Permissions Verified" -ForegroundColor Green
        Write-Host $userPermissions
    } else {
        Write-Host "❌ User $dbUser Not Found" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ User Permissions Check Error: $_" -ForegroundColor Red
}

Write-Host "`n🎉 PostgreSQL Verification Complete" -ForegroundColor Cyan
