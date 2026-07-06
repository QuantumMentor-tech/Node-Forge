@echo off
REM ============================================================================
REM NodeForge V5.1.0 - Dependency Installer
REM ============================================================================
REM Installs or updates npm dependencies
REM ============================================================================

echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║              NodeForge V5.1.0 - Dependency Installer                   ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ✗ ERROR: Node.js is not installed
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Select the LTS (Long Term Support) version
    echo.
    pause
    exit /b 1
)

echo Installing npm dependencies...
echo This may take several minutes on first run.
echo.

REM Run npm install
call npm install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ═══════════════════════════════════════════════════════════════════════════
    echo ✓ Dependencies installed successfully!
    echo.
    echo You can now run the application:
    echo   - Double-click run.bat
    echo   - Or run: npm run electron:dev
    echo ═══════════════════════════════════════════════════════════════════════════
) else (
    echo.
    echo ✗ Installation failed!
    echo.
    echo Possible solutions:
    echo   1. Check your internet connection
    echo   2. Try again with administrator privileges
    echo   3. Delete node_modules folder and try again
    echo   4. Update Node.js to the latest version
    echo.
)

echo.
pause
