#!/bin/bash

echo "🚀 Deploying Histora to Railway..."

# Install Railway CLI if not installed
if ! command -v railway &> /dev/null; then
    echo "Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Login to Railway
echo "Logging into Railway..."
railway login

# Initialize project if needed
if [ ! -f ".railway/project.json" ]; then
    echo "Initializing Railway project..."
    railway init
fi

# Deploy the application
echo "📦 Deploying application..."
railway up

echo "✅ Deployment completed!"
echo "Check your services at: https://railway.app/dashboard"
