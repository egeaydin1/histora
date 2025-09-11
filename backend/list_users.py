#!/usr/bin/env python3
"""
List existing users in the database.
"""
import asyncio
import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import DatabaseManager
from sqlalchemy import text

async def list_users():
    """List existing users."""
    print("👥 Listing existing users...")
    
    db_manager = DatabaseManager()
    engine = db_manager.get_async_engine()
    
    try:
        async with engine.begin() as conn:
            result = await conn.execute(text('SELECT email FROM users'))
            users = result.fetchall()
            print("Existing users:")
            for user in users:
                print(f"  📧 {user.email}")
                
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(list_users())