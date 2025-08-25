#!/usr/bin/env python3
"""
Simple script to create demo user.
"""
import asyncio
import sys
import os
import uuid

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import DatabaseManager
from app.services.auth_service import auth_service
from sqlalchemy import text

async def create_demo_user():
    """Create demo user for testing."""
    print("🎭 Creating Demo User...")
    
    db_manager = DatabaseManager()
    engine = db_manager.get_async_engine()
    
    try:
        async with engine.begin() as conn:
            # Check if demo user exists
            result = await conn.execute(
                text("SELECT email FROM users WHERE email = 'demo@histora.com'")
            )
            existing = result.fetchone()
            
            if existing:
                print("⚠️  Demo user already exists: demo@histora.com")
                return
            
            # Hash password
            password_hash = auth_service.hash_password("demo123")
            
            # Generate UUID for user
            user_id = str(uuid.uuid4())
            
            # Create demo user
            await conn.execute(
                text("""
                    INSERT INTO users (
                        id, firebase_uid, email, password_hash, display_name, 
                        full_name, role, is_admin, is_active, email_verified
                    ) VALUES (
                        :id, :firebase_uid, :email, :password_hash, :display_name,
                        :full_name, :role, :is_admin, :is_active, :email_verified
                    )
                """),
                {
                    "id": user_id,
                    "firebase_uid": "demo-user-uuid",
                    "email": "demo@histora.com",
                    "password_hash": password_hash,
                    "display_name": "Demo User",
                    "full_name": "Demo User",
                    "role": "user",
                    "is_admin": False,
                    "is_active": True,
                    "email_verified": True
                }
            )
            
            await conn.commit()
            print("✅ Demo user created successfully!")
            print("   📧 Email: demo@histora.com")
            print("   🔑 Password: demo123")
            
    except Exception as e:
        print(f"❌ Failed to create demo user: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(create_demo_user())
