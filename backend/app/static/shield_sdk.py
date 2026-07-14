import hmac
import hashlib
import json
import requests
import time

class ShieldClient:
    def __init__(self, api_key, gateway_url="http://localhost:8005"):
        self.api_key = api_key
        self.gateway_url = gateway_url

    def scan_request(self, method, url, headers, body, ip):
        """
        Sends request metadata to SHIELD SaaS for analysis
        Returns (is_safe, threat_info)
        """
        try:
            payload = {
                "method": method,
                "url": url,
                "headers": dict(headers),
                "body": body,
                "ip": ip,
                "timestamp": time.time()
            }
            
            res = requests.post(
                f"{self.gateway_url}/api/appsec/analyze",
                json=payload,
                headers={"X-API-KEY": self.api_key},
                timeout=2
            )
            
            if res.status_code == 200:
                data = res.json()
                return not data.get("is_malicious", False), data
            
            return True, None # Fail open on system errors
        except:
            return True, None # Fail open on network errors
