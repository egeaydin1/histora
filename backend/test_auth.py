#!/usr/bin/env python3
"""
Test authentication system - Railway compatible.
"""
import asyncio
import json
from test_config import *

async def test_auth_endpoints():
    """Test authentication endpoints via HTTP."""
    print_test_header("Authentication System Test")
    
    try:
        import aiohttp
    except ImportError:
        print("❌ aiohttp not available - install with: pip install aiohttp")
        return
    
    base_url = f"{get_api_base_url()}/auth"
    
    try:
        async with aiohttp.ClientSession() as session:
            # Test health check
            print("\n📋 Testing auth health...")
            async with session.get(f"{base_url}/health") as resp:
                if resp.status == 200:
                    data = await resp.json()
                    print(f"✅ Auth health: {data}")
                else:
                    print(f"❌ Auth health failed: {resp.status}")
            
            # Test registration (with API key)
            print("\n👤 Testing user registration...")
            register_data = TEST_USER_DATA.copy()
            
            headers = {"X-Admin-API-Key": TEST_ADMIN_API_KEY}
            
            async with session.post(
                f"{base_url}/register", 
                json=register_data,
                headers=headers
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    print(f"✅ Registration successful: {data['user']['email']}")
                    access_token = data['access_token']
                else:
                    text = await resp.text()
                    print(f"❌ Registration failed: {resp.status} - {text}")
                    return
            
            # Test login
            print("\n🔑 Testing user login...")
            login_data = {
                "email": "test@histora.com",
                "password": "test123!"
            }
            
            async with session.post(f"{base_url}/login", json=login_data) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    print(f"✅ Login successful: {data['user']['email']}")
                    access_token = data['access_token']
                else:
                    text = await resp.text()
                    print(f"❌ Login failed: {resp.status} - {text}")
                    return
            
            # Test protected endpoint
            print("\n🛡️  Testing protected endpoint...")
            auth_headers = {"Authorization": f"Bearer {access_token}"}
            
            async with session.get(f"{base_url}/me", headers=auth_headers) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    print(f"✅ Protected endpoint: {data['email']} ({data['role']})")
                else:
                    text = await resp.text()
                    print(f"❌ Protected endpoint failed: {resp.status} - {text}")
            
            # Test admin endpoint with API key
            print("\n👑 Testing admin endpoint...")
            admin_headers = {"X-Admin-API-Key": "histora-admin-dev-2025"}
            
            async with session.get(f"{base_url}/admin/stats", headers=admin_headers) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    print(f"✅ Admin stats: {data}")
                else:
                    text = await resp.text()
                    print(f"❌ Admin endpoint failed: {resp.status} - {text}")
    
    except Exception as e:
        print(f"❌ Auth test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("🚀 Starting authentication test...")
    print("📌 Make sure backend is running on http://localhost:8000")
    asyncio.run(test_auth_endpoints())
