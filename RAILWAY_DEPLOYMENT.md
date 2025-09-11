## Histora Railway Dağıtım Kılavuzu

Bu kılavuz, Histora'nın backend (FastAPI) ve frontend (Next.js) servislerini Railway'e adım adım nasıl dağıtacağınızı açıklar.

## Önkoşullar
- Railway hesabı ve bir proje
- Node.js ve npm (Frontend build için)
- Railway CLI: `npm i -g @railway/cli`
- PostgreSQL eklentisi (Railway üzerinden ekleyeceğiz)

## Hızlı Başlangıç (CLI)
```bash
# CLI kurulumu ve giriş
npm i -g @railway/cli
railway login

# Projeyi bağla ve deploy tetikle
cd /Users/hientranpc/Desktop/Claude/histora
railway init
railway up
```

Not: PostgreSQL servisini Railway dashboard üzerinden ekleyin ve backend servisine bağlayın. `DATABASE_URL` otomatik enjekte edilir.

## Railway Servisleri ve Komutlar

Backend servisi (kaynak: `backend/`)
- Build: `pip install -r requirements.txt`
- Start: `python3 main.py`

Frontend servisi (kaynak: `frontend/`)
- Build: `npm ci --no-audit --no-fund && npm run build`
- Start: `npx next start -p $PORT`

Bu komutlar `railway.json` içinde tanımlıdır ve otomatik kullanılır.

## Ortam Değişkenleri

Backend (zorunlu)
```
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=info
# PORT (Railway verir)
DATABASE_URL=<Railway Postgres tarafından otomatik sağlanır>
BACKEND_URL=https://<backend-domain>
FRONTEND_URL=https://<frontend-domain>
ALLOWED_ORIGINS=https://<frontend-domain>
JWT_SECRET_KEY=<güçlü bir anahtar>
```

Backend (opsiyonel/entegrasyon)
```
OPENROUTER_API_KEY=
OPENAI_API_KEY=
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY_ID=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=
FIREBASE_CLIENT_ID=
RUN_MIGRATIONS_ON_START=true
```

Frontend
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://<backend-domain>
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Notlar:
- Production'da CORS kısıtlaması için `ALLOWED_ORIGINS` içine frontend domainini ekleyin.
- `frontend/next.config.ts` `NEXT_PUBLIC_API_URL`'ı kullanarak backend'e proxy yapar.

## Doğrulama (Health Check)
- Backend dağıtıldıktan sonra:
  - `GET https://<backend-domain>/health`
  - `GET https://<backend-domain>/api/v1/health`
- Frontend dağıtıldıktan sonra:
  - Tarayıcı: `https://<frontend-domain>`
  - Ağ isteklerinde backend çağrılarının `NEXT_PUBLIC_API_URL` ile doğru domaine gittiğini kontrol edin.

## Sık Karşılaşılan Sorunlar
- Veritabanı bağlantı hatası: Postgres servisini projeye ekleyip backend servisine bağlayın; `DATABASE_URL`'ın geldiğini doğrulayın.
- 401/403 CORS: `ALLOWED_ORIGINS` değerine frontend domainini ekleyin.
- Frontend 404/başlatılamıyor: `npx next start -p $PORT` kullanıldığına emin olun; `npm run build` başarılı mı kontrol edin.
- 500/Env eksik: Backend ve frontend env değişkenlerinin eksiksiz olduğundan emin olun.
- Port çakışması: Railway `PORT` değişkenini sağlar; hard-coded port kullanmayın.

## Ek Notlar
- `railway.json` servis komutları güncellendi:
  - Backend start: `python3 main.py`
  - Frontend start: `npx next start -p $PORT`
- Dockerfile sadece backend içindir; frontend ayrı servis olarak deploy edilmelidir.
