#!/usr/bin/env python3
"""
Railway internal API test - bypasses HTTP and tests directly.
"""
import asyncio
import sys
from pathlib import Path

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

async def test_auth_direct():
    """Test authentication directly without HTTP."""
    print("🔐 Testing authentication directly...")
    
    try:
        from app.core.database import get_async_session
        from app.services.auth_service import auth_service
        from app.services.firebase_service import firebase_service
        
        # Test user creation
        session_gen = get_async_session()
        db = await session_gen.__anext__()
        
        try:
            test_email = "test@railway.com"
            test_password = "test123456"
            
            # Check if user exists
            existing_user = await auth_service.get_user_by_email(test_email, db)
            
            if not existing_user:
                # Create user
                user = await auth_service.create_user(
                    email=test_email,
                    password=test_password,
                    full_name="Railway Test User",
                    role="user",
                    db=db
                )
                print(f"✅ Created test user: {test_email}")
            else:
                user = existing_user
                print(f"✅ Using existing user: {test_email}")
            
            # Test authentication
            authenticated_user = await auth_service.authenticate_user(
                test_email, test_password, db
            )
            
            if authenticated_user:
                print("✅ User authentication successful")
                
                # Test token creation
                token_data = {
                    "user_id": str(user.id),
                    "email": user.email,
                    "role": user.role
                }
                
                token = auth_service.create_access_token(token_data)
                if token:
                    print("✅ JWT token creation successful")
                    
                    # Test token verification
                    try:
                        verified_data = auth_service.verify_token(token)
                        if verified_data:
                            print("✅ JWT token verification successful")
                        else:
                            print("❌ JWT token verification failed")
                    except Exception as e:
                        print(f"❌ JWT token verification error: {e}")
                else:
                    print("❌ JWT token creation failed")
            else:
                print("❌ User authentication failed")
                
        finally:
            await db.close()
            
    except Exception as e:
        print(f"❌ Direct auth test failed: {e}")
        import traceback
        traceback.print_exc()

async def test_firebase_direct():
    """Test Firebase service directly."""
    print("🔥 Testing Firebase directly...")
    
    try:
        from app.services.firebase_service import firebase_service
        
        # Test status
        status = firebase_service.get_status()
        print(f"📊 Firebase status: {status}")
        
        if status.get("initialized"):
            print("✅ Firebase initialized")
            
            # Test mock token (since we don't have real Firebase tokens in Railway)
            mock_token = "firebase-mock-test123"
            result = await firebase_service.verify_firebase_token(mock_token)
            
            if result:
                print(f"✅ Mock Firebase token verified: {result.get('email')}")
            else:
                print("⚠️  Mock Firebase token not verified (expected in production)")
        else:
            print("❌ Firebase not initialized")
            
    except Exception as e:
        print(f"❌ Firebase direct test failed: {e}")

async def run_railway_internal_tests():
    """Run all Railway internal tests."""
    print("🚀 RAILWAY INTERNAL TEST SUITE")
    print("=" * 50)
    
    tests = [
        ("Direct Authentication Test", test_auth_direct),
        ("Direct Firebase Test", test_firebase_direct),
    ]
    
    for test_name, test_func in tests:
        print(f"\n🧪 Running: {test_name}")
        try:
            await test_func()
        except Exception as e:
            print(f"❌ {test_name} crashed: {e}")
    
    print("\n🎉 Railway internal tests completed!")

if __name__ == "__main__":
    asyncio.run(run_railway_internal_tests())
