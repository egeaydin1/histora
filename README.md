# 📂 Histora - AI Historical Figures Chat Platform

Histora, kullanıcıların tarihi figürler, filozoflar, bilim insanları, sanatçılar ve liderlerle gerçekçi sohbetler yapabileceği interaktif bir yapay zeka platformudur.

## 🚀 Tech Stack

### Backend
- **Framework**: Python + FastAPI
- **AI Model**: Llama 3.1 (OpenRouter)
- **Vector DB**: Chroma
- **Database**: PostgreSQL
- **Auth**: Firebase Auth

### Frontend
- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Language**: TypeScript

### Deployment
- **Backend**: Railway
- **Frontend**: Vercel

## 📁 Project Structure

```
histora/
├── backend/                 # FastAPI Backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Core configurations
│   │   ├── models/         # Database models
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utilities
│   ├── database/           # Database migrations & scripts
│   ├── config/             # Configuration files
│   └── tests/              # Backend tests
├── frontend/               # Next.js Frontend
│   ├── src/
│   │   ├── app/            # Next.js 14 app router
│   │   ├── components/     # React components
│   │   ├── lib/            # Utilities & configurations
│   │   └── types/          # TypeScript types
│   └── public/             # Static assets
├── docs/                   # Documentation
└── scripts/                # Deployment & utility scripts
```

## 🎯 MVP Features

### For Users
- ✅ Character selection and chat
- ✅ Historical personality emulation
- ✅ Turkish & English support
- ✅ Firebase authentication

### For Admin
- ✅ Character management panel
- ✅ Document upload & embedding
- ✅ Category management
- ✅ Model publishing system

## 🏁 Quick Start

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🔧 Environment Variables

Check `.env.example` files in both backend and frontend directories.

## 📚 Characters (MVP)

### 🇹🇷 Turkish Characters
- Atatürk (Leader)
- Mevlana (Philosopher) 
- Mimar Sinan (Architect)
- Nazım Hikmet (Poet)
- İbn-i Sina (Scientist)

### 🇨🇳 Chinese Characters  
- Konfüçyüs (Philosopher)
- Laozi (Philosopher)
- Sun Tzu (Strategist)
- Zhang Heng (Scientist)
- Mao Zedong (Leader)

---
*"Histora, insanlığın en büyük zihinsel mirasını canlı hale getiriyor."*
