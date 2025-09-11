#!/bin/bash

# Get port from environment variable, default to 8000
PORT=${PORT:-8000}

# Start uvicorn with proper port
exec uvicorn main:app --host 0.0.0.0 --port "$PORT"
