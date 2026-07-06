@echo off
REM ============================================================================
REM NodeForge V5.1.0 - Build Script
REM ============================================================================
REM Compiles TypeScript and bundles the application with Vite
REM ============================================================================

echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║              NodeForge V5.1.0 - Build Script                           ║
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

echo Building project...
echo.

REM Run the build
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ═══════════════════════════════════════════════════════════════════════════
    echo ✓ Build completed successfully!
    echo.
    echo Build artifacts created in:
    echo   - dist/          (React app assets)
    echo   - dist-electron/ (Electron bundles)
    echo.
    echo Next steps:
    echo   1. Run: npm run electron:dev  (to test the build)
    echo   2. Run: npm run package       (to create installer)
    echo ═══════════════════════════════════════════════════════════════════════════
) else (
    echo.
    echo ✗ Build failed!
    echo Check the error messages above.
)

echo.
pause
