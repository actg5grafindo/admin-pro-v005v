# Comprehensive PostgreSQL Diagnostic Script

# Ensure running with administrator privileges
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Error "Please run this script as Administrator"
    exit
}

# PostgreSQL Configuration Paths
$pgDataDir = "C:\Program Files\PostgreSQL\14\data"
$pgBinDir = "C:\Program Files\PostgreSQL\14\bin"

# Add PostgreSQL bin to PATH
$env:Path += ";$pgBinDir"

# Diagnostic Functions
function Test-PostgreSQLService {
    $service = Get-Service -Name "postgresql-x64-14" -ErrorAction SilentlyContinue
    if ($service) {
        Write-Host "PostgreSQL Service Status:" -ForegroundColor Cyan
        Write-Host "Name: $($service.Name)" -ForegroundColor Green
        Write-Host "Status: $($service.Status)" -ForegroundColor Green
        
        if ($service.Status -ne "Running") {
            Write-Host "Attempting to start service..." -ForegroundColor Yellow
            Start-Service $service.Name
            Start-Sleep -Seconds 5
        }
    } else {
        Write-Host "❌ PostgreSQL Service Not Found" -ForegroundColor Red
    }
}

function Test-PostgreSQLConnection {
    $username = "postgres"
    $database = "postgres"

    try {
        $result = & "$pgBinDir\psql.exe" -U $username -d $database -c "SELECT NOW() as current_time;" 2>&1
        
        if ($result -like "*current_time*") {
            Write-Host "✅ Basic PostgreSQL Connection Successful" -ForegroundColor Green
        } else {
            Write-Host "❌ Connection Failed" -ForegroundColor Red
            Write-Host $result -ForegroundColor Red
        }
    }
    catch {
        Write-Host "❌ Connection Error: $_" -ForegroundColor Red
    }
}

function Check-PostgreSQLConfiguration {
    Write-Host "Checking PostgreSQL Configuration Files:" -ForegroundColor Cyan
    
    $configFiles = @(
        "$pgDataDir\pg_hba.conf",
        "$pgDataDir\postgresql.conf"
    )

    foreach ($file in $configFiles) {
        if (Test-Path $file) {
            Write-Host "✅ Found: $file" -ForegroundColor Green
        } else {
            Write-Host "❌ Missing: $file" -ForegroundColor Red
        }
    }
}

function List-PostgreSQLUsers {
    try {
        $users = & "$pgBinDir\psql.exe" -U postgres -d postgres -c "\du" 2>&1
        Write-Host "PostgreSQL Users:" -ForegroundColor Cyan
        Write-Host $users -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Could not list users" -ForegroundColor Red
    }
}

# Run Diagnostics
Write-Host "🔍 PostgreSQL Diagnostic Tool" -ForegroundColor Magenta
Test-PostgreSQLService
Test-PostgreSQLConnection
Check-PostgreSQLConfiguration
List-PostgreSQLUsers

Write-Host "`n🛠️ Troubleshooting Recommendations:" -ForegroundColor Yellow
Write-Host "1. Verify PostgreSQL installation" -ForegroundColor White
Write-Host "2. Check Windows Services" -ForegroundColor White
Write-Host "3. Verify connection strings" -ForegroundColor White
