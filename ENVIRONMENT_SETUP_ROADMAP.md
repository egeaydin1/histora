# 🚀 Histora Environment Setup Roadmap

This guide will help you set up all the necessary environment variables for the Histora project step by step.

## 📋 Overview

The Histora project now uses a **single consolidated `.env` file** in the root directory that contains all environment variables for both backend and frontend. The `start.sh` script automatically copies the relevant variables to where they're needed.

## 🏗️ Environment Structure

```
histora/
├── .env                    # 📍 MAIN CONFIG - All environment variables
├── backend/.env           # 🔄 Auto-copied from root .env
└── frontend/.env.local    # 🔄 Auto-generated from NEXT_PUBLIC_ variables
```

## 🎯 Quick Start (Development Mode)

The project is **ready to run in development mode** with the current configuration! You can start immediately:

```bash
./start.sh
```

The following services will work out of the box:
- ✅ PostgreSQL Database (Docker)
- ✅ ChromaDB Vector Database (Docker)  
- ✅ FastAPI Backend (Python)
- ✅ Next.js Frontend (Node.js)

## 📊 Environment Variables Status

### 🟢 Ready to Use (No Action Required)
These are already configured for development:

| Category | Variable | Status | Current Value |
|----------|----------|---------|---------------|
| **Database** | `DATABASE_URL` | ✅ Ready | `postgresql://histora:histora123@localhost:5433/histora` |
| **Vector DB** | `CHROMA_HOST/PORT` | ✅ Ready | `localhost:8001` |
| **API URLs** | `BACKEND_URL/FRONTEND_URL` | ✅ Ready | Development URLs |
| **Firebase** | `NEXT_PUBLIC_FIREBASE_*` | ✅ Ready | Demo mode |

### 🟡 Optional for Basic Functionality
These can be set up later for enhanced features:

| Category | Variable | Priority | Impact |
|----------|----------|----------|---------|
| **AI Models** | `OPENROUTER_API_KEY` | Medium | Chat functionality |
| **Embeddings** | `OPENAI_API_KEY` | Medium | Better search results |
| **Authentication** | `FIREBASE_*` | Low | Real user auth |
| **Monitoring** | `SENTRY_DSN` | Low | Error tracking |

### 🔴 Required for Production
These must be configured before deploying:

| Category | Variable | Requirement | Security Level |
|----------|----------|-------------|----------------|
| **Security** | `JWT_SECRET_KEY` | Production | 🔴 High |
| **Database** | `DATABASE_URL` | Production | 🔴 High |
| **Firebase** | All Firebase configs | Production | 🔴 High |

## 🛠️ Step-by-Step Setup Guide

### Phase 1: Core Development Setup ⚡ (5 minutes)

**Goal**: Get the application running locally

1. **Database is already configured** ✅
2. **Run the application**:
   ```bash
   ./start.sh
   ```
3. **Verify everything works**:
   - Backend: http://localhost:8000/health
   - Frontend: http://localhost:3000
   - API Docs: http://localhost:8000/docs

**Result**: Full application running with demo data!

### Phase 2: AI Integration 🤖 (15 minutes)

**Goal**: Enable AI chat functionality

1. **Get OpenRouter API Key** (for chat models):
   - Visit: https://openrouter.ai/
   - Sign up and get API key
   - Update in `.env`:
     ```env
     OPENROUTER_API_KEY=sk-or-v1-xxxxx
     ```

2. **Get OpenAI API Key** (for embeddings):
   - Visit: https://platform.openai.com/api-keys
   - Create new API key
   - Update in `.env`:
     ```env
     OPENAI_API_KEY=sk-proj-xxxxx
     ```

3. **Test AI functionality**:
   ```bash
   ./restart.sh
   ```

**Result**: Full AI chat and search capabilities!

### Phase 3: Authentication Setup 🔐 (30 minutes)

**Goal**: Enable real user authentication

1. **Create Firebase Project**:
   - Visit: https://console.firebase.google.com/
   - Create new project: "histora-production"
   - Enable Authentication > Email/Password

2. **Get Firebase Web Config**:
   - Project Settings > General > Your apps
   - Add web app, copy config values
   - Update in `.env`:
     ```env
     NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyxxxxx
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
     ```

3. **Setup Firebase Admin SDK**:
   - Project Settings > Service Accounts
   - Generate new private key
   - Update in `.env`:
     ```env
     FIREBASE_PROJECT_ID=your-project-id
     FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nxxxxx\n-----END PRIVATE KEY-----"
     FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
     ```

4. **Generate secure JWT secret**:
   ```bash
   openssl rand -base64 32
   ```
   Update in `.env`:
   ```env
   JWT_SECRET_KEY=your-generated-secret-key
   ```

**Result**: Real user registration and authentication!

### Phase 4: Production Deployment 🚀 (45 minutes)

**Goal**: Deploy to production environment

1. **Setup Production Database**:
   - Use managed PostgreSQL (Railway, Supabase, etc.)
   - Update `DATABASE_URL` with production credentials

2. **Setup Production ChromaDB**:
   - Deploy ChromaDB instance or use hosted solution
   - Update `CHROMA_HOST` and `CHROMA_PORT`

3. **Configure Security**:
   ```env
   ENVIRONMENT=production
   DEBUG=false
   ALLOWED_ORIGINS=https://your-domain.com
   ```

4. **Setup Monitoring** (Optional):
   ```env
   SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
   GOOGLE_ANALYTICS_ID=G-xxxxxxxxxx
   ```

**Result**: Production-ready deployment!

## 🔧 Environment Variable Reference

