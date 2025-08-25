#!/bin/bash

# Histora Development Environment Startup Script
# This script starts all required services for local development

set -e  # Exit on any error

echo "🚀 Starting Histora Development Environment..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
port_in_use() {
    lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    echo "Waiting for $service_name to be ready at $url..."
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f $url >/dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name is ready!${NC}"
            return 0
        fi
        
        # For FastAPI, show more detailed error info
        if [[ "$service_name" == *"FastAPI"* ]]; then
            echo "Attempt $attempt/$max_attempts - $service_name not ready yet..."
            # Check if the process is still running
            if [ -f "backend.pid" ]; then
                local pid=$(cat backend.pid 2>/dev/null || echo "")
                if [ -n "$pid" ] && ! kill -0 $pid 2>/dev/null; then
                    echo -e "${RED}❌ FastAPI process (PID: $pid) has died. Check backend.log:${NC}"
                    echo "Last 10 lines of backend.log:"
                    tail -10 backend.log 2>/dev/null || echo "No backend.log found"
                    return 1
                fi
            fi
            
            # Show curl error details for debugging
            local curl_output=$(curl -s $url 2>&1 || echo "Connection failed")
            echo "  Debug: $curl_output"
        else
            echo "Attempt $attempt/$max_attempts - $service_name not ready yet..."
        fi
        
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ $service_name failed to start within expected time${NC}"
    
    # For FastAPI failures, show additional debug info
    if [[ "$service_name" == *"FastAPI"* ]]; then
        echo -e "${RED}Debug information:${NC}"
        echo "Backend log (last 20 lines):"
        tail -20 backend.log 2>/dev/null || echo "No backend.log found"
        echo "\nProcess status:"
        if [ -f "backend.pid" ]; then
            local pid=$(cat backend.pid 2>/dev/null || echo "")
            if [ -n "$pid" ]; then
                if kill -0 $pid 2>/dev/null; then
                    echo "Process $pid is still running"
                else
                    echo "Process $pid has exited"
                fi
            fi
        fi
        echo "\nPort status:"
        lsof -i :8000 2>/dev/null || echo "No process listening on port 8000"
    fi
    
    return 1
}

# Function to wait for PostgreSQL specifically
wait_for_postgres() {
    local host=$1
    local port=$2
    local database=$3
    local username=$4
    local max_attempts=30
    local attempt=1
    
    echo "Waiting for PostgreSQL to be ready..."
    while [ $attempt -le $max_attempts ]; do
        if command_exists pg_isready; then
            # Use pg_isready if available
            if pg_isready -h $host -p $port -U $username -d $database >/dev/null 2>&1; then
                echo -e "${GREEN}✅ PostgreSQL is ready!${NC}"
                return 0
            fi
        else
            # Fallback to docker exec health check
            if docker exec histora-postgres pg_isready -U $username -d $database >/dev/null 2>&1; then
                echo -e "${GREEN}✅ PostgreSQL is ready!${NC}"
                return 0
            fi
        fi
        echo "Attempt $attempt/$max_attempts - PostgreSQL not ready yet..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ PostgreSQL failed to start within expected time${NC}"
    return 1
}

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

if ! command_exists docker; then
    echo -e "${RED}❌ Docker is not installed or not in PATH${NC}"
    exit 1
fi

if ! command_exists docker-compose; then
    echo -e "${RED}❌ Docker Compose is not installed or not in PATH${NC}"
    exit 1
fi

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed or not in PATH${NC}"
    exit 1
fi

if ! command_exists python3; then
    echo -e "${RED}❌ Python 3 is not installed or not in PATH${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites are available${NC}"

# Step 0: Setup environment files from consolidated .env
echo -e "\n${BLUE}⚙️  Setting up environment configuration...${NC}"

# Copy environment variables to backend and frontend
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Root .env file not found. Please create one from .env.example${NC}"
    exit 1
fi

# Copy environment to backend
cp .env backend/.env
echo "✅ Environment copied to backend"

# Extract frontend environment variables to frontend/.env.local
echo "# Frontend Environment Variables (Auto-generated from root .env)" > frontend/.env.local
grep "^NEXT_PUBLIC_" .env >> frontend/.env.local
echo "✅ Frontend environment variables extracted"

# Step 1: Start Docker services (PostgreSQL + ChromaDB)
echo -e "\n${BLUE}🐳 Starting Docker services (PostgreSQL + ChromaDB)...${NC}"

if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker daemon is not running. Please start Docker Desktop.${NC}"
    exit 1
fi

# Start Docker services
docker-compose up -d

echo "Waiting for databases to be ready..."
sleep 5

# Wait for PostgreSQL
wait_for_postgres "localhost" "5433" "histora" "histora"

# Step 2: Setup Python virtual environment and install dependencies
echo -e "\n${BLUE}🐍 Setting up Python backend...${NC}"

cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to create Python virtual environment${NC}"
        exit 1
    fi
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to activate virtual environment${NC}"
    exit 1
fi

