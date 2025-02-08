# PostgreSQL Connection Verification Script

# Set PostgreSQL bin path
$env:Path += ";C:\Program Files\PostgreSQL\14\bin"

# Connection Parameters
$username = "adminpro_user"
$database = "adminpro_db"
$password = "strong_password"

# Set password for non-interactive authentication
$env:PGPASSWORD = $password

# Test Connection
try {
    $result = psql -U $username -d $database -c "SELECT NOW() as current_time;" 2>&1
    
    if ($result -like "*current_time*") {
        Write-Host "✅ Database Connection Successful!" -ForegroundColor Green
        Write-Host "Connection Details:" -ForegroundColor Cyan
        Write-Host "Username: $username" -ForegroundColor Cyan
        Write-Host "Database: $database" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Connection Failed" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ Connection Error: $_" -ForegroundColor Red
}
