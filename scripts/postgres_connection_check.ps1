# Detailed PostgreSQL Connection Verification

# PostgreSQL Paths
$pgBinDir = "C:\Program Files\PostgreSQL\14\bin"
$pgDataDir = "C:\Program Files\PostgreSQL\14\data"

# Verbose Logging Function
function Write-VerboseLog {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

# Service Check
function Check-PostgreSQLService {
    Write-VerboseLog "🔍 Checking PostgreSQL Service" -Color Cyan
    $service = Get-Service -Name "postgresql-x64-14" -ErrorAction SilentlyContinue
    
    if ($service) {
        Write-VerboseLog "Service Name: $($service.Name)" -Color Green
        Write-VerboseLog "Service Status: $($service.Status)" -Color Green
        
        if ($service.Status -ne "Running") {
            Write-VerboseLog "Attempting to start service..." -Color Yellow
            try {
                Start-Service $service.Name -ErrorAction Stop
                Write-VerboseLog "Service started successfully" -Color Green
            }
            catch {
                Write-VerboseLog "Failed to start service: $_" -Color Red
                return $false
            }
        }
        return $true
    }
    else {
        Write-VerboseLog "❌ PostgreSQL Service Not Found" -Color Red
        return $false
    }
}

# Binary Existence Check
function Check-PostgreSQLBinaries {
    Write-VerboseLog "🔍 Checking PostgreSQL Binaries" -Color Cyan
    $requiredBinaries = @(
        "psql.exe", 
        "pg_config.exe", 
        "createdb.exe", 
        "dropdb.exe"
    )

    $missingBinaries = @()
    foreach ($binary in $requiredBinaries) {
        $path = Join-Path $pgBinDir $binary
        if (Test-Path $path) {
            Write-VerboseLog "✅ Found: $binary" -Color Green
        }
        else {
            Write-VerboseLog "❌ Missing: $binary" -Color Red
            $missingBinaries += $binary
        }
    }

    return $missingBinaries.Count -eq 0
}

# Connection Test
function Test-PostgreSQLConnection {
    Write-VerboseLog "🔍 Testing PostgreSQL Connection" -Color Cyan
    
    # Attempt connection as postgres user
    $env:PGPASSWORD = 'postgres'
    
    try {
        $result = & "$pgBinDir\psql.exe" -U postgres -d postgres -c "SELECT NOW() as current_time;" 2>&1
        
        if ($result -like "*current_time*") {
            Write-VerboseLog "✅ Connection Successful" -Color Green
            return $true
        }
        else {
            Write-VerboseLog "❌ Connection Failed" -Color Red
            Write-VerboseLog ($result | Out-String) -Color Red
            return $false
        }
    }
    catch {
        Write-VerboseLog "❌ Connection Error: $_" -Color Red
        return $false
    }
}

# Main Diagnostic Function
function Diagnose-PostgreSQLSetup {
    Write-VerboseLog "🚀 PostgreSQL Diagnostic Tool" -Color Magenta
    
    $serviceCheck = Check-PostgreSQLService
    $binaryCheck = Check-PostgreSQLBinaries
    $connectionCheck = Test-PostgreSQLConnection

    Write-VerboseLog "`n📋 Diagnostic Summary:" -Color Cyan
    Write-VerboseLog "Service Status:     $(if($serviceCheck){'✅ OK'}else{'❌ FAILED'})" -Color White
    Write-VerboseLog "Binaries Integrity: $(if($binaryCheck){'✅ OK'}else{'❌ FAILED'})" -Color White
    Write-VerboseLog "Connection Test:    $(if($connectionCheck){'✅ OK'}else{'❌ FAILED'})" -Color White

    if (-not ($serviceCheck -and $binaryCheck -and $connectionCheck)) {
        Write-VerboseLog "`n🛠️ Recommended Actions:" -Color Yellow
        Write-VerboseLog "1. Verify PostgreSQL installation" -Color White
        Write-VerboseLog "2. Check Windows Services" -Color White
        Write-VerboseLog "3. Reinstall PostgreSQL if needed" -Color White
    }
}

# Run Diagnosis
Diagnose-PostgreSQLSetup
