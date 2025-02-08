@echo off
set PGPASSWORD=6PLYXHccuGsD8@H
set PGBIN=K:\App\PostgreSQL-17\bin

echo Testing Database Connection...
"%PGBIN%\psql.exe" -h localhost -U adminpro_user -d adminpro_db -c "SELECT NOW() as current_time;"

echo.
echo Listing Databases:
"%PGBIN%\psql.exe" -U postgres -c "\l"

echo.
echo Listing Users:
"%PGBIN%\psql.exe" -U postgres -c "\du"

pause