### 🚀 Application Settings
```env
APP_NAME=Histora
APP_VERSION=1.0.0
ENVIRONMENT=development          # development | staging | production
DEBUG=true                      # true | false
LOG_LEVEL=info                  # debug | info | warning | error
```

### 🔗 API Settings  
```env
BACKEND_URL=http://localhost:8000
BACKEND_PORT=8000
FRONTEND_URL=http://localhost:3000
FRONTEND_PORT=3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### 🤖 AI Model Settings
```env
# OpenRouter (Required for AI chat)
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Model Selection
DEFAULT_AI_MODEL=meta-llama/llama-3.1-8b-instruct:free
BACKUP_AI_MODEL=meta-llama/llama-3.1-70b-instruct:free

# Model Parameters
AI_MAX_TOKENS=2048
AI_TEMPERATURE=0.7
AI_TOP_P=0.9
```

### 🧠 Embedding Settings
```env
# OpenAI (Required for search functionality)
OPENAI_API_KEY=sk-proj-xxxxx
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536
```

### 🗃️ Database Settings
```env
# PostgreSQL (Already configured for development)
DATABASE_URL=postgresql://histora:histora123@localhost:5433/histora
DB_HOST=localhost
DB_PORT=5433
DB_NAME=histora
DB_USER=histora
DB_PASSWORD=histora123
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20
```

### 🔍 Vector Database (ChromaDB)
```env
# Already configured for development
CHROMA_HOST=localhost
CHROMA_PORT=8001
CHROMA_COLLECTION_NAME=character_embeddings
CHROMA_PERSIST_DIRECTORY=./chroma_db
```

### 🔐 Authentication (Firebase)
```env
# Firebase Admin SDK (Backend)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token

# Firebase Web Config (Frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 🔒 Security Settings
```env
# JWT Configuration
JWT_SECRET_KEY=your_super_secret_jwt_key_here_min_32_chars
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440

# Admin API Key
ADMIN_API_KEY=your_admin_api_key_here
```

### 📁 File Upload Settings
```env
MAX_FILE_SIZE_MB=50
ALLOWED_FILE_TYPES=.txt,.md,.pdf,.docx
UPLOAD_DIRECTORY=./uploads
TEMP_DIRECTORY=./temp
```

### 🌐 Frontend Configuration
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_VERSION=v1

# UI Configuration  
NEXT_PUBLIC_APP_NAME="Histora"
NEXT_PUBLIC_APP_DESCRIPTION="AI Historical Figures Chat Platform"
NEXT_PUBLIC_THEME_COLOR=#3B82F6
NEXT_PUBLIC_BRAND_COLOR=#1E40AF
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_DEBUG=true

# Internationalization
NEXT_PUBLIC_DEFAULT_LANGUAGE=tr
NEXT_PUBLIC_SUPPORTED_LANGUAGES=tr,en
DEFAULT_LANGUAGE=tr
SUPPORTED_LANGUAGES=tr,en
TRANSLATION_CACHE=true
```

### 📊 Monitoring & Logging
```env
# Logging
LOG_FILE_PATH=./logs/histora.log  
LOG_MAX_SIZE_MB=100
LOG_BACKUP_COUNT=5

# Analytics (Optional)
GOOGLE_ANALYTICS_ID=your_ga_id_here
SENTRY_DSN=your_sentry_dsn_here
```

### 🚀 Deployment Settings
```env
# Railway (Optional)
RAILWAY_PROJECT_ID=your_railway_project_id
RAILWAY_SERVICE_ID=your_railway_service_id

# Vercel (Optional)  
VERCEL_PROJECT_ID=your_vercel_project_id
VERCEL_TEAM_ID=your_vercel_team_id
```

### 🔧 Development Settings
```env
# Development Only
DEV_SEED_DATABASE=true
DEV_AUTO_RELOAD=true
DEV_SHOW_DOCS=true
DEV_CORS_ALLOW_ALL=true

# Testing
TEST_DATABASE_URL=postgresql://histora:histora123@localhost:5433/histora_test
RUN_MIGRATIONS_ON_START=true
```

## 🚨 Security Best Practices

### Development
- ✅ Current demo keys are safe for local development
- ✅ Database is isolated in Docker containers
- ✅ No real user data at risk

### Production
- 🔒 **Never commit real API keys to git**
- 🔒 Use environment-specific `.env` files
- 🔒 Rotate keys regularly
- 🔒 Use managed services for databases
- 🔒 Enable proper CORS settings
- 🔒 Use HTTPS everywhere

## 🆘 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill existing processes
pkill -f "uvicorn"
pkill -f "next"
./start.sh
```

#### Database Connection Failed
```bash
# Restart Docker services
docker-compose down
docker-compose up -d
./start.sh
```

#### Environment Variables Not Loading
```bash
# Check file exists and has correct format
cat .env | head -10
# Restart application  
./restart.sh
```

#### Permission Denied
```bash
# Make scripts executable
chmod +x *.sh
```

## 📞 Support

- **Documentation**: Check `/docs` folder
- **API Reference**: http://localhost:8000/docs
- **Logs**: Check `backend.log` and `frontend.log`
- **Issues**: Create GitHub issue with logs

## 🎉 Success Checklist

- [ ] ✅ Application runs with `./start.sh`
- [ ] ✅ Backend health check: http://localhost:8000/health
- [ ] ✅ Frontend loads: http://localhost:3000
- [ ] ✅ API documentation: http://localhost:8000/docs
- [ ] 🟡 AI chat works (requires API keys)
- [ ] 🟡 User registration works (requires Firebase)
- [ ] 🔴 Production deployment (requires all configs)

You're now ready to develop with Histora! Start with Phase 1 and gradually work through the phases as needed.