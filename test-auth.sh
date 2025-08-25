#!/bin/bash

# Test script to verify authentication fixes
echo "🧪 Testing Histora Authentication Endpoints"
echo "============================================="

BASE_URL="http://localhost:8000/api/v1"

echo "1. Testing health endpoint..."
curl -s "$BASE_URL/health" | jq '.status'

echo -e "\n2. Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test-auth@example.com","password":"testpass123","full_name":"Test Auth User"}')

echo "$REGISTER_RESPONSE" | jq '.user.email'

# Extract token for further tests
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.access_token')

echo -e "\n3. Testing /auth/me with token..."
curl -s -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN" | jq '.email'

echo -e "\n4. Testing /auth/me without token (should fail)..."
curl -s -X GET "$BASE_URL/auth/me" | jq '.detail'

echo -e "\n5. Testing characters endpoint (should work with CORS)..."
curl -s -X GET "$BASE_URL/characters/" | jq 'length'

echo -e "\n6. Testing Firebase registration endpoint..."
curl -s -X POST "$BASE_URL/auth/firebase-register" \
  -H "Content-Type: application/json" \
  -d '{"firebase_uid":"test-firebase-123","email":"firebase-test@example.com","display_name":"Firebase Test"}' | jq '.detail // .user.email'

echo -e "\n✅ All authentication tests completed!"
echo "If you see errors, check the backend logs for details."