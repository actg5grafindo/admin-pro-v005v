# Create Startup Shortcut for Admin Pro App
$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup\AdminProApp.lnk")
$Shortcut.TargetPath = "k:\App\project\admprov002\adm-pro-v003-main\adm-pro-v002-main\start_app.bat"
$Shortcut.WorkingDirectory = "k:\App\project\admprov002\adm-pro-v003-main\adm-pro-v002-main"
$Shortcut.Save()
