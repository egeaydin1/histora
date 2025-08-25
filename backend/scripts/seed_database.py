"""
Database seeding script for Histora platform.
Populates PostgreSQL with comprehensive mock data for production deployment.
"""
import asyncio
import sys
import os
from datetime import datetime, timedelta
from typing import List
import uuid

# Add the parent directory to Python path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.models.database import (
    Base, User, Character, PricingPlan, CreditPackage,
    UserSubscription, CreditTransaction, UserUsage, UserQuota
)
from app.core.config import settings

# Mock data definitions
MOCK_USERS = [
    {
        "id": "demo-user-001",
        "email": "demo@histora.com",
        "display_name": "Demo User",
        "full_name": "Demo Test User",
        "role": "user",
        "is_admin": False,
        "credits": 150,
        "total_credits_purchased": 200,
        "total_credits_used": 50,
        "total_tokens": 5000,
        "language_preference": "tr"
    },
    {
        "id": "admin-001",
        "email": "admin@histora.com",
        "display_name": "Admin User",
        "full_name": "Histora Administrator",
        "role": "admin",
        "is_admin": True,
        "credits": 1000,
        "total_credits_purchased": 1000,
        "total_credits_used": 0,
        "total_tokens": 0,
        "language_preference": "tr"
    },
    {
        "id": "user-002",
        "email": "ayse@example.com",
        "display_name": "Ayşe Kaya",
        "full_name": "Ayşe Kaya",
        "role": "user",
        "is_admin": False,
        "credits": 75,
        "total_credits_purchased": 100,
        "total_credits_used": 25,
        "total_tokens": 2500,
        "language_preference": "tr"
    },
    {
        "id": "user-003",
        "email": "mehmet@example.com",
        "display_name": "Mehmet Demir",
        "full_name": "Mehmet Demir",
        "role": "user",
        "is_admin": False,
        "credits": 200,
        "total_credits_purchased": 300,
        "total_credits_used": 100,
        "total_tokens": 10000,
        "language_preference": "tr"
    }
]

MOCK_CHARACTERS = [
    {
        "id": "ataturk-001",
        "name": "Mustafa Kemal Atatürk",
        "title": "Türkiye Cumhuriyeti Kurucusu",
        "birth_year": 1881,
        "death_year": 1938,
        "nationality": "Turkish",
        "category": "leaders",
        "description": "Türkiye Cumhuriyeti'nin kurucusu ve ilk Cumhurbaşkanı. Modern Türkiye'nin mimarı.",
        "avatar_url": "/avatars/ataturk.jpg",
        "system_prompt": "Sen Mustafa Kemal Atatürk'sün. Türkiye Cumhuriyeti'nin kurucusu ve ilk Cumhurbaşkanı olarak, modern Türkiye'nin temellerini atmış vizyoner bir lidersin.",
        "personality_traits": ["vizyoner", "kararlı", "modernist", "lider", "reformcu"],
        "speaking_style": "Kararlı, net ve ilham verici",
        "is_published": True,
        "is_featured": True
    },
    {
        "id": "mevlana-001",
        "name": "Mevlana Celaleddin Rumi",
        "title": "Büyük Mutasavvıf",
        "birth_year": 1207,
        "death_year": 1273,
        "nationality": "Persian",
        "category": "philosophers",
        "description": "Büyük mutasavvıf, şair ve filozof. Sevgi ve hoşgörünün öncüsü.",
        "avatar_url": "/avatars/mevlana.jpg",
        "system_prompt": "Sen Mevlana Celaleddin Rumi'sin. Büyük bir mutasavvıf, şair ve filozof olarak, sevgi, hoşgörü ve birlik mesajını yayıyorsun.",
        "personality_traits": ["sevgi dolu", "hoşgörülü", "bilge", "şair", "mistik"],
        "speaking_style": "Sevgi dolu, bilge ve metaforik",
        "is_published": True,
        "is_featured": True
    },
    {
        "id": "yunus-001",
        "name": "Yunus Emre",
        "title": "Aşık Şair",
        "birth_year": 1238,
        "death_year": 1320,
        "nationality": "Turkish",
        "category": "poets",
        "description": "Türk tasavvuf edebiyatının büyük şairi. Halk şiirinin ustası.",
        "avatar_url": "/avatars/yunus.jpg",
        "system_prompt": "Sen Yunus Emre'sin. Büyük bir aşık şair olarak, sade ve güzel Türkçe ile tasavvufi düşünceleri halka ulaştırıyorsun.",
        "personality_traits": ["alçak gönüllü", "sevgi dolu", "şair", "halkçı", "tasavvufi"],
        "speaking_style": "Sade, güzel ve içten",
        "is_published": True,
        "is_featured": False
    },
    {
        "id": "shakespeare-001",
        "name": "William Shakespeare",
        "title": "The Bard",
        "birth_year": 1564,
        "death_year": 1616,
        "nationality": "English",
        "category": "writers",
        "description": "English playwright, poet, and actor, widely regarded as the greatest writer in the English language.",
        "avatar_url": "/avatars/shakespeare.jpg",
        "system_prompt": "You are William Shakespeare, the greatest playwright and poet in English literature. You speak with eloquence and wisdom.",
        "personality_traits": ["eloquent", "creative", "wise", "dramatic", "poetic"],
        "speaking_style": "Eloquent, poetic and dramatic",
        "is_published": True,
        "is_featured": False
    }
]

