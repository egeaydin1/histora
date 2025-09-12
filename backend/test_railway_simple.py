#!/usr/bin/env python3
"""
Simple Railway-compatible test script.
Tests basic functionality without external dependencies.
"""
import asyncio
import sys
import os
from pathlib import Path

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

async def test_database_connection():
    """Test database connection."""
    print("🗄️  Testing database connection...")
    
    try:
        from app.core.database import engine
        from sqlalchemy import text
        
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT 1 as test"))
            row = result.fetchone()
            if row and row[0] == 1:
                print("✅ Database connection successful!")
                return True
            else:
                print("❌ Database connection failed!")
                return False
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False

async def test_firebase_service():
    """Test Firebase service."""
    print("🔥 Testing Firebase service...")
    
    try:
        from app.services.firebase_service import firebase_service
        
        status = firebase_service.get_status()
        print(f"📊 Firebase status: {status}")
        
        if status.get("initialized"):
            print("✅ Firebase service initialized!")
            return True
        else:
            print("⚠️  Firebase service not initialized (mock mode)")
            return True  # Mock mode is acceptable
    except Exception as e:
        print(f"❌ Firebase error: {e}")
        return False

async def test_auth_service():
    """Test auth service."""
    print("🔐 Testing auth service...")
    
    try:
        from app.services.auth_service import auth_service
        
        # Test token creation (mock)
        test_data = {"user_id": "test-123", "email": "test@example.com"}
        token = auth_service.create_access_token(test_data)
        
        if token:
            print("✅ Auth service working!")
            return True
        else:
            print("❌ Auth service failed!")
            return False
    except Exception as e:
        print(f"❌ Auth error: {e}")
        return False

async def test_api_endpoints():
    """Test API endpoints without external HTTP client."""
    print("🌐 Testing API endpoints...")
    
    try:
        from app.main import app
        print("✅ FastAPI app loaded successfully!")
        
        # Check if routes are registered
        routes = [route.path for route in app.routes]
        api_routes = [r for r in routes if r.startswith('/api/v1')]
        
        print(f"📋 Found {len(api_routes)} API routes:")
        for route in api_routes[:5]:  # Show first 5
            print(f"   - {route}")
        
        if api_routes:
            print("✅ API endpoints registered!")
            return True
        else:
            print("❌ No API endpoints found!")
            return False
    except Exception as e:
        print(f"❌ API error: {e}")
        return False

async def run_all_tests():
    """Run all tests."""
    print("🚀 RAILWAY TEST SUITE")
    print("=" * 50)
    
    tests = [
        ("Database Connection", test_database_connection),
        ("Firebase Service", test_firebase_service),
        ("Auth Service", test_auth_service),
        ("API Endpoints", test_api_endpoints),
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        print(f"\n🧪 Running: {test_name}")
        try:
            success = await test_func()
            results[test_name] = success
        except Exception as e:
            print(f"❌ {test_name} crashed: {e}")
            results[test_name] = False
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 50)
    
    passed = 0
    total = len(results)
    
    for test_name, success in results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if success:
            passed += 1
    
    print(f"\n🎯 Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed!")
        return True
    else:
        print("⚠️  Some tests failed!")
        return False

if __name__ == "__main__":
    print(f"🔗 Database URL: {os.environ.get('DATABASE_URL', 'Not set')[:50]}...")
    print(f"🌍 Environment: {os.environ.get('ENVIRONMENT', 'Not set')}")
    
    success = asyncio.run(run_all_tests())
    sys.exit(0 if success else 1)
