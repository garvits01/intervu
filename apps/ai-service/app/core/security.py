"""
Haveloc Pro AI Service — Security
JWT validation, API key auth, and password utilities.
"""

from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
    APIKeyHeader,
)

from app.core.config import Settings, get_settings

# ── Security schemes ──
bearer_scheme = HTTPBearer(auto_error=False)
api_key_scheme = APIKeyHeader(name="X-API-Key", auto_error=False)


# ── JWT ──

class TokenPayload:
    """Decoded JWT payload."""

    def __init__(self, sub: str, email: str, role: str, org_id: str | None = None):
        self.sub = sub
        self.email = email
        self.role = role
        self.org_id = org_id


def create_access_token(
    sub: str,
    email: str,
    role: str = "user",
    org_id: str | None = None,
    settings: Settings | None = None,
) -> str:
    s = settings or get_settings()
    expire = datetime.now(timezone.utc) + timedelta(minutes=s.JWT_EXPIRY_MINUTES)
    payload = {
        "sub": sub,
        "email": email,
        "role": role,
        "org_id": org_id,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "iss": s.APP_NAME,
    }
    return jwt.encode(payload, s.JWT_SECRET, algorithm=s.JWT_ALGORITHM)


def decode_token(token: str, settings: Settings | None = None) -> TokenPayload:
    s = settings or get_settings()
    try:
        payload = jwt.decode(
            token,
            s.JWT_SECRET,
            algorithms=[s.JWT_ALGORITHM],
            options={"verify_exp": True},
        )
        return TokenPayload(
            sub=payload["sub"],
            email=payload.get("email", ""),
            role=payload.get("role", "user"),
            org_id=payload.get("org_id"),
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
        )


# ── Dependencies ──

async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Security(bearer_scheme)] = None,
    api_key: Annotated[str | None, Security(api_key_scheme)] = None,
    settings: Settings = Depends(get_settings),
) -> TokenPayload:
    """
    Authenticate via JWT Bearer token OR API key.
    In development mode, allows unauthenticated access.
    """
    # Try JWT first
    if credentials and credentials.credentials:
        return decode_token(credentials.credentials, settings)

    # Try API key
    if api_key and api_key in settings.api_key_list:
        return TokenPayload(sub="api-key-user", email="api@haveloc.pro", role="service")

    # Dev mode: allow unauthenticated
    if not settings.is_production:
        return TokenPayload(sub="dev-user", email="dev@haveloc.pro", role="admin")

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Missing or invalid authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def require_admin(
    user: TokenPayload = Depends(get_current_user),
) -> TokenPayload:
    if user.role not in ("admin", "service"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return user
