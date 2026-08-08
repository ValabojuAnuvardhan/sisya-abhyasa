from dataclasses import dataclass
from fastapi import Header, HTTPException, status
from app.core.config import settings

@dataclass(frozen=True)
class AuthPrincipal:
    subject: str
    email: str | None = None

async def require_principal(
    authorization: str | None = Header(default=None),
    x_dev_auth_subject: str | None = Header(default=None),
    x_dev_auth_email: str | None = Header(default=None),
) -> AuthPrincipal:
    """Authentication boundary.

    Development may use explicit X-Dev-Auth-* headers. Production refuses this
    path until a real OIDC/JWT verifier is configured in Sprint 1 deployment.
    """
    if settings.environment == "development" and settings.allow_dev_auth:
        if not x_dev_auth_subject:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing development identity")
        return AuthPrincipal(subject=x_dev_auth_subject, email=x_dev_auth_email)

    # Do not pretend authentication is complete in production.
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Production identity provider is not configured")
