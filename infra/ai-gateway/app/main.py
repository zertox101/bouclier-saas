from fastapi import FastAPI, Request, HTTPException, Header
import httpx
import os
import logging
import re
import json
from typing import Dict, Any, Optional

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("shield.ai-gateway")

app = FastAPI(title="SHIELD AI Control Plane (Gateway)")

LLM_BACKEND_URL = os.getenv("LLM_BACKEND_URL", "http://ollama:11434")

# Model Mapping (Hybrid Architecture)
MODEL_REGISTRY = {
    "general": os.getenv("LLM_MODEL_GENERAL", "llama3.2:3b"),
    "security": os.getenv("LLM_MODEL_SECURITY", "deepseek-coder:6.7b"),
    "fast": "tinyllama"
}

# Basic Prompt Injection Patterns
INJECTION_PATTERNS = [
    r"ignore previous instructions",
    r"system bypass",
    r"reveal your system prompt",
    r"sudo ",
    r"bash ",
    r"rm -rf",
]

def scan_prompt(prompt: str) -> bool:
    """Returns True if the prompt is suspicious."""
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, prompt, re.IGNORECASE):
            logger.warning(f"INJECTION DETECTED: Match found for pattern '{pattern}'")
            return True
    return False

@app.post("/api/generate")
async def generate_completion(
    request: Request,
    x_shield_intent: Optional[str] = Header(None)
):
    """
    AI Router & Gatekeeper.
    Routes requests to the optimal model based on intent and security policies.
    """
    body = await request.json()
    prompt = body.get("prompt", "")
    
    # 🛑 1. Security Firewall (Input)
    if scan_prompt(prompt):
        logger.error("Security Policy Violation: Blocked malicious prompt.")
        raise HTTPException(status_code=403, detail="AI POLICY VIOLATION: Suspicious activity detected.")

    # 🧠 2. Intelligent Routing Logic
    # Default to general model
    target_model = MODEL_REGISTRY["general"]
    
    # Override based on Intent Header or Keywords
    if x_shield_intent == "security" or any(kw in prompt.lower() for kw in ["vulnerability", "nmap", "exploit", "cve"]):
        target_model = MODEL_REGISTRY["security"]
        logger.info(f"Routing to SECURITY model: {target_model}")
    else:
        logger.info(f"Routing to GENERAL model: {target_model}")

    # Inject model into body
    body["model"] = target_model

    # 🔄 3. Forward to AI Backend (Ollama)
    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            # Ensure model is pulled (Async attempt - in prod we pre-pull)
            # await client.post(f"{LLM_BACKEND_URL}/api/pull", json={"name": target_model})
            
            response = await client.post(f"{LLM_BACKEND_URL}/api/generate", json=body)
            
            if response.status_code != 200:
                logger.error(f"Ollama Error ({response.status_code}): {response.text}")
                raise HTTPException(status_code=502, detail="AI Backend Error")

            resp_data = response.json()
            response_text = resp_data.get("response", "")
            
            # 🔍 4. Output Data Loss Prevention (DLP)
            if "BOUCLIER_ALPHA" in response_text:
                logger.error("DLP DETECTED: Model tried to leak internal session secret.")
                resp_data["response"] = "[REDACTED BY SHIELD GATEWAY: DATA LOSS PREVENTION]"

            return resp_data
            
        except Exception as e:
            logger.error(f"Gateway Routing error: {e}")
            raise HTTPException(status_code=502, detail="AI Infrastructure Unreachable.")

@app.get("/health")
async def health():
    return {
        "status": "active",
        "registry": MODEL_REGISTRY,
        "backend": LLM_BACKEND_URL
    }
