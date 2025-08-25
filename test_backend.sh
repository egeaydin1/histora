#!/bin/bash

# FastAPI Backend Test Script
# Tests if the backend can start properly

set -e

echo "🧪 Testing FastAPI Backend Setup..."
echo "=================================="

# Navigate to backend directory
cd /Users/hientranpc/Desktop/Claude/histora/backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Run start.sh first."
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Check Python and key packages
echo "🔍 Checking Python environment..."
echo "Python version: $(python --version)"
echo "Pip version: $(pip --version)"

# Test imports
echo "🔍 Testing key imports..."
python -c "import fastapi; print('✅ FastAPI:', fastapi.__version__)" || echo "❌ FastAPI not installed"
python -c "import sqlalchemy; print('✅ SQLAlchemy:', sqlalchemy.__version__)" || echo "❌ SQLAlchemy not installed"
python -c "import pydantic; print('✅ Pydantic:', pydantic.__version__)" || echo "❌ Pydantic not installed"
python -c "import uvicorn; print('✅ Uvicorn:', uvicorn.__version__)" || echo "❌ Uvicorn not installed"

# Test app import
echo "🔍 Testing FastAPI app import..."
python -c "
try:
    from app.main import app
    print('✅ FastAPI app imported successfully')
    print('App title:', app.title)
    print('App version:', app.version if hasattr(app, 'version') else 'Not set')
except ImportError as e:
    print('❌ Import error:', e)
    exit(1)
except Exception as e:
    print('❌ App creation error:', e)
    exit(1)
"

if [ $? -eq 0 ]; then
    echo "🎉 FastAPI backend setup is valid!"
else
    echo "❌ FastAPI backend setup has issues"
    exit 1
fi