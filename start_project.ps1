# ASCG Enterprise Portal - PowerShell 1-Click Launcher
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "🚀 ASCG Enterprise Portal - Starting All Services..." -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Start XAMPP (MySQL & Apache)
Write-Host "📦 Step 1: Starting XAMPP Services (MySQL & Apache)..." -ForegroundColor Yellow
if (Test-Path "C:\xampp\mysql_start.bat") {
    Start-Process -FilePath "C:\xampp\mysql_start.bat" -WindowStyle Hidden
    Write-Host "   - MySQL Started" -ForegroundColor Green
}
if (Test-Path "C:\xampp\apache_start.bat") {
    Start-Process -FilePath "C:\xampp\apache_start.bat" -WindowStyle Hidden
    Write-Host "   - Apache Started" -ForegroundColor Green
}

Start-Sleep -Seconds 2

# 2. Start Backend Server (Port 5000)
Write-Host "⚙️ Step 2: Starting Node.js Backend Server (Port 5000)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k cd /d C:\Users\keerakiat.k\Desktop\ascg_g\backend && npm run dev"
Write-Host "   - Backend Launching..." -ForegroundColor Green

# 3. Start Frontend Server (Port 5173)
Write-Host "🎨 Step 3: Starting Vite Frontend App (Port 5173)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k cd /d C:\Users\keerakiat.k\Desktop\ascg_g\frontend && npm run dev"
Write-Host "   - Frontend Launching..." -ForegroundColor Green

Start-Sleep -Seconds 3

# 4. Open Browser
Write-Host "🌐 Step 4: Opening Browser..." -ForegroundColor Yellow
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "✅ All services launched successfully!" -ForegroundColor Green
Write-Host "💡 To stop all services, run 'stop_project.bat'" -ForegroundColor Gray
Write-Host "===================================================" -ForegroundColor Cyan
