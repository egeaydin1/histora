# Histora Railway Deployment
## Environment Variables Template

# After creating Railway services, set these variables in Railway dashboard:

## Backend Service Environment Variables:
```
DATABASE_URL=${DATABASE_URL}  # Auto-provided by Railway PostgreSQL
APP_NAME=Histora
APP_VERSION=1.0.0
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=info
PORT=${PORT}  # Auto-provided by Railway
BACKEND_URL=${RAILWAY_STATIC_URL}
FRONTEND_URL=https://your-frontend.railway.app
ALLOWED_ORIGINS=https://your-frontend.railway.app
FIREBASE_CREDENTIALS_JSON={"type":"service_account",...}
FIREBASE_PROJECT_ID=your-firebase-project-id
OPENROUTER_API_KEY=your-openrouter-api-key
OPENAI_API_KEY=your-openai-api-key
SECRET_KEY=your-super-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key
```

## Frontend Service Environment Variables:
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id
NODE_ENV=production
PORT=3000
```

## Railway Deployment Steps:
1. Run `chmod +x deploy.sh`
2. Run `./deploy.sh`
3. Create PostgreSQL service in Railway dashboard
4. Create backend service (root directory: backend)
5. Create frontend service (root directory: frontend)
6. Set environment variables for each service
7. Deploy and test
