@echo off
title ASCG Portal Launcher

echo ===================================================
echo ASCG Enterprise Portal - Starting All Services...
echo ===================================================
echo.

echo [1/4] Starting XAMPP Services (MySQL and Apache)...
if exist "C:\xampp\mysql_start.bat" (
    start "XAMPP-MySQL" /min "C:\xampp\mysql_start.bat"
    echo   - MySQL Started
)
if exist "C:\xampp\apache_start.bat" (
    start "XAMPP-Apache" /min "C:\xampp\apache_start.bat"
    echo   - Apache Started
)
echo.

ping 127.0.0.1 -n 3 > nul

echo [2/4] Starting Backend Server (Port 5000)...
start "ASCG-Backend" cmd /k "cd /d C:\Users\keerakiat.k\Desktop\ascg_g\backend && npm run dev"
echo   - Backend Server Launching...
echo.

echo [3/4] Starting Frontend App (Port 5173)...
start "ASCG-Frontend" cmd /k "cd /d C:\Users\keerakiat.k\Desktop\ascg_g\frontend && npm run dev"
echo   - Frontend App Launching...
echo.

ping 127.0.0.1 -n 4 > nul

echo [4/4] Opening Web Browser...
start http://localhost:5173

echo.
echo ===================================================
echo All services launched successfully!
echo To stop services, run stop_project.bat
echo ===================================================
ping 127.0.0.1 -n 4 > nul
