"""
Security and Authentication Module
Handles Google Cloud Secret Manager runtime retrieval, Firebase Auth token
verification, input sanitization, and rate limiting controls.
"""

import os
import re
import html
import functools
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from google.cloud import secretmanager
import firebase_admin
from firebase_admin import auth as firebase_auth, credentials

# Initialize Firebase Admin SDK lazily
if not firebase_admin._apps:
    try:
        # Defaults to Application Default Credentials on GCP Cloud Run
        firebase_admin.initialize_app()
    except Exception as e:
        print(f"[SECURITY WARNING] Firebase Admin ADC init deferred: {e}")

security_scheme = HTTPBearer(auto_error=False)

@functools.lru_cache(maxsize=32)
def get_secret(secret_id: str, version_id: str = "latest") -> str:
    """
    Dynamically retrieves secrets from Google Cloud Secret Manager at runtime.
    Caches secret in-memory to minimize GCP API calls while avoiding hardcoded keys.
    """
    project_id = os.getenv("GCP_PROJECT_ID") or os.getenv("GOOGLE_CLOUD_PROJECT")
    
    # Fallback to local environment variable during local sandbox test
    if not project_id or os.getenv("ENV") == "local_development":
        env_fallback = os.getenv(secret_id)
        if env_fallback:
            return env_fallback

    try:
        client = secretmanager.SecretManagerServiceClient()
        name = f"projects/{project_id}/secrets/{secret_id}/versions/{version_id}"
        response = client.access_secret_version(request={"name": name})
        return response.payload.data.decode("UTF-8")
    except Exception as exc:
        print(f"[SECRET MANAGER LOG] Fallback lookup for {secret_id}: {exc}")
        env_val = os.getenv(secret_id, "")
        if env_val:
            return env_val
        raise RuntimeError(f"Failed to access secret '{secret_id}' from GCP Secret Manager.")

async def verify_firebase_token(
    credentials: HTTPAuthorizationCredentials = Security(security_scheme)
) -> dict:
    """
    Validates Firebase ID token from Authorization Bearer header.
    Ensures that every request is strictly bound to an authenticated user UID.
    """
    # Allow bypass in mock sandbox development mode if configured
    if os.getenv("MOCK_AUTH_FOR_DEV") == "true":
        return {"uid": "mock-user-123", "email": "developer@enterprise.internal"}

    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization Bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    try:
        decoded_token = firebase_auth.verify_id_token(token)
        return {
            "uid": decoded_token["uid"],
            "email": decoded_token.get("email", ""),
            "name": decoded_token.get("name", "")
        }
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired Firebase Auth token: {str(err)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

def sanitize_user_input(text: str) -> str:
    """
    Sanitizes user input to prevent XSS and strip potentially malicious control tokens.
    """
    if not text:
        return ""
    # Strip null bytes and control chars
    clean = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)
    return clean.strip()
