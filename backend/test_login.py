#!/usr/bin/env python3
"""
Test script to verify authentication.
"""
import asyncio
import sys
import os
import httpx

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

async def test_login():
    """Test login endpoint."""
    print("🔐 Testing login...")
    
    # Test with demo user credentials
    login_data = {
        "email": "demo@histora.com",
        "password": "demo123"
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://localhost:8000/api/v1/auth/login",
                json=login_data
            )
            
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.json()}")
            
            if response.status_code == 200:
                print("✅ Login successful!")
                return True
            else:
                print("❌ Login failed!")
                return False
                
    except Exception as e:
        print(f"❌ Error during login test: {e}")
        return False

if __name__ == "__main__":
    asyncio.run(test_login())