#!/bin/bash

# Enterprise B2B Pilot Program Manager - Quick Start Script
# This script sets up and runs the entire application

echo "🚀 Enterprise B2B Pilot Program Manager - Quick Start"
echo "======================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo ""

# Navigate to backend directory
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✓ Dependencies installed"
    echo ""
else
    echo "✓ Dependencies already installed"
    echo ""
fi

# Check if database exists
if [ ! -f "pilot-tracker.db" ]; then
    echo "🗄️  Creating database and seeding data..."
    npm run seed
    echo "✓ Database created with 10 sample pilots"
    echo ""
else
    echo "✓ Database already exists"
    echo ""
fi

echo "🌟 Starting backend server..."
echo ""
echo "Backend will run on: http://localhost:3000"
echo "Frontend dashboard: ../frontend/index.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
echo "======================================================"
echo ""

# Start the server
npm start
