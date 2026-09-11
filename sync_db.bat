@echo off
echo ========================================================
echo  Syncing rail_maintenance_data.sql into PostgreSQL (railsync)
echo ========================================================
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d railsync -f "%~dp0rail_maintenance_data.sql"
if %ERRORLEVEL% equ 0 (
    echo.
    echo [SUCCESS] rail_maintenance_data.sql loaded into railsync successfully!
) else (
    echo.
    echo [ERROR] Encountered an issue while loading rail_maintenance_data.sql.
)
