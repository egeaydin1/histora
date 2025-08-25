#!/bin/bash

# Test script to verify admin login functionality
echo "🧪 Testing Admin Login Functionality"
echo "===================================="

BASE_URL="http://localhost:8000/api/v1"

echo "1. Testing backend health..."
HEALTH_RESPONSE=$(curl -s "$BASE_URL/health/" | jq -r '.status // "error"')
echo "Backend status: $HEALTH_RESPONSE"

if [ "$HEALTH_RESPONSE" != "healthy" ]; then
    echo "❌ Backend is not healthy. Please start the backend first."
    exit 1
fi

echo -e "\n2. Testing admin user creation..."
ADMIN_EMAIL="admin@histora.com"
ADMIN_PASSWORD="histora2025!"

# Try to create admin user first (might fail if already exists)
ADMIN_CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\",\"full_name\":\"Histora Admin\",\"role\":\"admin\"}")

echo "$ADMIN_CREATE_RESPONSE" | jq '.user.email // .detail' 2>/dev/null || echo "Admin user creation response: $ADMIN_CREATE_RESPONSE"

echo -e "\n3. Testing admin login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

LOGIN_SUCCESS=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token // "none"')
IS_ADMIN=$(echo "$LOGIN_RESPONSE" | jq -r '.user.is_admin // false')

if [ "$LOGIN_SUCCESS" != "none" ]; then
    echo "✅ Admin login successful!"
    echo "Token: ${LOGIN_SUCCESS:0:20}..."
    echo "Is Admin: $IS_ADMIN"
else
    echo "❌ Admin login failed"
    echo "Response: $LOGIN_RESPONSE"
fi

echo -e "\n4. Testing frontend admin login page..."
FRONTEND_RESPONSE=$(curl -s -I http://localhost:3000/admin/login | head -1)
echo "Frontend admin login page: $FRONTEND_RESPONSE"

echo -e "\n5. Testing frontend admin dashboard page..."
ADMIN_DASHBOARD_RESPONSE=$(curl -s -I http://localhost:3000/admin | head -1)
echo "Frontend admin dashboard page: $ADMIN_DASHBOARD_RESPONSE"

echo -e "\n✅ Admin login functionality tests completed!"
echo "If login works, the frontend should now be able to:"
echo "1. Use the correct API URL (NEXT_PUBLIC_API_URL)"
echo "2. Login via API client instead of manual fetch"
echo "3. Store admin token and redirect to /admin dashboard"