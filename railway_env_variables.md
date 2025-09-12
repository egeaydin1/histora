# 🚀 RAILWAY ENVIRONMENT VARIABLES - HISTORA BACKEND

## 🔥 **KRİTİK (MUTLAKA GEREKLİ)**

### **1. DATABASE (Railway otomatik sağlar)**
```bash
DATABASE_URL=postgresql://postgres:password@postgres.railway.internal:5432/railway
```

### **2. FIREBASE AUTHENTICATION**
```bash
FIREBASE_PROJECT_ID=histora-production
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@histora-production.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789012345678901
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
```

### **3. JWT SECURITY**
```bash
JWT_SECRET_KEY=er1Wx0PXWo-aUC37UVblyqYhwvtDCPb2DNaHTcZm1wVwye9ZyrMb7-pmHN4WJga-kNiXLVTAvM4R6rQonPkCmg
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
```

### **4. APPLICATION SETTINGS**
```bash
ENVIRONMENT=production
DEBUG=false
APP_NAME=Histora
APP_VERSION=1.0.0
LOG_LEVEL=info
```

## ⚙️ **ÖNEMLI (PRODUCTION İÇİN)**

### **5. AI MODEL SETTINGS**
```bash
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
DEFAULT_AI_MODEL=google/gemini-2.0-flash-001
BACKUP_AI_MODEL=deepseek/deepseek-r1-0528:free
```

### **6. CORS & FRONTEND**
```bash
FRONTEND_URL=https://frontend-red-alpha-19.vercel.app
ALLOWED_ORIGINS=https://frontend-red-alpha-19.vercel.app,http://localhost:3000
```

### **7. ADMIN & SECURITY**
```bash
ADMIN_API_KEY=histora-admin-production-2025-secure-key
```

## 📝 **İSTEĞE BAĞLI (DEFAULTS VAR)**

### **8. AI MODEL PARAMETERS**
```bash
AI_MAX_TOKENS=2048
AI_TEMPERATURE=0.7
AI_TOP_P=0.9
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536
```

### **9. FILE UPLOAD**
```bash
MAX_FILE_SIZE_MB=50
ALLOWED_FILE_TYPES=.txt,.md,.pdf,.docx
UPLOAD_DIRECTORY=./uploads
TEMP_DIRECTORY=./temp
```

### **10. INTERNATIONALIZATION**
```bash
DEFAULT_LANGUAGE=tr
SUPPORTED_LANGUAGES=tr,en
TRANSLATION_CACHE=true
```

### **11. DATABASE TUNING**
```bash
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20
```

### **12. LOGGING**
```bash
LOG_FILE_PATH=./logs/histora.log
LOG_MAX_SIZE_MB=100
LOG_BACKUP_COUNT=5
```

### **13. MONITORING (İSTEĞE BAĞLI)**
```bash
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

### **14. DEVELOPMENT FLAGS**
```bash
DEV_SEED_DATABASE=false
DEV_AUTO_RELOAD=false
DEV_SHOW_DOCS=true
DEV_CORS_ALLOW_ALL=false
RUN_MIGRATIONS_ON_START=true
```

## 🎯 **RAILWAY'DE AYARLAMA SIRASI**

### **1. Railway Dashboard'a Git**
- Railway Dashboard → Histora Project → Backend Service → Variables

### **2. Öncelik Sırası ile Ekle:**

#### **🔴 MUTLAKA GEREKLİ (HEMEN EKLE):**
1. `ENVIRONMENT=production`
2. `DEBUG=false`
3. `JWT_SECRET_KEY=er1Wx0PXWo-aUC37UVblyqYhwvtDCPb2DNaHTcZm1wVwye9ZyrMb7-pmHN4WJga-kNiXLVTAvM4R6rQonPkCmg`
4. `JWT_ALGORITHM=HS256`
5. `FIREBASE_PROJECT_ID=histora-production`
6. `FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n[KEY_HERE]\n-----END PRIVATE KEY-----`
7. `FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@histora-production.iam.gserviceaccount.com`
8. `FIREBASE_CLIENT_ID=123456789012345678901`

#### **🟡 ÖNEMLİ (SONRA EKLE):**
9. `FRONTEND_URL=https://frontend-red-alpha-19.vercel.app`
10. `ALLOWED_ORIGINS=https://frontend-red-alpha-19.vercel.app,http://localhost:3000`
11. `OPENROUTER_API_KEY=your_key_here`
12. `OPENAI_API_KEY=your_key_here`
13. `ADMIN_API_KEY=histora-admin-production-2025-secure-key`

## 🔐 **GÜVENLİK NOTLARI**

1. **JWT_SECRET_KEY**: Güçlü, rastgele 64 byte key kullan
2. **FIREBASE_PRIVATE_KEY**: `\n` karakterlerini gerçek newline olarak ayarla
3. **API_KEYS**: Gerçek production key'leri kullan
4. **ADMIN_API_KEY**: Güçlü, tahmin edilemez key seç

## ✅ **DOĞRULAMA**

Environment variables'ları ayarladıktan sonra:

```bash
# Railway SSH ile bağlan
railway ssh --project=YOUR_PROJECT_ID --service=backend

# Test et
python test_railway_simple.py
python test_railway_user.py
```

## 🎉 **SONUÇ**

Bu environment variables'ları ayarladıktan sonra:
- ✅ Firebase authentication çalışacak
- ✅ JWT token'lar doğru oluşacak
- ✅ CORS sorunları çözülecek
- ✅ AI model'ler çalışacak
- ✅ Database bağlantısı stabil olacak
