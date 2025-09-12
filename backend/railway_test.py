#!/usr/bin/env python3
"""
Simple Railway connectivity test for Histora backend.
"""
import os
import asyncio
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

async def test_railway_connection():
    """Test Railway database connection."""
    print("🧪 RAILWAY CONNECTION TEST")
    print("=" * 40)
    
    # Check environment
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        print("❌ DATABASE_URL not found!")
        print("💡 This script should be run on Railway with DATABASE_URL set")
        return False
    
    print(f"🔗 DATABASE_URL: {database_url[:50]}...")
    
    try:
        # Test database connection
        from app.core.database import engine
        from sqlalchemy import text
        
        print("🔌 Testing database connection...")
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT 1 as test"))
            row = result.fetchone()
            if row and row[0] == 1:
                print("✅ Database connection successful!")
            else:
                print("❌ Database connection failed!")
                return False
                
        # Test table existence
        print("📋 Checking if tables exist...")
        async with engine.begin() as conn:
            result = await conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name
            """))
            tables = [row[0] for row in result.fetchall()]
            
            if tables:
                print(f"✅ Found {len(tables)} tables:")
                for table in tables:
                    print(f"   - {table}")
            else:
                print("⚠️  No tables found - run railway_setup.py first")
                
        print("🎉 Railway test completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Railway test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_railway_connection())
    
    if not success:
        sys.exit(1)
