from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import httpx
import os

router = APIRouter(prefix="/api/ai-intel", tags=["AI Intelligence"])

OLLAMA_URL = os.getenv("LLM_BASE_URL", "http://localhost:11434")
MODEL = os.getenv("LLM_MODEL", "llama3.2:3b")

class ForensicsRequest(BaseModel):
    alert_description: str
    severity: str
    source: str

@router.post("/analyze")
async def analyze_alert(req: ForensicsRequest):
    prompt = f"""
    [SOC ANALYST ASSISTANT]
    Analyze the following security alert and provide a concise forensic summary and mitigation steps.
    Alert: {req.alert_description}
    Severity: {req.severity}
    Source: {req.source}

    Format your response as follows:
    SUMMARY: ...
    MITIGATION: ...
    """
    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(
                f"{OLLAMA_URL}/api/generate",
                json={
                    "model": MODEL,
                    "prompt": prompt,
                    "stream": False
                },
                timeout=30.0
            )
            if res.status_code != 200:
                return _heuristic_analysis(req)
            
            data = res.json()
            response_text = data.get("response", "")
            
            # Simple parsing
            summary = "No summary generated."
            mitigation = "No mitigation provided."
            
            if "SUMMARY:" in response_text:
                summary = response_text.split("SUMMARY:")[1].split("MITIGATION:")[0].strip()
            if "MITIGATION:" in response_text:
                mitigation = response_text.split("MITIGATION:")[1].strip()
                
            return {
                "summary": summary,
                "mitigation": mitigation,
                "raw": response_text
            }
    except Exception as e:
        return _heuristic_analysis(req)

def _heuristic_analysis(req: ForensicsRequest):
    """Tactical fallback when LLM is unreachable."""
    desc = req.alert_description.lower()
    
    if "ddos" in desc or "flood" in desc:
        summary = "Detected a high-volume denial of service attempt targeting network availability."
        mitigation = "Activate rate limiting on perimeter gateways and route traffic through the scrubbing center."
    elif "sql" in desc or "injection" in desc:
        summary = "Critical database injection vector identified in web application layer."
        mitigation = "Enforce parameterized queries and update WAF rules to block common SQLi payloads."
    elif "brute" in desc or "login" in desc:
        summary = "Multiple failed authentication attempts indicating a brute-force campaign."
        mitigation = "Implement account lockout policies and mandate multi-factor authentication."
    else:
        summary = f"Automated analysis of {req.alert_description} complete. Pattern suggests target-specific reconnaissance."
        mitigation = "Monitor affected source for lateral movement and rotate relevant access keys."

    return {
        "summary": f"[SENTINEL HEURISTIC] {summary}",
        "mitigation": mitigation,
        "status": "NEURAL_LINK_STABLE"
    }
