@echo off
:: Change to the project directory
cd /d "K:\App\project\adminpro\admprov002\adm-pro-v003-main\adm-pro-v002-main"

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js is not installed. Please install Node.js first.
    pause
    exit /b
)

:: Check if npm dependencies are installed
if not exist "node_modules" (
    echo Installing npm dependencies...
    call npm install
)

:: Configure Windows Firewall
netsh advfirewall firewall add rule name="AdminProApp" dir=in action=allow protocol=TCP localport=5050

:: Start the application with host parameter to make it accessible on the network
start "" cmd /k "npm run dev -- --host 0.0.0.0 --port 5050"

:: Get local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| find "IPv4 Address"') do set "localip=%%a"
set localip=%localip:~1%

:: Optional: Open the application in default browser
start http://localhost:5050

echo Application is running on:
echo http://localhost:5050
echo http://%localip%:5050
