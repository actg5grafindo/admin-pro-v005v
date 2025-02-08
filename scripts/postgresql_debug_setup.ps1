# PostgreSQL Debugging and Setup Script

# Ensure running with administrator privileges
$currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
$windowsPrincipal = New-Object Security.Principal.WindowsPrincipal($currentUser)
$adminRole = [Security.Principal.WindowsBuiltInRole]::Administrator

if (-not $windowsPrincipal.IsInRole($adminRole)) {
    Write-Host "❌ Please run this script as Administrator" -ForegroundColor Red
    exit 1
}

# Logging Function
function Write-DetailedLog {
    param(
        [string]$Message, 
        [string]$Color = "White",
        [switch]$Error
    )
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logPrefix = if ($Error) { "[ERROR]" } else { "[INFO]" }
    $fullMessage = "$timestamp $logPrefix $Message"
    
    Write-Host $fullMessage -ForegroundColor $Color

    # Optional: Log to file
    $logPath = "C:\temp\postgresql_setup_log.txt"
    $fullMessage | Out-File -Append -FilePath $logPath
}

# Comprehensive System and PostgreSQL Check
function Diagnose-PostgreSQLEnvironment {
    Write-DetailedLog "🔍 Performing System Diagnosis" -Color Cyan

    # Check Windows Version
    $osInfo = Get-CimInstance Win32_OperatingSystem
    Write-DetailedLog "OS: $($osInfo.Caption), Version: $($osInfo.Version)"

    # Check PostgreSQL Installation
    $pgInstall = Get-ItemProperty -Path 'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*' | 
        Where-Object { $_.DisplayName -like "*PostgreSQL*" }
    
    if ($pgInstall) {
        Write-DetailedLog "PostgreSQL Installation Found:" -Color Green
        Write-DetailedLog "Name: $($pgInstall.DisplayName)" -Color Green
        Write-DetailedLog "Version: $($pgInstall.DisplayVersion)" -Color Green
    }
    else {
        Write-DetailedLog "❌ No PostgreSQL Installation Detected" -Color Red -Error
        return $false
    }

    # Check Service
    $service = Get-Service -Name "postgresql-x64-14" -ErrorAction SilentlyContinue
    if ($service) {
        Write-DetailedLog "PostgreSQL Service Status: $($service.Status)" -Color Green
    }
    else {
        Write-DetailedLog "❌ PostgreSQL Service Not Found" -Color Red -Error
        return $false
    }

    # Check Binaries
    $pgBinDir = "C:\Program Files\PostgreSQL\14\bin"
    $requiredBinaries = @("psql.exe", "pg_config.exe", "createdb.exe")
    
    foreach ($binary in $requiredBinaries) {
        $binaryPath = Join-Path $pgBinDir $binary
        if (Test-Path $binaryPath) {
            Write-DetailedLog "✅ Found Binary: $binary" -Color Green
        }
        else {
            Write-DetailedLog "❌ Missing Binary: $binary" -Color Red -Error
        }
    }

    return $true
}

# PostgreSQL Configuration and Setup
function Configure-PostgreSQL {
    $pgDataDir = "C:\Program Files\PostgreSQL\14\data"
    $pgBinDir = "C:\Program Files\PostgreSQL\14\bin"

    Write-DetailedLog "🛠️ Configuring PostgreSQL" -Color Cyan

    # Configuration Files
    $configFiles = @{
        "pg_hba.conf" = @"
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             postgres                                peer
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
"@
        "postgresql.conf" = @"
listen_addresses = 'localhost'
port = 5432
max_connections = 100
shared_buffers = 128MB
"@
    }

    foreach ($fileName in $configFiles.Keys) {
        $filePath = Join-Path $pgDataDir $fileName
        try {
            # Backup existing
            if (Test-Path $filePath) {
                Copy-Item $filePath "$filePath.backup" -Force
            }
            
            # Write new configuration
            $configFiles[$fileName] | Set-Content $filePath -ErrorAction Stop
            Write-DetailedLog "✅ Updated $fileName" -Color Green
        }
        catch {
            Write-DetailedLog "❌ Failed to update $fileName" -Color Red -Error
            Write-DetailedLog $_.Exception.Message -Color Red -Error
            return $false
        }
    }

    # Restart Service
    try {
        Restart-Service postgresql-x64-14 -Force -ErrorAction Stop
        Start-Sleep -Seconds 5
        Write-DetailedLog "🔄 PostgreSQL Service Restarted" -Color Green
    }
    catch {
        Write-DetailedLog "❌ Failed to Restart Service" -Color Red -Error
        Write-DetailedLog $_.Exception.Message -Color Red -Error
        return $false
    }

    return $true
}

# User and Database Setup
function Setup-PostgreSQLDatabase {
    $env:PGPASSWORD = 'postgres'
    $pgBinDir = "C:\Program Files\PostgreSQL\14\bin"

    $setupCommands = @"
-- Comprehensive Database Setup
DROP DATABASE IF EXISTS adminpro_db;
DROP USER IF EXISTS adminpro_user;

CREATE USER adminpro_user WITH PASSWORD 'strong_password' CREATEDB LOGIN;
CREATE DATABASE adminpro_db OWNER adminpro_user;

\c adminpro_db
GRANT ALL PRIVILEGES ON SCHEMA public TO adminpro_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO adminpro_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO adminpro_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO adminpro_user;
"@

    $setupCommandsPath = Join-Path $env:TEMP "postgresql_setup.sql"
    $setupCommands | Set-Content $setupCommandsPath

    try {
        $result = & "$pgBinDir\psql.exe" -U postgres -f $setupCommandsPath 2>&1
        Write-DetailedLog "✅ Database Setup Completed" -Color Green
        Write-DetailedLog ($result | Out-String) -Color Cyan
        return $true
    }
    catch {
        Write-DetailedLog "❌ Database Setup Failed" -Color Red -Error
        Write-DetailedLog $_.Exception.Message -Color Red -Error
        return $false
    }
}

# Main Execution
function Main {
    Write-DetailedLog "🚀 PostgreSQL Complete Setup Script" -Color Magenta

    $diagnosisResult = Diagnose-PostgreSQLEnvironment
    if (-not $diagnosisResult) {
        Write-DetailedLog "❌ System Diagnosis Failed" -Color Red -Error
        return
    }

    $configResult = Configure-PostgreSQL
    if (-not $configResult) {
        Write-DetailedLog "❌ PostgreSQL Configuration Failed" -Color Red -Error
        return
    }

    $setupResult = Setup-PostgreSQLDatabase
    if (-not $setupResult) {
        Write-DetailedLog "❌ Database Setup Failed" -Color Red -Error
        return
    }

    Write-DetailedLog "🎉 PostgreSQL Setup Completed Successfully" -Color Green
}

# Run Main Function
Main
