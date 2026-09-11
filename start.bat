@echo off
echo ========================================================
echo   Starting Monocle (RailSync-AI) Backend and Frontend
echo ========================================================
echo.
echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "Monocle Backend (FastAPI + PostgreSQL)" cmd /k "cd /d %~dp0 && .\.venv\Scripts\python.exe main.py"

echo [2/2] Starting React Frontend on http://localhost:5173 ...
cd /d %~dp0frontend
npm run dev
