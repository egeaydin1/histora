#!/bin/bash

# Railway Setup Script for Histora
# This script helps set up the environment for Railway deployment

echo "🚀 Setting up Histora for Railway deployment..."

# Check if we're in Railway environment
if [ -z "$RAILWAY_PROJECT_ID" ]; then
    echo "⚠️  Not running in Railway environment. This script is intended for Railway deployment."
    echo "💡 For local development, use ./start.sh instead."
    exit 1
fi

echo "🔧 Railway environment detected"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p backend/logs
mkdir -p backend/uploads
mkdir -p backend/temp

# Set up database if DATABASE_URL is provided
if [ -n "$DATABASE_URL" ]; then
    echo "📊 Database URL detected: $DATABASE_URL"
    echo "💡 You'll need to run database migrations after deployment:"
    echo "   railway run python backend/create_tables.py"
fi

# Check for required environment variables
echo "🔍 Checking required environment variables..."

REQUIRED_VARS=(
    "DATABASE_URL"
    "FIREBASE_PROJECT_ID"
    "FIREBASE_PRIVATE_KEY"
    "FIREBASE_CLIENT_EMAIL"
    "OPENROUTER_API_KEY"
    "OPENAI_API_KEY"
    "JWT_SECRET_KEY"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo "❌ Missing required environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo "💡 Please set these variables in your Railway project settings."
else
    echo "✅ All required environment variables are set"
fi

echo "🎉 Setup complete!"
echo "💡 Next steps:"
echo "   1. Deploy your application to Railway"
echo "   2. After deployment, run database migrations:"
echo "      railway run python backend/create_tables.py"
echo "   3. Optionally create an admin user:"
echo "      railway run python backend/create_admin.py"