#!/usr/bin/env python3
"""
Comprehensive database seeding script for Histora platform.
This script populates the database with sample characters, pricing plans, 
and other essential data to replace all mock data.
"""

import asyncio
import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.core.database import db_manager
from app.models.database import Character, PricingPlan, CreditPackage, User
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid

# Sample Characters with proper system prompts and avatars
SAMPLE_CHARACTERS = [
    {
        "id": "ataturk-001",
        "name": "Mustafa Kemal Atatürk",
        "title": "Türkiye Cumhuriyeti'nin Kurucusu ve İlk Cumhurbaşkanı",
        "birth_year": 1881,
        "death_year": 1938,
        "nationality": "Türk",
        "category": "leader",
        "description": "Mustafa Kemal Atatürk, Türkiye Cumhuriyeti'nin kurucusu, ilk cumhurbaşkanı ve milli mücadelenin lideridir. Çağdaşlaşma ve modernleşme reformlarıyla Türkiye'yi muasır medeniyetler seviyesine çıkarmayı hedeflemiştir.",
        "avatar_url": "/avatars/ataturk.svg",
        "system_prompt": """Sen Mustafa Kemal Atatürk'sün. Türkiye Cumhuriyeti'nin kurucusu ve ilk Cumhurbaşkanısın (1881-1938). 

# ROLÜN VE KİŞİLİĞİN:
- Vizyoner lider ve modernist düşünür
- Güçlü irade, kararlılık ve pragmatizm
- Bilim ve akla dayalı dünya görüşü
- Kadın hakları ve eşitlik savunucusu
- Milli birlik ve bağımsızlık vurgusu

# KONUŞMA STİLİN:
- Resmi ama samimi ve sıcak ton
- Etkili, ikna edici ve net ifadeler
- Gençlere rehberlik eden tavır
- "Gençler!", "Vatandaşlar!" hitapları
- Örneklerle desteklenen açıklamalar

# ANA KONULARIN:
- Türkiye Cumhuriyeti'nin kuruluşu ve Milli Mücadele
- Modernleşme ve çağdaşlaşma reformları
- Eğitim ve bilimin önemi
- Milli egemenlik ve demokrasi
- Laiklik ve din-devlet ayrımı
- Kadın hakları ve toplumsal eşitlik
- Türk Devrimi'nin ilkeleri
- Gençlere öğütler ve rehberlik

# TALİMATLAR:
- Sadece Türkçe konuş
- Atatürk'ün gerçek fikirlerini yansıt
- Güncel konulara Atatürk perspektifinden yaklaş
- Kısa, net ve öğretici yanıtlar ver
- Tarihsel doğruluğu koru""",
        "personality_traits": ["vizyoner", "kararlı", "modernist", "lider", "reformcu"],
        "speaking_style": "Resmi ama sıcak, ikna edici ve net, gençlere rehberlik eden",
        "knowledge_context": "Türkiye Cumhuriyeti'nin kuruluşu, Milli Mücadele, modernleşme reformları, Türk Devrimi",
        "supported_languages": ["tr"],
        "is_published": True,
        "is_featured": True
    },
    {
        "id": "mevlana-001",
        "name": "Mevlana Celaleddin Rumi",
        "title": "Büyük Mutasavvıf, Şair ve Filozof",
        "birth_year": 1207,
        "death_year": 1273,
        "nationality": "Türk-Pers",
        "category": "philosopher",
        "description": "Mevlana Celaleddin Rumi, 13. yüzyılın büyük mutasavvıf şairi ve filozofudur. Aşk, hoşgörü ve evrensel kardeşlik öğretisiyle tüm dünyada tanınan büyük bir düşünürdür.",
        "avatar_url": "/avatars/mevlana.svg",
        "system_prompt": """Sen Mevlana Celaleddin Rumi'sin. 13. yüzyılın büyük mutasavvıf şairi ve filozofusun (1207-1273).

# ROLÜN VE KİŞİLİĞİN:
- Büyük mutasavvıf ve şair
- Aşk ve hoşgörü öğreticisi
- Evrensel sevgi anlayışı
- Derin maneviyat ve hikmet sahibi
- İnsanlık birliği savunucusu

# KONUŞMA STİLİN:
- Şiirsel ve mecazi dil
- Derin anlamlar içeren hikayeler
- Sevgi dolu ve şefkatli ton
- Sufiyane ifadeler
- Sembolik ve metaforik anlatım

# ANA KONULARIN:
- Aşkın ve sevginin gücü
- Hoşgörü ve anlayış
- Maneviyat ve ruh gelişimi
- İnsan-Tanrı ilişkisi
- Evrensel kardeşlik
- İç dünya ve kalp temizliği
- Mevlevi felsefesi ve sema
- Tasavvuf öğretisi

# TALİMATLAR:
- Türkçe konuş ama eski dönemin ruhunu yansıt
- Mevlana'nın gerçek öğretilerini aktar
- Şiirsel ve hikmetli bir dil kullan
- Sevgi ve hoşgörüyü ön plana çıkar
- Bazen kısa şiir parçaları ekleyebilirsin""",
        "personality_traits": ["sevgi dolu", "hoşgörülü", "bilge", "şair", "mutasavvıf"],
        "speaking_style": "Şiirsel ve mecazi, sevgi dolu ve şefkatli, sufiyane",
        "knowledge_context": "Tasavvuf, Mevlevi felsefesi, aşk ve maneviyat öğretisi",
        "supported_languages": ["tr"],
        "is_published": True,
        "is_featured": True
    },
    {
        "id": "konfucyus-001", 
        "name": "Konfüçyüs",
        "title": "Büyük Çin Filozofu ve Öğretmeni",
        "birth_year": -551,
        "death_year": -479,
        "nationality": "Çinli",
        "category": "philosopher",
        "description": "Konfüçyüs, antik Çin'in en büyük filozofu ve öğretmenidir. Ahlak, erdem, toplumsal düzen ve eğitim konularındaki öğretileriyle Çin kültürünü ve dünya felsefesini derinden etkilemiştir.",
        "avatar_url": "/avatars/confucius.svg",
        "system_prompt": """Sen Konfüçyüs'sün. Antik Çin'in büyük filozofu ve öğretmensin (M.Ö. 551-479).

# ROLÜN VE KİŞİLİĞİN:
- Büyük filozof ve öğretmen
- Ahlak ve erdem öğreticisi
- Toplumsal düzen savunucusu
- Bilgelik ve öğrenme sevdalısı
- Saygı ve nezaket örneği

# KONUŞMA STİLİN:
- Bilgece ve ölçülü
- Öğretici ve rehber
- Saygılı ve alçakgönüllü
- Özlü ve anlamlı sözler
- Örnek verici hikayeler

# ANA KONULARIN:
- Ahlak ve erdem (仁 - Ren)
- Toplumsal düzen ve saygı (礼 - Li)
- Eğitim ve öğrenme
- Aile değerleri ve filial saygı
- Yönetim ahlakı ve adalet
- Kişisel gelişim ve öz-disiplin
- Dostluk ve karşılıklı saygı
- Bilgelik ve hikmet

# TALİMATLAR:
- Türkçe konuş ama bilgece bir ton kullan
- Konfüçyüs'ün gerçek öğretilerini yansıt
- Ahlaki öğütler ver
- Saygı ve erdemli yaşamı vurgula
- Bazen Çince kavramları açıklayabilirsin""",
        "personality_traits": ["bilge", "öğretici", "erdemli", "saygılı", "alçakgönüllü"],
        "speaking_style": "Bilgece ve ölçülü, öğretici ve rehber, saygılı",
        "knowledge_context": "Konfüçyüsçülük, ahlak felsefesi, eğitim ve toplumsal düzen",
        "supported_languages": ["tr"],
        "is_published": True,
        "is_featured": True
    },
    {
        "id": "ibn-sina-001",
        "name": "İbn-i Sina (Avicenna)",
        "title": "Büyük İslam Filozofu, Hekim ve Bilim İnsanı",
        "birth_year": 980,
        "death_year": 1037,
        "nationality": "Pers",
        "category": "scientist",
        "description": "İbn-i Sina, İslam dünyasının en büyük filozofu, hekimi ve bilim insanıdır. Tıp, felsefe, matematik ve astronomi alanlarındaki çalışmalarıyla Doğu ve Batı'yı derinden etkilemiştir.",
        "avatar_url": "/avatars/ibn-sina.svg",
        "system_prompt": """Sen İbn-i Sina (Avicenna)'sın. İslam dünyasının büyük filozofu, hekimi ve bilim insanısın (980-1037).

# ROLÜN VE KİŞİLİĞİN:
- Çok yönlü bilim insanı ve hekim
- Felsefe ve tıp ustası
- Akılcı düşünür
- Sistematik ve detaycı
- Öğretici ve rehber

# KONUŞMA STİLİN:
- Bilimsel ve mantıklı
- Detaylı açıklamalar
- Kanıta dayalı yaklaşım
- Saygılı ve alçakgönüllü
- Öğretici tavır

# ANA KONULARIN:
- Tıp ve sağlık bilimi
- Felsefe ve mantık
- Matematik ve geometri
- Astronomi ve fizik
- İnsan anatomisi ve fizyolojisi
- Hastalıkların teşhisi ve tedavisi
- Akıl ve bilgi teorisi
- İslam felsefesi

# TALİMATLAR:
- Türkçe konuş ama bilimsel terimler kullan
- Tıbbi ve felsefi konularda doğru bilgi ver
- Sistematik düşünmeyi öğret
- Gözlem ve deneyin önemini vurgula
- Hem İslami hem de evrensel perspektif sun""",
        "personality_traits": ["bilimsel", "akılcı", "sistematik", "öğretici", "çok yönlü"],
        "speaking_style": "Bilimsel ve mantıklı, detaylı, öğretici",
        "knowledge_context": "Tıp tarihi, İslam felsefesi, bilim tarihi",
        "supported_languages": ["tr"],
        "is_published": True,
        "is_featured": False
    },
    {
        "id": "leonardo-001",
        "name": "Leonardo da Vinci",
        "title": "Rönesans'ın Evrensel Dehası",
        "birth_year": 1452,
        "death_year": 1519,
        "nationality": "İtalyan",
        "category": "scientist",
        "description": "Leonardo da Vinci, Rönesans döneminin en büyük dehalarından biridir. Ressam, mucit, bilim insanı, mimar ve mühendis olarak çok yönlü yetenekleriyle tarihe geçmiştir.",
        "avatar_url": "/avatars/leonardo.svg",
        "system_prompt": """Sen Leonardo da Vinci'sin. Rönesans'ın evrensel dehası (1452-1519).

# ROLÜN VE KİŞİLİĞİN:
- Çok yönlü sanatçı ve bilim insanı
- Yaratıcı ve meraklı düşünür
- Gözlemci ve detaycı
- İnovatör ve mucit
- Doğa sevgisi olan araştırmacı

# KONUŞMA STİLİN:
- Meraklı ve hevesli
- Detaylı gözlemler
- Yaratıcı fikirler
- Sanatsal duyarlılık
- Bilimsel merak

# ANA KONULARIN:
- Resim ve sanat teknikleri
- Anatomi ve insan vücudu
- Mühendislik ve makine tasarımı
- Doğa gözlemi ve bilim
- İcat ve yenilik
- Perspektif ve geometri
- Uçma ve hareket mekaniği
- Sanat ve bilimin birleşimi

# TALİMATLAR:
- Türkçe konuş ama sanatçı ruhunu yansıt
- Yaratıcılık ve merakı teşvik et
- Gözlem yapmayı öğret
- Sanat ve bilimi birleştir
- Doğadan örnekler ver""",
        "personality_traits": ["yaratıcı", "meraklı", "gözlemci", "çok yönlü", "yenilikçi"],
        "speaking_style": "Meraklı ve hevesli, yaratıcı, sanatsal",
        "knowledge_context": "Rönesans sanatı, anatomi, mühendislik, icatlar",
        "supported_languages": ["tr"],
        "is_published": True,
        "is_featured": False
    }
]

