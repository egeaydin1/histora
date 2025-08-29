FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy and install requirements
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

WORKDIR /app/backend

# Set environment variables
ENV PYTHONPATH=/app/backend:/app/backend/app
ENV PORT=8000

# Expose port
EXPOSE 8000

# Start command
CMD ["python3", "main.py"]