#!/usr/bin/env python3
"""
SHIELD Zero Trust Security Framework
Identity verification, micro-segmentation, and continuous validation
"""

import sys
import os
import json
import hashlib
import secrets
import time
import base64
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
from enum import Enum
from dataclasses import dataclass, asdict
import socket

# Force UTF-8
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')


class TrustLevel(Enum):
    """Trust levels for Zero Trust"""
    NONE = 0
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    VERIFIED = 4


class AccessDecision(Enum):
    """Access control decisions"""
    DENY = "DENY"
    ALLOW = "ALLOW"
    REQUIRE_MFA = "REQUIRE_MFA"
    REQUIRE_STEP_UP = "REQUIRE_STEP_UP"
    QUARANTINE = "QUARANTINE"


@dataclass
class Identity:
    """User or device identity"""
    id: str
    type: str  # user, device, service
    name: str
    attributes: Dict
    trust_level: TrustLevel
    last_verified: float
    mfa_enabled: bool
    risk_score: float
    
    def to_dict(self):
        d = asdict(self)
        d['trust_level'] = self.trust_level.name
        return d


@dataclass
class Resource:
    """Protected resource"""
    id: str
    name: str
    type: str  # application, data, network, api
    sensitivity: str  # public, internal, confidential, restricted
    required_trust: TrustLevel
    allowed_actions: List[str]
    owner: str
    
    def to_dict(self):
        d = asdict(self)
        d['required_trust'] = self.required_trust.name
        return d


@dataclass
class AccessContext:
    """Context for access request"""
    identity_id: str
    resource_id: str
    action: str
    source_ip: str
    device_id: str
    timestamp: float
    location: Optional[str] = None
    user_agent: Optional[str] = None
    session_id: Optional[str] = None


class IdentityProvider:
    """Identity and authentication provider"""
    
    def __init__(self):
        self.identities: Dict[str, Identity] = {}
        self.sessions: Dict[str, Dict] = {}
        self.mfa_challenges: Dict[str, str] = {}
    
    def register_identity(self, identity: Identity):
        """Register new identity"""
        self.identities[identity.id] = identity
    
    def authenticate(self, identity_id: str, credential: str) -> Optional[str]:
        """Authenticate and create session"""
        identity = self.identities.get(identity_id)
        if not identity:
            return None
        
        # Verify credential (simplified - use proper auth in production)
        expected_hash = hashlib.sha256(f"{identity_id}:password".encode()).hexdigest()
        provided_hash = hashlib.sha256(f"{identity_id}:{credential}".encode()).hexdigest()
        
        if expected_hash != provided_hash:
            return None
        
        # Create session
        session_id = secrets.token_hex(32)
        self.sessions[session_id] = {
            'identity_id': identity_id,
            'created': time.time(),
            'expires': time.time() + 3600,  # 1 hour
            'mfa_verified': not identity.mfa_enabled,
            'trust_level': identity.trust_level,
        }
        
        # Update last verified
        identity.last_verified = time.time()
        
        return session_id
    
    def initiate_mfa(self, session_id: str) -> str:
        """Initiate MFA challenge"""
        if session_id not in self.sessions:
            raise ValueError("Invalid session")
        
        # Generate TOTP code (simplified)
        code = str(secrets.randbelow(1000000)).zfill(6)
        self.mfa_challenges[session_id] = code
        
        print(f"    [MFA] Code sent: {code}")  # In real system, send via SMS/email
        return "MFA challenge initiated"
    
    def verify_mfa(self, session_id: str, code: str) -> bool:
        """Verify MFA code"""
        expected = self.mfa_challenges.get(session_id)
        if expected and expected == code:
            self.sessions[session_id]['mfa_verified'] = True
            del self.mfa_challenges[session_id]
            return True
        return False
    
    def validate_session(self, session_id: str) -> Optional[Dict]:
        """Validate session"""
        session = self.sessions.get(session_id)
        if not session:
            return None
        
        if time.time() > session['expires']:
            del self.sessions[session_id]
            return None
        
        return session
    
    def get_identity(self, identity_id: str) -> Optional[Identity]:
        """Get identity by ID"""
        return self.identities.get(identity_id)


