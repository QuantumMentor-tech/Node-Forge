@echo off
REM ============================================================================
REM NodeForge V5.1.0 - Package Script (Create Installer)
REM ============================================================================
REM Builds and packages the application as a Windows installer (.exe)
REM ============================================================================

echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║              NodeForge V5.1.0 - Package Creator                        ║
echo ║                   (Windows Installer Generator)                        ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ✗ ERROR: Node.js is not installed
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ✗ Failed to install dependencies
        pause
        exit /b 1
    )
)

echo Building and packaging application...
echo.
echo This may take a few minutes...
echo.

REM Run the package script
call npm run package

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ═══════════════════════════════════════════════════════════════════════════
    echo ✓ Packaging completed successfully!
    echo.
    echo Installer created in:
    echo   - dist/  (Look for NodeForge-*.exe)
    echo.
    echo You can now:
    echo   1. Share the installer with others
    echo   2. Double-click to install NodeForge on your system
    echo ═══════════════════════════════════════════════════════════════════════════
) else (
    echo.
    echo ✗ Packaging failed!
    echo Check the error messages above.
)

echo.
pause
