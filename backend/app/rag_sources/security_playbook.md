# Security Playbook

## Authentication Failures
Repeated authentication failures should trigger rate limiting and multi-factor authentication checks.
Investigate brute-force attempts and confirm whether accounts are targeted.

## Privilege Escalation
Privilege changes must be audited and tied to an approved request.
Validate the new role assignments and verify administrative actions.

## Response Checklist
1. Collect relevant logs.
2. Confirm user identity and source host.
3. Apply temporary access restrictions if needed.