class DeviceRegistry:
    """Device trust registry"""
    
    def __init__(self):
        self.devices: Dict[str, Dict] = {}
        self.compliance_requirements = {
            'os_updated': True,
            'antivirus_active': True,
            'firewall_enabled': True,
            'encryption_enabled': True,
        }
    
    def register_device(self, device_id: str, info: Dict):
        """Register device"""
        self.devices[device_id] = {
            **info,
            'registered': time.time(),
            'trust_score': 0.0,
            'last_seen': time.time(),
            'compliant': False,
        }
    
    def check_compliance(self, device_id: str) -> Dict:
        """Check device compliance"""
        device = self.devices.get(device_id)
        if not device:
            return {'compliant': False, 'reason': 'Unknown device'}
        
        compliance = {
            'device_id': device_id,
            'checks': {},
            'compliant': True,
        }
        
        for check, required in self.compliance_requirements.items():
            passed = device.get(check, False) == required
            compliance['checks'][check] = passed
            if not passed and required:
                compliance['compliant'] = False
        
        device['compliant'] = compliance['compliant']
        return compliance
    
    def calculate_trust_score(self, device_id: str) -> float:
        """Calculate device trust score"""
        device = self.devices.get(device_id)
        if not device:
            return 0.0
        
        score = 0.0
        
        # Compliance score (40%)
        if device.get('compliant'):
            score += 0.4
        
        # Registration age (20%)
        age_days = (time.time() - device.get('registered', 0)) / 86400
        if age_days > 30:
            score += 0.2
        elif age_days > 7:
            score += 0.1
        
        # Activity score (20%)
        last_seen = device.get('last_seen', 0)
        if time.time() - last_seen < 3600:  # Active in last hour
            score += 0.2
        
        # Certificate status (20%)
        if device.get('has_certificate'):
            score += 0.2
        
        device['trust_score'] = score
        return score


class PolicyEngine:
    """Zero Trust policy engine"""
    
    def __init__(self):
        self.policies: List[Dict] = []
        self.default_deny = True
    
    def add_policy(self, policy: Dict):
        """Add access policy"""
        self.policies.append(policy)
    
    def evaluate(self, identity: Identity, resource: Resource, 
                 context: AccessContext) -> Tuple[AccessDecision, str]:
        """Evaluate access request against policies"""
        
        # Check identity trust level
        if identity.trust_level.value < resource.required_trust.value:
            return AccessDecision.DENY, f"Insufficient trust level: {identity.trust_level.name} < {resource.required_trust.name}"
        
        # Check action allowed
        if context.action not in resource.allowed_actions:
            return AccessDecision.DENY, f"Action not allowed: {context.action}"
        
        # Check MFA for sensitive resources
        if resource.sensitivity in ['confidential', 'restricted']:
            if not identity.mfa_enabled:
                return AccessDecision.REQUIRE_MFA, "MFA required for sensitive resource"
        
        # Check risk score
        if identity.risk_score > 0.7:
            return AccessDecision.QUARANTINE, f"High risk score: {identity.risk_score}"
        elif identity.risk_score > 0.5:
            return AccessDecision.REQUIRE_STEP_UP, f"Elevated risk: {identity.risk_score}"
        
        # Check custom policies
        for policy in self.policies:
            if self._matches_policy(policy, identity, resource, context):
                if policy.get('action') == 'deny':
                    return AccessDecision.DENY, f"Policy denied: {policy.get('name')}"
        
        # Check verification age
        if time.time() - identity.last_verified > 3600:  # Re-verify after 1 hour
            return AccessDecision.REQUIRE_STEP_UP, "Session verification expired"
        
        return AccessDecision.ALLOW, "Access granted"
    
    def _matches_policy(self, policy: Dict, identity: Identity,
                       resource: Resource, context: AccessContext) -> bool:
        """Check if policy matches request"""
        conditions = policy.get('conditions', {})
        
        if 'source_ip' in conditions:
            if not self._ip_matches(context.source_ip, conditions['source_ip']):
                return False
        
        if 'time_range' in conditions:
            hour = datetime.now().hour
            start, end = conditions['time_range']
            if not (start <= hour <= end):
                return False
        
        if 'identity_type' in conditions:
            if identity.type != conditions['identity_type']:
                return False
        
        if 'resource_type' in conditions:
            if resource.type != conditions['resource_type']:
                return False
        
        return True
    
    def _ip_matches(self, ip: str, pattern: str) -> bool:
        """Check if IP matches pattern"""
        if pattern == '*':
            return True
        if pattern.endswith('*'):
            return ip.startswith(pattern[:-1])
        return ip == pattern


class MicroSegmentation:
    """Network micro-segmentation"""
    
    def __init__(self):
        self.segments: Dict[str, Dict] = {}
        self.rules: List[Dict] = []
    
    def create_segment(self, segment_id: str, config: Dict):
        """Create network segment"""
        self.segments[segment_id] = {
            'id': segment_id,
            **config,
            'members': [],
        }
    
    def add_to_segment(self, segment_id: str, identity_id: str):
        """Add identity to segment"""
        if segment_id in self.segments:
            self.segments[segment_id]['members'].append(identity_id)
    
    def add_segment_rule(self, rule: Dict):
        """Add inter-segment communication rule"""
        self.rules.append(rule)
    
    def check_communication(self, source_segment: str, dest_segment: str,
                           port: int, protocol: str) -> bool:
        """Check if communication is allowed"""
        for rule in self.rules:
            if (rule['source'] in [source_segment, '*'] and
                rule['destination'] in [dest_segment, '*'] and
                port in rule.get('ports', [port]) and
                protocol in rule.get('protocols', [protocol])):
                return rule['action'] == 'allow'
        
        # Default deny
        return False


