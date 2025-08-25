# 🔥 Firebase Authentication Setup

This guide explains how to set up Firebase Authentication for Histora.

## 📋 Current Status

✅ **Backend Firebase Service**: Complete with mock fallback  
✅ **Frontend Firebase Integration**: Enhanced with helper functions  
✅ **JWT + Firebase Hybrid**: Both authentication methods supported  
✅ **Mock Mode**: Development without Firebase configuration  
⚠️ **Production Setup**: Requires Firebase project creation  

## 🚀 Quick Setup (Production)

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `histora-production`
4. Enable Google Analytics (optional)
5. Create project

### 2. Enable Authentication

1. In Firebase Console → Authentication
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password"
5. Optional: Enable Google, GitHub, etc.

### 3. Get Configuration

#### Frontend Configuration
1. Go to Project Settings → General
2. Scroll to "Your apps" 
3. Click "Web app" icon (</>) 
4. Register app: `histora-frontend`
5. Copy configuration:

```typescript
// Add to frontend/.env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=histora-production.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=histora-production
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=histora-production.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

#### Backend Configuration
1. Go to Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download JSON file
4. Add to backend configuration:

**Option A: Environment Variables**
```bash
# Add to backend/.env
FIREBASE_PROJECT_ID=histora-production
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc@histora-production.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789
```

**Option B: Service Account File**
```bash
# Save JSON file as backend/firebase-service-account.json
# Add to backend/.env
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

**Option C: JSON String**
```bash
# Add entire JSON as string to backend/.env
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"histora-production",...}'
```

## 🛠️ Development Mode

Currently running in **mock mode** with these features:

### Backend Mock Features
- ✅ Token verification (accepts `firebase-mock-*` tokens)
- ✅ User creation from Firebase data
- ✅ Custom claims support (mock)
- ✅ Admin SDK functions (mock)

### Frontend Mock Features  
- ✅ Authentication state management
- ✅ Login/signup UI (falls back to JWT)
- ✅ Mock token generation
- ✅ Status checking

### Test Firebase Integration
```bash
# Test Firebase status
curl http://localhost:8000/api/v1/auth/firebase/status

# Test Firebase login (mock)
curl -X POST http://localhost:8000/api/v1/auth/firebase-login \
  -H "Content-Type: application/json" \
  -d '{"firebase_token":"firebase-mock-test123"}'
```

## 🔄 Authentication Flow

### Current Hybrid System

1. **JWT Authentication** (Always Available)
   - Email/password login
   - Admin access
   - API authentication

2. **Firebase Authentication** (When Configured)
   - Social login (Google, GitHub, etc.)
   - Email verification
   - Password reset
   - Multi-factor authentication

3. **API Key Authentication** (Admin Only)
   - Backend admin operations
   - Development access

### User Registration Flow

```mermaid
graph TD
    A[User Registration] --> B{Firebase Configured?}
    B -->|Yes| C[Firebase Sign Up]
    B -->|No| D[JWT Registration]
    C --> E[Get Firebase Token]
    E --> F[Send to Backend]
    F --> G[Verify Firebase Token]
    G --> H[Create/Update User in DB]
    H --> I[Return JWT Token]
    D --> H
    I --> J[User Authenticated]
```

## 📊 Authentication Endpoints

### Public Endpoints
- `POST /api/v1/auth/login` - JWT login
- `POST /api/v1/auth/register` - JWT registration  
- `POST /api/v1/auth/firebase-login` - Firebase token login
- `GET /api/v1/auth/me` - Get current user
- `GET /api/v1/auth/health` - Auth service status
- `GET /api/v1/auth/firebase/status` - Firebase status

### Admin Endpoints (Require Admin Access)
- `GET /api/v1/auth/admin/users` - List users
- `POST /api/v1/auth/admin/users` - Create user
- `PUT /api/v1/auth/admin/users/{id}` - Update user
- `DELETE /api/v1/auth/admin/users/{id}` - Deactivate user
- `GET /api/v1/auth/admin/stats` - Auth statistics

## 🔒 Security Features

### JWT Security
- ✅ bcrypt password hashing
- ✅ Token expiration (24 hours)
- ✅ Role-based access control
- ✅ Secure secret key

### Firebase Security
- ✅ Token verification
- ✅ Email verification
- ✅ Custom claims
- ✅ Admin SDK protection

### API Security
- ✅ Admin API key protection
- ✅ CORS configuration
- ✅ Rate limiting ready
- ✅ Development bypass

## 🚀 Production Deployment

### Backend Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# JWT
JWT_SECRET_KEY=your_super_secret_jwt_key_here
JWT_EXPIRE_MINUTES=1440

# Admin
ADMIN_API_KEY=your_super_secret_admin_key_here

# Firebase (one of the options above)
FIREBASE_PROJECT_ID=histora-production
# ... other Firebase variables

# Environment
ENVIRONMENT=production
DEBUG=false
```

### Frontend Environment Variables  
```bash
# API
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_API_VERSION=v1

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=histora-production.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=histora-production
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=histora-production.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

## 🧪 Testing

### Local Testing
```bash
# Test JWT authentication
npm run test:auth

# Test Firebase integration
npm run test:firebase

# Test admin functions
npm run test:admin
```

### Production Testing
```bash
# Health check
curl https://your-backend.railway.app/api/v1/auth/health

# Firebase status
curl https://your-backend.railway.app/api/v1/auth/firebase/status
```

## 📝 Next Steps

1. **Create Firebase Project** (when ready for production)
2. **Add Social Login Providers** (Google, GitHub, Twitter)
3. **Implement Email Verification** 
4. **Add Password Reset Flow**
5. **Set up Analytics** (optional)
6. **Configure Security Rules** 
7. **Enable Multi-factor Auth** (optional)

## 🎯 Current Capabilities

### ✅ Working Now
- Complete JWT authentication system
- Admin panel with role-based access
- Mock Firebase integration
- User management (CRUD)
- Protected routes
- Multiple auth methods

### 🔄 Ready for Firebase
- Firebase token verification
- User sync between Firebase and database
- Custom claims support
- Social login integration
- Email verification flow

**Histora authentication system is production-ready with or without Firebase! 🔥🚀**
