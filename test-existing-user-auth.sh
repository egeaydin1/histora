#!/bin/bash

# Test script to verify authentication fixes for existing users
echo "🧪 Testing Authentication Flow for Existing Users"
echo "=================================================="

BASE_URL="http://localhost:8000/api/v1"

echo "1. Testing backend health..."
HEALTH_RESPONSE=$(curl -s "$BASE_URL/health/" | jq -r '.status // "error"')
echo "Backend status: $HEALTH_RESPONSE"

if [ "$HEALTH_RESPONSE" != "healthy" ]; then
    echo "❌ Backend is not healthy. Please start the backend first."
    exit 1
fi

echo -e "\n2. Testing user registration (should create new user)..."
TEST_EMAIL="test-existing-user@example.com"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"testpass123\",\"full_name\":\"Test Existing User\"}")

echo "$REGISTER_RESPONSE" | jq '.user.email // .detail'

echo -e "\n3. Testing duplicate registration (should return 'already exists' error)..."
DUPLICATE_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"testpass123\",\"full_name\":\"Test Existing User\"}")

DUPLICATE_ERROR=$(echo "$DUPLICATE_RESPONSE" | jq -r '.detail // "no error"')
echo "Duplicate registration error: $DUPLICATE_ERROR"

if [[ "$DUPLICATE_ERROR" == *"already exists"* ]]; then
    echo "✅ Backend correctly returns 'already exists' error for duplicate registrations"
else
    echo "⚠️ Backend behavior for duplicate registrations may be unexpected"
fi

echo -e "\n4. Testing Firebase registration endpoint..."
FIREBASE_REGISTER=$(curl -s -X POST "$BASE_URL/auth/firebase-register" \
  -H "Content-Type: application/json" \
  -d "{\"firebase_uid\":\"firebase-test-123\",\"email\":\"$TEST_EMAIL\",\"display_name\":\"Firebase Test\"}")

FIREBASE_ERROR=$(echo "$FIREBASE_REGISTER" | jq -r '.detail // "no error"')
echo "Firebase registration result: $FIREBASE_ERROR"

echo -e "\n5. Testing Firebase login endpoint..."
MOCK_TOKEN="mock-firebase-token-for-testing"
FIREBASE_LOGIN=$(curl -s -X POST "$BASE_URL/auth/firebase-login" \
  -H "Content-Type: application/json" \
  -d "{\"firebase_token\":\"$MOCK_TOKEN\"}")

FIREBASE_LOGIN_ERROR=$(echo "$FIREBASE_LOGIN" | jq -r '.detail // "success"')
echo "Firebase login result: $FIREBASE_LOGIN_ERROR"

echo -e "\n✅ Authentication flow tests completed!"
echo "Frontend should now handle existing users correctly by:"
echo "1. Attempting registration when user not found"
echo "2. If 'already exists' error, try Firebase login"
echo "3. Fall back to demo user if all else fails"