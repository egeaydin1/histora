"""
Firebase authentication service for backend verification.
"""
import os
import json
from typing import Optional, Dict, Any
import firebase_admin
from firebase_admin import credentials, auth
import structlog

from app.core.config import get_settings

logger = structlog.get_logger(__name__)

class FirebaseService:
    """Firebase authentication service."""
    
    def __init__(self):
        self.settings = get_settings()
        self.app = None
        self.initialized = False
        self._initialize_firebase()
    
    def _initialize_firebase(self):
        """Initialize Firebase Admin SDK."""
        try:
            # Check if Firebase is already initialized
            if firebase_admin._apps:
                self.app = firebase_admin.get_app()
                self.initialized = True
                logger.info("Firebase already initialized")
                return
            
            # Try to initialize with service account
            service_account_info = self._get_service_account_info()
            
            if service_account_info:
                cred = credentials.Certificate(service_account_info)
                self.app = firebase_admin.initialize_app(cred)
                self.initialized = True
                logger.info("Firebase initialized with service account")
            else:
                logger.warning("Firebase service account not configured - using mock mode")
                self.initialized = False
                
        except Exception as e:
            logger.error(f"Firebase initialization failed: {e}")
            self.initialized = False
    
    def _get_service_account_info(self) -> Optional[Dict[str, Any]]:
        """Get Firebase service account info from environment variables."""
        try:
            # Method 1: From JSON file path
            service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
            if service_account_path and os.path.exists(service_account_path):
                with open(service_account_path, 'r') as f:
                    return json.load(f)
            
            # Method 2: From JSON string
            service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
            if service_account_json:
                return json.loads(service_account_json)
            
            # Method 3: From individual environment variables
            # Check if we have valid (non-placeholder) credentials
            if all([
                self.settings.firebase_project_id,
                self.settings.firebase_private_key,
                self.settings.firebase_client_email
            ]) and not any([
                self.settings.firebase_project_id.startswith('your_'),
                'your_private_key_here' in self.settings.firebase_private_key,
                self.settings.firebase_client_email.startswith('your_')
            ]):
                return {
                    "type": "service_account",
                    "project_id": self.settings.firebase_project_id,
                    "private_key_id": self.settings.firebase_private_key_id,
                    "private_key": self.settings.firebase_private_key.replace('\\n', '\n'),
                    "client_email": self.settings.firebase_client_email,
                    "client_id": self.settings.firebase_client_id,
                    "auth_uri": self.settings.firebase_auth_uri,
                    "token_uri": self.settings.firebase_token_uri,
                    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                    "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{self.settings.firebase_client_email}"
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting Firebase service account info: {e}")
            return None
    
    async def verify_firebase_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify Firebase ID token."""
        if not self.initialized:
            logger.warning("Firebase not initialized - using mock verification")
            return self._mock_token_verification(token)
        
        try:
            # Verify the token
            decoded_token = auth.verify_id_token(token)
            
            logger.info(f"Firebase token verified for user: {decoded_token.get('uid')}")
            
            return {
                "uid": decoded_token.get("uid"),
                "email": decoded_token.get("email"),
                "email_verified": decoded_token.get("email_verified", False),
                "name": decoded_token.get("name"),
                "picture": decoded_token.get("picture"),
                "firebase_claims": decoded_token
            }
            
        except auth.InvalidIdTokenError:
            logger.warning("Invalid Firebase ID token")
            return None
        except auth.ExpiredIdTokenError:
            logger.warning("Expired Firebase ID token")
            return None
        except Exception as e:
            logger.error(f"Firebase token verification error: {e}")
            return None
    
    def _mock_token_verification(self, token: str) -> Optional[Dict[str, Any]]:
        """Mock token verification for development."""
        # Simple mock verification for development
        if token.startswith("firebase-mock-"):
            user_id = token.replace("firebase-mock-", "")
            return {
                "uid": user_id,
                "email": f"{user_id}@example.com",
                "email_verified": True,
                "name": f"Mock User {user_id}",
                "picture": None,
                "firebase_claims": {
                    "uid": user_id,
                    "email": f"{user_id}@example.com",
                    "iss": "mock-firebase",
                    "aud": "mock-project",
                    "auth_time": 1640995200,
                    "iat": 1640995200,
                    "exp": 1641081600
                }
            }
        
        return None
    
    async def get_firebase_user(self, uid: str) -> Optional[Dict[str, Any]]:
        """Get Firebase user by UID."""
        if not self.initialized:
            logger.warning("Firebase not initialized - using mock user data")
            return {
                "uid": uid,
                "email": f"{uid}@example.com",
                "email_verified": True,
                "display_name": f"Mock User {uid}",
                "disabled": False,
                "custom_claims": {}
            }
        
        try:
            user_record = auth.get_user(uid)
            
            return {
                "uid": user_record.uid,
                "email": user_record.email,
                "email_verified": user_record.email_verified,
                "display_name": user_record.display_name,
                "photo_url": user_record.photo_url,
                "disabled": user_record.disabled,
                "custom_claims": user_record.custom_claims or {}
            }
            
        except auth.UserNotFoundError:
            logger.warning(f"Firebase user not found: {uid}")
            return None
        except Exception as e:
            logger.error(f"Error getting Firebase user {uid}: {e}")
            return None
    
    async def set_custom_claims(self, uid: str, claims: Dict[str, Any]) -> bool:
        """Set custom claims for Firebase user."""
        if not self.initialized:
            logger.warning("Firebase not initialized - mock custom claims set")
            return True
        
        try:
            auth.set_custom_user_claims(uid, claims)
            logger.info(f"Custom claims set for user {uid}: {claims}")
            return True
            
        except Exception as e:
            logger.error(f"Error setting custom claims for {uid}: {e}")
            return False
    
    async def create_custom_token(self, uid: str, additional_claims: Optional[Dict[str, Any]] = None) -> Optional[str]:
        """Create custom Firebase token."""
        if not self.initialized:
            logger.warning("Firebase not initialized - returning mock token")
            return f"firebase-custom-mock-{uid}"
        
        try:
            token = auth.create_custom_token(uid, additional_claims)
            return token.decode('utf-8')
            
        except Exception as e:
            logger.error(f"Error creating custom token for {uid}: {e}")
            return None
    
    def is_configured(self) -> bool:
        """Check if Firebase is properly configured."""
        return self.initialized
    
    def get_status(self) -> Dict[str, Any]:
        """Get Firebase service status."""
        return {
            "initialized": self.initialized,
            "configured": self.is_configured(),
            "project_id": self.settings.firebase_project_id or "not_configured",
            "mode": "production" if self.initialized else "mock",
            "apps_count": len(firebase_admin._apps) if firebase_admin._apps else 0
        }

# Global Firebase service instance
firebase_service = FirebaseService()
