#!/usr/bin/env python3
"""
Railway-compatible setup script for Histora backend.
Creates database tables and admin user using Railway's PostgreSQL.
"""
import os
import asyncio
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

def check_environment():
    """Check if we have the necessary environment variables."""
    required_vars = ["DATABASE_URL"]
    missing_vars = []
    
    for var in required_vars:
        if not os.environ.get(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        print("🔧 Please set these variables in Railway dashboard:")
        for var in missing_vars:
            print(f"   - {var}")
        return False
    
    print(f"✅ Environment check passed")
    print(f"🔗 DATABASE_URL: {os.environ.get('DATABASE_URL')[:50]}...")
    return True

async def setup_database():
    """Set up database tables and admin user."""
    if not check_environment():
        return False
    
    try:
        # Import after environment check
        from app.core.database import engine
        from app.models.database import Base
        from app.core.database import get_async_session
        from app.services.auth_service import auth_service
        
        print("🔧 Creating database tables...")
        
        # Create tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("✅ Database tables created successfully!")
        
        # Create admin user
        print("👑 Creating admin user...")
        session_gen = get_async_session()
        db = await session_gen.__anext__()
        
        try:
            admin_email = "admin@histora.com"
            admin_password = "HistoraAdmin2025!"
            admin_name = "Histora Administrator"
            
            # Check if admin already exists
            existing_admin = await auth_service.get_user_by_email(admin_email, db)
            
            if existing_admin:
                print(f"⚠️  Admin user already exists: {admin_email}")
            else:
                admin_user = await auth_service.create_user(
                    email=admin_email,
                    password=admin_password,
                    full_name=admin_name,
                    role="admin",
                    db=db
                )
                print(f"✅ Admin user created: {admin_email}")
                print(f"🔑 Password: {admin_password}")
                
        except Exception as e:
            print(f"❌ Failed to create admin user: {e}")
        finally:
            await db.close()
            
        print("🎉 Railway setup completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Database setup failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🚀 HISTORA RAILWAY SETUP")
    print("=" * 50)
    
    success = asyncio.run(setup_database())
    
    if success:
        print("\n✅ Setup completed successfully!")
        print("🌐 Your Histora backend is ready on Railway!")
    else:
        print("\n❌ Setup failed!")
        sys.exit(1)
