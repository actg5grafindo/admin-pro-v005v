# Konfigurasi error handling
$ErrorActionPreference = 'Stop'

# Pindah ke direktori proyek
Set-Location "K:\App\project\admprov002\adm-pro-v003-main\adm-pro-v002-main"

# Pastikan npm tersedia
try {
    npm --version
} catch {
    Write-Error "npm tidak terinstal. Silakan instal Node.js dan npm terlebih dahulu."
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
    node database_proxy_server.js
} catch {
    Write-Error "Gagal menjalankan proxy server. Periksa konfigurasi server."
    exit 1
}
