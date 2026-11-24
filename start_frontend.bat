@echo off
echo ========================================================
echo Starting CampusConnect React Vite Frontend...
echo URL: http://localhost:5173
echo ========================================================
cd /d "%~dp0frontend"
call npm run dev
pause
