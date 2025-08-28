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
    print("👑 Creating Super Admin User for Histora...")
    print("=" * 50)
    
    try:
        session_gen = get_async_session()
        db = await session_gen.__anext__()
        
        try:
            # Super admin user details
            admin_email = "superadmin@histora.com"
            admin_password = "HistoraSuperAdmin2025#"
            admin_name = "Histora Super Administrator"
            
            print(f"📧 Email: {admin_email}")
            print(f"🔑 Password: {admin_password}")
            print(f"👤 Full Name: {admin_name}")
            print(f"🛡️  Role: super_admin")
            print(f"📅 Creation Time: {__import__('datetime').datetime.now().isoformat()}")
            print("-" * 50)
            
            # Check if super admin already exists
            existing_admin = await auth_service.get_user_by_email(admin_email, db)
            
            if existing_admin:
                print(f"⚠️  Super admin user already exists: {admin_email}")
                print(f"   User ID: {existing_admin.id}")
                print(f"   Role: {existing_admin.role}")
                print(f"   Is Admin: {existing_admin.is_admin}")
                print(f"   Active: {existing_admin.is_active}")
                print(f"   Created At: {existing_admin.created_at}")
                print(f"   Last Login: {existing_admin.last_login_at or 'Never'}")
                
                # Update existing user to super admin if needed
                if existing_admin.role != "admin" or not existing_admin.is_admin:
                    print("\n🔄 Updating existing user to super admin...")
                    existing_admin.role = "admin"
                    existing_admin.is_admin = True
                    await db.commit()
                    await db.refresh(existing_admin)
                    print("✅ User updated to super admin status!")
                return existing_admin
            
            # Create super admin user
            print("\n🚀 Creating new super admin user...")
            admin_user = await auth_service.create_user(
                email=admin_email,
                password=admin_password,
                full_name=admin_name,
                role="admin",
                db=db
            )
            
            print("\n✅ Super Admin User Created Successfully!")
            print("=" * 50)
            print(f"   🆔 User ID: {admin_user.id}")
            print(f"   📧 Email: {admin_user.email}")
            print(f"   👤 Full Name: {admin_user.full_name}")
            print(f"   🛡️  Role: {admin_user.role}")
            print(f"   🔐 Is Admin: {admin_user.is_admin}")
            print(f"   ✅ Is Active: {admin_user.is_active}")
            print(f"   ✉️  Email Verified: {admin_user.email_verified}")
            print(f"   📅 Created At: {admin_user.created_at}")
            print(f"   🔄 Updated At: {admin_user.updated_at}")
            print(f"   🌐 Language: {admin_user.language_preference}")
            
            # Test login
            print("\n🔐 Testing Super Admin Login...")
            print("-" * 30)
            authenticated_user = await auth_service.authenticate_user(
                email=admin_email,
                password=admin_password,
                db=db
            )
            
            if authenticated_user:
                print("✅ Super Admin login test SUCCESSFUL!")
                
                # Create access token
                token_data = {
                    "user_id": str(authenticated_user.id),
                    "email": authenticated_user.email,
                    "role": authenticated_user.role,
                    "is_admin": authenticated_user.is_admin
                }
                
                access_token = auth_service.create_access_token(token_data)
                print(f"\n🎫 Access Token Generated:")
                print(f"   Token (first 50 chars): {access_token[:50]}...")
                print(f"   Token Length: {len(access_token)} characters")
                print(f"   Token Type: Bearer")
                print(f"   Expires In: {auth_service.token_expire_minutes} minutes")
                
                # Store token for immediate use
                with open("super_admin_token.txt", "w") as f:
                    f.write(access_token)
                print(f"   💾 Token saved to: super_admin_token.txt")
                
            else:
                print("❌ Super Admin login test FAILED!")
                
            return admin_user
            
        finally:
            await db.close()
            
    except Exception as e:
        print(f"❌ Failed to create super admin user: {e}")
        import traceback
        traceback.print_exc()
        return None
            
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

