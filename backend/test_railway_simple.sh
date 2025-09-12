#!/bin/bash
# Railway Backend Simple Test Script
# Tests backend endpoints after deployment

echo "🚀 Railway Backend Deployment Tester"
echo "🎯 Target: https://backend-production-1c32.up.railway.app"
echo "============================================================"

BASE_URL="https://backend-production-1c32.up.railway.app"
PASSED=0
FAILED=0
TOTAL=0

# Function to test endpoint
test_endpoint() {
    local endpoint=$1
    local expected_status=${2:-200}
    local description=$3
    
    echo -n "Testing $description... "
    
    # Make request and get status code
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
    
    TOTAL=$((TOTAL + 1))
    
    if [ "$status_code" -eq "$expected_status" ]; then
        echo "✅ PASS ($status_code)"
        PASSED=$((PASSED + 1))
    else
        echo "❌ FAIL (got $status_code, expected $expected_status)"
        FAILED=$((FAILED + 1))
    fi
}

echo ""
echo "📋 Basic Health Tests"
echo "---------------------"

# Wait for deployment to be ready
echo "🔄 Waiting for deployment to be ready..."
for i in {1..10}; do
    if curl -s "$BASE_URL/health" > /dev/null 2>&1; then
        echo "✅ Deployment is ready!"
        break
    fi
    echo "⏳ Attempt $i/10 - waiting 5s..."
    sleep 5
done

# Basic tests
test_endpoint "/health" 200 "Health Check"
test_endpoint "/" 200 "Root Endpoint"
test_endpoint "/docs" 200 "API Documentation"

echo ""
echo "🔌 API v1 Tests"
echo "---------------"

test_endpoint "/api/v1/auth/me" 401 "Auth Me (should be 401 without token)"
test_endpoint "/api/v1/characters" 200 "Characters List"
test_endpoint "/api/v1/health" 200 "API Health Check"

echo ""
echo "⚡ Performance Test"
echo "------------------"

echo -n "Testing response time... "
response_time=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL/health")
echo "⏱️  ${response_time}s"

if (( $(echo "$response_time < 1.0" | bc -l) )); then
    echo "✅ Performance: Excellent (<1s)"
elif (( $(echo "$response_time < 2.0" | bc -l) )); then
    echo "⚠️  Performance: Good (1-2s)"
else
    echo "❌ Performance: Slow (>2s)"
fi

echo ""
echo "📊 Test Summary"
echo "============================================================"
echo "Total Tests: $TOTAL"
echo "✅ Passed: $PASSED"
echo "❌ Failed: $FAILED"

if [ $FAILED -eq 0 ]; then
    echo ""
    echo "🎉 ALL TESTS PASSED! Deployment is successful!"
    echo "🌐 Backend is ready at: $BASE_URL"
    exit 0
elif [ $PASSED -gt $FAILED ]; then
    echo ""
    echo "⚠️  PARTIAL SUCCESS - Some issues detected"
    exit 1
else
    echo ""
    echo "❌ DEPLOYMENT FAILED - Major issues detected"
    exit 2
fi