class ContinuousValidation:
    """Continuous validation and monitoring"""
    
    def __init__(self):
        self.validation_events: List[Dict] = []
        self.risk_factors: Dict[str, float] = {}
    
    def calculate_risk(self, identity: Identity, context: AccessContext) -> float:
        """Calculate real-time risk score"""
        risk = 0.0
        factors = []
        
        # Location-based risk
        if context.location and context.location not in ['office', 'home']:
            risk += 0.2
            factors.append('unknown_location')
        
        # Time-based risk
        hour = datetime.now().hour
        if hour < 6 or hour > 22:
            risk += 0.1
            factors.append('unusual_time')
        
        # Device trust
        if not context.device_id:
            risk += 0.3
            factors.append('no_device_id')
        
        # Historical behavior
        recent_failures = sum(1 for e in self.validation_events[-100:]
                            if e.get('identity_id') == identity.id 
                            and e.get('result') == 'denied')
        if recent_failures > 5:
            risk += 0.2
            factors.append('recent_failures')
        
        # Concurrent sessions
        # In real implementation, check for anomalous patterns
        
        self.risk_factors[identity.id] = min(risk, 1.0)
        return min(risk, 1.0)
    
    def log_validation(self, identity: Identity, resource: Resource,
                      context: AccessContext, decision: AccessDecision, reason: str):
        """Log validation event"""
        event = {
            'timestamp': datetime.now().isoformat(),
            'identity_id': identity.id,
            'resource_id': resource.id,
            'action': context.action,
            'source_ip': context.source_ip,
            'decision': decision.value,
            'reason': reason,
            'risk_score': self.risk_factors.get(identity.id, 0.0),
        }
        self.validation_events.append(event)
        return event


