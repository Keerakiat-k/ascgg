@echo off
title ASCG Portal - Stop All Services

echo ===================================================
echo ASCG Enterprise Portal - Stopping All Services...
echo ===================================================
echo.

echo Stopping Node.js Backend and Frontend processes...
taskkill /F /IM node.exe > nul 2>&1
echo   - Node.js processes stopped.

echo Stopping XAMPP Services (MySQL and Apache)...
if exist "C:\xampp\mysql_stop.bat" (
    call "C:\xampp\mysql_stop.bat" > nul 2>&1
    echo   - MySQL Stopped.
)
if exist "C:\xampp\apache_stop.bat" (
    call "C:\xampp\apache_stop.bat" > nul 2>&1
    echo   - Apache Stopped.
)

echo.
echo ===================================================
echo All services stopped successfully!
echo ===================================================
ping 127.0.0.1 -n 3 > nul
