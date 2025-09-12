#!/usr/bin/env python3
"""
Test configuration for Railway environment.
Provides common utilities for all test files.
"""
import os
import sys
from pathlib import Path

# Add backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Set default environment variables if not set (Railway will override)
if not os.environ.get("DATABASE_URL"):
    os.environ.update({
        "DATABASE_URL": "postgresql://histora:histora123@localhost:5433/histora",
        "ENVIRONMENT": "development",
        "DEBUG": "true",
        "JWT_SECRET_KEY": "test-secret-key-for-development",
        "JWT_ALGORITHM": "HS256"
    })

def get_base_url():
    """Get base URL for testing."""
    # Check if we're in Railway environment
    if os.environ.get("DATABASE_URL") and "railway" in os.environ.get("DATABASE_URL", ""):
        return "http://127.0.0.1:8080"  # Railway internal port
    return "http://localhost:8000"

def get_api_base_url():
    """Get API base URL for testing."""
    return f"{get_base_url()}/api/v1"

def print_test_header(test_name: str):
    """Print formatted test header."""
    print(f"\n{'='*50}")
    print(f"🧪 {test_name}")
    print(f"{'='*50}")

def print_test_result(test_name: str, success: bool, details: str = ""):
    """Print formatted test result."""
    status = "✅" if success else "❌"
    print(f"{status} {test_name}: {details}")

# Common test data
TEST_USER_DATA = {
    "email": "test@histora.com",
    "password": "test123456",
    "full_name": "Test User"
}

TEST_ADMIN_API_KEY = "histora-admin-dev-2025"

print(f"🔗 Test Base URL: {get_base_url()}")
print(f"🔗 API Base URL: {get_api_base_url()}")
print(f"🔗 Database URL: {os.environ.get('DATABASE_URL', 'Not set')[:50]}...")
