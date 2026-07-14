from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, List, Any
import json
import logging
from datetime import datetime

from app.core.database import get_db
from app.routes.soc_expert import soc_expert_summary
from app.services.llm import llm_service

logger = logging.getLogger("SHIELD")

router = APIRouter(prefix="/api/strategic-briefing", tags=["Strategic AI"])

# Simple in-memory cache to avoid hammering the LLM
_BRIEFING_CACHE = {
    "data": None,
    "timestamp": None,
    "ttl": 60  # 1 minute cache
}

@router.get("/")
def get_strategic_briefing(db: Session = Depends(get_db)):
    global _BRIEFING_CACHE
    
    # Check cache
    now = datetime.now()
    if _BRIEFING_CACHE["data"] and _BRIEFING_CACHE["timestamp"]:
        if (now - _BRIEFING_CACHE["timestamp"]).total_seconds() < _BRIEFING_CACHE["ttl"]:
            return _BRIEFING_CACHE["data"]
    """
    Generates a high-level strategic intelligence briefing for executives
    based on the current SOC Expert aggregated data.
    """
    try:
        # 1. Get current SOC stats
        soc_data = soc_expert_summary(db)
        
        # 2. Extract key metrics for the LLM
        summary_context = {
            "total_alerts_24h": soc_data.get("total_alerts_24h"),
            "risk_score": soc_data.get("risk_score"),
            "top_attack_types": [t["name"] for t in soc_data.get("attack_types", [])[:3]],
            "active_critical_incidents": soc_data.get("active_incidents", {}).get("Critical", 0),
            "threat_origins": [c["country"] for c in soc_data.get("top_countries", [])[:3]],
            "ai_accuracy": soc_data.get("ai_metrics", {}).get("accuracy", 0)
        }
        
        # 3. Construct Strategic Prompt
        prompt = f"""
        As the Chief Information Security Officer (CISO) AI Assistant, analyze the following SOC operational data and provide a strategic executive briefing.
        
        DATA CONTEXT:
        - Total Alerts (24h): {summary_context['total_alerts_24h']}
        - Current Risk Score: {summary_context['risk_score']}/100
        - Critical Incidents: {summary_context['active_critical_incidents']}
        - Top Threats: {', '.join(summary_context['top_attack_types'])}
        - Primary Threat Origins: {', '.join(summary_context['threat_origins'])}
        - AI Detection Accuracy: {summary_context['ai_accuracy']}%
        
        INSTRUCTIONS:
        1. Provide a 3-paragraph executive summary (Strategic Outlook, Immediate Risks, and Recommended Posture).
        2. Use professional, high-stakes military-grade terminology.
        3. Identify if we are in a 'Stable', 'Elevated', or 'Critical' state.
        4. Suggest the #1 priority for the security team today.
        
        Format the response as a clean JSON object with keys: 'status', 'summary', 'priority_action', 'risk_assessment'.
        """
        
        # 4. Call LLM
        analysis_raw = llm_service.call_llm(prompt, system_prompt="You are the SHIELD Strategic Intelligence Engine.", timeout=120)
        
        # 5. Parse LLM Response
        try:
            # Clean up potential markdown formatting in LLM response
            clean_json = analysis_raw.strip()
            if "```json" in clean_json:
                clean_json = clean_json.split("```json")[1].split("```")[0].strip()
            elif "```" in clean_json:
                clean_json = clean_json.split("```")[1].split("```")[0].strip()
                
            briefing = json.loads(clean_json)
        except Exception as e:
            logger.error(f"Failed to parse Strategic AI response: {e}")
            briefing = {
                "status": "ELEVATED" if summary_context['risk_score'] > 50 else "STABLE",
                "summary": analysis_raw,
                "priority_action": "Investigate top attack vectors and verify firewall rule efficacy.",
                "risk_assessment": f"Current risk score of {summary_context['risk_score']} indicates non-negligible activity."
            }
            
        result = {
            "timestamp": datetime.now().isoformat(),
            "briefing": briefing,
            "metrics_snapshot": summary_context
        }
        
        # Update cache
        _BRIEFING_CACHE["data"] = result
        _BRIEFING_CACHE["timestamp"] = now
        
        return result
        
    except Exception as e:
        logger.error(f"Strategic Briefing Error: {e}")
        return {"error": str(e), "status": "NEURAL_LINK_ERROR"}
