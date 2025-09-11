#!/usr/bin/env python3
"""
Database test and setup script for Histora.
This script tests the database connection and creates necessary tables.
"""

import asyncio
import sys
import os
from pathlib import Path

# Add the app directory to the path
backend_dir = Path(__file__).parent
app_dir = backend_dir / "app"
sys.path.insert(0, str(backend_dir))

async def main():
    """Main function to test database connection and setup."""
    
    print("🔍 Testing Histora Database Connection...")
    print("=" * 50)
    
    try:
        # Import after adding to path
        from app.core.database import db_manager
        from app.core.config import get_settings
        from app.models.database import Base
        
        settings = get_settings()
        
        print(f"📋 Database Configuration:")
        print(f"   Host: {settings.db_host}")
        print(f"   Port: {settings.db_port}")
        print(f"   Database: {settings.db_name}")
        print(f"   User: {settings.db_user}")
        
        # Test connection
        print(f"\n🔗 Testing database connection...")
        connection_ok = await db_manager.test_connection()
        
        if connection_ok:
            print("✅ Database connection successful!")
        else:
            print("❌ Database connection failed!")
            return False
        
        # Create tables
        print(f"\n📊 Creating database tables...")
        tables_created = await db_manager.create_tables()
        
        if tables_created:
            print("✅ Database tables created successfully!")
        else:
            print("❌ Failed to create database tables!")
            return False
        
        # List created tables
        print(f"\n📋 Available tables:")
        engine = db_manager.get_async_engine()
        async with engine.begin() as conn:
            from sqlalchemy import text
            result = await conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name;
            """))
            tables = [row[0] for row in result.fetchall()]
            
            for table in tables:
                print(f"   ✓ {table}")
        
        print(f"\n🎉 Database setup completed successfully!")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Make sure you've activated the virtual environment and installed dependencies:")
        print("   source venv/bin/activate")
        print("   pip install -r requirements.txt")
        return False
        
    except Exception as e:
        print(f"❌ Database error: {e}")
        print(f"\nTroubleshooting:")
        print(f"1. Make sure PostgreSQL is running: docker-compose up -d")
        print(f"2. Check database credentials in .env file")
        print(f"3. Verify port 5433 is accessible")
        return False

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)