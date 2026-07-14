"""
Unit tests for SOC Expert Pydantic schemas.

This test file validates all Pydantic schemas for the SOC Expert Operation feature,
ensuring proper validation, field requirements, and data integrity.
"""

import pytest
from datetime import datetime
from pydantic import ValidationError

from app.schemas.soc_expert import (
    # Enums
    SeverityLevel, IncidentStatus, PlaybookStatus, EventType, SourceModule,
    ActionType, ThreatIntelConfidence, ThreatHuntStatus, PriorityLevel,
    TriageStatus, NoteType, NoteVisibility,
    
    # Security Event Schemas
    SecurityEventCreate, SecurityEventResponse, SecurityEventUpdate,
    
    # Incident Schemas
    IncidentCreate, IncidentUpdate, IncidentResponse, IncidentTimelineEntry,
    
    # Playbook Schemas
    PlaybookStepConfig, PlaybookCreate, PlaybookExecutionRequest,
    PlaybookStepResult, PlaybookExecutionStatus, PlaybookExecutionControl,
    
    # Threat Intelligence Schemas
    IndicatorOfCompromise, ThreatActorInfo, ThreatIntelligencePackage,
    ThreatIntelligenceResponse, ThreatIntelligenceUpdate,
    
    # Threat Hunt Schemas
    ThreatHuntCreate, ThreatHuntUpdate, ThreatHuntResult, ThreatHuntResponse,
    ThreatHuntExecuteRequest, ThreatHuntResultsResponse,
    
    # Alert Priority Schemas
    AlertPriorityCreate, AlertPriorityUpdate, AlertPriorityResponse,
    AlertQueueResponse, AlertAcknowledgeRequest, AlertSuppressRequest,
    
    # Investigation Note Schemas
    InvestigationNoteCreate, InvestigationNoteUpdate, InvestigationNoteResponse,
    InvestigationNotesListResponse,
    
    # Search Schemas
    SearchQuery, SearchResult,
    
    # Correlation Schemas
    CorrelationRule, CorrelationGraphNode, CorrelationGraphEdge, CorrelationGraph,
    
    # Dashboard Schemas
    DashboardMetrics, ThreatTrendData,
    
    # Export Schemas
    STIXExportRequest, ReportExportRequest,
)


class TestSecurityEventSchemas:
    """Test Security Event schemas"""
    
    def test_security_event_create_valid(self):
        """Test valid security event creation"""
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
        assert len(event.mitre_attack_techniques) == 2
    
    def test_security_event_create_invalid_ip(self):
        """Test security event creation with invalid IP"""
        with pytest.raises(ValidationError) as exc_info:
            SecurityEventCreate(
                title="Test Event",
                description="Test description for validation",
                event_type=EventType.INTRUSION,
                severity=SeverityLevel.HIGH,
                source_module=SourceModule.GOTHAM_THREAT_MAP,
                source_ip="invalid-ip-address"
            )
        assert "Invalid IP address format" in str(exc_info.value)
    
    def test_security_event_create_invalid_hash(self):
        """Test security event creation with invalid file hash"""
        with pytest.raises(ValidationError) as exc_info:
            SecurityEventCreate(
                title="Test Event",
                description="Test description for validation",
                event_type=EventType.MALWARE,
                severity=SeverityLevel.HIGH,
                source_module=SourceModule.KALI_ARSENAL,
                file_hash="invalid-hash"
            )
        assert "Invalid hash format" in str(exc_info.value)
    
    def test_security_event_create_invalid_mitre_technique(self):
        """Test security event creation with invalid MITRE technique"""
        with pytest.raises(ValidationError) as exc_info:
            SecurityEventCreate(
                title="Test Event",
                description="Test description for validation",
                event_type=EventType.INTRUSION,
                severity=SeverityLevel.HIGH,
                source_module=SourceModule.GOTHAM_THREAT_MAP,
                mitre_attack_techniques=["INVALID123"]
            )
        assert "Invalid MITRE ATT&CK technique ID" in str(exc_info.value)


class TestIncidentSchemas:
    """Test Incident schemas"""
    
    def test_incident_create_valid(self):
        """Test valid incident creation"""
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
    
    def test_incident_update_closure_validation(self):
        """Test incident closure requires resolution notes"""
        with pytest.raises(ValidationError) as exc_info:
            IncidentUpdate(
                status=IncidentStatus.CLOSED
                # Missing resolution_notes and closure_reason
            )
        assert "resolution_notes is required" in str(exc_info.value)
    
    def test_incident_update_closure_valid(self):
        """Test valid incident closure"""
        update = IncidentUpdate(
            status=IncidentStatus.CLOSED,
            resolution_notes="Ransomware contained and systems restored from backup",
            closure_reason="resolved"
        )
        assert update.status == IncidentStatus.CLOSED
        assert update.resolution_notes is not None


class TestPlaybookSchemas:
    """Test Playbook schemas"""
    
    def test_playbook_create_valid(self):
        """Test valid playbook creation"""
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
    
    def test_playbook_create_invalid_dependency(self):
        """Test playbook creation with invalid step dependency"""
        with pytest.raises(ValidationError) as exc_info:
            PlaybookCreate(
                name="Test Playbook",
                description="Test playbook with invalid dependency",
                trigger_conditions={"event_type": "test"},
                auto_execute=False,
                steps=[
                    PlaybookStepConfig(
                        step_id="step1",
                        step_type=ActionType.ISOLATE_ASSET,
                        name="Step 1",
                        parameters={},
                        depends_on=["non_existent_step"]  # Invalid dependency
                    )
                ]
            )
        assert "depends on non-existent step" in str(exc_info.value)


