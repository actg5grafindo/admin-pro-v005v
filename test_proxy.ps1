# Skrip PowerShell untuk menguji proxy server

# Tes status server
try {
    $statusResponse = Invoke-RestMethod -Uri "http://localhost:5000/status" -Method Get
    Write-Host "Status Server: $($statusResponse | ConvertTo-Json)"
} catch {
    Write-Error "Gagal mengakses status server: $_"
}

# Tes query database
try {
    $queryBody = @{
        query = "SELECT NOW()"
        params = @()
    } | ConvertTo-Json

    $queryResponse = Invoke-RestMethod -Uri "http://localhost:5000/query" -Method Post -Body $queryBody -ContentType "application/json"
    Write-Host "Hasil Query: $($queryResponse | ConvertTo-Json)"
} catch {
    Write-Error "Gagal menjalankan query: $_"
}
