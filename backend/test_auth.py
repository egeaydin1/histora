#!/usr/bin/env python3
"""
Test authentication system.
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

async def test_auth_endpoints():
    """Test authentication endpoints via HTTP."""
    print("🔐 Testing Authentication System...")
    
    import aiohttp
    
    base_url = "http://localhost:8000/api/v1/auth"
    
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
            register_data = {
                "email": "test@histora.com",
                "password": "test123!",
                "full_name": "Test User"
            }
            
            headers = {"X-Admin-API-Key": "histora-admin-dev-2025"}
            
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
