@echo off
echo ========================================================
echo   Stopping servers on ports 8000 (Backend) and 5173 (Frontend)
echo ========================================================
powershell -Command "Get-NetTCPConnection -LocalPort 8000, 5173 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }; Write-Host 'Ports 8000 and 5173 successfully cleared!'"
