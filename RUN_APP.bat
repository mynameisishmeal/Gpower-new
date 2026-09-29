@echo off
title Gpower CRM
color 0A
cd /d "%~dp0"

echo Starting Gpower CRM...

netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo Server already running. Opening Chrome...
    start chrome http://localhost:3000
    timeout /t 1 >nul
    exit
)

if not exist "node_modules\" npm install --silent
if not exist ".next\" npm run build

echo Server starting at http://localhost:3000
start /b cmd /c "timeout /t 3 >nul && start chrome http://localhost:3000"

npm run start
