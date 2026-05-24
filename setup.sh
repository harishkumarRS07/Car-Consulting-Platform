#!/bin/bash

# CarConsult - Quick Setup Script
# This script automates the initial setup

echo "🚗 CarConsult - Quick Setup Script"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js v14 or higher"
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if Git is installed (optional)
if command -v git &> /dev/null; then
    echo "✅ Git version: $(git --version)"
else
    echo "⚠️  Git not found (optional)"
fi

echo ""
echo "📦 Setting up Backend..."
echo "------------------------"

# Backend Setup
cd backend

# Create .env if doesn't exist
if [ ! -f .env ]; then
    echo "Creating backend .env file..."
    cp .env.example .env
    echo "⚠️  Please update backend/.env with your MongoDB URI"
else
    echo "✅ .env already exists"
fi

# Install dependencies
echo "Installing backend dependencies..."
npm install

# Optionally seed database
echo ""
echo "Do you want to seed the database with sample cars? (y/n)"
read -r seed_response
if [ "$seed_response" = "y" ]; then
    echo "Seeding database..."
    npm run seed
    echo "✅ Database seeded with sample data"
fi

cd ..

echo ""
echo "📦 Setting up Frontend..."
echo "------------------------"

# Frontend Setup
cd frontend

# Create .env if doesn't exist
if [ ! -f .env ]; then
    echo "Creating frontend .env file..."
    cp .env.example .env
    echo "✅ Frontend .env created"
else
    echo "✅ .env already exists"
fi

# Install dependencies
echo "Installing frontend dependencies..."
npm install

cd ..

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Update backend/.env with your MongoDB URI"
echo "2. Open two terminals:"
echo ""
echo "   Terminal 1 (Backend):"
echo "   $ cd backend && npm run dev"
echo ""
echo "   Terminal 2 (Frontend):"
echo "   $ cd frontend && npm run dev"
echo ""
echo "3. Open your browser to: http://localhost:3000"
echo ""
echo "4. Default credentials:"
echo "   Email: admin@carconsult.com"
echo "   Password: admin123"
echo ""
echo "🚀 Happy coding!"
