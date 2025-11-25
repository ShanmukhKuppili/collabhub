@echo off
echo 🚀 CollabHub Setup Script
echo ==========================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    exit /b 1
)

echo ✅ Node.js version:
node --version
echo.

REM Backend setup
echo 📦 Setting up backend...
cd backend

if not exist ".env" (
    echo ⚠️ .env file not found. Please copy .env.example to .env
    copy .env.example .env
    echo ✅ Created .env file from .env.example
)

echo Installing backend dependencies...
call npm install

if %ERRORLEVEL% equ 0 (
    echo ✅ Backend dependencies installed successfully
) else (
    echo ❌ Failed to install backend dependencies
    exit /b 1
)

cd ..
echo.

REM Frontend setup
echo 📦 Setting up frontend...
cd frontend

echo Installing frontend dependencies...
call npm install

if %ERRORLEVEL% equ 0 (
    echo ✅ Frontend dependencies installed successfully
) else (
    echo ❌ Failed to install frontend dependencies
    exit /b 1
)

cd ..
echo.

REM Create uploads directory
echo 📁 Creating uploads directory...
if not exist "backend\uploads\resources" mkdir backend\uploads\resources
echo ✅ Uploads directory created
echo.

echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Make sure MongoDB is running
echo 2. Update backend\.env if needed
echo 3. Start backend: cd backend ^&^& npm run dev
echo 4. Start frontend: cd frontend ^&^& npm start
echo.
echo Backend will run on: http://localhost:5000
echo Frontend will run on: http://localhost:3000
echo.
echo Happy coding! 🚀
pause
