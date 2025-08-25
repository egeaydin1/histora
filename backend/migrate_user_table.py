#!/usr/bin/env python3
"""
Migration script to add new fields to the User table.
"""
import asyncio
import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import DatabaseManager
from sqlalchemy import text

async def migrate_user_table():
    """Add new columns to the users table."""
    db_manager = DatabaseManager()
    engine = db_manager.get_async_engine()
    
    migrations = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;",
        "UPDATE users SET role = 'admin' WHERE is_admin = TRUE;",
        "UPDATE users SET role = 'user' WHERE is_admin = FALSE;"
    ]
    
    async with engine.begin() as conn:
        for migration in migrations:
            print(f"Running: {migration}")
            try:
                await conn.execute(text(migration))
                print("✅ Success")
            except Exception as e:
                print(f"❌ Error: {e}")
                # Continue with other migrations
        
        await conn.commit()
    
    print("🚀 User table migration completed!")

if __name__ == "__main__":
    asyncio.run(migrate_user_table())
