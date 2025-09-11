#!/usr/bin/env python3
"""
Test Firebase authentication integration.
"""
import os
import asyncio
import sys
import json
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

async def test_firebase_service():
    """Test Firebase service functionality."""
    print("🔥 Testing Firebase Service...")
    
    try:
        from app.services.firebase_service import firebase_service
        
        # Test service status
        print("\n📊 Firebase Service Status:")
        status = firebase_service.get_status()
        for key, value in status.items():
            print(f"  {key}: {value}")
        
        # Test mock token verification
        print("\n🔐 Testing Token Verification:")
        
        # Test valid mock token
        mock_token = "firebase-mock-test123"
        result = await firebase_service.verify_firebase_token(mock_token)
        if result:
            print(f"✅ Mock token verified: {result['email']}")
        else:
            print("❌ Mock token verification failed")
        
        # Test invalid token
        invalid_token = "invalid-token-123"
        result = await firebase_service.verify_firebase_token(invalid_token)
        if result:
            print(f"❌ Invalid token should not verify: {result}")
        else:
            print("✅ Invalid token correctly rejected")
        
        # Test Firebase user retrieval
        print("\n👤 Testing User Retrieval:")
        user_data = await firebase_service.get_firebase_user("test123")
        if user_data:
            print(f"✅ User data retrieved: {user_data['email']}")
        else:
            print("❌ User data retrieval failed")
        
        # Test custom claims
        print("\n🏷️  Testing Custom Claims:")
        claims_set = await firebase_service.set_custom_claims("test123", {"admin": True})
        if claims_set:
            print("✅ Custom claims set successfully")
        else:
            print("❌ Custom claims setting failed")
        
        # Test custom token creation
        print("\n🎫 Testing Custom Token Creation:")
        custom_token = await firebase_service.create_custom_token("test123", {"role": "admin"})
        if custom_token:
            print(f"✅ Custom token created: {custom_token[:30]}...")
        else:
            print("❌ Custom token creation failed")
        
        print("\n🎉 Firebase service test completed!")
        
    except Exception as e:
        print(f"❌ Firebase service test failed: {e}")
        import traceback
        traceback.print_exc()

async def test_firebase_endpoints():
    """Test Firebase endpoints via HTTP."""
    print("\n🌐 Testing Firebase Endpoints...")
    
    try:
        import aiohttp
        
        base_url = "http://localhost:8000/api/v1/auth"
        
        async with aiohttp.ClientSession() as session:
            # Test Firebase status
            print("\n📊 Testing Firebase status endpoint...")
            async with session.get(f"{base_url}/firebase/status") as resp:
                if resp.status == 200:
                    data = await resp.json()
                    print(f"✅ Firebase status: {data}")
                else:
                    text = await resp.text()
                    print(f"❌ Firebase status failed: {resp.status} - {text}")
            
            # Test Firebase login
            print("\n🔑 Testing Firebase login endpoint...")
            firebase_login_data = {
                "firebase_token": "firebase-mock-test123"
            }
            
            async with session.post(
                f"{base_url}/firebase-login", 
                json=firebase_login_data
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    print(f"✅ Firebase login successful: {data['user']['email']}")
                    print(f"   Token: {data['access_token'][:30]}...")
                    print(f"   Firebase UID: {data['user']['firebase_uid']}")
                else:
                    text = await resp.text()
                    print(f"❌ Firebase login failed: {resp.status} - {text}")
            
            # Test auth health with Firebase info
            print("\n🏥 Testing auth health with Firebase info...")
            async with session.get(f"{base_url}/health") as resp:
                if resp.status == 200:
                    data = await resp.json()
                    print(f"✅ Auth health: {data['auth_methods']}")
                    print(f"   Firebase status: {data['firebase']}")
                else:
                    text = await resp.text()
                    print(f"❌ Auth health failed: {resp.status} - {text}")
        
        print("\n🎉 Firebase endpoints test completed!")
        
    except Exception as e:
        print(f"❌ Firebase endpoints test failed: {e}")
        import traceback
        traceback.print_exc()

async def test_firebase_integration():
    """Test full Firebase integration."""
    print("\n🔄 Testing Firebase Integration Flow...")
    
    try:
        import aiohttp
        
        base_url = "http://localhost:8000/api/v1/auth"
        
        async with aiohttp.ClientSession() as session:
            # Step 1: Firebase login (creates user if doesn't exist)
            print("\n1️⃣ Firebase Login (User Creation)...")
            firebase_login_data = {
                "firebase_token": "firebase-mock-newuser123"
            }
            
            async with session.post(
                f"{base_url}/firebase-login", 
                json=firebase_login_data
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    jwt_token = data['access_token']
                    user_id = data['user']['id']
                    print(f"✅ User created via Firebase: {data['user']['email']}")
                else:
                    text = await resp.text()
                    print(f"❌ Firebase user creation failed: {resp.status} - {text}")
                    return
            
            # Step 2: Use JWT token to access protected endpoint
            print("\n2️⃣ Using JWT Token from Firebase Login...")
            auth_headers = {"Authorization": f"Bearer {jwt_token}"}
            
            async with session.get(f"{base_url}/me", headers=auth_headers) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    print(f"✅ JWT token works: {data['email']} (ID: {data['id']})")
                else:
                    text = await resp.text()
                    print(f"❌ JWT token failed: {resp.status} - {text}")
            
            # Step 3: Test admin endpoints (if user is admin)
            print("\n3️⃣ Testing Admin Access...")
            admin_headers = {"X-Admin-API-Key": "histora-admin-dev-2025"}
            
            async with session.get(f"{base_url}/admin/users", headers=admin_headers) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    firebase_users = [u for u in data if u.get('firebase_uid')]
                    print(f"✅ Found {len(firebase_users)} Firebase-created users")
                else:
                    text = await resp.text()
                    print(f"❌ Admin access failed: {resp.status} - {text}")
        
        print("\n🎉 Firebase integration test completed!")
        
    except Exception as e:
        print(f"❌ Firebase integration test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("🔥 Starting Firebase Authentication Test Suite...")
    print("📌 Make sure backend is running on http://localhost:8000")
    print()
    
    asyncio.run(test_firebase_service())
    asyncio.run(test_firebase_endpoints())
    asyncio.run(test_firebase_integration())
