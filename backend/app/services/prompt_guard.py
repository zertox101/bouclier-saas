import re


INJECTION_PATTERNS = [
    r"ignore\s+previous",
    r"disregard\s+instructions",
    r"system\s+prompt",
    r"reveal\s+secret",
    r"exfiltrate",
    r"bypass\s+policy",
    r"act\s+as\s+system",
    r"tool\s+override",
    r"instead\s+of\s+following",
    r"new\s+priority",
    r"original\s+instructions",
    r"show\s+the\s+prompt",
    r"dump\s+context",
    r"base64\s+decode",
    r"execute\s+arbitrary",
]


def is_prompt_injection(text: str) -> bool:
    if not text:
        return False
    lower = text.lower()
    
    # 1. Regex check
    if any(re.search(pattern, lower) for pattern in INJECTION_PATTERNS):
        return True
    
    # 2. Heuristic: Check for excessive capitalization or "system-like" tokens
    system_tokens = ["system:", "user:", "assistant:", "role:"]
    if sum(1 for tok in system_tokens if tok in lower) > 2:
        return True
        
    return False
