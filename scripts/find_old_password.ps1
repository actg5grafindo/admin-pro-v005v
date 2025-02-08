# Script to find files with old password
$oldPassword = "6PLYXHccuGsD8@H"
$searchPath = "k:\App\project\admprov002\adm-pro-v003-main\adm-pro-v002-main"

Write-Host "Searching for files containing old password..."

Get-ChildItem -Path $searchPath -Recurse -Include *.ts,*.js,*.json,*.env,*.sql | 
    Select-String -Pattern $oldPassword -List | 
    Select-Object Path

Write-Host "Search complete."
