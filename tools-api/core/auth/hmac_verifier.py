import hmac
import hashlib
import time
import json
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("shield.hmac-verifier")

class HMACVerifier:
    def __init__(self, secret_key: str, max_drift: int = 60):
        self.secret_key = secret_key.encode()
        self.max_drift = max_drift

    def verify_request(self, 
                       payload: Dict[str, Any], 
                       signature: str, 
                       timestamp: str, 
                       nonce: str) -> bool:
        """
        Verifies the signature of an incoming request.
        """
        try:
            # 1. Anti-Replay Check (Timestamp Drift)
            request_time = int(timestamp)
            current_time = int(time.time())
            
            if abs(current_time - request_time) > self.max_drift:
                logger.error(f"HMAC Reject: Timestamp drift exceeds {self.max_drift}s limit.")
                return False
                
            # 2. Re-calculate Signature (Compact JSON)
            payload_str = json.dumps(payload, sort_keys=True, separators=(',', ':'))
            message = f"{timestamp}|{nonce}|{payload_str}".encode()
            
            expected_signature = hmac.new(self.secret_key, message, hashlib.sha256).hexdigest()
            
            # 3. Secure Constant-Time Comparison
            if not hmac.compare_digest(expected_signature, signature):
                logger.error(f"HMAC Reject: Invalid signature for nonce {nonce}")
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"HMAC Error during verification: {str(e)}")
            return False