class ZeroTrustFramework:
    """Main Zero Trust Architecture Framework"""
    
    def __init__(self):
        self.identity_provider = IdentityProvider()
        self.device_registry = DeviceRegistry()
        self.policy_engine = PolicyEngine()
        self.segmentation = MicroSegmentation()
        self.validator = ContinuousValidation()
        
        self._setup_demo_data()
    
    def _setup_demo_data(self):
        """Setup demo identities and resources"""
        # Register identities
        self.identity_provider.register_identity(Identity(
            id="user_001",
            type="user",
            name="John Admin",
            attributes={"department": "IT", "role": "admin"},
            trust_level=TrustLevel.HIGH,
            last_verified=time.time(),
            mfa_enabled=True,
            risk_score=0.1,
        ))
        
        self.identity_provider.register_identity(Identity(
            id="user_002",
            type="user",
            name="Jane Developer",
            attributes={"department": "Engineering", "role": "developer"},
            trust_level=TrustLevel.MEDIUM,
            last_verified=time.time(),
            mfa_enabled=False,
            risk_score=0.2,
        ))
        
        self.identity_provider.register_identity(Identity(
            id="service_001",
            type="service",
            name="API Gateway",
            attributes={"type": "infrastructure"},
            trust_level=TrustLevel.VERIFIED,
            last_verified=time.time(),
            mfa_enabled=False,
            risk_score=0.0,
        ))
        
        # Register devices
        self.device_registry.register_device("dev_001", {
            "type": "laptop",
            "os": "Windows 11",
            "os_updated": True,
            "antivirus_active": True,
            "firewall_enabled": True,
            "encryption_enabled": True,
            "has_certificate": True,
        })
        
        self.device_registry.register_device("dev_002", {
            "type": "mobile",
            "os": "iOS 17",
            "os_updated": True,
            "antivirus_active": False,
            "firewall_enabled": True,
            "encryption_enabled": True,
            "has_certificate": False,
        })
        
        # Create segments
        self.segmentation.create_segment("production", {"sensitivity": "high"})
        self.segmentation.create_segment("development", {"sensitivity": "medium"})
        self.segmentation.create_segment("dmz", {"sensitivity": "low"})
        
        # Add segment rules
        self.segmentation.add_segment_rule({
            "source": "development",
            "destination": "production",
            "ports": [443],
            "protocols": ["tcp"],
            "action": "deny"
        })
        
        self.segmentation.add_segment_rule({
            "source": "dmz",
            "destination": "production",
            "ports": [443, 8443],
            "protocols": ["tcp"],
            "action": "allow"
        })
    
    def print_banner(self):
        print("""
+==============================================================+
|     SHIELD ZERO TRUST FRAMEWORK v1.0                         |
|          Never Trust, Always Verify                          |
|     Identity-based Security & Micro-segmentation             |
+==============================================================+
        """)
    
    def request_access(self, context: AccessContext) -> Dict:
        """Process access request"""
        result = {
            'timestamp': datetime.now().isoformat(),
            'request': {
                'identity': context.identity_id,
                'resource': context.resource_id,
                'action': context.action,
            }
        }
        
        # Get identity
        identity = self.identity_provider.get_identity(context.identity_id)
        if not identity:
            result['decision'] = AccessDecision.DENY.value
            result['reason'] = "Unknown identity"
            return result
        
        # Create resource for demo
        resource = Resource(
            id=context.resource_id,
            name="Demo Resource",
            type="application",
            sensitivity="internal",
            required_trust=TrustLevel.MEDIUM,
            allowed_actions=["read", "write"],
            owner="system",
        )
        
        # Calculate risk
        risk = self.validator.calculate_risk(identity, context)
        identity.risk_score = risk
        
        # Check device compliance
        if context.device_id:
            compliance = self.device_registry.check_compliance(context.device_id)
            if not compliance['compliant']:
                result['decision'] = AccessDecision.DENY.value
                result['reason'] = f"Device not compliant: {compliance}"
                return result
        
        # Evaluate policies
        decision, reason = self.policy_engine.evaluate(identity, resource, context)
        
        # Log event
        self.validator.log_validation(identity, resource, context, decision, reason)
        
        result['decision'] = decision.value
        result['reason'] = reason
        result['identity'] = identity.to_dict()
        result['risk_score'] = risk
        
        return result
    
    def demo(self):
        """Run demo"""
        self.print_banner()
        
        print("\n  === ZERO TRUST ACCESS REQUESTS ===")
        
        # Test case 1: Valid admin access
        print("\n  [1] Admin accessing resource from trusted device:")
        result = self.request_access(AccessContext(
            identity_id="user_001",
            resource_id="app_001",
            action="read",
            source_ip="192.168.1.100",
            device_id="dev_001",
            timestamp=time.time(),
            location="office",
        ))
        print(f"      Decision: {result['decision']}")
        print(f"      Reason: {result['reason']}")
        print(f"      Risk: {result.get('risk_score', 0):.2f}")
        
        # Test case 2: Developer from untrusted device
        print("\n  [2] Developer from non-compliant device:")
        result = self.request_access(AccessContext(
            identity_id="user_002",
            resource_id="app_001",
            action="read",
            source_ip="10.0.0.50",
            device_id="dev_002",
            timestamp=time.time(),
            location="remote",
        ))
        print(f"      Decision: {result['decision']}")
        print(f"      Reason: {result['reason']}")
        
        # Test case 3: Unknown identity
        print("\n  [3] Unknown identity attempting access:")
        result = self.request_access(AccessContext(
            identity_id="unknown_user",
            resource_id="app_001",
            action="read",
            source_ip="1.2.3.4",
            device_id=None,
            timestamp=time.time(),
        ))
        print(f"      Decision: {result['decision']}")
        print(f"      Reason: {result['reason']}")
        
        # Segment communication test
        print("\n  === MICRO-SEGMENTATION TEST ===")
        
        print("\n  [*] Development -> Production (port 443):")
        allowed = self.segmentation.check_communication("development", "production", 443, "tcp")
        print(f"      Allowed: {allowed}")
        
        print("\n  [*] DMZ -> Production (port 443):")
        allowed = self.segmentation.check_communication("dmz", "production", 443, "tcp")
        print(f"      Allowed: {allowed}")
        
        # Device compliance
        print("\n  === DEVICE COMPLIANCE ===")
        
        print("\n  [*] Device dev_001 compliance:")
        compliance = self.device_registry.check_compliance("dev_001")
        print(f"      Compliant: {compliance['compliant']}")
        print(f"      Checks: {compliance['checks']}")
        
        trust = self.device_registry.calculate_trust_score("dev_001")
        print(f"      Trust Score: {trust:.2f}")
        
        print("\n  [*] Device dev_002 compliance:")
        compliance = self.device_registry.check_compliance("dev_002")
        print(f"      Compliant: {compliance['compliant']}")
        print(f"      Checks: {compliance['checks']}")
        
        print("\n" + "="*60)
        print("              ZERO TRUST DEMO COMPLETE")
        print("="*60)


def main():
    framework = ZeroTrustFramework()
    framework.demo()


if __name__ == "__main__":
    main()
