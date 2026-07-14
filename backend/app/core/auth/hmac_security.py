import hmac
import hashlib
import time
import uuid
import json
from typing import Dict, Any

class HMACSigner:
    def __init__(self, secret_key: str):
        self.secret_key = secret_key.encode()

    def sign_payload(self, payload: Dict[str, Any]) -> Dict[str, str]:
        """
        Signs a payload and returns the necessary headers.
        Uses a compact JSON representation for cross-service stability.
        """
        timestamp = str(int(time.time()))
        nonce = str(uuid.uuid4())
        
        # Canonicalize payload (Sorted keys, no whitespace)
        payload_str = json.dumps(payload, sort_keys=True, separators=(',', ':'))
        
        message = f"{timestamp}|{nonce}|{payload_str}".encode()
        signature = hmac.new(self.secret_key, message, hashlib.sha256).hexdigest()
        
        return {
            "X-Shield-Signature": signature,
            "X-Shield-Timestamp": timestamp,
            "X-Shield-Nonce": nonce
        }