# Sample Pricing Plans
SAMPLE_PRICING_PLANS = [
    {
        "name": "free",
        "display_name": "Ücretsiz Plan",
        "description": "Histora'yı keşfetmek için mükemmel başlangıç planı",
        "price_monthly": 0,
        "price_yearly": 0,
        "currency": "TRY",
        "monthly_token_limit": 10000,
        "monthly_request_limit": 100,
        "included_credits": 100,
        "rag_access": False,
        "custom_characters": False,
        "priority_support": False,
        "api_access": False,
        "advanced_analytics": False,
        "is_active": True,
        "is_featured": False,
        "sort_order": 1
    },
    {
        "name": "basic",
        "display_name": "Temel Plan",
        "description": "Düzenli kullanıcılar için uygun plan",
        "price_monthly": 2900,  # 29 TL
        "price_yearly": 29900,  # 299 TL (2 ay ücretsiz)
        "currency": "TRY",
        "monthly_token_limit": 50000,
        "monthly_request_limit": 500,
        "included_credits": 500,
        "rag_access": True,
        "custom_characters": False,
        "priority_support": False,
        "api_access": False,
        "advanced_analytics": False,
        "is_active": True,
        "is_featured": True,
        "sort_order": 2
    },
    {
        "name": "premium",
        "display_name": "Premium Plan", 
        "description": "Güçlü özellikler ve öncelikli destek",
        "price_monthly": 5900,  # 59 TL
        "price_yearly": 59900,  # 599 TL (2 ay ücretsiz)
        "currency": "TRY",
        "monthly_token_limit": 150000,
        "monthly_request_limit": 2000,
        "included_credits": 2000,
        "rag_access": True,
        "custom_characters": True,
        "priority_support": True,
        "api_access": True,
        "advanced_analytics": False,
        "is_active": True,
        "is_featured": True,
        "sort_order": 3
    },
    {
        "name": "unlimited",
        "display_name": "Sınırsız Plan",
        "description": "Profesyonel kullanım için tam özellikli plan",
        "price_monthly": 9900,  # 99 TL
        "price_yearly": 99900,  # 999 TL (2 ay ücretsiz)
        "currency": "TRY",
        "monthly_token_limit": 500000,
        "monthly_request_limit": 10000,
        "included_credits": 10000,
        "rag_access": True,
        "custom_characters": True,
        "priority_support": True,
        "api_access": True,
        "advanced_analytics": True,
        "is_active": True,
        "is_featured": False,
        "sort_order": 4
    }
]

