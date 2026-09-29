@echo off
title Gpower CRM - Database Tools
color 0A

:menu
cls
echo ========================================
echo   GPOWER CRM - DATABASE TOOLS
echo ========================================
echo.
echo   1. Build Database Indexes
echo   2. Remove Duplicate Customers
echo   3. View Documentation
echo   4. Exit
echo.
echo ========================================
echo.

set /p choice="Select option (1-4): "

if "%choice%"=="1" goto indexes
if "%choice%"=="2" goto cleanup
if "%choice%"=="3" goto docs
if "%choice%"=="4" goto exit
goto menu

:indexes
cls
echo Building database indexes...
echo.
start /min cmd /c "node scripts/buildIndexes.js && pause"
echo.
echo Script running in minimized window...
echo Check the minimized window for progress.
echo.
pause
goto menu

:cleanup
cls
echo Removing duplicate customers...
echo.
echo WARNING: This will remove duplicate entries!
echo The oldest entry will be kept.
echo.
set /p confirm="Continue? (Y/N): "
if /i "%confirm%"=="Y" (
    start /min cmd /c "node scripts/removeDuplicateCustomers.js && pause"
    echo.
    echo Script running in minimized window...
    echo Check the minimized window for progress.
    echo.
) else (
    echo Operation cancelled.
)
pause
goto menu

:docs
cls
echo Opening documentation...
start docs\INDEX.md
pause
goto menu

:exit
cls
echo.
echo Thank you for using Gpower CRM Database Tools!
echo.
timeout /t 2 >nul
exit
