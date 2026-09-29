@echo off
title Gpower CRM - Desktop App
color 0B
cd /d "%~dp0"

echo ===================================================
echo Starting Gpower CRM Desktop App...
echo ===================================================

if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
)

if not exist ".next\" (
    echo Building application...
    call npm run build
)

echo Launching Electron Desktop App...
call npm run electron:dev
