@echo off
REM CarConsult - Quick Setup Script for Windows

echo.
echo 🚗 CarConsult - Quick Setup Script (Windows)
echo ================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js v14 or higher
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js version: %NODE_VERSION%
echo.

echo 📦 Setting up Backend...
echo ========================
cd backend

if not exist .env (
    echo Creating backend .env file...
    copy .env.example .env
    echo ⚠️  Please update backend\.env with your MongoDB URI
) else (
    echo ✅ .env already exists
)

echo Installing backend dependencies...
call npm install

echo.
echo Do you want to seed the database with sample cars? (y/n)
set /p seed_response=
if /i "%seed_response%"=="y" (
    echo Seeding database...
    call npm run seed
    echo ✅ Database seeded with sample data
)

cd ..

echo.
echo 📦 Setting up Frontend...
echo =========================
cd frontend

if not exist .env (
    echo Creating frontend .env file...
    copy .env.example .env
    echo ✅ Frontend .env created
) else (
    echo ✅ .env already exists
)

echo Installing frontend dependencies...
call npm install

cd ..

echo.
echo ✅ Setup Complete!
echo.
echo 📝 Next Steps:
echo 1. Update backend\.env with your MongoDB URI
echo 2. Open two command prompts:
echo.
echo    Command Prompt 1 (Backend):
echo    cd backend
echo    npm run dev
echo.
echo    Command Prompt 2 (Frontend):
echo    cd frontend
echo    npm run dev
echo.
echo 3. Open your browser to: http://localhost:3000
echo.
echo 4. Default credentials:
echo    Email: admin@carconsult.com
echo    Password: admin123
echo.
echo 🚀 Happy coding!
echo.
pause
