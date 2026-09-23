@echo off
title Dr. Arwa Bohra - Clinic Website Launcher
color 0A

echo ===================================================
echo     Dr. Arwa Bohra - Clinic Website Launcher
echo ===================================================
echo.

:: Detect project folder
set "PROJECT_DIR=%~dp0"
if exist "%~dp0doctor-arwa-bohra-vercel-v3\package.json" (
    set "PROJECT_DIR=%~dp0doctor-arwa-bohra-vercel-v3"
)

cd /d "%PROJECT_DIR%"

:: Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [ERROR] Node.js is not installed or not found in PATH!
    echo Please install Node.js from https://nodejs.org/ to run the website.
    echo.
    pause
    exit /b 1
)

:: Ensure .env.local exists
if not exist ".env.local" (
    if exist ".env.example" (
        echo [INFO] Creating .env.local from .env.example...
        copy .env.example .env.local >nul
    )
)

:: Ensure node_modules exists
if not exist "node_modules" (
    echo [INFO] Dependencies not found. Installing now (this may take a minute)...
    call npm install
    if %ERRORLEVEL% neq 0 (
        color 0C
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b 1
    )
)

echo.
echo ===================================================
echo   Website URL:   http://localhost:3000
echo   Admin Panel:   http://localhost:3000/admin
echo   Default Pass:  arwaadmin2026
echo ===================================================
echo.
echo Launching your browser in 2 seconds...
echo Press Ctrl + C in this window to stop the server anytime.
echo.

:: Launch browser in background after 2 seconds
start "" /b cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3000"

:: Start Next.js development server
call npm run dev

pause
