@echo off
cd /d "C:\Users\Admin\OneDrive\Desktop\KisanMitraAi"

start "Kisan Mitra AI Server" /min cmd /k "node server.js"

timeout /t 4 /nobreak >nul

start "" "http://localhost:3000"

exit