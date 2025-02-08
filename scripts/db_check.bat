@echo off
set PGPASSWORD=6PLYXHccuGsD8@H
set PGBIN=K:\App\PostgreSQL-17\bin
set DBNAME=adminpro_db
set DBUSER=adminpro_user

echo Checking Databases:
"%PGBIN%\psql.exe" -U postgres -c "\l"

echo.
echo Checking Specific Database:
"%PGBIN%\psql.exe" -U postgres -c "SELECT datname FROM pg_database WHERE datname = '%DBNAME%';"

echo.
echo Testing Database Connection:
"%PGBIN%\psql.exe" -h localhost -U %DBUSER% -d %DBNAME% -c "SELECT NOW() as current_time;"

echo.
echo Listing Users:
"%PGBIN%\psql.exe" -U postgres -c "\du"

pause
