#!/usr/bin/env python3
"""
Quick script to create a test user on Railway
"""
import asyncio
import sys
import os
from pathlib import Path

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent / "backend"))

async def create_test_user():
    """Create test user on Railway."""
    try:
        from backend.app.core.database import get_async_session
        from backend.app.services.auth_service import auth_service
        
        print("🧪 Creating test user on Railway...")
        
        session_gen = get_async_session()
        db = await session_gen.__anext__()
        
        try:
            # Create test user
            test_email = "egea123i@gmail.com"
            test_password = "test123456"
            test_name = "Test User"
            
            # Check if user exists
            existing_user = await auth_service.get_user_by_email(test_email, db)
            
            if existing_user:
                print(f"✅ User already exists: {test_email}")
                print(f"🔑 Password: {test_password}")
                return
            
            # Create new user
            user = await auth_service.create_user(
                email=test_email,
                password=test_password,
                full_name=test_name,
                role="user",
                db=db
            )
            
            print(f"✅ Test user created: {test_email}")
            print(f"🔑 Password: {test_password}")
            print(f"👤 Name: {test_name}")
            print(f"🆔 User ID: {user.id}")
            
        finally:
            await db.close()
            
    except Exception as e:
        print(f"❌ Error creating test user: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(create_test_user())
