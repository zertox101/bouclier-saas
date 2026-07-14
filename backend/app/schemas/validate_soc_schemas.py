"""
Validation script for SOC Expert Pydantic schemas.

This script performs basic validation tests on all Pydantic schemas
to ensure they work correctly with proper validation rules.
"""

from datetime import datetime
from app.schemas.soc_expert import (
    # Enums
    SeverityLevel, IncidentStatus, EventType, SourceModule, ActionType,
    ThreatIntelConfidence, ThreatHuntStatus, PriorityLevel, NoteType,
    
    # Security Event Schemas
    SecurityEventCreate, SecurityEventUpdate,
    
    # Incident Schemas
    IncidentCreate, IncidentUpdate,
    
    # Playbook Schemas
    PlaybookStepConfig, PlaybookCreate, PlaybookExecutionRequest,
    
    # Threat Intelligence Schemas
    IndicatorOfCompromise, ThreatActorInfo, ThreatIntelligencePackage,
    
    # Threat Hunt Schemas
    ThreatHuntCreate, ThreatHuntUpdate,
    
    # Alert Priority Schemas
    AlertPriorityCreate, AlertAcknowledgeRequest, AlertSuppressRequest,
    
    # Investigation Note Schemas
    InvestigationNoteCreate,
    
    # Search Schemas
    SearchQuery,
    
    # Correlation Schemas
    CorrelationRule,
    
    # Dashboard Schemas
    DashboardMetrics,
    
    # Export Schemas
    STIXExportRequest, ReportExportRequest,
)


def test_security_event_create():
    """Test SecurityEventCreate schema"""
    print("Testing SecurityEventCreate...")
    event = SecurityEventCreate(
        title="Suspicious Login Attempt",
        description="Multiple failed login attempts detected from unusual location",
        event_type=EventType.INTRUSION,
        severity=SeverityLevel.HIGH,
        source_module=SourceModule.GOTHAM_THREAT_MAP,
        source_ip="192.168.1.100",
        destination_ip="10.0.0.50",
        mitre_attack_techniques=["T1078", "T1110.001"],
        tags=["brute-force", "authentication"]
    )
    assert event.title == "Suspicious Login Attempt"
    assert event.severity == SeverityLevel.HIGH
    print("✓ SecurityEventCreate validated successfully")


def test_incident_create():
    """Test IncidentCreate schema"""
    print("Testing IncidentCreate...")
    incident = IncidentCreate(
        title="Ransomware Attack Detected",
        description="Ransomware encryption activity detected on multiple endpoints",
        severity=SeverityLevel.CRITICAL,
        assigned_to="analyst1",
        security_event_ids=[1, 2, 3],
        affected_assets=["server-01", "workstation-05"],
        incident_type=EventType.RANSOMWARE,
        mitre_attack_techniques=["T1486", "T1490"],
        tags=["ransomware", "critical-infrastructure"]
    )
    assert incident.severity == SeverityLevel.CRITICAL
    assert len(incident.security_event_ids) == 3
    print("✓ IncidentCreate validated successfully")


def test_playbook_create():
    """Test PlaybookCreate schema"""
    print("Testing PlaybookCreate...")
    playbook = PlaybookCreate(
        name="Ransomware Response",
        description="Automated response playbook for ransomware incidents",
        trigger_conditions={"event_type": "ransomware", "severity": "critical"},
        auto_execute=False,
        steps=[
            PlaybookStepConfig(
                step_id="step1",
                step_type=ActionType.ISOLATE_ASSET,
                name="Isolate Infected Systems",
                parameters={"asset_ids": ["server-01"]},
                timeout_seconds=300
            ),
            PlaybookStepConfig(
                step_id="step2",
                step_type=ActionType.COLLECT_FORENSICS,
                name="Collect Forensic Evidence",
                parameters={"evidence_types": ["memory", "disk"]},
                depends_on=["step1"],
                timeout_seconds=600
            )
        ],
        tags=["ransomware", "automated-response"]
    )
    assert len(playbook.steps) == 2
    assert playbook.steps[1].depends_on == ["step1"]
    print("✓ PlaybookCreate validated successfully")


def test_threat_intelligence_package():
    """Test ThreatIntelligencePackage schema"""
    print("Testing ThreatIntelligencePackage...")
    ti_package = ThreatIntelligencePackage(
        title="APT29 Campaign Analysis",
        description="Analysis of recent APT29 campaign targeting government entities",
        threat_type=EventType.INTRUSION,
        severity=SeverityLevel.CRITICAL,
        confidence=ThreatIntelConfidence.CONFIRMED,
        indicators=[
            IndicatorOfCompromise(
                ioc_type="ip",
                value="203.0.113.45",
                confidence=ThreatIntelConfidence.CONFIRMED,
                tags=["c2-server"]
            ),
            IndicatorOfCompromise(
                ioc_type="domain",
                value="malicious-domain.com",
                confidence=ThreatIntelConfidence.PROBABLE,
                tags=["phishing"]
            )
        ],
        mitre_attack_techniques=["T1566.001", "T1071.001"],
        threat_actor=ThreatActorInfo(
            name="APT29",
            aliases=["Cozy Bear", "The Dukes"],
            motivation="espionage",
            sophistication="advanced",
            target_sectors=["government", "defense"]
        ),
        source="internal_analysis",
        tags=["apt29", "espionage"],
        recommendations=["Block C2 IPs", "Monitor for similar patterns"]
    )
    assert len(ti_package.indicators) == 2
    assert ti_package.threat_actor.name == "APT29"
    print("✓ ThreatIntelligencePackage validated successfully")


