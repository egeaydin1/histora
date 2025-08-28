#!/bin/bash

# Railway startup script for Histora backend
echo "🚀 Starting Histora backend on Railway..."

# Install dependencies
echo "🔧 Installing Python dependencies..."
pip install -r requirements.txt

# Check if installation was successful
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Run database initialization if needed
echo "🔧 Initializing database..."
python railway_init.py

# Check if initialization was successful
if [ $? -ne 0 ]; then
    echo "❌ Failed to initialize database"
    exit 1
fi

echo "✅ Database initialized successfully"

# Start the application
echo "🚀 Starting FastAPI application..."
cd backend
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 4