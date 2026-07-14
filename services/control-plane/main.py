import os
import time
import hmac
import hashlib
import logging
from typing import Optional
from fastapi import FastAPI, Request, HTTPException, Header, Response

# Setup Logging (SOC Format)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | SHIELD-PEP | %(message)s'
)
logger = logging.getLogger("shield.control-plane")

app = FastAPI(title="SHIELD Control Plane (PEP)")

# Security Configuration
_secret_raw = os.getenv("HMAC_SECRET_KEY")
if not _secret_raw:
    # Hard fail — do not run with a public default secret
    logger.critical("FATAL: HMAC_SECRET_KEY environment variable is not set. Refusing to start.")
    raise SystemExit(1)
HMAC_SECRET = _secret_raw.encode()
MAX_DRIFT = 60 # Seconds

@app.get("/health")
def health():
    return {"status": "operational", "layer": "control_plane"}

@app.get("/validate")
async def validate_request(
    request: Request,
    x_shield_signature: Optional[str] = Header(None),
    x_shield_timestamp: Optional[str] = Header(None),
    x_shield_nonce: Optional[str] = Header(None),
    x_shield_trace: Optional[str] = Header(None)
):
    """
    Policy Enforcement Point (PEP).
    Validates HMAC signature before allowing Nginx to proxy to backend.
    Enforces Zero-Trust at the edge.
    """
    trace_id = x_shield_trace or "unknown"

    # 1. Credential Check
    if not all([x_shield_signature, x_shield_timestamp, x_shield_nonce]):
        logger.warning(f"AUTH_FAILURE | Missing Headers | Trace: {trace_id}")
        raise HTTPException(status_code=401, detail="Missing Shield Credentials")

    # 2. Replay Protection (Drift check)
    try:
        req_ts = int(x_shield_timestamp)
        now = int(time.time())
        if abs(now - req_ts) > MAX_DRIFT:
            logger.warning(f"AUTH_FAILURE | Expired Token | Drift: {abs(now - req_ts)}s | Trace: {trace_id}")
            raise HTTPException(status_code=401, detail="Security Token Expired")
    except (ValueError, TypeError):
        raise HTTPException(status_code=401, detail="Invalid Timestamp")

    # 3. Signature Validation
    # In a full PEP, we'd also validate the URI/Method to prevent request tampering
    # For this blueprint, we validate the Timestamp + Nonce + Secret integrity
    message = f"{x_shield_timestamp}|{x_shield_nonce}".encode()
    expected_sig = hmac.new(HMAC_SECRET, message, hashlib.sha256).hexdigest()

    if not hmac.compare_digest(expected_sig, x_shield_signature):
        logger.error(f"AUTH_FAILURE | Invalid Signature | Trace: {trace_id}")
        raise HTTPException(status_code=403, detail="Neural Shield: Invalid Signature")

    # 4. Success - Audit Log
    logger.info(f"AUTH_SUCCESS | Validated Request | Trace: {trace_id} | Nonce: {x_shield_nonce}")
    
    # Return 200 to Nginx to allow the request
    return Response(status_code=200)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8008)
