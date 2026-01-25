import re


EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
IP_RE = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")
PHONE_RE = re.compile(r"\b\+?\d[\d\s().-]{7,}\b")
SECRET_RE = re.compile(r"(?:sk-|AI_|[A-Za-z0-9+/]{20,})[A-Za-z0-9+/]{20,}") # Basic secret pattern
CANARY_RE = re.compile(r"canary_token_[a-zA-Z0-9]+")


def redact_text(text: str) -> str:
    if not text:
        return text
    text = EMAIL_RE.sub("[REDACTED_EMAIL]", text)
    text = IP_RE.sub("[REDACTED_IP]", text)
    text = PHONE_RE.sub("[REDACTED_PHONE]", text)
    text = SECRET_RE.sub("[REDACTED_SECRET]", text)
    if CANARY_RE.search(text):
        # In a real app, this would trigger an alert
        text = CANARY_RE.sub("[CANARY_ALERT_TRIGGERED]", text)
    return text
