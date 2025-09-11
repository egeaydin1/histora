#!/usr/bin/env python3
"""
Check user password hashes.
"""
import asyncio
import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import DatabaseManager
from sqlalchemy import text

async def check_user_password(email: str):
    """Check user password hash."""
    print(f"🔍 Checking password for user: {email}")
    
    db_manager = DatabaseManager()
    engine = db_manager.get_async_engine()
    
    try:
        async with engine.begin() as conn:
            result = await conn.execute(
                text('SELECT email, password_hash FROM users WHERE email = :email'),
                {"email": email}
            )
            user = result.fetchone()
            
            if user:
                print(f"✅ User found:")
                print(f"   Email: {user.email}")
                print(f"   Password hash: {user.password_hash}")
                return user.password_hash
            else:
                print(f"❌ User not found: {email}")
                return None
                
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    if len(sys.argv) > 1:
        email = sys.argv[1]
    else:
        email = "demo@histora.com"
    
    asyncio.run(check_user_password(email))