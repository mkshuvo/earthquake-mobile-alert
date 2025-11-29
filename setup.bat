@echo off
REM Setup script for Earthquake Alert Mobile App
REM Automates the initial setup process

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════════════════════╗
echo ║          EARTHQUAKE ALERT MOBILE APP - SETUP WIZARD                       ║
echo ╚════════════════════════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERROR: Node.js is not installed or not in PATH
    echo.
    echo Please install Node.js 16+ from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js found: 
node --version
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERROR: npm is not installed
    echo Please reinstall Node.js with npm included.
    echo.
    pause
    exit /b 1
)

echo ✅ npm found:
npm --version
echo.

REM Install dependencies
echo ⏳ Installing dependencies (this may take a few minutes)...
echo.
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERROR: Failed to install dependencies
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Dependencies installed successfully!
echo.

REM Offer to link native modules
echo.
echo ╔════════════════════════════════════════════════════════════════════════════╗
echo ║                        OPTIONAL: Link Native Modules                       ║
echo ╚════════════════════════════════════════════════════════════════════════════╝
echo.
echo Some native modules may need to be linked for proper functionality.
echo This is only needed if you encounter map or icon issues.
echo.
set /p LINK_NATIVE="Link native modules? (y/n): "
if /i "%LINK_NATIVE%"=="y" (
    echo.
    echo ⏳ Linking react-native-maps...
    call npx react-native link react-native-maps
    echo.
    echo ⏳ Linking react-native-vector-icons...
    call npx react-native link react-native-vector-icons
    echo.
    echo ✅ Native modules linked!
)

echo.
echo ╔════════════════════════════════════════════════════════════════════════════╗
echo ║                         SETUP COMPLETED SUCCESSFULLY                       ║
echo ╚════════════════════════════════════════════════════════════════════════════╝
echo.

echo.
echo 📱 NEXT STEPS:
echo.
echo 1. Start the development server:
echo    npm start
echo.
echo 2. In a new terminal, run on Android:
echo    npm run android
echo.
echo    Or run on iOS:
echo    npm run ios
echo.

echo.
echo 🔧 TROUBLESHOOTING:
echo.
echo If you encounter issues:
echo   - Check SETUP.md for detailed documentation
echo   - Ensure Earthquake Alert Server is running on port 51763
echo   - For Android emulator: use machine IP instead of localhost
echo     Update src/services/earthquakeService.ts with your machine IP
echo.

echo.
echo ✨ Happy coding!
echo.
pause
