
@echo off
echo Starting Billing Buddy in development mode...

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

REM Start development server
echo Starting development server...
call npm run tauri:dev

pause
