#!/usr/bin/env python3
"""
Check which environment variables are set on Railway.
"""
import os
import sys
from pathlib import Path

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

def check_environment_variables():
    """Check all required environment variables."""
    print("🔍 RAILWAY ENVIRONMENT VARIABLES CHECK")
    print("=" * 60)
    
    # Define all required variables
    required_vars = {
        "🔴 CRITICAL": [
            "DATABASE_URL",
            "ENVIRONMENT", 
            "DEBUG",
            "JWT_SECRET_KEY",
            "JWT_ALGORITHM",
            "FIREBASE_PROJECT_ID",
            "FIREBASE_PRIVATE_KEY",
            "FIREBASE_CLIENT_EMAIL",
            "FIREBASE_CLIENT_ID",
        ],
        "🟡 IMPORTANT": [
            "FRONTEND_URL",
            "ALLOWED_ORIGINS", 
            "OPENROUTER_API_KEY",
            "OPENAI_API_KEY",
            "ADMIN_API_KEY",
            "FIREBASE_PRIVATE_KEY_ID",
        ],
        "🟢 OPTIONAL": [
            "APP_NAME",
            "APP_VERSION",
            "LOG_LEVEL",
            "AI_MAX_TOKENS",
            "AI_TEMPERATURE", 
            "DEFAULT_AI_MODEL",
            "BACKUP_AI_MODEL",
            "MAX_FILE_SIZE_MB",
            "DEFAULT_LANGUAGE",
        ]
    }
    
    all_vars_status = {}
    
    for category, vars_list in required_vars.items():
        print(f"\n{category} VARIABLES:")
        print("-" * 40)
        
        for var_name in vars_list:
            value = os.environ.get(var_name)
            if value:
                # Mask sensitive values
                if any(sensitive in var_name.lower() for sensitive in ['key', 'secret', 'password', 'token']):
                    display_value = f"{value[:10]}...***" if len(value) > 10 else "***"
                else:
                    display_value = value[:50] + "..." if len(value) > 50 else value
                
                print(f"✅ {var_name:<25} = {display_value}")
                all_vars_status[var_name] = True
            else:
                print(f"❌ {var_name:<25} = NOT SET")
                all_vars_status[var_name] = False
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 SUMMARY")
    print("=" * 60)
    
    critical_missing = []
    important_missing = []
    optional_missing = []
    
    for category, vars_list in required_vars.items():
        missing = [var for var in vars_list if not all_vars_status[var]]
        if "CRITICAL" in category:
            critical_missing = missing
        elif "IMPORTANT" in category:
            important_missing = missing
        elif "OPTIONAL" in category:
            optional_missing = missing
    
    print(f"🔴 Critical Missing: {len(critical_missing)}")
    for var in critical_missing:
        print(f"   - {var}")
    
    print(f"🟡 Important Missing: {len(important_missing)}")
    for var in important_missing:
        print(f"   - {var}")
    
    print(f"🟢 Optional Missing: {len(optional_missing)}")
    for var in optional_missing:
        print(f"   - {var}")
    
    # Status
    total_set = sum(all_vars_status.values())
    total_vars = len(all_vars_status)
    
    print(f"\n🎯 OVERALL STATUS: {total_set}/{total_vars} variables set")
    
    if len(critical_missing) == 0:
        print("✅ All critical variables are set!")
    else:
        print(f"❌ {len(critical_missing)} critical variables missing!")
        
    return len(critical_missing) == 0

def check_firebase_config():
    """Check Firebase configuration specifically."""
    print("\n🔥 FIREBASE CONFIGURATION CHECK")
    print("=" * 60)
    
    try:
        from app.services.firebase_service import firebase_service
        
        status = firebase_service.get_status()
        print(f"📊 Firebase Status: {status}")
        
        if status.get("initialized"):
            print("✅ Firebase is properly initialized")
        else:
            print("❌ Firebase is not initialized")
            
        if status.get("configured"):
            print("✅ Firebase is properly configured")
        else:
            print("❌ Firebase is not configured")
            
        return status.get("initialized") and status.get("configured")
        
    except Exception as e:
        print(f"❌ Firebase check failed: {e}")
        return False

if __name__ == "__main__":
    print(f"🌍 Current Environment: {os.environ.get('ENVIRONMENT', 'Not Set')}")
    print(f"🔗 Database URL: {os.environ.get('DATABASE_URL', 'Not Set')[:50]}...")
    
    env_ok = check_environment_variables()
    firebase_ok = check_firebase_config()
    
    print("\n" + "=" * 60)
    print("🎉 FINAL RESULT")
    print("=" * 60)
    
    if env_ok and firebase_ok:
        print("✅ All systems ready!")
        sys.exit(0)
    else:
        print("❌ Some configuration missing!")
        print("📋 Check the missing variables above and add them to Railway")
        sys.exit(1)
