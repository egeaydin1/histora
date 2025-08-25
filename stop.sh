#!/bin/bash

# Histora Development Environment Stop Script
# This script stops all running development services

set -e  # Exit on any error

echo "🛑 Stopping Histora Development Environment..."
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to kill process by PID file
kill_by_pidfile() {
    local pidfile=$1
    local service_name=$2
    
    if [ -f "$pidfile" ]; then
        local pid=$(cat "$pidfile")
        if kill -0 "$pid" 2>/dev/null; then
            echo "Stopping $service_name (PID: $pid)..."
            kill "$pid"
            sleep 2
            
            # Force kill if still running
            if kill -0 "$pid" 2>/dev/null; then
                echo "Force stopping $service_name..."
                kill -9 "$pid"
            fi
            
            echo -e "${GREEN}✅ $service_name stopped${NC}"
        else
            echo -e "${YELLOW}⚠️  $service_name PID file exists but process not running${NC}"
        fi
        rm -f "$pidfile"
    else
        echo -e "${YELLOW}⚠️  No PID file found for $service_name${NC}"
    fi
}

# Function to kill process by pattern
kill_by_pattern() {
    local pattern=$1
    local service_name=$2
    
    local pids=$(pgrep -f "$pattern" || true)
    if [ ! -z "$pids" ]; then
        echo "Stopping $service_name processes..."
        echo "$pids" | xargs kill
        sleep 2
        
        # Force kill if still running
        local remaining_pids=$(pgrep -f "$pattern" || true)
        if [ ! -z "$remaining_pids" ]; then
            echo "Force stopping $service_name processes..."
            echo "$remaining_pids" | xargs kill -9
        fi
        
        echo -e "${GREEN}✅ $service_name stopped${NC}"
    else
        echo -e "${YELLOW}⚠️  No running $service_name processes found${NC}"
    fi
}

echo -e "${BLUE}🔍 Checking running services...${NC}"

# Step 1: Stop Next.js Frontend
echo -e "\n${BLUE}⚛️  Stopping Next.js frontend...${NC}"
kill_by_pidfile "frontend.pid" "Next.js Frontend"

# Also kill any remaining Next.js processes
kill_by_pattern "next.*dev" "Next.js"

# Step 2: Stop FastAPI Backend
echo -e "\n${BLUE}⚡ Stopping FastAPI backend...${NC}"
kill_by_pidfile "backend.pid" "FastAPI Backend"

# Also kill any remaining FastAPI processes
kill_by_pattern "uvicorn.*app.main:app" "FastAPI"

# Step 3: Stop Docker services
echo -e "\n${BLUE}🐳 Stopping Docker services...${NC}"

if command -v docker-compose >/dev/null 2>&1; then
    if docker-compose ps -q 2>/dev/null | grep -q .; then
        echo "Stopping Docker Compose services..."
        docker-compose stop
        echo -e "${GREEN}✅ Docker services stopped${NC}"
    else
        echo -e "${YELLOW}⚠️  No Docker Compose services running${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Docker Compose not available${NC}"
fi

# Step 4: Clean up log files (optional)
echo -e "\n${BLUE}🧹 Cleaning up...${NC}"

# Option to remove log files
read -p "Do you want to remove log files? [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Removing log files..."
    rm -f backend.log frontend.log
    echo -e "${GREEN}✅ Log files removed${NC}"
else
    echo "Log files preserved"
fi

# Step 5: Show final status
echo -e "\n${BLUE}📊 Final Status Check:${NC}"

# Check if any processes are still running
remaining_backend=$(pgrep -f "uvicorn.*app.main:app" || true)
remaining_frontend=$(pgrep -f "next.*dev" || true)
remaining_docker=$(docker-compose ps -q 2>/dev/null || true)

if [ -z "$remaining_backend" ] && [ -z "$remaining_frontend" ] && [ -z "$remaining_docker" ]; then
    echo -e "${GREEN}✅ All Histora services stopped successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Some processes may still be running:${NC}"
    [ ! -z "$remaining_backend" ] && echo "  - Backend processes: $remaining_backend"
    [ ! -z "$remaining_frontend" ] && echo "  - Frontend processes: $remaining_frontend"
    [ ! -z "$remaining_docker" ] && echo "  - Docker services: $remaining_docker"
fi

echo ""
echo -e "${BLUE}📋 Available Commands:${NC}"
echo "• Start services:   ./start.sh"
echo "• Restart services: ./restart.sh"
echo "• View logs:        tail -f backend.log frontend.log"

echo -e "\n${GREEN}🏁 Histora Development Environment Stopped${NC}"