MOCK_PRICING_PLANS = [
    {
        "name": "free",
        "display_name": "Ücretsiz",
        "description": "Histora'yı keşfetmek için ideal başlangıç planı",
        "price_monthly": 0,
        "price_yearly": 0,
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
        "display_name": "Temel",
        "description": "Günlük kullanım için uygun plan",
        "price_monthly": 2900,  # 29 TRY
        "price_yearly": 29000,  # 290 TRY (2 months free)
        "monthly_token_limit": 50000,
        "monthly_request_limit": 500,
        "included_credits": 500,
        "rag_access": True,
        "custom_characters": False,
        "priority_support": False,
        "api_access": False,
        "advanced_analytics": False,
        "is_active": True,
        "is_featured": False,
        "sort_order": 2
    },
    {
        "name": "premium",
        "display_name": "Premium",
        "description": "Yoğun kullanım için en popüler plan",
        "price_monthly": 5900,  # 59 TRY
        "price_yearly": 59000,  # 590 TRY (2 months free)
        "monthly_token_limit": 150000,
        "monthly_request_limit": 1500,
        "included_credits": 1500,
        "rag_access": True,
        "custom_characters": True,
        "priority_support": True,
        "api_access": False,
        "advanced_analytics": True,
        "is_active": True,
        "is_featured": True,
        "sort_order": 3
    },
    {
        "name": "unlimited",
        "display_name": "Sınırsız",
        "description": "Kurumsal kullanım için gelişmiş plan",
        "price_monthly": 9900,  # 99 TRY
        "price_yearly": 99000,  # 990 TRY (2 months free)
        "monthly_token_limit": 500000,
        "monthly_request_limit": 5000,
        "included_credits": 5000,
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

MOCK_CREDIT_PACKAGES = [
    {
        "name": "starter",
        "display_name": "Başlangıç",
        "description": "Az kullanım için ideal paket",
        "credit_amount": 100,
        "bonus_credits": 0,
        "total_credits": 100,
        "price": 1500,  # 15 TRY
        "currency": "TRY",
        "is_popular": False,
        "discount_percentage": 0,
        "is_active": True,
        "sort_order": 1
    },
    {
        "name": "popular",
        "display_name": "Popüler",
        "description": "En çok tercih edilen paket",
        "credit_amount": 300,
        "bonus_credits": 50,
        "total_credits": 350,
        "price": 3900,  # 39 TRY
        "original_price": 4500,
        "currency": "TRY",
        "is_popular": True,
        "discount_percentage": 13,
        "is_active": True,
        "sort_order": 2
    },
    {
        "name": "value",
        "display_name": "Değerli",
        "description": "En avantajlı fiyat/kredi oranı",
        "credit_amount": 500,
        "bonus_credits": 100,
        "total_credits": 600,
        "price": 5900,  # 59 TRY
        "original_price": 7500,
        "currency": "TRY",
        "is_popular": False,
        "discount_percentage": 21,
        "is_active": True,
        "sort_order": 3
    },
    {
        "name": "premium",
        "display_name": "Premium",
        "description": "Yoğun kullanım için büyük paket",
        "credit_amount": 1000,
        "bonus_credits": 300,
        "total_credits": 1300,
        "price": 9900,  # 99 TRY
        "original_price": 15000,
        "currency": "TRY",
        "is_popular": False,
        "discount_percentage": 34,
        "is_active": True,
        "sort_order": 4
    }
]

async def create_database_tables(engine):
    """Create all database tables."""
    async with engine.begin() as conn:
        # Drop all tables and recreate (for development)
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database tables created successfully")

async def seed_users(session: AsyncSession):
    """Seed user data."""
    users = []
    for user_data in MOCK_USERS:
        user = User(
            id=uuid.UUID(user_data["id"]) if user_data["id"].count('-') == 4 else uuid.uuid4(),
            email=user_data["email"],
            display_name=user_data["display_name"],
            full_name=user_data["full_name"],
            role=user_data["role"],
            is_admin=user_data["is_admin"],
            credits=user_data["credits"],
            total_credits_purchased=user_data["total_credits_purchased"],
            total_credits_used=user_data["total_credits_used"],
            total_tokens=user_data["total_tokens"],
            language_preference=user_data["language_preference"],
            is_active=True,
            email_verified=True,
            created_at=datetime.utcnow(),
            last_login_at=datetime.utcnow() - timedelta(hours=1)
        )
        users.append(user)
        session.add(user)
    
    await session.commit()
    print(f"✅ Seeded {len(users)} users")
    return users

async def seed_characters(session: AsyncSession):
    """Seed character data."""
    characters = []
    for char_data in MOCK_CHARACTERS:
        character = Character(
            id=char_data["id"],
            name=char_data["name"],
            title=char_data["title"],
            birth_year=char_data["birth_year"],
            death_year=char_data["death_year"],
            nationality=char_data["nationality"],
            category=char_data["category"],
            description=char_data["description"],
            avatar_url=char_data["avatar_url"],
            system_prompt=char_data["system_prompt"],
            personality_traits=char_data["personality_traits"],
            speaking_style=char_data["speaking_style"],
            supported_languages=["tr", "en"],
            is_published=char_data["is_published"],
            is_featured=char_data["is_featured"],
            created_at=datetime.utcnow()
        )
        characters.append(character)
        session.add(character)
    
    await session.commit()
    print(f"✅ Seeded {len(characters)} characters")
    return characters

async def seed_pricing_plans(session: AsyncSession):
    """Seed pricing plan data."""
    plans = []
    for plan_data in MOCK_PRICING_PLANS:
        plan = PricingPlan(
            name=plan_data["name"],
            display_name=plan_data["display_name"],
            description=plan_data["description"],
            price_monthly=plan_data["price_monthly"],
            price_yearly=plan_data["price_yearly"],
            monthly_token_limit=plan_data["monthly_token_limit"],
            monthly_request_limit=plan_data["monthly_request_limit"],
            included_credits=plan_data["included_credits"],
            rag_access=plan_data["rag_access"],
            custom_characters=plan_data["custom_characters"],
            priority_support=plan_data["priority_support"],
            api_access=plan_data["api_access"],
            advanced_analytics=plan_data["advanced_analytics"],
            is_active=plan_data["is_active"],
            is_featured=plan_data["is_featured"],
            sort_order=plan_data["sort_order"],
            created_at=datetime.utcnow()
        )
        plans.append(plan)
        session.add(plan)
    
    await session.commit()
    print(f"✅ Seeded {len(plans)} pricing plans")
    return plans

async def seed_credit_packages(session: AsyncSession):
    """Seed credit package data."""
    packages = []
    for package_data in MOCK_CREDIT_PACKAGES:
        package = CreditPackage(
            name=package_data["name"],
            display_name=package_data["display_name"],
            description=package_data["description"],
            credit_amount=package_data["credit_amount"],
            bonus_credits=package_data["bonus_credits"],
            total_credits=package_data["total_credits"],
            price=package_data["price"],
            original_price=package_data.get("original_price"),
            currency=package_data["currency"],
            is_popular=package_data["is_popular"],
            discount_percentage=package_data["discount_percentage"],
            is_active=package_data["is_active"],
            sort_order=package_data["sort_order"],
            created_at=datetime.utcnow()
        )
        packages.append(package)
        session.add(package)
    
    await session.commit()
    print(f"✅ Seeded {len(packages)} credit packages")
    return packages

async def seed_user_quotas(session: AsyncSession, users: List[User], plans: List[PricingPlan]):
    """Seed user quota data."""
    quotas = []
    for user in users:
        # Assign different plans to different users
        if user.email == "admin@histora.com":
            plan = next(p for p in plans if p.name == "unlimited")
        elif user.email == "mehmet@example.com":
            plan = next(p for p in plans if p.name == "premium")
        elif user.email == "ayse@example.com":
            plan = next(p for p in plans if p.name == "basic")
        else:
            plan = next(p for p in plans if p.name == "free")
        
        quota = UserQuota(
            user_id=user.id,
            plan_type=plan.name,
            monthly_token_limit=plan.monthly_token_limit,
            monthly_request_limit=plan.monthly_request_limit,
            current_month_tokens=user.total_tokens % 10000,  # Some usage
            current_month_requests=user.total_tokens // 100,  # Approximate requests
            current_month_cost=user.total_credits_used * 10,  # 10 cents per credit
            billing_cycle_start=datetime.utcnow() - timedelta(days=15),
            last_reset_date=datetime.utcnow() - timedelta(days=15),
            rag_access=plan.rag_access,
            custom_characters=plan.custom_characters,
            priority_support=plan.priority_support,
            created_at=datetime.utcnow()
        )
        quotas.append(quota)
        session.add(quota)
    
    await session.commit()
    print(f"✅ Seeded {len(quotas)} user quotas")
    return quotas

async def seed_credit_transactions(session: AsyncSession, users: List[User], packages: List[CreditPackage]):
    """Seed credit transaction data."""
    transactions = []
    for user in users:
        if user.total_credits_purchased > 0:
            # Add purchase transaction
            popular_package = next(p for p in packages if p.name == "popular")
            purchase_transaction = CreditTransaction(
                user_id=user.id,
                transaction_type="purchase",
                amount=popular_package.total_credits,
                balance_after=user.credits + popular_package.total_credits,
                payment_amount=popular_package.price,
                payment_currency="TRY",
                payment_provider="stripe",
                payment_reference=f"pi_{uuid.uuid4().hex[:24]}",
                package_name=popular_package.display_name,
                bonus_credits=popular_package.bonus_credits,
                description=f"{popular_package.display_name} paketi satın alındı",
                created_at=datetime.utcnow() - timedelta(days=10)
            )
            transactions.append(purchase_transaction)
            session.add(purchase_transaction)
        
        if user.total_credits_used > 0:
            # Add usage transactions
            for i in range(3):  # 3 different usage sessions
                usage_transaction = CreditTransaction(
                    user_id=user.id,
                    transaction_type="usage",
                    amount=-(user.total_credits_used // 3),
                    balance_after=user.credits,
                    tokens_consumed=(user.total_tokens // 3),
                    character_id="ataturk-001" if i % 2 == 0 else "mevlana-001",
                    description=f"Karakterle sohbet - {user.total_credits_used // 3} kredi kullanıldı",
                    created_at=datetime.utcnow() - timedelta(days=5-i)
                )
                transactions.append(usage_transaction)
                session.add(usage_transaction)
    
    await session.commit()
    print(f"✅ Seeded {len(transactions)} credit transactions")

async def main():
    """Main seeding function."""
    print("🌱 Starting database seeding...")
    
    # Create async engine
    database_url = settings.database_url.replace("postgresql://", "postgresql+asyncpg://")
    engine = create_async_engine(
        database_url,
        echo=True
    )
    
    # Create session factory
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    try:
        # Create tables
        await create_database_tables(engine)
        
        # Seed data
        async with async_session() as session:
            users = await seed_users(session)
            characters = await seed_characters(session)
            plans = await seed_pricing_plans(session)
            packages = await seed_credit_packages(session)
            quotas = await seed_user_quotas(session, users, plans)
            await seed_credit_transactions(session, users, packages)
        
        print("🎉 Database seeding completed successfully!")
        print("\n📊 Seeded data summary:")
        print(f"   • {len(MOCK_USERS)} users")
        print(f"   • {len(MOCK_CHARACTERS)} characters")
        print(f"   • {len(MOCK_PRICING_PLANS)} pricing plans")
        print(f"   • {len(MOCK_CREDIT_PACKAGES)} credit packages")
        print(f"   • User quotas and credit transactions")
        
        print("\n🔑 Admin credentials:")
        print("   Email: admin@histora.com")
        print("   Password: admin123")
        
        print("\n👤 Demo user credentials:")
        print("   Email: demo@histora.com")
        print("   Password: demo123")
        
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        raise
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())