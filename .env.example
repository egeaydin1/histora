# =============================================================================
# HISTORA - ENVIRONMENT CONFIGURATION EXAMPLE
# =============================================================================
# Copy this file to .env and update the values as needed
# See ENVIRONMENT_SETUP_ROADMAP.md for detailed setup guide

# =============================================================================
# 🚀 APPLICATION SETTINGS  
# =============================================================================
APP_NAME=Histora
APP_VERSION=1.0.0
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=info

# =============================================================================
# 🔗 API SETTINGS
# =============================================================================
BACKEND_URL=http://localhost:8000
BACKEND_PORT=8000
FRONTEND_URL=http://localhost:3000
FRONTEND_PORT=3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# =============================================================================
# 🤖 AI MODEL SETTINGS (Optional for basic functionality)
# =============================================================================
# Get from: https://openrouter.ai/
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

DEFAULT_AI_MODEL=meta-llama/llama-3.1-8b-instruct:free
BACKUP_AI_MODEL=meta-llama/llama-3.1-70b-instruct:free

AI_MAX_TOKENS=2048
AI_TEMPERATURE=0.7
AI_TOP_P=0.9

# =============================================================================
# 🧠 EMBEDDING SETTINGS (Optional for enhanced search)
# =============================================================================
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536

# =============================================================================
# 🗃️ DATABASE SETTINGS (Ready for development)
# =============================================================================
DATABASE_URL=postgresql://histora:histora123@localhost:5433/histora
DB_HOST=localhost
DB_PORT=5433
DB_NAME=histora
DB_USER=histora
DB_PASSWORD=histora123
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20

# =============================================================================
# 🔍 VECTOR DATABASE (Ready for development)
# =============================================================================
CHROMA_HOST=localhost
CHROMA_PORT=8001
CHROMA_COLLECTION_NAME=character_embeddings
CHROMA_PERSIST_DIRECTORY=./chroma_db

# =============================================================================
# 🔐 AUTHENTICATION (Demo mode - works for development)
# =============================================================================
# Firebase Admin SDK (for production, get from Firebase Console)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token

# Firebase Web Config (Frontend - demo values work for development)
NEXT_PUBLIC_FIREBASE_API_KEY=demo_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=histora-demo.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=histora-demo
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=histora-demo.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Frontend API Configuration (Ready to use)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_VERSION=v1

# Frontend UI Configuration (Ready to use)
NEXT_PUBLIC_APP_NAME="Histora"
NEXT_PUBLIC_APP_DESCRIPTION="AI Historical Figures Chat Platform"
NEXT_PUBLIC_THEME_COLOR=#3B82F6
NEXT_PUBLIC_BRAND_COLOR=#1E40AF
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_DEBUG=true
NEXT_PUBLIC_DEFAULT_LANGUAGE=tr
NEXT_PUBLIC_SUPPORTED_LANGUAGES=tr,en

# =============================================================================
# 🔒 SECURITY SETTINGS
# =============================================================================
JWT_SECRET_KEY=histora-super-secret-jwt-key-for-development-2025
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440

ADMIN_API_KEY=your_admin_api_key_here

# =============================================================================
# 📁 FILE UPLOAD SETTINGS
# =============================================================================
MAX_FILE_SIZE_MB=50
ALLOWED_FILE_TYPES=.txt,.md,.pdf,.docx
UPLOAD_DIRECTORY=./uploads
TEMP_DIRECTORY=./temp

# =============================================================================
# 🌐 INTERNATIONALIZATION
# =============================================================================
DEFAULT_LANGUAGE=tr
SUPPORTED_LANGUAGES=tr,en
TRANSLATION_CACHE=true

# =============================================================================
# 📊 MONITORING & LOGGING (Optional)
# =============================================================================
LOG_FILE_PATH=./logs/histora.log
LOG_MAX_SIZE_MB=100
LOG_BACKUP_COUNT=5

# Optional: Get from respective services
GOOGLE_ANALYTICS_ID=your_ga_id_here
SENTRY_DSN=your_sentry_dsn_here

# =============================================================================
# 🚀 DEPLOYMENT SETTINGS (Optional)
# =============================================================================
RAILWAY_PROJECT_ID=your_railway_project_id
RAILWAY_SERVICE_ID=your_railway_service_id

VERCEL_PROJECT_ID=your_vercel_project_id
VERCEL_TEAM_ID=your_vercel_team_id

# =============================================================================
# 🔧 DEVELOPMENT SETTINGS
# =============================================================================
DEV_SEED_DATABASE=true
DEV_AUTO_RELOAD=true
DEV_SHOW_DOCS=true
DEV_CORS_ALLOW_ALL=true

TEST_DATABASE_URL=postgresql://histora:histora123@localhost:5433/histora_test
RUN_MIGRATIONS_ON_START=true