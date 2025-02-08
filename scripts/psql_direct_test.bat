@echo off
echo PostgreSQL Direct Connection Test

set PGPASSWORD=strong_password

"C:\Program Files\PostgreSQL\14\bin\psql.exe" ^
    -h localhost ^
    -p 5432 ^
    -U adminpro_user ^
    -d adminpro_db ^
    -c "SELECT version();"

pause
