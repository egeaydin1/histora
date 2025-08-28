# 📂 Histora - Yapay Zeka Tarihi Figürler Sohbet Platformu

[English](README.md) | [Türkçe](README_TR.md)

Histora, kullanıcıların tarihi figürler, filozoflar, bilim insanları, sanatçılar ve liderlerle gerçekçi sohbetler yapabileceği interaktif bir yapay zeka platformudur.

## 🌟 Proje Özeti

Histora, kullanıcıların Mustafa Kemal Atatürk, Mevlana, Konfüçyüs gibi tarihi figürlerle yapay zeka destekli gerçekçi sohbetler yapmalarını sağlayan bir platformdur. Proje, kullanıcıların tarihi kişiliklerden öğrenmelerini ve onlarla etkileşimde bulunmalarını hedeflemektedir.

## 🚀 Teknoloji Yığını

### Backend

- **Framework**: Python + FastAPI
- **AI Model**: DeepSeek R1 (OpenRouter)
- **Veritabanı**: PostgreSQL
- **Kimlik Doğrulama**: Firebase Auth
- **Vector DB**: Chroma (RAG için)

### Frontend

- **Framework**: Next.js 14
- **Stil**: Tailwind CSS
- **Dil**: TypeScript

### Dağıtım

- **Backend**: Railway
- **Frontend**: Vercel

## 📁 Proje Yapısı

```
histora/
├── backend/                 # FastAPI Backend
│   ├── app/
│   │   ├── api/            # API rotaları
│   │   ├── core/           # Temel yapılandırmalar
│   │   ├── models/         # Veritabanı modelleri
│   │   ├── services/       # İş mantığı
│   │   └── utils/          # Yardımcı araçlar
│   ├── database/           # Veritabanı migrasyonları ve scriptler
│   ├── config/             # Yapılandırma dosyaları
│   └── tests/              # Backend testleri
├── frontend/               # Next.js Frontend
│   ├── src/
│   │   ├── app/            # Next.js 14 app router
│   │   ├── components/     # React bileşenleri
│   │   ├── lib/            # Yardımcı araçlar ve yapılandırmalar
│   │   └── types/          # TypeScript tür tanımları
│   └── public/             # Statik dosyalar
├── docs/                   # Dokümantasyon
└── scripts/                # Dağıtım ve yardımcı scriptler
```

## 🎯 Özellikler

### Kullanıcılar İçin

- ✅ Karakter seçimi ve sohbet
- ✅ Tarihi kişilik taklidi
- ✅ Türkçe ve İngilizce destek
- ✅ Firebase kimlik doğrulama
- ✅ Kullanıcı kredisi sistemi
- ✅ Sohbet geçmişi yönetimi

### Yöneticiler İçin

- ✅ Karakter yönetim paneli
- ✅ Belge yükleme ve işleme
- ✅ Kategori yönetimi
- ✅ Karakter yayımlama sistemi
- ✅ Kullanıcı yönetimi
- ✅ Fiyatlandırma planı yönetimi
- ✅ Kredi paketi yönetimi
- ✅ Sistem istatistikleri ve analitik

## 🏁 Hızlı Başlangıç

### Backend Kurulumu

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows'ta: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Kurulumu

```bash
cd frontend
npm install
npm run dev
```

## 🐳 Docker ile Geliştirme Ortamı

Proje, tüm gerekli servisleri başlatmak için bir Docker Compose yapılandırması içerir:

```bash
# Tüm servisleri başlat
./start.sh

# Servisleri durdur
./stop.sh

# Servisleri yeniden başlat
./restart.sh
```

Bu scriptler şu işlemleri gerçekleştirir:

1. PostgreSQL veritabanı başlatma
2. Python backend sanal ortamı kurulumu
3. Next.js frontend kurulumu
4. Tüm servislerin sağlıklı çalıştığını kontrol etme

## 🔧 Ortam Değişkenleri

`.env.example` dosyasını inceleyerek gerekli ortam değişkenlerini yapılandırın. Ana yapılandırmalar:

