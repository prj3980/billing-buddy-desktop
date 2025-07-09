
@echo off
echo Testing Billing Buddy build process...

REM Clean previous builds
if exist "dist" rmdir /s /q "dist"
if exist "src-tauri\target" rmdir /s /q "src-tauri\target"

REM Install dependencies
echo Installing dependencies...
call npm install

REM Build React app
echo Building React app...
call npm run build

REM Test Tauri build
echo Testing Tauri build...
call npm install -g @tauri-apps/cli
call tauri build

REM Test Electron build
echo Testing Electron build...
call npm install --save-dev electron-builder
call node scripts/build-electron.js

echo Build test completed!
echo Check dist/ and src-tauri/target/release/bundle/ folders for executables
pause