async def display_system_info():
    """Display comprehensive system information for the super admin."""
    print("\n\n" + "="*60)
    print("📊 HISTORA SUPER ADMIN SYSTEM INFORMATION")
    print("="*60)
    
    try:
        session_gen = get_async_session()
        db = await session_gen.__anext__()
        
        try:
            from sqlalchemy import text
            
            # Database info
            print("\n💾 DATABASE INFORMATION:")
            print("-" * 30)
            
            # Count users by role
            result = await db.execute(text("SELECT role, COUNT(*) as count FROM users GROUP BY role"))
            user_counts = result.fetchall()
            total_users = sum(row.count for row in user_counts)
            
            print(f"   Total Users: {total_users}")
            for row in user_counts:
                print(f"   - {row.role.title()} Users: {row.count}")
            
            # Count characters
            try:
                result = await db.execute(text("SELECT COUNT(*) as count FROM characters"))
                character_count = result.scalar()
                print(f"   Total Characters: {character_count}")
            except:
                print(f"   Total Characters: N/A (table may not exist)")
            
            # Count active sessions
            try:
                result = await db.execute(text("SELECT COUNT(*) as count FROM chat_sessions WHERE created_at > NOW() - INTERVAL '24 hours'"))
                recent_sessions = result.scalar()
                print(f"   Recent Sessions (24h): {recent_sessions}")
            except:
                print(f"   Recent Sessions (24h): N/A (table may not exist)")
            
            # System capabilities
            print("\n🛠️ SUPER ADMIN CAPABILITIES:")
            print("-" * 30)
            print("   ✅ User Management (Create, Update, Delete, Deactivate)")
            print("   ✅ Character Management (Create, Update, Publish)")
            print("   ✅ System Settings Configuration")
            print("   ✅ Pricing Plans & Credit Package Management")
            print("   ✅ Usage Statistics & Analytics")
            print("   ✅ Admin Panel Full Access")
            print("   ✅ API Administration")
            print("   ✅ Database Administration")
            
            # API endpoints available
            print("\n🌐 ADMIN API ENDPOINTS:")
            print("-" * 30)
            print("   POST /api/v1/admin/login - Admin authentication")
            print("   GET  /api/v1/admin/users - List all users")
            print("   POST /api/v1/admin/users - Create new user")
            print("   PUT  /api/v1/admin/users/{id} - Update user")
            print("   GET  /api/v1/admin/characters - Manage characters")
            print("   POST /api/v1/admin/characters - Create characters")
            print("   GET  /api/v1/admin/stats - System statistics")
            print("   GET  /api/v1/admin/pricing-plans - Pricing management")
            print("   POST /api/v1/admin/pricing-plans - Create plans")
            print("   GET  /api/v1/admin/credit-packages - Credit management")
            
            # Environment info
            print("\n🌍 ENVIRONMENT INFORMATION:")
            print("-" * 30)
            print(f"   Environment: {os.getenv('ENVIRONMENT', 'Not Set')}")
            print(f"   Debug Mode: {os.getenv('DEBUG', 'Not Set')}")
            print(f"   Database URL: {os.getenv('DATABASE_URL', 'Not Set')[:50]}...")
            print(f"   Backend URL: {os.getenv('BACKEND_URL', 'http://localhost:8000')}")
            print(f"   Frontend URL: {os.getenv('FRONTEND_URL', 'http://localhost:3000')}")
            
        finally:
            await db.close()
            
    except Exception as e:
        print(f"❌ Failed to get system info: {e}")

if __name__ == "__main__":
    print("🚀 HISTORA SUPER ADMIN CREATION SCRIPT")
    print("=" * 50)
    print("📅 Timestamp:", __import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    print("💾 Script Location:", __file__)
    print("🌐 Environment:", os.getenv('ENVIRONMENT', 'development'))
    print()
    
    async def main():
        # Create super admin
        admin_user = await create_admin_user()
        
        if admin_user:
            # Display system information
            await display_system_info()
            
            # Create test users
            await create_test_users()
            
            print("\n\n" + "="*60)
            print("🎉 SUPER ADMIN CREATION COMPLETED SUCCESSFULLY!")
            print("="*60)
            print("🔑 LOGIN CREDENTIALS:")
            print(f"   Email: superadmin@histora.com")
            print(f"   Password: HistoraSuperAdmin2025#")
            print()
            print("🌐 ACCESS POINTS:")
            print(f"   Admin Panel: http://localhost:3000/admin")
            print(f"   API Docs: http://localhost:8000/docs")
            print(f"   Main App: http://localhost:3000")
            print()
            print("💾 TOKEN FILE: super_admin_token.txt")
            print("   Use this token for API authentication")
            print("="*60)
        else:
            print("❌ Super admin creation failed!")
    
    asyncio.run(main())