- `OPENROUTER_API_KEY`: AI model erişimi için API anahtarı
- `DATABASE_URL`: PostgreSQL veritabanı bağlantı dizesi
- `FIREBASE_*`: Firebase kimlik doğrulama ayarları
- `NEXT_PUBLIC_API_URL`: Frontend'in bağlanacağı backend URL'si

## 📚 Karakterler (MVP)

### 🇹🇷 Türk Karakterleri

- **Mustafa Kemal Atatürk** (Lider)
- **Mevlana Celaleddin Rumi** (Filozof)
- **Mimar Sinan** (Mimar)
- **Nazım Hikmet** (Şair)
- **İbn-i Sina** (Bilim İnsanı)

### 🇨🇳 Çinli Karakterler

- **Konfüçyüs** (Filozof)
- **Lao Tzu** (Filozof)
- **Sun Tzu** (Stratejist)
- **Zhang Heng** (Bilim İnsanı)
- **Mao Zedong** (Lider)

### 🇮🇳 Hintli Karakterler

- **Budha** (Dini Lider)
- **Mahatma Gandhi** (Lider)
- **Chanakya** (Filozof)

## 🛠️ Yönetim Paneli

Admin paneli şu özellikleri içerir:

- Karakter oluşturma ve düzenleme
- Kullanıcı yönetimi
- Fiyatlandırma planı yönetimi
- Kredi paketi yönetimi
- Sistem istatistikleri

Admin paneline erişmek için:

```
http://localhost:3000/admin
```

## 💰 Kredi ve Fiyatlandırma Sistemi

Platform, kullanıcıların AI hizmetlerini kullanabilmeleri için bir kredi sistemi kullanır:

- **Ücretsiz Katman**: Yeni kullanıcılar için 100 kredi
- **Fiyatlandırma Planları**: Aylık veya yıllık abonelik seçenekleri
- **Kredi Paketleri**: Ek kredi satın alma imkanı
- **Kullanım Takibi**: Token tüketimi üzerinden kredi düşürme

## 🔒 Güvenlik ve Kimlik Doğrulama

- **Firebase Auth**: Email/şifre ve sosyal giriş desteği
- **Admin Yetkilendirme**: Özel admin API anahtarları
- **Rate Limiting**: Kullanıcı başına istek sınırlama
- **HTTPS**: Tüm API bağlantıları şifreli

## 📊 İzleme ve Analitik

Sistem şu verileri izler:

- Kullanıcı aktivitesi ve büyüme
- Token tüketimi ve maliyetler
- Karakter kullanım istatistikleri
- Sistem sağlığı ve performans metrikleri

## 🚀 Dağıtım

### Üretim Ortamı

- **Backend**: Railway üzerinde dağıtılmıştır
- **Frontend**: Vercel üzerinde dağıtılmıştır
- **Veritabanı**: Supabase/PlanetScale gibi yönetilen PostgreSQL servisleri

### CI/CD

- GitHub Actions ile otomatik test ve dağıtım
- Otomatik kod kalitesi kontrolleri
- Güvenlik taramaları

## 🧪 Test

Backend testleri için:

```bash
cd backend
pytest
```

Frontend testleri için:

```bash
cd frontend
npm test
```

## 📖 API Dokümantasyonu

API dokümantasyonuna şu adreslerden ulaşabilirsiniz:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🤝 Katkıda Bulunma

1. Repoyu fork'layın
2. Yeni bir özellik dalı oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi yapın
4. Değişikliklerinizi commit'leyin (`git commit -m 'Add some AmazingFeature'`)
5. Dalınızı push'layın (`git push origin feature/AmazingFeature`)
6. Bir Pull Request oluşturun

## 📄 Lisans

Bu proje MIT Lisansı ile lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 📞 İletişim

Proje sahibi: [Proje Sahibi Adı]
GitHub: [@githubkullaniciadi](https://github.com/githubkullaniciadi)

---

*"Histora, insanlığın en büyük zihinsel mirasını canlı hale getiriyor."*
