# PostgreSQL Restart and Verification Script

# PostgreSQL Service Name (adjust if different)
$serviceName = "postgresql-x64-17"

# PostgreSQL Connection Details
$pgBinDir = "K:\App\PostgreSQL-17\bin"
$dbName = "adminpro_db"
$dbUser = "adminpro_user"
$dbPassword = "7OQYXHccuGsD5@R"

# Function to restart PostgreSQL service
function Restart-PostgreSQLService {
    Write-Host " Restarting PostgreSQL Service..." -ForegroundColor Yellow
    try {
        Stop-Service -Name $serviceName -Force
        Start-Service -Name $serviceName
        Write-Host "PostgreSQL Service Restarted Successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "Failed to Restart PostgreSQL Service" -ForegroundColor Red
        Write-Host $_.Exception.Message
    }
}

# Function to test database connection
function Test-DatabaseConnection {
    Write-Host "Testing Database Connection..." -ForegroundColor Yellow
    
    $env:PGPASSWORD = $dbPassword
    try {
        $result = & "$pgBinDir\psql.exe" -h localhost -U $dbUser -d $dbName -c "SELECT NOW() as current_time;" 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Database Connection Successful" -ForegroundColor Green
            Write-Host "Connection Details:" -ForegroundColor Cyan
            Write-Host "Database: $dbName" -ForegroundColor Cyan
            Write-Host "User: $dbUser" -ForegroundColor Cyan
            return $true
        }
        else {
            Write-Host "Database Connection Failed" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "Database Connection Error" -ForegroundColor Red
        Write-Host $_.Exception.Message
        return $false
    }
}

# Main Execution
Restart-PostgreSQLService
Start-Sleep -Seconds 5  # Wait for service to fully restart
Test-DatabaseConnection

pause
