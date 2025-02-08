# Comprehensive PostgreSQL Setup and Configuration Script

# Require administrator privileges
#Requires -RunAsAdministrator

# Configuration Parameters
$pgDataDir = "K:\App\PostgreSQL-17\data"
$pgBinDir = "K:\App\PostgreSQL-17\bin"
$dbName = "adminpro_db"
$dbUser = "adminpro_user"
$dbPassword = "6PLYXHccuGsD8@H"
$postgresPassword = "6PLYXHccuGsD8@H"
$dbPort = 5432
$serviceName = "postgresql-x64-17"

# Logging Function
function Write-ColorLog {
    param(
        [string]$Message, 
        [string]$Color = "White",
        [switch]$NoNewline
    )
    if ($NoNewline) {
        Write-Host $Message -ForegroundColor $Color -NoNewline
    } else {
        Write-Host $Message -ForegroundColor $Color
    }
}

# Validate PostgreSQL Installation
function Test-PostgreSQLInstallation {
    Write-ColorLog "Checking PostgreSQL Installation..." Yellow
    
    # Use the actual psql path we found earlier
    $psqlPath = Join-Path $pgBinDir "psql.exe"
    
    if (-not (Test-Path $psqlPath)) {
        Write-ColorLog "Error: PostgreSQL binary not found at $psqlPath" Red
        return $false
    }

    try {
        $version = & $psqlPath --version
        Write-ColorLog "PostgreSQL Version: $version" Green
        return $true
    }
    catch {
        Write-ColorLog "Error checking PostgreSQL version" Red
        return $false
    }
}

# Configure PostgreSQL Configuration Files
function Set-PostgreSQLConfiguration {
    Write-ColorLog "Configuring PostgreSQL Configuration Files..." Yellow

    # Ensure data directory exists
    if (-not (Test-Path $pgDataDir)) {
        Write-ColorLog "Creating PostgreSQL data directory..." Yellow
        New-Item -Path $pgDataDir -ItemType Directory -Force | Out-Null
    }

    # postgresql.conf
    $postgresConfigPath = Join-Path $pgDataDir "postgresql.conf"
    $postgresConfig = @"
# Connection Settings
listen_addresses = '*'
port = $dbPort
max_connections = 100
shared_buffers = 128MB
effective_cache_size = 256MB
work_mem = 4MB
maintenance_work_mem = 64MB
"@
    
    try {
        $postgresConfig | Set-Content $postgresConfigPath -Force
        
        # pg_hba.conf
        $hbaConfigPath = Join-Path $pgDataDir "pg_hba.conf"
        $hbaConfig = @"
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             postgres                                peer
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
host    all             all             0.0.0.0/0               md5
"@
        $hbaConfig | Set-Content $hbaConfigPath -Force

        Write-ColorLog "Configuration files updated successfully" Green
        return $true
    }
    catch {
        Write-ColorLog "Error updating configuration files: $_" Red
        return $false
    }
}

# Create Database and User
function New-PostgreSQLDatabase {
    Write-ColorLog "Creating Database and User..." Yellow

    $env:PGPASSWORD = $postgresPassword
    $setupScript = @"
-- Drop existing objects
DROP DATABASE IF EXISTS $dbName;
DROP USER IF EXISTS $dbUser;

-- Create new user
CREATE USER $dbUser WITH PASSWORD '$dbPassword' CREATEDB LOGIN;

-- Create database
CREATE DATABASE $dbName OWNER $dbUser;

-- Connect to database and set up privileges
\c $dbName
GRANT ALL PRIVILEGES ON SCHEMA public TO $dbUser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $dbUser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $dbUser;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO $dbUser;
"@

    $setupScriptPath = Join-Path $env:TEMP "postgres_setup.sql"
    $setupScript | Set-Content $setupScriptPath

    try {
        & "$pgBinDir\psql.exe" -U postgres -f $setupScriptPath
        Write-ColorLog "Database and user created successfully" Green
        return $true
    }
    catch {
        Write-ColorLog "Error creating database: $_" Red
        return $false
    }
}

# Restart PostgreSQL Service
function Restart-PostgreSQLService {
    Write-ColorLog "Restarting PostgreSQL Service..." Yellow
    try {
        Restart-Service $serviceName -Force
        Start-Sleep -Seconds 5
        Write-ColorLog "Service restarted successfully" Green
        return $true
    }
    catch {
        Write-ColorLog "Error restarting service: $_" Red
        return $false
    }
}

# Verify Database Connection
function Test-DatabaseConnection {
    Write-ColorLog "Testing Database Connection..." Yellow
    
    $env:PGPASSWORD = $dbPassword
    try {
        $connectionTest = & "$pgBinDir\psql.exe" -h localhost -p $dbPort -U $dbUser -d $dbName -c "SELECT NOW() as current_time;" 2>&1
        
        if ($connectionTest -like "*current_time*") {
            Write-ColorLog "Database connection successful" Green
            return $true
        }
        else {
            Write-ColorLog "Connection test failed" Red
            Write-ColorLog ($connectionTest | Out-String) Red
            return $false
        }
    }
    catch {
        Write-ColorLog "Connection error: $_" Red
        return $false
    }
}

# Main Execution Function
function Start-PostgreSQLSetup {
    Write-ColorLog "Starting PostgreSQL Full Setup" Cyan

    $steps = @(
        @{Name = "PostgreSQL Installation Check"; Function = ${function:Test-PostgreSQLInstallation}},
        @{Name = "Configure PostgreSQL"; Function = ${function:Set-PostgreSQLConfiguration}},
        @{Name = "Create Database and User"; Function = ${function:New-PostgreSQLDatabase}},
        @{Name = "Restart PostgreSQL Service"; Function = ${function:Restart-PostgreSQLService}},
        @{Name = "Verify Database Connection"; Function = ${function:Test-DatabaseConnection}}
    )

    $overallSuccess = $true

    foreach ($step in $steps) {
        Write-ColorLog ("Executing: " + $step.Name) Yellow
        $result = & $step.Function
        
        if (-not $result) {
            Write-ColorLog ("❌ " + $step.Name + " failed") Red
            $overallSuccess = $false
            break
        }
        else {
            Write-ColorLog ("✅ " + $step.Name + " completed") Green
        }
    }

    if ($overallSuccess) {
        Write-ColorLog "PostgreSQL Setup Completed Successfully" Green
        Write-ColorLog "Database: $dbName" Cyan
        Write-ColorLog "Username: $dbUser" Cyan
        Write-ColorLog "Port: $dbPort" Cyan
    }
    else {
        Write-ColorLog "PostgreSQL Setup Failed" Red
    }
}

# Execute Setup
Start-PostgreSQLSetup