class TestThreatIntelligenceSchemas:
    """Test Threat Intelligence schemas"""
    
    def test_threat_intelligence_package_valid(self):
        """Test valid threat intelligence package creation"""
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
    
    def test_threat_intelligence_package_no_indicators(self):
        """Test threat intelligence package requires at least one indicator"""
        with pytest.raises(ValidationError) as exc_info:
            ThreatIntelligencePackage(
                title="Test TI Package",
                description="Test package without indicators",
                threat_type=EventType.INTRUSION,
                severity=SeverityLevel.HIGH,
                confidence=ThreatIntelConfidence.PROBABLE,
                indicators=[],  # Empty indicators list
                source="test"
            )
        assert "At least one indicator of compromise must be provided" in str(exc_info.value)


class TestThreatHuntSchemas:
    """Test Threat Hunt schemas"""
    
    def test_threat_hunt_create_valid(self):
        """Test valid threat hunt creation"""
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
    
    def test_threat_hunt_create_invalid_query_type(self):
        """Test threat hunt creation with invalid query type"""
        with pytest.raises(ValidationError) as exc_info:
            ThreatHuntCreate(
                name="Test Hunt",
                description="Test hunt with invalid query type",
                hypothesis="Test hypothesis",
                query_type="invalid_type",  # Invalid query type
                query_definition={}
            )
        assert "string does not match regex" in str(exc_info.value)


class TestAlertPrioritySchemas:
    """Test Alert Priority schemas"""
    
    def test_alert_priority_create_valid(self):
        """Test valid alert priority creation"""
        alert_priority = AlertPriorityCreate(
            security_event_id=123,
            priority_score=85.5,
            priority_level=PriorityLevel.HIGH,
            severity_score=90.0,
            asset_criticality_score=80.0
        )
        assert alert_priority.priority_score == 85.5
        assert alert_priority.priority_level == PriorityLevel.HIGH
    
    def test_alert_acknowledge_request_valid(self):
        """Test valid alert acknowledgment request"""
        request = AlertAcknowledgeRequest(
            alert_ids=[1, 2, 3, 4, 5],
            notes="Acknowledged and assigned to team"
        )
        assert len(request.alert_ids) == 5
    
    def test_alert_suppress_request_valid(self):
        """Test valid alert suppression request"""
        request = AlertSuppressRequest(
            alert_ids=[10, 11],
            suppression_reason="False positive - maintenance activity"
        )
        assert request.suppression_reason == "False positive - maintenance activity"


class TestInvestigationNoteSchemas:
    """Test Investigation Note schemas"""
    
    def test_investigation_note_create_valid(self):
        """Test valid investigation note creation"""
        note = InvestigationNoteCreate(
            incident_id=42,
            title="Initial Analysis",
            content="Preliminary investigation reveals compromised credentials",
            note_type=NoteType.FINDING,
            visibility=NoteVisibility.TEAM,
            tags=["credentials", "initial-analysis"]
        )
        assert note.incident_id == 42
        assert note.note_type == NoteType.FINDING
    
    def test_investigation_note_create_no_association(self):
        """Test investigation note requires at least one association"""
        with pytest.raises(ValidationError) as exc_info:
            InvestigationNoteCreate(
                content="Test note without association",
                note_type=NoteType.GENERAL
            )
        assert "At least one association" in str(exc_info.value)
    
    def test_investigation_note_create_multiple_associations(self):
        """Test investigation note with multiple associations"""
        note = InvestigationNoteCreate(
            incident_id=42,
            security_event_id=100,
            content="Note linked to both incident and event",
            note_type=NoteType.GENERAL
        )
        assert note.incident_id == 42
        assert note.security_event_id == 100


class TestSearchSchemas:
    """Test Search schemas"""
    
    def test_search_query_valid(self):
        """Test valid search query"""
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


class TestCorrelationSchemas:
    """Test Correlation schemas"""
    
    def test_correlation_rule_valid(self):
        """Test valid correlation rule"""
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


class TestDashboardSchemas:
    """Test Dashboard schemas"""
    
    def test_dashboard_metrics_valid(self):
        """Test valid dashboard metrics"""
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


class TestExportSchemas:
    """Test Export schemas"""
    
    def test_stix_export_request_valid(self):
        """Test valid STIX export request"""
        request = STIXExportRequest(
            threat_intelligence_ids=[1, 2, 3],
            include_related_events=True
        )
        assert len(request.threat_intelligence_ids) == 3
    
    def test_report_export_request_valid(self):
        """Test valid report export request"""
        request = ReportExportRequest(
            report_type="incident_summary",
            format="pdf",
            incident_ids=[10, 20, 30],
            start_date=datetime(2024, 1, 1),
            end_date=datetime(2024, 12, 31),
            include_visualizations=True,
            include_raw_data=False
        )
        assert request.format == "pdf"
        assert request.include_visualizations is True


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
