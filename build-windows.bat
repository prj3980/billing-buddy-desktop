
@echo off
echo Building Billing Buddy for Windows...

REM Clear any existing build artifacts
if exist "dist" rmdir /s /q "dist"
if exist "src-tauri\target" rmdir /s /q "src-tauri\target"

REM Install dependencies
echo Installing dependencies...
call npm install

REM Build the React app
echo Building React application...
call npm run build

REM Build Tauri app
echo Building Tauri application...
call npm run tauri:build

echo Build complete! Check src-tauri\target\release\bundle\ for your executable files.
pause