# Verify Python and pip
echo "Python version: $(python --version)"
echo "Pip version: $(pip --version)"

# Install/update dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
if [ ! -f "requirements.txt" ]; then
    echo -e "${RED}❌ requirements.txt not found in backend directory${NC}"
    exit 1
fi

pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install Python dependencies${NC}"
    echo "Check requirements.txt and ensure all packages are compatible"
    exit 1
fi

# Run database migrations if needed
echo "Running database migrations..."
if [ -f "alembic.ini" ]; then
    alembic upgrade head
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}⚠️ Database migration failed, continuing anyway...${NC}"
    fi
else
    echo "No Alembic configuration found, skipping migrations"
fi

# Step 3: Start FastAPI backend
echo -e "\n${BLUE}⚡ Starting FastAPI backend...${NC}"

# More aggressive cleanup of existing processes
if port_in_use 8000; then
    echo -e "${YELLOW}⚠️  Port 8000 is already in use. Cleaning up existing processes...${NC}"
    # Kill all uvicorn processes
    pkill -f "uvicorn" || true
    # Kill by port (more aggressive)
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    sleep 3
    
    # Verify port is free
    if port_in_use 8000; then
        echo -e "${RED}❌ Failed to free port 8000. Please manually kill processes using this port.${NC}"
        echo "Run: lsof -ti:8000 | xargs kill -9"
        exit 1
    fi
    echo -e "${GREEN}✅ Port 8000 is now free${NC}"
fi

# Ensure we're in the backend directory
echo "Starting FastAPI from backend directory..."
echo "Working directory: $(pwd)"
echo "Python path: $(which python)"
echo "Uvicorn path: $(which uvicorn)"

# Check if app.main:app exists
if [ ! -f "app/main.py" ]; then
    echo -e "${RED}❌ app/main.py not found in backend directory${NC}"
    exit 1
fi

# Test if the FastAPI app can be imported
echo "Testing FastAPI app import..."
(
    source venv/bin/activate
    export PYTHONPATH="$(pwd):$PYTHONPATH"
    python -c "from app.main import app; print('✅ FastAPI app imported successfully')"
) 2>&1 | tee -a ../backend.log

if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo -e "${RED}❌ Failed to import FastAPI app. Check dependencies and configuration.${NC}"
    echo "Error details in backend.log:"
    tail -10 ../backend.log
    exit 1
fi

# Start backend with better error handling
echo "Starting uvicorn server..."
(
    source venv/bin/activate
    export PYTHONPATH="$(pwd):$PYTHONPATH"
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --log-level info
) > ../backend.log 2>&1 &

BACKEND_PID=$!
echo $BACKEND_PID > ../backend.pid

echo "FastAPI started with PID: $BACKEND_PID"
echo "Checking if process is still running..."
sleep 2

# Check if the process is still running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}❌ FastAPI process died immediately. Check backend.log for errors:${NC}"
    tail -20 ../backend.log
    exit 1
fi

# Wait for backend to be ready
cd ..
echo "Waiting for FastAPI health check..."
wait_for_service "http://localhost:8000/health" "FastAPI Backend"

# Step 4: Setup and start Next.js frontend
echo -e "\n${BLUE}⚛️  Setting up Next.js frontend...${NC}"

cd frontend

# Install dependencies
echo "Installing Node.js dependencies..."
npm install

# Check if frontend port is already in use
if port_in_use 3000; then
    echo -e "${YELLOW}⚠️  Port 3000 is already in use. Stopping existing process...${NC}"
    pkill -f "next.*dev" || true
    sleep 2
fi

# Start frontend in background
echo -e "\n${BLUE}🌐 Starting Next.js frontend...${NC}"
nohup npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../frontend.pid

cd ..

# Wait for frontend to be ready
wait_for_service "http://localhost:3000" "Next.js Frontend"

# Step 5: Show status
echo -e "\n${GREEN}🎉 Histora Development Environment Started Successfully!${NC}"
echo "================================================"
echo -e "${GREEN}✅ PostgreSQL:${NC}     http://localhost:5433"
echo -e "${GREEN}✅ Backend API:${NC}    http://localhost:8000"
echo -e "${GREEN}✅ Frontend App:${NC}   http://localhost:3000"
echo ""
echo -e "${BLUE}📊 Service Status:${NC}"
echo "Backend PID: $(cat backend.pid 2>/dev/null || echo 'Not found')"
echo "Frontend PID: $(cat frontend.pid 2>/dev/null || echo 'Not found')"
echo ""
echo -e "${BLUE}📋 Useful Commands:${NC}"
echo "• View backend logs:  tail -f backend.log"
echo "• View frontend logs: tail -f frontend.log"
echo "• Stop services:      ./stop.sh"
echo "• Restart services:   ./restart.sh"
echo ""
echo -e "${BLUE}🌍 Access Points:${NC}"
echo "• Main Application:   http://localhost:3000"
echo "• API Documentation:  http://localhost:8000/docs"
echo "• Health Check:       http://localhost:8000/health"

echo -e "\n${GREEN}🚀 Happy coding!${NC}"