#!/usr/bin/env python3
"""
Railway startup script for Histora backend
This script handles dependency installation and application startup for Railway deployment.
"""

import os
import sys
import subprocess
import pathlib

def run_command(cmd, shell=False):
    """Run a command and return the result."""
    print(f"🔧 Running: {cmd}")
    try:
        if shell:
            result = subprocess.run(cmd, shell=True, check=True, text=True, capture_output=True)
        else:
            result = subprocess.run(cmd.split(), check=True, text=True, capture_output=True)
        print(f"✅ Command succeeded: {cmd}")
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Command failed: {cmd}")
        print(f"Error: {e}")
        if e.stderr:
            print(e.stderr)
        return False

def main():
    """Main entry point."""
    print("🚀 Starting Histora backend on Railway...")
    
    # Get the project root directory
    project_root = pathlib.Path(__file__).parent.parent
    backend_dir = project_root / "backend"
    
    # Change to project root
    os.chdir(project_root)
    print(f"📂 Working directory: {os.getcwd()}")
    
    # Install dependencies using the most available method
    print("🔧 Installing Python dependencies...")
    
    # Try different pip commands
    pip_commands = [
        [sys.executable, "-m", "pip", "install", "-r", "requirements.txt"],
        ["pip3", "install", "-r", "requirements.txt"],
        ["pip", "install", "-r", "requirements.txt"]
    ]
    
    installed = False
    for cmd in pip_commands:
        try:
            print(f"🔧 Trying pip command: {' '.join(cmd)}")
            result = subprocess.run(cmd, check=True, text=True, capture_output=True)
            print("✅ Dependencies installed successfully")
            installed = True
            break
        except subprocess.CalledProcessError as e:
            print(f"⚠️  Pip command failed: {' '.join(cmd)}")
            continue
        except FileNotFoundError:
            print(f"⚠️  Command not found: {' '.join(cmd)}")
            continue
    
    if not installed:
        print("❌ Failed to install dependencies with any method")
        sys.exit(1)
    
    # Run database initialization
    print("🔧 Initializing database...")
    try:
        init_result = subprocess.run([sys.executable, "backend/railway_init.py"], 
                                   check=True, text=True, capture_output=True)
        print("✅ Database initialized successfully")
        if init_result.stdout:
            print(init_result.stdout)
    except subprocess.CalledProcessError as e:
        print("❌ Failed to initialize database")
        if e.stderr:
            print(e.stderr)
        sys.exit(1)
    
    # Start the application
    print("🚀 Starting FastAPI application...")
    os.chdir(backend_dir)
    print(f"📂 Working directory: {os.getcwd()}")
    
    # Use uvicorn as a module
    uvicorn_cmd = [
        sys.executable, "-m", "uvicorn", 
        "app.main:app",
        "--host", "0.0.0.0",
        "--port", str(os.environ.get("PORT", 8000)),
        "--workers", "4"
    ]
    
    print(f"🔧 Starting with command: {' '.join(uvicorn_cmd)}")
    os.execv(sys.executable, uvicorn_cmd)

if __name__ == "__main__":
    main()