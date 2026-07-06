@echo off
REM ============================================================================
REM NodeForge V5.1.0 - Quick Start Menu
REM ============================================================================

:menu
cls
echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║              NodeForge V5.1.0 - Quick Start Menu                       ║
echo ║                    Professional Diagram Editor                         ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.
echo Choose an option:
echo.
echo   [1] Run Application (Development Mode)
echo   [2] Build Project
echo   [3] Create Installer (.exe)
echo   [4] Install Dependencies
echo   [5] Open in Explorer
echo   [6] Exit
echo.
set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto run
if "%choice%"=="2" goto build
if "%choice%"=="3" goto package
if "%choice%"=="4" goto install
if "%choice%"=="5" goto explorer
if "%choice%"=="6" goto exit
goto menu

:run
echo.
echo Starting NodeForge...
call npm run electron:dev
goto menu

:build
echo.
echo Building project...
call npm run build
pause
goto menu

:package
echo.
echo Creating installer...
call npm run package
pause
goto menu

:install
echo.
echo Installing dependencies...
call npm install
pause
goto menu

:explorer
echo.
explorer .
goto menu

:exit
cls
exit /b 0
