from __future__ import annotations

import time
from typing import Any

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwk, jwt
from jose.exceptions import ExpiredSignatureError, JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db import get_session
from app.models.orm import User

_http_bearer = HTTPBearer(auto_error=False)

_jwks_cache: dict[str, Any] | None = None
_jwks_cache_expires: float = 0.0
JWKS_TTL_SEC = 600.0


async def fetch_jwks() -> dict[str, Any]:
    global _jwks_cache, _jwks_cache_expires
    now = time.monotonic()
    if _jwks_cache is not None and now < _jwks_cache_expires:
        return _jwks_cache

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(settings.keycloak_jwks_url)
        response.raise_for_status()
        _jwks_cache = response.json()
        _jwks_cache_expires = time.monotonic() + JWKS_TTL_SEC
    return _jwks_cache


def _decode_access_token(token: str, jwks: dict[str, Any]) -> dict[str, Any]:
    headers = jwt.get_unverified_header(token)
    kid = headers.get("kid")
    keys = [k for k in jwks.get("keys", []) if k.get("kid") == kid]
    if not keys:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED, detail="Unknown token signing key"
        )
    key = jwk.construct(keys[0])
    return jwt.decode(
        token,
        key,
        algorithms=["RS256"],
        audience=settings.keycloak_audience,
        issuer=settings.keycloak_issuer,
        options={"verify_at_hash": False},
    )


async def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_http_bearer),
    session: AsyncSession = Depends(get_session),
) -> User:
    if creds is None or creds.scheme.lower() != "bearer":
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )
    token = creds.credentials
    jwks = await fetch_jwks()
    try:
        claims = _decode_access_token(token, jwks)
    except ExpiredSignatureError as e:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED, detail="Token expired"
        ) from e
    except JWTError as e:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token: {e!s}"
        ) from e

    sub = claims.get("sub")
    if not sub or not isinstance(sub, str):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Missing sub claim")

    email = claims.get("email")
    if email is not None and not isinstance(email, str):
        email = str(email)
    preferred = claims.get("preferred_username") or claims.get("username")
    if preferred is not None and not isinstance(preferred, str):
        preferred = str(preferred)

    result = await session.execute(select(User).where(User.id == sub))
    user = result.scalar_one_or_none()
    if user is None:
        user = User(id=sub, email=email, username=preferred)
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user

    changed = False
    if email and user.email != email:
        user.email = email
        changed = True
    if preferred and user.username != preferred:
        user.username = preferred
        changed = True
    if changed:
        await session.commit()
        await session.refresh(user)
    return user
