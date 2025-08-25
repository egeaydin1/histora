#!/usr/bin/env python3
"""
Create admin user for Histora.
"""
import os
import asyncio
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Set environment variables for testing
os.environ.update({
    "DATABASE_URL": "postgresql://histora:histora123@localhost:5433/histora",
    "ENVIRONMENT": "development",
    "DEBUG": "true"
})

from app.core.database import get_async_session
from app.services.auth_service import auth_service

async def create_admin_user():
    """Create admin user for Histora."""
    print("👑 Creating Admin User for Histora...")
    
    try:
        session_gen = get_async_session()
        db = await session_gen.__anext__()
        
        try:
            # Admin user details
            admin_email = "admin@histora.com"
            admin_password = "histora2025!"
            admin_name = "Histora Admin"
            
            print(f"📧 Email: {admin_email}")
            print(f"🔑 Password: {admin_password}")
            print(f"👤 Name: {admin_name}")
            
            # Check if admin already exists
            existing_admin = await auth_service.get_user_by_email(admin_email, db)
            
            if existing_admin:
                print(f"⚠️  Admin user already exists: {admin_email}")
                print(f"   User ID: {existing_admin.id}")
                print(f"   Role: {existing_admin.role}")
                print(f"   Active: {existing_admin.is_active}")
                return
            
            # Create admin user
            admin_user = await auth_service.create_user(
                email=admin_email,
                password=admin_password,
                full_name=admin_name,
                role="admin",
                db=db
            )
            
            print(f"✅ Admin user created successfully!")
            print(f"   User ID: {admin_user.id}")
            print(f"   Email: {admin_user.email}")
            print(f"   Role: {admin_user.role}")
            print(f"   Is Admin: {admin_user.is_admin}")
            print(f"   Created At: {admin_user.created_at}")
            
            # Test login
            print("\n🔐 Testing admin login...")
            authenticated_user = await auth_service.authenticate_user(
                email=admin_email,
                password=admin_password,
                db=db
            )
            
            if authenticated_user:
                print("✅ Admin login test successful!")
                
                # Create access token
                token_data = {
                    "user_id": authenticated_user.id,
                    "email": authenticated_user.email,
                    "role": authenticated_user.role,
                    "is_admin": authenticated_user.is_admin
                }
                
                access_token = auth_service.create_access_token(token_data)
                print(f"🎫 Access Token: {access_token[:50]}...")
                
            else:
                print("❌ Admin login test failed!")
            
        finally:
            await db.close()
            
    except Exception as e:
        print(f"❌ Failed to create admin user: {e}")
        import traceback
        traceback.print_exc()

async def create_test_users():
    """Create some test users."""
    print("\n👥 Creating Test Users...")
    
    try:
        session_gen = get_async_session()
        db = await session_gen.__anext__()
        
        try:
            test_users = [
                {
                    "email": "demo@histora.com",
                    "password": "demo123",
                    "full_name": "Demo User",
                    "role": "user"
                },
                {
                    "email": "moderator@histora.com",
                    "password": "moderator123!",
                    "full_name": "Test Moderator",
                    "role": "moderator"
                },
                {
                    "email": "user@histora.com", 
                    "password": "user123!",
                    "full_name": "Test User",
                    "role": "user"
                }
            ]
            
            for user_data in test_users:
                # Check if user exists
                existing_user = await auth_service.get_user_by_email(user_data["email"], db)
                
                if existing_user:
                    print(f"⚠️  User already exists: {user_data['email']}")
                    continue
                
                # Create user
                user = await auth_service.create_user(
                    email=user_data["email"],
                    password=user_data["password"],
                    full_name=user_data["full_name"],
                    role=user_data["role"],
                    db=db
                )
                
                print(f"✅ Created {user_data['role']}: {user.email}")
            
        finally:
            await db.close()
            
    except Exception as e:
        print(f"❌ Failed to create test users: {e}")

if __name__ == "__main__":
    asyncio.run(create_admin_user())
    asyncio.run(create_test_users())
