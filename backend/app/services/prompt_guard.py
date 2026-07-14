import re
from typing import Dict, Tuple

# Advanced patterns from OWASP LLM Top 10 & Research
INJECTION_PATTERNS = [
    r"ignore\s+all\s+previous",
    r"disregard\s+instructions",
    r"output\s+the\s+original\s+system\s+prompt",
    r"reveal\s+your\s+instructions",
    r"you\s+are\s+now\s+in\s+developer\s+mode",
    r"switch\s+to\s+admin\s+mode",
    r"bypass\s+security\s+filters",
    r"execute\s+arbitrary\s+code",
    r"dump\s+database\s+credentials",
    r"format\s+c:",
    r"sudo\s+rm\s+-rf",
    r"base64\s+decode\s+this",
    r"instead\s+of\s+following\s+your\s+rules",
    r"new\s+identity\s+is",
    r"concierge\s+instructions",
    r"internal\s+developer\s+prompts",
    r"reveal\s+secret\s+key",
    r"exfiltrate\s+data",
]

OBFUSCATION_PATTERNS = [
    r"\\u[0-9a-fA-F]{4}", # Unicode escape
    r"0x[0-9a-fA-F]+",   # Hex
    r"PHNjcmlwdD4=",      # Base64 <script>
]

def analyze_prompt_security(text: str) -> Tuple[bool, float, str]:
    """
    Analyzes prompt for potential injection or malicious intent.
    Returns: (is_blocked, risk_score, reason)
    """
    if not text:
        return False, 0.0, ""

    lower = text.lower()
    risk_score = 0.0
    reasons = []

    # 1. Direct Pattern Match (High Risk)
    for pattern in INJECTION_PATTERNS:
        match = re.search(pattern, lower)
        if match:
            risk_score += 0.8
            reasons.append(f"matched_pattern:{pattern[:15]}")

    # 2. Obfuscation detection
    for pattern in OBFUSCATION_PATTERNS:
        if re.search(pattern, text):
            risk_score += 0.4
            reasons.append("obfuscation_detected")

    # 3. Role-play / Jailbreak heuristics
    jailbreak_terms = ["jailbreak", "dan", "stay out of character", "developer mode"]
    if any(term in lower for term in jailbreak_terms):
        risk_score += 0.5
        reasons.append("jailbreak_attempt")

    # 4. Prompt delimiters / leakage attempts
    if "user:" in lower and "system:" in lower:
        risk_score += 0.3
        reasons.append("role_impersonation")

    # 5. Final Verdict
    is_blocked = risk_score >= 0.6
    reason_str = ", ".join(reasons) if reasons else "clean"
    
    return is_blocked, min(risk_score, 1.0), reason_str

def is_prompt_injection(text: str) -> bool:
    blocked, _, _ = analyze_prompt_security(text)
    return blocked
