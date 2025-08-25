#!/bin/bash

# Histora Development Environment Restart Script
# This script restarts all development services

set -e  # Exit on any error

echo "🔄 Restarting Histora Development Environment..."
echo "==============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

echo -e "${BLUE}📍 Working directory: $SCRIPT_DIR${NC}"

# Function to check if script exists and is executable
check_script() {
    local script_path="$1"
    local script_name="$2"
    
    if [ ! -f "$script_path" ]; then
        echo -e "${RED}❌ $script_name not found at $script_path${NC}"
        return 1
    fi
    
    if [ ! -x "$script_path" ]; then
        echo "Making $script_name executable..."
        chmod +x "$script_path"
    fi
    
    return 0
}

# Step 1: Check if stop and start scripts exist
echo -e "${BLUE}🔍 Checking required scripts...${NC}"

STOP_SCRIPT="$SCRIPT_DIR/stop.sh"
START_SCRIPT="$SCRIPT_DIR/start.sh"

if ! check_script "$STOP_SCRIPT" "stop.sh"; then
    echo -e "${RED}❌ Cannot restart without stop.sh script${NC}"
    exit 1
fi

if ! check_script "$START_SCRIPT" "start.sh"; then
    echo -e "${RED}❌ Cannot restart without start.sh script${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All required scripts found${NC}"

# Step 2: Parse command line options
SKIP_STOP=false
SKIP_DOCKER_RESTART=false
QUICK_RESTART=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-stop)
            SKIP_STOP=true
            shift
            ;;
        --skip-docker)
            SKIP_DOCKER_RESTART=true
            shift
            ;;
        --quick)
            QUICK_RESTART=true
            shift
            ;;
        --help|-h)
            echo "Histora Restart Script"
            echo ""
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --skip-stop     Skip the stop phase (only start services)"
            echo "  --skip-docker   Don't restart Docker services (faster restart)"
            echo "  --quick         Quick restart (skip Docker + minimal checks)"
            echo "  --help, -h      Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                    # Full restart (stop + start all)"
            echo "  $0 --quick           # Quick restart (backend + frontend only)"
            echo "  $0 --skip-docker     # Restart without touching Docker"
            exit 0
            ;;
        *)
            echo -e "${YELLOW}⚠️  Unknown option: $1${NC}"
            echo "Use --help for usage information"
            shift
            ;;
    esac
done

# Step 3: Show restart plan
echo -e "\n${BLUE}📋 Restart Plan:${NC}"
if [ "$SKIP_STOP" = true ]; then
    echo "• Skip stop phase: YES"
else
    echo "• Stop services: YES"
fi

if [ "$SKIP_DOCKER_RESTART" = true ] || [ "$QUICK_RESTART" = true ]; then
    echo "• Restart Docker: NO"
else
    echo "• Restart Docker: YES"
fi

if [ "$QUICK_RESTART" = true ]; then
    echo "• Quick restart: YES (backend + frontend only)"
    SKIP_DOCKER_RESTART=true
fi

echo ""

# Confirmation for full restart
if [ "$SKIP_STOP" = false ] && [ "$SKIP_DOCKER_RESTART" = false ]; then
    read -p "This will stop and restart all services. Continue? [Y/n]: " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        echo "Restart cancelled"
        exit 0
    fi
fi

# Step 4: Stop services (if not skipped)
if [ "$SKIP_STOP" = false ]; then
    echo -e "\n${BLUE}🛑 Step 1: Stopping services...${NC}"
    
    if [ "$SKIP_DOCKER_RESTART" = true ]; then
        # Custom stop without Docker
        echo "Stopping application services only..."
        
        # Stop frontend
        if [ -f "frontend.pid" ]; then
            local pid=$(cat "frontend.pid")
            if kill -0 "$pid" 2>/dev/null; then
                echo "Stopping frontend..."
                kill "$pid"
            fi
            rm -f "frontend.pid"
        fi
        
        # Stop backend
        if [ -f "backend.pid" ]; then
            local pid=$(cat "backend.pid")
            if kill -0 "$pid" 2>/dev/null; then
                echo "Stopping backend..."
                kill "$pid"
            fi
            rm -f "backend.pid"
        fi
        
        # Kill any remaining processes
        pkill -f "next.*dev" || true
        pkill -f "uvicorn.*app.main:app" || true
        
        sleep 2
    else
        # Full stop using stop.sh
        "$STOP_SCRIPT"
    fi
    
    echo -e "${GREEN}✅ Stop phase completed${NC}"
else
    echo -e "${YELLOW}⏭️  Skipping stop phase${NC}"
fi

# Step 5: Wait a moment for clean shutdown
echo -e "\n${BLUE}⏱️  Waiting for clean shutdown...${NC}"
sleep 3

# Step 6: Start services
echo -e "\n${BLUE}🚀 Step 2: Starting services...${NC}"

if [ "$SKIP_DOCKER_RESTART" = true ]; then
    # Start only application services
    echo "Starting application services..."
    
    # Ensure we're in the right directory
    cd "$SCRIPT_DIR"
    
    # Start backend
    echo "Starting FastAPI backend..."
    cd backend
    if [ ! -d "venv" ]; then
        echo "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    source venv/bin/activate
    pip install -q -r requirements.txt
    
    nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > ../backend.log 2>&1 &
    echo $! > ../backend.pid
    cd ..
    
    # Wait for backend
    echo "Waiting for backend to be ready..."
    for i in {1..15}; do
        if curl -s http://localhost:8000/health >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend is ready${NC}"
            break
        fi
        sleep 2
    done
    
    # Start frontend
    echo "Starting Next.js frontend..."
    cd frontend
    npm install --silent
    nohup npm run dev > ../frontend.log 2>&1 &
    echo $! > ../frontend.pid
    cd ..
    
    # Wait for frontend
    echo "Waiting for frontend to be ready..."
    for i in {1..15}; do
        if curl -s http://localhost:3000 >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Frontend is ready${NC}"
            break
        fi
        sleep 2
    done
    
else
    # Full start using start.sh
    "$START_SCRIPT"
fi

# Step 7: Final status
echo -e "\n${GREEN}🎉 Histora Restart Completed Successfully!${NC}"
echo "=============================================="

echo -e "${BLUE}🌐 Service URLs:${NC}"
echo "• Frontend:  http://localhost:3000"
echo "• Backend:   http://localhost:8000"
echo "• API Docs:  http://localhost:8000/docs"

if [ "$SKIP_DOCKER_RESTART" = false ]; then
    echo "• PostgreSQL: localhost:5433"
    echo "• ChromaDB:   http://localhost:8001"
fi

echo ""
echo -e "${BLUE}📋 Quick Commands:${NC}"
echo "• View backend logs:  tail -f backend.log"
echo "• View frontend logs: tail -f frontend.log"
echo "• Stop all services:  ./stop.sh"
echo "• Quick restart:      ./restart.sh --quick"

echo -e "\n${GREEN}🚀 Happy coding!${NC}"