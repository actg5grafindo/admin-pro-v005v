# Konfigurasi error handling
$ErrorActionPreference = 'Stop'

# Pindah ke direktori proyek
Set-Location "K:\App\project\admprov002\adm-pro-v003-main\adm-pro-v002-main"

# Jalankan proxy server
node proxy_server.js