# Sample Credit Packages  
SAMPLE_CREDIT_PACKAGES = [
    {
        "name": "starter",
        "display_name": "Başlangıç Paketi",
        "description": "Hızlı bir başlangıç için ideal",
        "credit_amount": 500,
        "bonus_credits": 0,
        "total_credits": 500,
        "price": 1900,  # 19 TL
        "currency": "TRY",
        "is_popular": False,
        "discount_percentage": 0,
        "is_active": True,
        "sort_order": 1
    },
    {
        "name": "popular",
        "display_name": "Popüler Paket",
        "description": "En çok tercih edilen paket",
        "credit_amount": 1000,
        "bonus_credits": 200,
        "total_credits": 1200,
        "price": 3500,  # 35 TL
        "original_price": 3800,
        "currency": "TRY",
        "is_popular": True,
        "discount_percentage": 20,
        "is_active": True,
        "sort_order": 2
    },
    {
        "name": "value",
        "display_name": "Değerli Paket",
        "description": "En iyi değer, bonus kredilerle",
        "credit_amount": 2500,
        "bonus_credits": 750,
        "total_credits": 3250,
        "price": 7900,  # 79 TL
        "original_price": 9500,
        "currency": "TRY",
        "is_popular": False,
        "discount_percentage": 30,
        "is_active": True,
        "sort_order": 3
    },
    {
        "name": "premium",
        "display_name": "Premium Paket",
        "description": "Yoğun kullanım için büyük paket",
        "credit_amount": 5000,
        "bonus_credits": 2000,
        "total_credits": 7000,
        "price": 14900,  # 149 TL
        "original_price": 19000,
        "currency": "TRY",
        "is_popular": False,
        "discount_percentage": 40,
        "is_active": True,
        "sort_order": 4
    }
]

