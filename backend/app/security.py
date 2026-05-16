from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2AuthorizationCodeBearer
from jose import JWTError, jwt
from pydantic import BaseModel
from typing import Optional
import requests

from app.config import settings


class KeycloakConfig(BaseModel):
    server_url: str
    realm: str
    client_id: str
    client_secret: str

    @property
    def openid_config_url(self) -> str:
        return f"{self.server_url}/realms/{self.realm}/.well-known/openid-configuration"

    @property
    def token_introspection_url(self) -> str:
        return f"{self.server_url}/realms/{self.realm}/protocol/openid-connect/token/introspect"

    @property
    def jwks_url(self) -> str:
        return f"{self.server_url}/realms/{self.realm}/protocol/openid-connect/certs"


class TokenInfo(BaseModel):
    active: bool
    sub: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None
    roles: list[str] = []


keycloak_config = KeycloakConfig(
    server_url=settings.keycloak_server_url,
    realm=settings.keycloak_realm,
    client_id=settings.keycloak_client_id,
    client_secret=settings.keycloak_client_secret,
)

oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl=f"{keycloak_config.server_url}/realms/{keycloak_config.realm}/protocol/openid-connect/auth",
    tokenUrl=f"{keycloak_config.server_url}/realms/{keycloak_config.realm}/protocol/openid-connect/token",
)


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """
    Validate JWT token with Keycloak and return user info.
    Unauthorized users will receive 401 error.
    """
    try:
        # Introspect token with Keycloak
        response = requests.post(
            keycloak_config.token_introspection_url,
            data={
                "token": token,
                "client_id": keycloak_config.client_id,
                "client_secret": keycloak_config.client_secret,
            },
            timeout=5,
        )
        response.raise_for_status()
        token_info = TokenInfo(**response.json())

        if not token_info.active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return {
            "sub": token_info.sub,
            "username": token_info.username,
            "email": token_info.email,
            "roles": token_info.roles,
        }

    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e
    except requests.RequestException as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service unavailable",
        ) from e
