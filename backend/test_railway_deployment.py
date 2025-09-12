#!/usr/bin/env python3
"""
Railway Deployment Test Program
Automatically tests backend endpoints after deployment
"""
import requests
import time
import json
import sys
from typing import Dict, List, Any

class RailwayTester:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.session.timeout = 10
        
    def test_endpoint(self, endpoint: str, method: str = 'GET', 
                     data: Dict = None, headers: Dict = None,
                     expected_status: int = 200) -> Dict[str, Any]:
        """Test a single endpoint"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=headers)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=headers)
            else:
                return {"status": "error", "message": f"Unsupported method: {method}"}
            
            # Parse response
            try:
                response_data = response.json()
            except:
                response_data = response.text
            
            result = {
                "endpoint": endpoint,
                "method": method,
                "status_code": response.status_code,
                "expected_status": expected_status,
                "success": response.status_code == expected_status,
                "response": response_data,
                "response_time": response.elapsed.total_seconds()
            }
            
            return result
            
        except requests.exceptions.RequestException as e:
            return {
                "endpoint": endpoint,
                "method": method,
                "status": "error",
                "success": False,
                "error": str(e)
            }
    
    def wait_for_deployment(self, max_attempts: int = 30) -> bool:
        """Wait for deployment to be ready"""
        print(f"🔄 Waiting for deployment at {self.base_url}")
        
        for attempt in range(max_attempts):
            try:
                response = self.session.get(f"{self.base_url}/health", timeout=5)
                if response.status_code == 200:
                    print(f"✅ Deployment ready after {attempt + 1} attempts")
                    return True
            except:
                pass
            
            print(f"⏳ Attempt {attempt + 1}/{max_attempts} - waiting 10s...")
            time.sleep(10)
        
        print(f"❌ Deployment not ready after {max_attempts} attempts")
        return False
    
    def run_comprehensive_tests(self) -> Dict[str, Any]:
        """Run all backend tests"""
        print("🧪 Starting Railway Backend Tests")
        print("=" * 50)
        
        # Wait for deployment
        if not self.wait_for_deployment():
            return {"status": "failed", "reason": "Deployment not ready"}
        
        test_results = []
        
        # Basic Health Tests
        print("\n📋 Basic Health Tests")
        print("-" * 30)
        
        basic_tests = [
            ("/health", "GET", 200),
            ("/", "GET", 200),
            ("/docs", "GET", 200),  # FastAPI docs
        ]
        
        for endpoint, method, expected in basic_tests:
            result = self.test_endpoint(endpoint, method, expected_status=expected)
            test_results.append(result)
            
            status = "✅" if result["success"] else "❌"
            print(f"{status} {method} {endpoint} - {result.get('status_code', 'ERROR')}")
        
        # API v1 Tests
        print("\n🔌 API v1 Tests")
        print("-" * 30)
        
        api_tests = [
            ("/api/v1/auth/me", "GET", 401),  # Should return 401 without token
            ("/api/v1/characters", "GET", 200),  # Should return characters list
            ("/api/v1/health", "GET", 200),  # API health check
        ]
        
        for endpoint, method, expected in api_tests:
            result = self.test_endpoint(endpoint, method, expected_status=expected)
            test_results.append(result)
            
            status = "✅" if result["success"] else "❌"
            print(f"{status} {method} {endpoint} - {result.get('status_code', 'ERROR')}")
        
        # Database Connection Test
        print("\n🗄️  Database Tests")
        print("-" * 30)
        
        db_result = self.test_endpoint("/api/v1/characters", "GET")
        test_results.append(db_result)
        
        if db_result["success"]:
            print("✅ Database connection working")
        else:
            print("❌ Database connection failed")
        
        # Performance Tests
        print("\n⚡ Performance Tests")
        print("-" * 30)
        
        performance_results = []
        for i in range(5):
            result = self.test_endpoint("/health", "GET")
            if result.get("response_time"):
                performance_results.append(result["response_time"])
        
        if performance_results:
            avg_time = sum(performance_results) / len(performance_results)
            print(f"📊 Average response time: {avg_time:.3f}s")
            
            if avg_time < 1.0:
                print("✅ Performance: Excellent (<1s)")
            elif avg_time < 2.0:
                print("⚠️  Performance: Good (1-2s)")
            else:
                print("❌ Performance: Slow (>2s)")
        
        # Summary
        print("\n📊 Test Summary")
        print("=" * 50)
        
        total_tests = len(test_results)
        successful_tests = sum(1 for r in test_results if r["success"])
        failed_tests = total_tests - successful_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {successful_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(successful_tests/total_tests)*100:.1f}%")
        
        # Final Status
        if failed_tests == 0:
            print("\n🎉 ALL TESTS PASSED! Deployment is successful!")
            final_status = "success"
        elif successful_tests > failed_tests:
            print("\n⚠️  PARTIAL SUCCESS - Some issues detected")
            final_status = "partial"
        else:
            print("\n❌ DEPLOYMENT FAILED - Major issues detected")
            final_status = "failed"
        
        return {
            "status": final_status,
            "total_tests": total_tests,
            "successful_tests": successful_tests,
            "failed_tests": failed_tests,
            "success_rate": (successful_tests/total_tests)*100,
            "test_results": test_results
        }

def main():
    """Main test function"""
    # Railway backend URL
    backend_url = "https://backend-production-1c32.up.railway.app"
    
    print("🚀 Railway Backend Deployment Tester")
    print(f"🎯 Target: {backend_url}")
    print("=" * 60)
    
    # Create tester
    tester = RailwayTester(backend_url)
    
    # Run tests
    results = tester.run_comprehensive_tests()
    
    # Save results to file
    with open("railway_test_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\n💾 Results saved to: railway_test_results.json")
    
    # Exit with appropriate code
    if results["status"] == "success":
        print("\n🎉 DEPLOYMENT TEST: SUCCESS")
        sys.exit(0)
    elif results["status"] == "partial":
        print("\n⚠️  DEPLOYMENT TEST: PARTIAL SUCCESS")
        sys.exit(1)
    else:
        print("\n❌ DEPLOYMENT TEST: FAILED")
        sys.exit(2)

if __name__ == "__main__":
    main()
