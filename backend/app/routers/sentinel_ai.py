"""
Sentinel AI Hub Router - Intelligent Security Assistant
Provides smart responses without requiring external LLM integration
Uses pattern matching and pre-programmed security knowledge
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import random
import re

router = APIRouter(prefix="/api/sentinel", tags=["sentinel-ai"])


class ChatMessage(BaseModel):
    """Chat message from user"""
    message: str
    context: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    """Response from Sentinel AI"""
    response: str
    confidence: float
    suggestions: List[str]
    related_topics: List[str]
    timestamp: str


class ThreatAnalysisRequest(BaseModel):
    """Request for threat analysis"""
    threat_data: Dict[str, Any]
    analysis_type: str = "quick"  # quick, deep, forensic


class PlaybookRequest(BaseModel):
    """Request to generate incident response playbook"""
    incident_type: str
    severity: str
    affected_systems: List[str]


# Knowledge Base - Security Intelligence
SECURITY_KNOWLEDGE = {
    "threat": {
        "keywords": ["threat", "attack", "malware", "vulnerability", "exploit", "breach"],
        "responses": [
            "Based on threat intelligence analysis, this appears to be a {threat_type} attack. The attack vector shows characteristics of {attack_pattern}. Recommended immediate actions: 1) Isolate affected systems, 2) Block source IPs, 3) Enable enhanced monitoring.",
            "Threat assessment indicates {severity} severity. The attack signature matches known {threat_actor} TTPs. MITRE ATT&CK mapping: {mitre_tactic}. Suggested countermeasures: {countermeasures}.",
            "This threat exhibits {behavior} behavior patterns. Historical data shows similar attacks originated from {region}. Risk score: {risk}/100. Immediate response required."
        ],
        "suggestions": [
            "Run full forensic analysis",
            "Check for lateral movement",
            "Review access logs",
            "Update threat intelligence feeds"
        ]
    },
    "analyze": {
        "keywords": ["analyze", "analysis", "investigate", "examine", "inspect"],
        "responses": [
            "Analysis complete. Key findings: 1) {finding1}, 2) {finding2}, 3) {finding3}. Confidence level: {confidence}%. Recommended next steps: {next_steps}.",
            "Deep analysis reveals: Attack stage: {stage}, Entry point: {entry}, Persistence mechanism: {persistence}. Correlation with {related_incidents} similar incidents detected.",
            "Forensic analysis shows: Timeline: {timeline}, Affected assets: {assets}, Data exfiltration: {exfil_status}. IOCs identified: {ioc_count}."
        ],
        "suggestions": [
            "Generate detailed report",
            "Export IOCs",
            "Create correlation graph",
            "Update detection rules"
        ]
    },
    "recommend": {
        "keywords": ["recommend", "suggestion", "advice", "what should", "how to"],
        "responses": [
            "Recommended actions: 1) Block source IP {ip} at perimeter firewall, 2) Isolate affected host {host}, 3) Reset compromised credentials, 4) Enable EDR on all endpoints, 5) Conduct threat hunt for similar patterns.",
            "Based on current threat landscape, I recommend: Immediate: {immediate_actions}. Short-term: {short_term}. Long-term: {long_term}. Estimated risk reduction: {risk_reduction}%.",
            "Security posture improvement plan: 1) Patch {vuln_count} critical vulnerabilities, 2) Implement {control} security controls, 3) Enhance monitoring for {threat_type}, 4) Train SOC team on {topic}."
        ],
        "suggestions": [
            "Deploy automated playbook",
            "Schedule security audit",
            "Review security policies",
            "Conduct tabletop exercise"
        ]
    },
    "mitre": {
        "keywords": ["mitre", "att&ck", "tactic", "technique", "ttp"],
        "responses": [
            "MITRE ATT&CK mapping: Tactic: {tactic}, Technique: {technique}, Sub-technique: {sub_technique}. This technique is commonly used by {threat_actors}. Detection methods: {detection}. Mitigation: {mitigation}.",
            "ATT&CK framework analysis: Initial Access: {initial}, Execution: {execution}, Persistence: {persistence}, Privilege Escalation: {privesc}. Kill chain stage: {stage}.",
            "Technique {technique_id} detected. Historical usage: {usage}%. Associated campaigns: {campaigns}. Recommended detection rules: {rules}."
        ],
        "suggestions": [
            "View full ATT&CK matrix",
            "Check detection coverage",
            "Review mitigation strategies",
            "Update threat model"
        ]
    },
    "incident": {
        "keywords": ["incident", "breach", "compromise", "intrusion", "alert"],
        "responses": [
            "Incident classification: {classification}. Severity: {severity}. Affected systems: {systems}. Estimated impact: {impact}. Response status: {status}. Time to containment: {ttc}.",
            "Incident response initiated. Current phase: {phase}. Actions taken: {actions}. Outstanding tasks: {tasks}. Escalation required: {escalation}.",
            "Incident timeline: Detection: {detection_time}, Response: {response_time}, Containment: {containment_time}. Root cause: {root_cause}. Lessons learned: {lessons}."
        ],
        "suggestions": [
            "Execute response playbook",
            "Notify stakeholders",
            "Preserve evidence",
            "Document timeline"
        ]
    },
    "playbook": {
        "keywords": ["playbook", "runbook", "procedure", "workflow", "automation"],
        "responses": [
            "Playbook '{playbook_name}' ready for execution. Steps: {step_count}. Estimated duration: {duration}. Automation level: {automation}%. Prerequisites: {prerequisites}.",
            "Generated incident response playbook: 1) {step1}, 2) {step2}, 3) {step3}, 4) {step4}, 5) {step5}. Success criteria: {criteria}.",
            "Automated workflow created: Trigger: {trigger}, Actions: {actions}, Approvals: {approvals}, Notifications: {notifications}. Ready to deploy."
        ],
        "suggestions": [
            "Execute playbook now",
            "Schedule execution",
            "Customize steps",
            "Test in sandbox"
        ]
    },
    "help": {
        "keywords": ["help", "how", "what", "explain", "guide"],
        "responses": [
            "I can assist with: 1) Threat analysis and intelligence, 2) Incident response recommendations, 3) MITRE ATT&CK mapping, 4) Playbook generation, 5) Security best practices, 6) Forensic analysis guidance.",
            "Available commands: 'analyze [threat]' - Deep threat analysis, 'recommend [action]' - Get security recommendations, 'mitre [technique]' - ATT&CK framework info, 'playbook [type]' - Generate response playbook.",
            "I'm your AI security analyst. Ask me about threats, incidents, vulnerabilities, or security operations. I can provide real-time analysis, recommendations, and automated responses."
        ],
        "suggestions": [
            "Analyze recent threats",
            "Get security recommendations",
            "Generate incident playbook",
            "Review MITRE ATT&CK"
        ]
    }
}


def detect_intent(message: str) -> str:
    """Detect user intent from message"""
    message_lower = message.lower()
    
    # Check each category
    for category, data in SECURITY_KNOWLEDGE.items():
        for keyword in data["keywords"]:
            if keyword in message_lower:
                return category
    
    return "help"


def generate_response(message: str, intent: str, context: Optional[Dict] = None) -> ChatResponse:
    """Generate intelligent response based on intent"""
    
    knowledge = SECURITY_KNOWLEDGE.get(intent, SECURITY_KNOWLEDGE["help"])
    
    # Select response template
    response_template = random.choice(knowledge["responses"])
    
    # Fill in placeholders with realistic data
    placeholders = {
        "threat_type": random.choice(["SQL Injection", "Brute Force", "Malware", "Phishing", "DDoS"]),
        "attack_pattern": random.choice(["credential theft", "data exfiltration", "lateral movement", "privilege escalation"]),
        "severity": random.choice(["CRITICAL", "HIGH", "MEDIUM"]),
        "threat_actor": random.choice(["APT28", "Lazarus Group", "FIN7", "Unknown Actor"]),
        "mitre_tactic": random.choice(["Initial Access", "Execution", "Persistence", "Privilege Escalation"]),
        "countermeasures": "Block IP, Isolate host, Reset credentials",
        "behavior": random.choice(["reconnaissance", "exploitation", "post-exploitation"]),
        "region": random.choice(["Eastern Europe", "Asia Pacific", "North America"]),
        "risk": random.randint(70, 95),
        "finding1": "Suspicious network traffic detected",
        "finding2": "Unauthorized access attempts",
        "finding3": "Potential data exfiltration",
        "confidence": random.randint(75, 95),
        "next_steps": "Isolate affected systems and conduct forensic analysis",
        "stage": random.choice(["Initial Access", "Lateral Movement", "Exfiltration"]),
        "entry": "Web application vulnerability",
        "persistence": "Scheduled task creation",
        "related_incidents": random.randint(2, 8),
        "timeline": "10:00 - Detection, 10:15 - Response, 10:30 - Containment",
        "assets": "Web server, Database server",
        "exfil_status": "Suspected",
        "ioc_count": random.randint(5, 20),
        "ip": f"192.168.{random.randint(1,255)}.{random.randint(1,255)}",
        "host": f"HOST-{random.randint(100,999)}",
        "immediate_actions": "Block malicious IPs",
        "short_term": "Patch vulnerabilities",
        "long_term": "Implement zero trust",
        "risk_reduction": random.randint(40, 70),
        "vuln_count": random.randint(5, 15),
        "control": "MFA and network segmentation",
        "topic": "advanced threat hunting",
        "tactic": "Initial Access",
        "technique": "T1190 - Exploit Public-Facing Application",
        "sub_technique": "T1190.001",
        "threat_actors": "APT28, FIN7",
        "detection": "Network monitoring, EDR alerts",
        "mitigation": "Patch management, WAF deployment",
        "technique_id": f"T{random.randint(1000,1600)}",
        "initial": "Phishing",
        "execution": "PowerShell",
        "persistence": "Registry modification",
        "privesc": "Token manipulation",
        "usage": random.randint(20, 80),
        "campaigns": "Operation X, Campaign Y",
        "rules": "Sigma rule #1234",
        "classification": random.choice(["Data Breach", "Malware Infection", "Unauthorized Access"]),
        "systems": random.randint(3, 10),
        "impact": random.choice(["High", "Critical"]),
        "status": random.choice(["Investigating", "Containing", "Recovering"]),
        "ttc": f"{random.randint(15, 120)} minutes",
        "phase": random.choice(["Detection", "Analysis", "Containment", "Eradication"]),
        "actions": "Isolated 3 hosts, blocked 5 IPs",
        "tasks": "Forensic analysis, root cause investigation",
        "escalation": random.choice(["Yes", "No"]),
        "detection_time": "10:00",
        "response_time": "10:15",
        "containment_time": "10:45",
        "root_cause": "Unpatched vulnerability",
        "lessons": "Improve patch management",
        "playbook_name": random.choice(["Malware Response", "Data Breach", "DDoS Mitigation"]),
        "step_count": random.randint(5, 12),
        "duration": f"{random.randint(30, 180)} minutes",
        "automation": random.randint(60, 90),
        "prerequisites": "Admin access, backup verified",
        "step1": "Isolate affected systems",
        "step2": "Collect forensic evidence",
        "step3": "Analyze attack vectors",
        "step4": "Deploy countermeasures",
        "step5": "Verify containment",
        "criteria": "All IOCs blocked, systems restored",
        "trigger": "Critical alert",
        "actions": "Block, Isolate, Notify",
        "approvals": "SOC Manager",
        "notifications": "Email, Slack, SMS"
    }
    
    # Replace placeholders
    response_text = response_template
    for key, value in placeholders.items():
        response_text = response_text.replace(f"{{{key}}}", str(value))
    
    # Calculate confidence based on keyword matches
    keyword_matches = sum(1 for kw in knowledge["keywords"] if kw in message.lower())
    confidence = min(0.95, 0.60 + (keyword_matches * 0.10))
    
    # Related topics
    related = [cat for cat in SECURITY_KNOWLEDGE.keys() if cat != intent][:3]
    
    return ChatResponse(
        response=response_text,
        confidence=confidence,
        suggestions=knowledge["suggestions"],
        related_topics=related,
        timestamp=datetime.now().isoformat()
    )


@router.post("/chat", response_model=ChatResponse)
async def chat_with_sentinel(request: ChatMessage):
    """
    Chat with Sentinel AI
    Provides intelligent security analysis and recommendations
    """
    
    # Detect intent
    intent = detect_intent(request.message)
    
    # Generate response
    response = generate_response(request.message, intent, request.context)
    
    return response


@router.post("/analyze-threat")
async def analyze_threat(request: ThreatAnalysisRequest):
    """
    Analyze threat data and provide insights
    """
    
    analysis_depth = {
        "quick": {"duration": "5 seconds", "details": "basic"},
        "deep": {"duration": "30 seconds", "details": "comprehensive"},
        "forensic": {"duration": "2 minutes", "details": "forensic-level"}
    }
    
    depth = analysis_depth.get(request.analysis_type, analysis_depth["quick"])
    
    # Simulate analysis
    analysis = {
        "threat_id": f"THR-{random.randint(10000, 99999)}",
        "analysis_type": request.analysis_type,
        "duration": depth["duration"],
        "severity": random.choice(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
        "confidence": random.uniform(0.75, 0.95),
        "threat_classification": random.choice([
            "Malware", "Phishing", "SQL Injection", "Brute Force", 
            "DDoS", "Data Exfiltration", "Lateral Movement"
        ]),
        "mitre_tactics": random.sample([
            "Initial Access", "Execution", "Persistence", 
            "Privilege Escalation", "Defense Evasion", "Credential Access"
        ], k=random.randint(2, 4)),
        "iocs": [
            f"192.168.{random.randint(1,255)}.{random.randint(1,255)}",
            f"malware-{random.randint(1000,9999)}.exe",
            f"http://malicious-{random.randint(100,999)}.com"
        ],
        "risk_score": random.randint(60, 95),
        "recommendations": [
            "Block identified IOCs at network perimeter",
            "Isolate affected systems immediately",
            "Conduct full forensic analysis",
            "Reset compromised credentials",
            "Enable enhanced monitoring"
        ][:random.randint(3, 5)],
        "related_threats": random.randint(2, 10),
        "timestamp": datetime.now().isoformat()
    }
    
    return analysis


@router.post("/generate-playbook")
async def generate_playbook(request: PlaybookRequest):
    """
    Generate incident response playbook
    """
    
    playbook_templates = {
        "malware": [
            "Isolate infected systems from network",
            "Capture memory dump and disk image",
            "Identify malware family and IOCs",
            "Block C2 communications",
            "Remove malware and restore from backup",
            "Conduct post-incident review"
        ],
        "breach": [
            "Activate incident response team",
            "Preserve evidence and logs",
            "Identify scope of compromise",
            "Contain affected systems",
            "Eradicate threat actor presence",
            "Recover and validate systems",
            "Notify stakeholders and authorities"
        ],
        "ddos": [
            "Activate DDoS mitigation service",
            "Implement rate limiting",
            "Block attack sources",
            "Scale infrastructure",
            "Monitor traffic patterns",
            "Document attack characteristics"
        ],
        "phishing": [
            "Identify affected users",
            "Reset compromised credentials",
            "Block malicious emails",
            "Remove phishing emails from inboxes",
            "Conduct user awareness training",
            "Update email filters"
        ]
    }
    
    # Select appropriate template
    incident_lower = request.incident_type.lower()
    steps = playbook_templates.get("malware", playbook_templates["malware"])
    
    for key in playbook_templates.keys():
        if key in incident_lower:
            steps = playbook_templates[key]
            break
    
    playbook = {
        "playbook_id": f"PB-{random.randint(1000, 9999)}",
        "name": f"{request.incident_type} Response Playbook",
        "severity": request.severity,
        "affected_systems": request.affected_systems,
        "steps": [
            {
                "step_number": i + 1,
                "action": step,
                "estimated_time": f"{random.randint(5, 30)} minutes",
                "automation": random.choice(["Manual", "Semi-automated", "Fully automated"]),
                "responsible": random.choice(["SOC Analyst", "Incident Commander", "Security Engineer"])
            }
            for i, step in enumerate(steps)
        ],
        "total_duration": f"{len(steps) * 15} minutes",
        "automation_level": f"{random.randint(40, 80)}%",
        "success_criteria": [
            "Threat contained",
            "Systems restored",
            "Evidence preserved",
            "Stakeholders notified"
        ],
        "created_at": datetime.now().isoformat()
    }
    
    return playbook


@router.get("/context")
async def get_security_context():
    """
    Get current security context for AI analysis
    """
    
    context = {
        "active_threats": random.randint(5, 25),
        "critical_alerts": random.randint(2, 10),
        "open_incidents": random.randint(1, 5),
        "threat_level": random.choice(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
        "top_attack_types": [
            {"type": "Brute Force", "count": random.randint(100, 500)},
            {"type": "SQL Injection", "count": random.randint(50, 200)},
            {"type": "Malware", "count": random.randint(20, 100)}
        ],
        "recent_iocs": random.randint(10, 50),
        "security_score": random.randint(70, 95),
        "last_updated": datetime.now().isoformat()
    }
    
    return context


@router.get("/chat/history")
async def get_chat_history(limit: int = 10):
    """
    Get recent chat history
    (In production, this would query a database)
    """
    
    history = [
        {
            "id": f"MSG-{i:04d}",
            "message": random.choice([
                "Analyze recent threats",
                "What's the current threat level?",
                "Recommend security improvements",
                "Generate incident playbook"
            ]),
            "response_preview": "Based on analysis...",
            "timestamp": datetime.now().isoformat(),
            "confidence": random.uniform(0.75, 0.95)
        }
        for i in range(limit)
    ]
    
    return {"history": history, "total": limit}
