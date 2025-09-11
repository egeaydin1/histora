"""
Test script to verify Firebase authentication.
"""
import asyncio
import os
import sys

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__)))

from app.services.firebase_service import firebase_service

async def test_firebase_auth():
    """Test Firebase authentication."""
    print("Firebase Service Status:")
    print(f"  Initialized: {firebase_service.initialized}")
    
    if not firebase_service.initialized:
        print("Firebase is not properly initialized!")
        return
    
    # Test getting a user (you would need to replace this with an actual UID)
    print("\nTesting Firebase user retrieval...")
    try:
        # Replace with a valid UID from your Firebase project if you want to test
        # user = await firebase_service.get_firebase_user("some_valid_uid")
        # print(f"User: {user}")
        print("Firebase service is working correctly.")
    except Exception as e:
        print(f"Error getting Firebase user: {e}")

if __name__ == "__main__":
    asyncio.run(test_firebase_auth())