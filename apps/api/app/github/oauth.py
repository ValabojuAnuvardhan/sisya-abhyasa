import time
import hmac
import hashlib
import base64
import logging
from urllib.parse import urlencode
import httpx
from app.core.config import settings

logger = logging.getLogger("sisya.github_oauth")

def get_secret_key() -> str:
    return (
        settings.oauth_client_secret
        or settings.secret_key
        or "sisya-secret-key-change-in-production-32bytes!"
    )

def generate_oauth_state(user_id: str) -> str:
    timestamp = str(int(time.time()))
    payload = f"{user_id}:{timestamp}"
    secret = get_secret_key().encode()
    sig = hmac.new(secret, payload.encode(), hashlib.sha256).hexdigest()
    raw_state = f"{payload}:{sig}"
    return base64.urlsafe_b64encode(raw_state.encode()).decode()

def verify_oauth_state(state: str, max_age_seconds: int = 900) -> str:
    """
    Verifies OAuth state payload and HMAC signature.
    Returns the authenticated user_id if state is valid and unexpired.
    Raises ValueError if state is missing, corrupted, tampered, or expired.
    """
    if not state:
        logger.warning("OAuth failed: Missing state parameter.")
        raise ValueError("Missing state parameter.")

    try:
        raw = base64.urlsafe_b64decode(state.encode()).decode()
        user_id, timestamp_str, sig = raw.rsplit(":", 2)
    except Exception as exc:
        logger.warning(f"OAuth failed: Invalid state format ({state}).")
        raise ValueError("Invalid OAuth state format.") from exc

    # Validate HMAC signature
    payload = f"{user_id}:{timestamp_str}"
    secret = get_secret_key().encode()
    expected_sig = hmac.new(secret, payload.encode(), hashlib.sha256).hexdigest()

    if not hmac.compare_digest(expected_sig, sig):
        logger.warning("OAuth failed: State HMAC signature mismatch.")
        raise ValueError("OAuth state validation failed (HMAC signature mismatch).")

    # Validate expiration
    try:
        ts = int(timestamp_str)
        if time.time() - ts > max_age_seconds:
            logger.warning("OAuth failed: Expired OAuth state.")
            raise ValueError("OAuth state expired. Please try connecting again.")
    except (ValueError, TypeError) as exc:
        raise ValueError("Invalid timestamp in OAuth state.") from exc

    return user_id

def get_authorization_url(user_id: str) -> str:
    client_id = settings.oauth_client_id
    state = generate_oauth_state(user_id)

    if not client_id or client_id.startswith("YOUR_"):
        # Dev fallback mode: Redirect directly to local callback with a signed state & demo code
        logger.info(f"OAuth started (dev fallback mode - no client ID configured) for user {user_id}")
        return f"{settings.github_callback_url}?code=dev_demo_oauth_code_12345&state={state}"

    params = {
        "client_id": client_id,
        "redirect_uri": settings.github_callback_url,
        "scope": "read:user repo",
        "state": state,
        "allow_signup": "true",
    }
    url = f"https://github.com/login/oauth/authorize?{urlencode(params)}"
    logger.info(f"OAuth started for user {user_id}")
    return url

def exchange_code_for_token(code: str) -> str:
    if not code:
        logger.warning("OAuth failed: Missing authorization code.")
        raise ValueError("Missing authorization code from GitHub.")

    if code.startswith("dev_demo_oauth_code"):
        logger.info("OAuth exchange (dev fallback mode): Returning demo access token")
        return "gho_dev_demo_access_token_999888777666"

    client_id = settings.oauth_client_id
    client_secret = settings.oauth_client_secret

    if not client_id or not client_secret or client_id.startswith("YOUR_"):
        logger.error("OAuth exchange error: GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET not configured.")
        raise ValueError("GitHub OAuth client credentials are not configured in environment variables.")

    headers = {"Accept": "application/json"}
    payload = {
        "client_id": client_id,
        "client_secret": client_secret,
        "code": code,
        "redirect_uri": settings.github_callback_url,
    }

    try:
        res = httpx.post(
            "https://github.com/login/oauth/access_token",
            json=payload,
            headers=headers,
            timeout=15.0,
        )
        res.raise_for_status()
        data = res.json()
    except httpx.HTTPError as exc:
        logger.error(f"OAuth failed: Network error exchanging code: {exc}")
        raise ValueError("Failed to connect to GitHub OAuth server.") from exc

    access_token = data.get("access_token")
    if not access_token:
        error_desc = data.get("error_description") or data.get("error") or "Unknown error"
        logger.warning(f"OAuth failed: GitHub returned error: {error_desc}")
        raise ValueError(f"GitHub OAuth error: {error_desc}")

    return access_token

def encrypt_token(token: str) -> str:
    """Helper to encrypt access token for secure persistence."""
    if not token:
        return ""
    secret = get_secret_key().encode()
    raw = token.encode()
    encrypted = bytes([b ^ secret[i % len(secret)] for i, b in enumerate(raw)])
    return "enc_" + base64.urlsafe_b64encode(encrypted).decode()

def decrypt_token(encrypted_token: str) -> str:
    """Helper to decrypt access token."""
    if not encrypted_token:
        return ""
    if not encrypted_token.startswith("enc_"):
        return encrypted_token
    raw_b64 = encrypted_token[4:]
    secret = get_secret_key().encode()
    encrypted = base64.urlsafe_b64decode(raw_b64.encode())
    decrypted = bytes([b ^ secret[i % len(secret)] for i, b in enumerate(encrypted)])
    return decrypted.decode(errors="ignore")

