@echo off
echo.
echo ========================================
echo   Gpower CRM - Next.js Edition
echo ========================================
echo.
echo Starting development server...
echo.
echo The app will open at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

cd /d "%~dp0"
npm run dev

pause