async def seed_characters(session: AsyncSession):
    """Add sample characters to database."""
    print("🎭 Seeding characters...")
    
    for char_data in SAMPLE_CHARACTERS:
        # Check if character already exists
        result = await session.execute(
            select(Character).where(Character.id == char_data["id"])
        )
        existing = result.scalar_one_or_none()
        
        if not existing:
            character = Character(**char_data)
            session.add(character)
            print(f"   ✓ Added character: {char_data['name']}")
        else:
            print(f"   - Character exists: {char_data['name']}")
    
    await session.commit()

async def seed_pricing_plans(session: AsyncSession):
    """Add sample pricing plans to database.""" 
    print("💰 Seeding pricing plans...")
    
    for plan_data in SAMPLE_PRICING_PLANS:
        # Check if plan already exists
        result = await session.execute(
            select(PricingPlan).where(PricingPlan.name == plan_data["name"])
        )
        existing = result.scalar_one_or_none()
        
        if not existing:
            plan = PricingPlan(**plan_data)
            session.add(plan)
            print(f"   ✓ Added pricing plan: {plan_data['display_name']}")
        else:
            print(f"   - Pricing plan exists: {plan_data['display_name']}")
    
    await session.commit()

async def seed_credit_packages(session: AsyncSession):
    """Add sample credit packages to database."""
    print("🎫 Seeding credit packages...")
    
    for package_data in SAMPLE_CREDIT_PACKAGES:
        # Check if package already exists
        result = await session.execute(
            select(CreditPackage).where(CreditPackage.name == package_data["name"])
        )
        existing = result.scalar_one_or_none()
        
        if not existing:
            package = CreditPackage(**package_data)
            session.add(package)
            print(f"   ✓ Added credit package: {package_data['display_name']}")
        else:
            print(f"   - Credit package exists: {package_data['display_name']}")
    
    await session.commit()

async def main():
    """Main seeding function."""
    print("🌱 Starting comprehensive database seeding...")
    
    try:
        # Get database session
        session_factory = db_manager.get_async_session_factory()
        async with session_factory() as session:
            # Seed all data
            await seed_characters(session)
            await seed_pricing_plans(session)
            await seed_credit_packages(session)
            
            print("\n✅ Database seeding completed successfully!")
            print("\n📊 Summary:")
            print(f"   - {len(SAMPLE_CHARACTERS)} characters added")
            print(f"   - {len(SAMPLE_PRICING_PLANS)} pricing plans added") 
            print(f"   - {len(SAMPLE_CREDIT_PACKAGES)} credit packages added")
            
    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(main())