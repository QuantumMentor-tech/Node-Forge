@echo off
REM ============================================================================
REM NodeForge V5.1.0 - Application Launcher
REM ============================================================================
REM This batch file runs the NodeForge Electron application in development mode
REM ============================================================================

echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║              NodeForge V5.1.0 - Application Launcher                   ║
echo ║                    Professional Diagram Editor                         ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ✗ ERROR: Node.js is not installed or not in PATH
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Then restart your terminal and try again.
    echo.
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ✗ ERROR: npm is not installed
    echo Please reinstall Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Display Node and npm versions
echo ✓ Node.js and npm found
echo.
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo   Node version: %NODE_VERSION%
echo   npm version:  %NPM_VERSION%
echo.

REM Check if node_modules exists, if not install dependencies
if not exist "node_modules\" (
    echo ⚠ node_modules not found. Installing dependencies...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ✗ Failed to install dependencies
        echo.
        pause
        exit /b 1
    )
    echo ✓ Dependencies installed successfully
    echo.
)

REM Start the application
echo ═══════════════════════════════════════════════════════════════════════════
echo Starting NodeForge in development mode...
echo.
echo ℹ This will:
echo   1. Compile TypeScript code
echo   2. Build React bundles with Vite
echo   3. Launch the Electron application
echo.
echo Press Ctrl+C in this window to stop the application.
echo ═══════════════════════════════════════════════════════════════════════════
echo.

REM Run the Electron development server
call npm run electron:dev

REM Check if the app exited successfully
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ NodeForge closed successfully
) else (
    echo.
    echo ✗ NodeForge exited with an error
    echo Error Code: %ERRORLEVEL%
)

echo.
pause
