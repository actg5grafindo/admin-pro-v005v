# Konfigurasi error handling
$ErrorActionPreference = 'Stop'

# Fungsi untuk memeriksa port
function Test-Port {
    param (
        [string]$ComputerName = 'localhost',
        [int]$Port = 5000
    )

    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.Connect($ComputerName, $Port)
        return $true
    }
    catch {
        return $false
    }
    finally {
        if ($tcpClient) {
            $tcpClient.Close()
        }
    }
}

# Pindah ke direktori proyek
Set-Location "K:\App\project\admprov002\adm-pro-v003-main\adm-pro-v002-main"

# Periksa apakah Node.js terinstal
try {
    $nodeVersion = node --version
    Write-Host "Node.js versi: $nodeVersion"
} catch {
    Write-Error "Node.js tidak terinstal. Silakan instal Node.js terlebih dahulu."
    exit 1
}

# Periksa apakah npm terinstal
try {
    $npmVersion = npm --version
    Write-Host "npm versi: $npmVersion"
} catch {
    Write-Error "npm tidak terinstal. Silakan instal Node.js dan npm terlebih dahulu."
    exit 1
}

# Periksa port 5000
if (Test-Port -Port 5000) {
    Write-Error "Port 5000 sudah digunakan. Harap tutup proses yang menggunakan port tersebut."
    exit 1
}

# Install dependencies
try {
    npm install express pg cors
} catch {
    Write-Error "Gagal menginstal dependencies. Periksa koneksi internet Anda."
    exit 1
}

# Jalankan proxy server
try {
    Start-Process node -ArgumentList "database_proxy_server.js" -PassThru
    Start-Sleep -Seconds 3  # Tunggu server mulai

    # Periksa apakah server berjalan
    if (Test-Port -Port 5000) {
        Write-Host "Proxy server berhasil dijalankan di port 5000"
    } else {
        Write-Error "Proxy server gagal berjalan"
        exit 1
    }
} catch {
    Write-Error "Gagal menjalankan proxy server. Periksa konfigurasi server."
    exit 1
}
