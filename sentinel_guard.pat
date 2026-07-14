# Sentinel Guard - AI Attack Patterns (.pat)
# Version: 1.0.2
# Last Updated: 2026-03-11

[INJECTION_PATTERNS]
ignore_all_previous: r"ignore\s+all\s+previous"
disregard_instructions: r"disregard\s+instructions"
system_prompt_reveal: r"output\s+the\s+original\s+system\s+prompt"
reveal_instructions: r"reveal\s+your\s+instructions"
dev_mode_jailbreak: r"you\s+are\s+now\s+in\s+developer\s+mode"
admin_mode_switch: r"switch\s+to\s+admin\s+mode"
security_bypass: r"bypass\s+security\s+filters"
code_execution: r"execute\s+arbitrary\s+code"
db_dump: r"dump\s+database\s+credentials"
system_destructive: r"format\s+c:|sudo\s+rm\s+-rf"
obfuscated_decode: r"base64\s+decode\s+this"

[OBFUSCATION_PATTERNS]
unicode_escape: r"\\u[0-9a-fA-F]{4}"
hex_encoding: r"0x[0-9a-fA-F]+"
base64_script: r"PHNjcmlwdD4="

[JAILBREAK_HEURISTICS]
jailbreak_terms: jailbreak, dan, stay out of character, developer mode
role_impersonation: user:, system:
