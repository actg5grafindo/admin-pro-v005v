# PostgreSQL Database Setup Script
# Ensure UTF-8 encoding without BOM

# Ensure running with administrator privileges
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "Please run this script as Administrator" -ForegroundColor Red
    exit 1
}

# PostgreSQL Configuration
$pgDataDir = "C:\Program Files\PostgreSQL\14\data"
$pgConfigFile = "$pgDataDir\postgresql.conf"
$pgHbaFile = "$pgDataDir\pg_hba.conf"

# Database and User Configuration
$dbName = "adminpro_db"
$dbUser = "adminpro_user"
$dbPassword = "6PLYXHccuGsD8@H"
$dbPort = 5432

# Logging Function
function Write-Log {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

# Update PostgreSQL Configuration
function Update-PostgreSQLConfig {
    Write-Log "Updating PostgreSQL Configuration" -Color Cyan

    # Modify postgresql.conf
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
    $postgresConfig | Set-Content $pgConfigFile

    # Modify pg_hba.conf for local and network access
    $hbaConfig = @"
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             postgres                                peer
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
host    all             all             0.0.0.0/0               md5
"@
    $hbaConfig | Set-Content $pgHbaFile

    Write-Log "PostgreSQL Configuration Updated" -Color Green
}

# Create Database and User
function Setup-DatabaseAndUser {
    Write-Log "Creating Database and User" -Color Cyan
    
    # Set PostgreSQL environment
    $env:PGPASSWORD = 'postgres'

    # PostgreSQL binary path
    $psqlPath = "C:\Program Files\PostgreSQL\14\bin\psql.exe"

    # SQL Commands
    $setupCommands = @"
-- Drop existing database and user if they exist
DROP DATABASE IF EXISTS $dbName;
DROP USER IF EXISTS $dbUser;

-- Create new user
CREATE USER $dbUser WITH PASSWORD '$dbPassword' CREATEDB LOGIN;

-- Create database
CREATE DATABASE $dbName OWNER $dbUser;

-- Connect to database and set up schema privileges
\c $dbName
GRANT ALL PRIVILEGES ON SCHEMA public TO $dbUser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $dbUser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $dbUser;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO $dbUser;
"@

    # Save SQL to temporary file
    $setupSqlPath = Join-Path $env:TEMP "postgres_setup.sql"
    $setupCommands | Set-Content $setupSqlPath

    try {
        & $psqlPath -U postgres -f $setupSqlPath
        Write-Log "Database and User Created Successfully" -Color Green
    }
    catch {
        Write-Log "Database Setup Failed: $_" -Color Red
        return $false
    }
}

# Restart PostgreSQL Service
function Restart-PostgreSQLService {
    Write-Log "Restarting PostgreSQL Service" -Color Cyan
    try {
        Restart-Service postgresql-x64-14 -Force
        Start-Sleep -Seconds 5
        Write-Log "Service Restarted Successfully" -Color Green
    }
    catch {
        Write-Log "Service Restart Failed: $_" -Color Red
        return $false
    }
}

# Main Execution
function Main {
    Write-Log "PostgreSQL Full Setup Script" -Color Magenta

    Update-PostgreSQLConfig
    $userSetupResult = Setup-DatabaseAndUser
    $serviceRestartResult = Restart-PostgreSQLService

    if ($userSetupResult -and $serviceRestartResult) {
        Write-Log "PostgreSQL Setup Completed Successfully" -Color Green
        Write-Log "Database: $dbName" -Color Cyan
        Write-Log "Username: $dbUser" -Color Cyan
        Write-Log "Port: $dbPort" -Color Cyan
    }
    else {
        Write-Log "PostgreSQL Setup Failed" -Color Red
    }
}

# Run Main Function
Main
