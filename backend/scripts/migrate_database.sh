#!/bin/bash

# Database Migration and Seeding Script for Histora
# This script initializes the database schema and populates it with mock data for production deployment

set -e  # Exit on any error

echo "🚀 Starting Histora Database Migration and Seeding..."

# Check if Python virtual environment is activated
if [[ "$VIRTUAL_ENV" != "" ]]; then
    echo "✅ Virtual environment detected: $VIRTUAL_ENV"
else
    echo "⚠️  No virtual environment detected. Attempting to activate..."
    if [ -f "venv/bin/activate" ]; then
        source venv/bin/activate
        echo "✅ Activated virtual environment: venv"
    elif [ -f "../venv/bin/activate" ]; then
        source ../venv/bin/activate
        echo "✅ Activated virtual environment: ../venv"
    else
        echo "❌ No virtual environment found. Please create and activate one first."
        exit 1
    fi
fi

# Navigate to backend directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"

echo "📂 Working directory: $BACKEND_DIR"
cd "$BACKEND_DIR"

# Check if required environment variables are set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set. Checking .env files..."
    
    # Try to load from root .env
    if [ -f "../.env" ]; then
        echo "📄 Loading environment from ../.env"
        export $(grep -v '^#' ../.env | xargs)
    elif [ -f ".env" ]; then
        echo "📄 Loading environment from .env"
        export $(grep -v '^#' .env | xargs)
    else
        echo "❌ No .env file found. Please create one with DATABASE_URL"
        exit 1
    fi
fi

echo "✅ Database URL configured: ${DATABASE_URL:0:20}..."

# Install/update dependencies
echo "📦 Installing Python dependencies..."
pip install --quiet -r requirements.txt

# Check if database is accessible
echo "🔍 Checking database connection..."
python -c "
import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine

async def test_connection():
    try:
        engine = create_async_engine(os.getenv('DATABASE_URL'))
        async with engine.begin() as conn:
            await conn.execute('SELECT 1')
        print('✅ Database connection successful')
        await engine.dispose()
        return True
    except Exception as e:
        print(f'❌ Database connection failed: {e}')
        return False

result = asyncio.run(test_connection())
exit(0 if result else 1)
"

if [ $? -ne 0 ]; then
    echo "❌ Database connection failed. Please check your DATABASE_URL and ensure PostgreSQL is running."
    exit 1
fi

# Run database seeding
echo "🌱 Running database migration and seeding..."
python scripts/seed_database.py

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Database migration and seeding completed successfully!"
    echo ""
    echo "📊 Your Histora database is now ready with:"
    echo "   • Complete database schema"
    echo "   • 4 sample users (including admin)"
    echo "   • 4 historical characters"
    echo "   • 4 pricing plans"
    echo "   • 4 credit packages"
    echo "   • Sample transactions and usage data"
    echo ""
    echo "🔑 Admin Access:"
    echo "   Email: admin@histora.com"
    echo "   Password: admin123"
    echo ""
    echo "👤 Demo User Access:"
    echo "   Email: demo@histora.com"
    echo "   Password: demo123"
    echo ""
    echo "🚀 You can now start the Histora application!"
else
    echo "❌ Database seeding failed. Check the logs above for details."
    exit 1
fi