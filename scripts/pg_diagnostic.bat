@echo off
echo PostgreSQL Diagnostic Information
echo ===================================

echo Checking PostgreSQL Service...
sc query postgresql-x64-14

echo.
echo Checking PostgreSQL Installation...
reg query "HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall" | findstr /i "PostgreSQL"

echo.
echo Checking PostgreSQL Binaries...
if exist "C:\Program Files\PostgreSQL\14\bin\psql.exe" (
    echo psql.exe found
) else (
    echo psql.exe NOT FOUND
)

echo.
echo Checking Listening Ports...
netstat -ano | findstr :5432

echo.
echo Checking Environment Variables...
echo PGDATA: %PGDATA%
echo PGHOST: %PGHOST%
echo PGPORT: %PGPORT%

echo.
echo Detailed Error Log
echo =================
type "C:\temp\postgresql_setup_log.txt" 2>nul

pause
