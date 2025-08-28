#!/bin/bash

# Railway startup script for Histora backend
echo "🚀 Starting Histora backend on Railway..."

# Ensure we're using the correct Python and pip
echo "🔧 Checking Python and pip availability..."

# Try different ways to access pip
if command -v pip3 &> /dev/null; then
    PIP_CMD="pip3"
elif command -v pip &> /dev/null; then
    PIP_CMD="pip"
elif command -v python3 -m pip &> /dev/null; then
    PIP_CMD="python3 -m pip"
elif command -v python -m pip &> /dev/null; then
    PIP_CMD="python -m pip"
else
    echo "❌ No pip command found"
    exit 1
fi

echo "✅ Using pip command: $PIP_CMD"

# Install dependencies
echo "🔧 Installing Python dependencies..."
$PIP_CMD install -r requirements.txt

# Check if installation was successful
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Run database initialization if needed
echo "🔧 Initializing database..."
python3 railway_init.py

# Check if initialization was successful
if [ $? -ne 0 ]; then
    echo "❌ Failed to initialize database"
    exit 1
fi

echo "✅ Database initialized successfully"

# Start the application
echo "🚀 Starting FastAPI application..."
cd backend
exec python3 -m uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 4