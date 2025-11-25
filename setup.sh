#!/bin/bash

echo "🚀 CollabHub Setup Script"
echo "=========================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if MongoDB is running
echo "Checking MongoDB connection..."
if command -v mongo &> /dev/null || command -v mongosh &> /dev/null; then
    echo "✅ MongoDB client found"
else
    echo "⚠️  MongoDB client not found. Make sure MongoDB is installed and running."
fi
echo ""

# Backend setup
echo "📦 Setting up backend..."
cd backend

if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Please copy .env.example to .env"
    cp .env.example .env
    echo "✅ Created .env file from .env.example"
fi

echo "Installing backend dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed successfully"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

cd ..
echo ""

# Frontend setup
echo "📦 Setting up frontend..."
cd frontend

if [ ! -f ".env" ]; then
    echo "⚠️  Frontend .env file not found."
fi

echo "Installing frontend dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed successfully"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

cd ..
echo ""

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p backend/uploads/resources
echo "✅ Uploads directory created"
echo ""

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure MongoDB is running (mongod)"
echo "2. Update backend/.env if needed"
echo "3. Start backend: cd backend && npm run dev"
echo "4. Start frontend: cd frontend && npm start"
echo ""
echo "Backend will run on: http://localhost:5000"
echo "Frontend will run on: http://localhost:3000"
echo ""
echo "Happy coding! 🚀"