def test_threat_hunt_create():
    """Test ThreatHuntCreate schema"""
    print("Testing ThreatHuntCreate...")
    hunt = ThreatHuntCreate(
        name="Lateral Movement Hunt",
        description="Hunt for signs of lateral movement in the network",
        hypothesis="Adversary is using RDP for lateral movement",
        query_type="sql",
        query_definition={
            "table": "security_events",
            "conditions": {"event_type": "lateral_movement", "protocol": "rdp"}
        },
        lookback_days=30,
        mitre_attack_techniques=["T1021.001"],
        assigned_to="threat_hunter_1",
        tags=["lateral-movement", "rdp"]
    )
    assert hunt.lookback_days == 30
    assert hunt.query_type == "sql"
    print("✓ ThreatHuntCreate validated successfully")


def test_alert_priority_create():
    """Test AlertPriorityCreate schema"""
    print("Testing AlertPriorityCreate...")
    alert_priority = AlertPriorityCreate(
        security_event_id=123,
        priority_score=85.5,
        priority_level=PriorityLevel.HIGH,
        severity_score=90.0,
        asset_criticality_score=80.0
    )
    assert alert_priority.priority_score == 85.5
    assert alert_priority.priority_level == PriorityLevel.HIGH
    print("✓ AlertPriorityCreate validated successfully")


def test_investigation_note_create():
    """Test InvestigationNoteCreate schema"""
    print("Testing InvestigationNoteCreate...")
    note = InvestigationNoteCreate(
        incident_id=42,
        title="Initial Analysis",
        content="Preliminary investigation reveals compromised credentials",
        note_type=NoteType.FINDING,
        tags=["credentials", "initial-analysis"]
    )
    assert note.incident_id == 42
    assert note.note_type == NoteType.FINDING
    print("✓ InvestigationNoteCreate validated successfully")


def test_search_query():
    """Test SearchQuery schema"""
    print("Testing SearchQuery...")
    query = SearchQuery(
        query="malware AND severity:high",
        severity=[SeverityLevel.HIGH, SeverityLevel.CRITICAL],
        event_types=[EventType.MALWARE, EventType.RANSOMWARE],
        start_time=datetime(2024, 1, 1),
        end_time=datetime(2024, 12, 31),
        page=1,
        page_size=50,
        sort_by="created_at",
        sort_order="desc"
    )
    assert query.page_size == 50
    assert len(query.severity) == 2
    print("✓ SearchQuery validated successfully")


def test_correlation_rule():
    """Test CorrelationRule schema"""
    print("Testing CorrelationRule...")
    rule = CorrelationRule(
        name="Brute Force Detection",
        description="Detect brute force attacks based on failed login attempts",
        rule_type="ioc_match",
        conditions={"failed_logins": {"threshold": 5, "window": 300}},
        time_window_seconds=300,
        severity=SeverityLevel.HIGH,
        enabled=True,
        tags=["brute-force", "authentication"]
    )
    assert rule.time_window_seconds == 300
    assert rule.enabled is True
    print("✓ CorrelationRule validated successfully")


def test_dashboard_metrics():
    """Test DashboardMetrics schema"""
    print("Testing DashboardMetrics...")
    metrics = DashboardMetrics(
        active_incidents=15,
        critical_incidents=3,
        incidents_today=8,
        pending_alerts=42,
        alerts_per_hour=12.5,
        mean_time_to_detect=300.0,
        mean_time_to_respond=1800.0,
        unique_threat_actors=5,
        top_attack_types=[
            {"type": "malware", "count": 25},
            {"type": "phishing", "count": 18}
        ],
        security_posture_score=78.5,
        severity_distribution={
            "critical": 5,
            "high": 15,
            "medium": 30,
            "low": 50
        }
    )
    assert metrics.active_incidents == 15
    assert metrics.security_posture_score == 78.5
    print("✓ DashboardMetrics validated successfully")


def test_export_requests():
    """Test export request schemas"""
    print("Testing export request schemas...")
    
    # STIX Export
    stix_request = STIXExportRequest(
        threat_intelligence_ids=[1, 2, 3],
        include_related_events=True
    )
    assert len(stix_request.threat_intelligence_ids) == 3
    
    # Report Export
    report_request = ReportExportRequest(
        report_type="incident_summary",
        format="pdf",
        incident_ids=[10, 20, 30],
        start_date=datetime(2024, 1, 1),
        end_date=datetime(2024, 12, 31),
        include_visualizations=True,
        include_raw_data=False
    )
    assert report_request.format == "pdf"
    assert report_request.include_visualizations is True
    
    print("✓ Export request schemas validated successfully")


def main():
    """Run all validation tests"""
    print("=" * 70)
    print("SOC Expert Pydantic Schemas Validation")
    print("=" * 70)
    print()
    
    tests = [
        test_security_event_create,
        test_incident_create,
        test_playbook_create,
        test_threat_intelligence_package,
        test_threat_hunt_create,
        test_alert_priority_create,
        test_investigation_note_create,
        test_search_query,
        test_correlation_rule,
        test_dashboard_metrics,
        test_export_requests,
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            test()
            passed += 1
        except Exception as e:
            print(f"✗ {test.__name__} failed: {e}")
            failed += 1
        print()
    
    print("=" * 70)
    print(f"Results: {passed} passed, {failed} failed")
    print("=" * 70)
    
    if failed == 0:
        print("\n🎉 All schemas validated successfully!")
        return 0
    else:
        print(f"\n❌ {failed} test(s) failed")
        return 1


if __name__ == "__main__":
    exit(main())
