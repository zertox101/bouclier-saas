"""
SOC Expert Operation Database Models

This module defines SQLAlchemy models for the SOC Expert Operation feature,
providing comprehensive security operations center capabilities including:
- Security event management with MITRE ATT&CK mapping
- Incident lifecycle management
- Threat intelligence aggregation and enrichment
- Automated playbook execution
- Correlation rules and investigation tracking
- Proactive threat hunting
- Alert prioritization

Requirements: 1.1, 1.2, 1.3, 2.1, 3.1, 4.1, 5.1, 7.1, 12.1
"""

from sqlalchemy import Column, Integer, String, DateTime, Float, JSON, Boolean, BigInteger, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.sql import Base


class SecurityEvent(Base):
    """
    Normalized security event from multiple sources (Gotham, RedHound, OSINT, etc.)
    
    Requirements: 1.1, 1.2, 1.3, 2.1, 7.1
    """
    __tablename__ = "security_events"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(String, index=True, nullable=False)
    
    # Temporal fields
    timestamp = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)
    timestamp_epoch = Column(BigInteger, index=True)
    
    # Source information
    source_module = Column(String, index=True, nullable=False)  # gotham, redhound, osint360, kali, etc.
    source_id = Column(String, index=True)  # Original event ID from source system
    
    # Event classification
    event_type = Column(String, index=True, nullable=False)  # intrusion, malware, phishing, etc.
    severity = Column(String, index=True, nullable=False)  # critical, high, medium, low, informational
    status = Column(String, default="new", index=True)  # new, acknowledged, investigating, resolved, closed
    
    # Network/Host information
    src_ip = Column(String, index=True)
    dst_ip = Column(String, index=True)
    src_port = Column(Integer)
    dst_port = Column(Integer)
    protocol = Column(String)
    hostname = Column(String, index=True)
    username = Column(String, index=True)
    
    # Threat intelligence enrichment
    mitre_attack_tactics = Column(JSON, default=list)  # List of MITRE ATT&CK tactic IDs
    mitre_attack_techniques = Column(JSON, default=list)  # List of MITRE ATT&CK technique IDs
    threat_actor = Column(String, index=True)  # Attributed threat actor/group
    threat_campaign = Column(String, index=True)  # Associated campaign
    
    # Risk scoring
    risk_score = Column(Float, default=0.0, index=True)  # Calculated risk score (0-100)
    confidence_score = Column(Float, default=0.0)  # Confidence in threat classification (0-1)
    
    # Indicators of Compromise
    ioc_type = Column(String, index=True)  # ip, domain, hash, url, email, etc.
    ioc_value = Column(String, index=True)  # The actual IOC value
    
    # Enrichment data
    enrichment_data = Column(JSON, default=dict)  # Additional context from threat intelligence
    geo_location = Column(JSON, default=dict)  # Geographic data: {country, city, lat, lon}
    
    # Event details
    title = Column(String, nullable=False)
    description = Column(Text)
    raw_data = Column(JSON, default=dict)  # Original event data
    
    # Correlation
    correlation_id = Column(String, index=True)  # Links related events
    parent_incident_id = Column(Integer, ForeignKey("soc_incidents.id"), nullable=True)
    
    # Metadata
    assigned_to = Column(String, index=True)  # Analyst username
    tags = Column(JSON, default=list)  # Custom tags for categorization
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    incident = relationship("SOCIncident", back_populates="security_events", foreign_keys=[parent_incident_id])
    investigation_notes = relationship("InvestigationNote", back_populates="security_event", cascade="all, delete-orphan")

    __table_args__ = (
        Index('idx_security_events_timestamp_severity', 'timestamp', 'severity'),
        Index('idx_security_events_source_module_status', 'source_module', 'status'),
        Index('idx_security_events_org_timestamp', 'org_id', 'timestamp'),
        Index('idx_security_events_ioc_lookup', 'ioc_type', 'ioc_value'),
    )


class SOCIncident(Base):
    """
    Enhanced incident model for SOC Expert operations with full lifecycle management
    
    Requirements: 1.1, 2.1, 3.1, 4.1, 12.1
    """
    __tablename__ = "soc_incidents"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(String, index=True, nullable=False)
    
    # Incident identification
    incident_id = Column(String, unique=True, index=True, nullable=False)  # Human-readable ID (INC-2024-001)
    title = Column(String, nullable=False, index=True)
    description = Column(Text)
    
    # Classification
    severity = Column(String, default="medium", index=True)  # critical, high, medium, low
    priority = Column(String, default="medium", index=True)  # critical, high, medium, low
    category = Column(String, index=True)  # intrusion, malware, data_breach, dos, etc.
    
    # Lifecycle state
    state = Column(String, default="new", index=True)  # new, acknowledged, investigating, contained, resolved, closed
    status = Column(String, default="open", index=True)  # open, in_progress, resolved, closed
    
    # MITRE ATT&CK mapping
    mitre_attack_tactics = Column(JSON, default=list)
    mitre_attack_techniques = Column(JSON, default=list)
    kill_chain_phase = Column(String)  # reconnaissance, weaponization, delivery, exploitation, etc.
    
    # Assignment and ownership
    assigned_to = Column(String, index=True)  # Primary analyst
    team = Column(String, index=True)  # SOC team responsible
    escalated_to = Column(String)  # Senior analyst or external team
    
    # Impact assessment
    affected_assets = Column(JSON, default=list)  # List of asset IDs/names
    affected_users = Column(JSON, default=list)  # List of usernames
    business_impact = Column(String)  # critical, high, medium, low, none
    data_classification = Column(String)  # public, internal, confidential, restricted
    
    # Threat intelligence
    threat_actor = Column(String, index=True)
    threat_campaign = Column(String, index=True)
    attack_vector = Column(String)  # email, web, network, physical, etc.
    
    # Metrics
    detection_time = Column(DateTime)  # When first detected
    acknowledgment_time = Column(DateTime)  # When acknowledged by analyst
    containment_time = Column(DateTime)  # When threat was contained
    resolution_time = Column(DateTime)  # When incident was resolved
    closure_time = Column(DateTime)  # When incident was closed
    
    # Root cause and resolution
    root_cause = Column(Text)
    resolution_summary = Column(Text)
    closure_reason = Column(String)  # resolved, false_positive, duplicate, not_applicable
    lessons_learned = Column(Text)
    
    # Playbook execution
    playbook_id = Column(Integer, ForeignKey("playbooks.id"), nullable=True)
    playbook_execution_id = Column(Integer, ForeignKey("playbook_executions.id"), nullable=True)
    
    # Timeline and audit
    timeline = Column(JSON, default=list)  # [{timestamp, action, user, details}]
    tags = Column(JSON, default=list)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String)
    
    # Relationships
    security_events = relationship("SecurityEvent", back_populates="incident", foreign_keys="SecurityEvent.parent_incident_id")
    investigation_notes = relationship("InvestigationNote", back_populates="incident", cascade="all, delete-orphan")
    playbook = relationship("Playbook", foreign_keys=[playbook_id])
    playbook_execution = relationship("PlaybookExecution", foreign_keys=[playbook_execution_id])

    __table_args__ = (
        Index('idx_soc_incidents_org_state', 'org_id', 'state'),
        Index('idx_soc_incidents_severity_priority', 'severity', 'priority'),
        Index('idx_soc_incidents_assigned_status', 'assigned_to', 'status'),
    )


class ThreatIntelligence(Base):
    """
    Threat intelligence data from multiple sources with enrichment
    
    Requirements: 1.1, 1.2, 1.3
    """
    __tablename__ = "threat_intelligence"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(String, index=True, nullable=False)
    
    # Source information
    source = Column(String, index=True, nullable=False)  # internal, external_feed, osint, analyst
    source_name = Column(String, index=True)  # Specific feed or analyst name
    source_url = Column(String)
    
    # Indicator information
    ioc_type = Column(String, index=True, nullable=False)  # ip, domain, hash, url, email, etc.
    ioc_value = Column(String, index=True, nullable=False)  # The actual indicator
    
    # Classification
    threat_type = Column(String, index=True)  # malware, phishing, c2, exploit, etc.
    threat_category = Column(String, index=True)  # apt, cybercrime, hacktivism, etc.
    severity = Column(String, default="medium", index=True)
    
    # MITRE ATT&CK mapping
    mitre_attack_tactics = Column(JSON, default=list)
    mitre_attack_techniques = Column(JSON, default=list)
    
    # Threat actor attribution
    threat_actor = Column(String, index=True)
    threat_campaign = Column(String, index=True)
    malware_family = Column(String, index=True)
    
    # Confidence and validity
    confidence_score = Column(Float, default=0.5)  # 0-1 confidence in intelligence
    tlp_level = Column(String, default="amber")  # white, green, amber, red (Traffic Light Protocol)
    is_active = Column(Boolean, default=True, index=True)
    
    # Temporal information
    first_seen = Column(DateTime, index=True)
    last_seen = Column(DateTime, index=True)
    expires_at = Column(DateTime, index=True)  # When intelligence becomes stale
    
    # Enrichment data
    enrichment_data = Column(JSON, default=dict)  # Additional context
    geo_location = Column(JSON, default=dict)
    asn_info = Column(JSON, default=dict)  # Autonomous System Number information
    
    # Description and context
    title = Column(String)
    description = Column(Text)
    context = Column(Text)  # Additional context about the threat
    
    # STIX 2.1 support
    stix_id = Column(String, unique=True, index=True)  # STIX 2.1 identifier
    stix_data = Column(JSON, default=dict)  # Full STIX object
    
    # Metadata
    tags = Column(JSON, default=list)
    references = Column(JSON, default=list)  # URLs to related reports/articles
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String)

    __table_args__ = (
        Index('idx_threat_intel_ioc_lookup', 'ioc_type', 'ioc_value'),
        Index('idx_threat_intel_active_severity', 'is_active', 'severity'),
        Index('idx_threat_intel_org_type', 'org_id', 'threat_type'),
    )


class Playbook(Base):
    """
    Automated response playbook definitions
    
    Requirements: 3.1
    """
    __tablename__ = "playbooks"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(String, index=True, nullable=False)
    
    # Playbook identification
    name = Column(String, nullable=False, index=True)
    display_name = Column(String)
    description = Column(Text)
    version = Column(String, default="1.0")
    
    # Classification
    category = Column(String, index=True)  # incident_response, threat_hunting, forensics, etc.
    severity = Column(String, index=True)  # Minimum severity to trigger
    
    # MITRE ATT&CK alignment
    mitre_attack_tactics = Column(JSON, default=list)
    mitre_attack_techniques = Column(JSON, default=list)
    
    # Trigger conditions
    trigger_conditions = Column(JSON, default=dict)  # Conditions that auto-trigger this playbook
    auto_execute = Column(Boolean, default=False)  # Whether to execute automatically
    requires_approval = Column(Boolean, default=True)  # Whether human approval is needed
    
    # Workflow definition
    workflow_steps = Column(JSON, default=list)  # [{step_id, name, type, action, params, dependencies}]
    error_handling = Column(JSON, default=dict)  # Error handling configuration
    
    # Execution settings
    timeout_seconds = Column(Integer, default=3600)  # Max execution time
    retry_policy = Column(JSON, default=dict)  # Retry configuration
    
    # Status and metadata
    is_active = Column(Boolean, default=True, index=True)
    is_template = Column(Boolean, default=False)  # Whether this is a template
    tags = Column(JSON, default=list)
    
    # Audit
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String)
    last_modified_by = Column(String)
    
    # Relationships
    executions = relationship("PlaybookExecution", back_populates="playbook", cascade="all, delete-orphan")

    __table_args__ = (
        Index('idx_playbooks_org_active', 'org_id', 'is_active'),
        Index('idx_playbooks_category', 'category'),
    )


class PlaybookExecution(Base):
    """
    Playbook execution tracking and audit
    
    Requirements: 3.1
    """
    __tablename__ = "playbook_executions"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(String, index=True, nullable=False)
    
    # Execution identification
    execution_id = Column(String, unique=True, index=True, nullable=False)  # EXEC-2024-001
    playbook_id = Column(Integer, ForeignKey("playbooks.id"), nullable=False)
    incident_id = Column(Integer, ForeignKey("soc_incidents.id"), nullable=True)
    
    # Execution context
    trigger_type = Column(String, index=True)  # manual, automatic, scheduled
    triggered_by = Column(String)  # Username or system
    trigger_event_id = Column(Integer, ForeignKey("security_events.id"), nullable=True)
    
    # Execution state
    status = Column(String, default="pending", index=True)  # pending, running, paused, completed, failed, cancelled
    current_step = Column(String)  # Current step being executed
    progress_percentage = Column(Integer, default=0)
    
    # Timing
    started_at = Column(DateTime, index=True)
    completed_at = Column(DateTime)
    duration_seconds = Column(Integer)
    
    # Results
    steps_executed = Column(JSON, default=list)  # [{step_id, status, started_at, completed_at, result, error}]
    execution_log = Column(JSON, default=list)  # Detailed execution log
    output_data = Column(JSON, default=dict)  # Output from playbook execution
    error_message = Column(Text)
    
    # Approval workflow
    approval_required = Column(Boolean, default=False)
    approval_status = Column(String)  # pending, approved, rejected
    approved_by = Column(String)
    approved_at = Column(DateTime)
    
    # Metadata
    tags = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    playbook = relationship("Playbook", back_populates="executions")
    incident = relationship("SOCIncident", foreign_keys=[incident_id])
    trigger_event = relationship("SecurityEvent", foreign_keys=[trigger_event_id])

    __table_args__ = (
        Index('idx_playbook_exec_org_status', 'org_id', 'status'),
        Index('idx_playbook_exec_playbook_started', 'playbook_id', 'started_at'),
    )


class CorrelationRule(Base):
    """
    Event correlation rules for detecting multi-stage attacks
    
    Requirements: 2.1
    """
    __tablename__ = "correlation_rules"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(String, index=True, nullable=False)
    
    # Rule identification
    name = Column(String, nullable=False, index=True)
    display_name = Column(String)
    description = Column(Text)
    
    # Rule definition
    rule_type = Column(String, index=True)  # sequence, threshold, statistical, pattern
    rule_logic = Column(JSON, nullable=False)  # Rule definition in JSON format
    
    # Correlation parameters
    time_window_seconds = Column(Integer, default=3600)  # Time window for correlation
    event_types = Column(JSON, default=list)  # Event types to correlate
    correlation_fields = Column(JSON, default=list)  # Fields to correlate on (src_ip, user, etc.)
    
    # Threshold settings
    threshold_count = Column(Integer)  # Number of events to trigger
    threshold_operator = Column(String)  # >, <, =, >=, <=
    
    # MITRE ATT&CK mapping
    mitre_attack_tactics = Column(JSON, default=list)
    mitre_attack_techniques = Column(JSON, default=list)
    
    # Output configuration
    output_severity = Column(String, default="medium")  # Severity of generated incident
    output_title_template = Column(String)  # Template for incident title
    output_description_template = Column(Text)  # Template for incident description
    
    # Execution settings
    is_active = Column(Boolean, default=True, index=True)
    priority = Column(Integer, default=50)  # Rule execution priority (higher = earlier)
    
    # Statistics
    match_count = Column(Integer, default=0)  # Number of times rule has matched
    last_matched_at = Column(DateTime)
    
    # Metadata
    tags = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String)
    last_modified_by = Column(String)

    __table_args__ = (
        Index('idx_correlation_rules_org_active', 'org_id', 'is_active'),
        Index('idx_correlation_rules_type_priority', 'rule_type', 'priority'),
    )


class InvestigationNote(Base):
    """
    Investigation notes and documentation for incidents and events
    
    Requirements: 4.1
    """
    __tablename__ = "investigation_notes"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(String, index=True, nullable=False)
    
    # Association
    incident_id = Column(Integer, ForeignKey("soc_incidents.id"), nullable=True)
    security_event_id = Column(Integer, ForeignKey("security_events.id"), nullable=True)
    threat_hunt_id = Column(Integer, ForeignKey("threat_hunts.id"), nullable=True)
    
    # Note content
    title = Column(String)
    content = Column(Text, nullable=False)  # Rich text content
    note_type = Column(String, default="general")  # general, finding, hypothesis, action, recommendation
    
    # Attachments and references
    attachments = Column(JSON, default=list)  # [{filename, url, type, size}]
    references = Column(JSON, default=list)  # URLs or IDs of related items
    
    # Visibility and sharing
    visibility = Column(String, default="team")  # private, team, organization
    is_pinned = Column(Boolean, default=False)
    
    # Metadata
    tags = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, index=True)
    last_modified_by = Column(String)
    
    # Relationships
    incident = relationship("SOCIncident", back_populates="investigation_notes")
    security_event = relationship("SecurityEvent", back_populates="investigation_notes")
    threat_hunt = relationship("ThreatHunt", back_populates="investigation_notes")

    __table_args__ = (
        Index('idx_investigation_notes_incident', 'incident_id', 'created_at'),
        Index('idx_investigation_notes_event', 'security_event_id', 'created_at'),
        Index('idx_investigation_notes_creator', 'created_by', 'created_at'),
    )


class ThreatHunt(Base):
    """
    Proactive threat hunting campaigns and queries
    
    Requirements: 5.1
    """
    __tablename__ = "threat_hunts"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(String, index=True, nullable=False)
    
    # Hunt identification
    hunt_id = Column(String, unique=True, index=True, nullable=False)  # HUNT-2024-001
    name = Column(String, nullable=False, index=True)
    description = Column(Text)
    
    # Hunt hypothesis
    hypothesis = Column(Text, nullable=False)  # What are we looking for?
    hypothesis_type = Column(String)  # behavioral, ioc_based, anomaly, pattern
    
    # MITRE ATT&CK alignment
    mitre_attack_tactics = Column(JSON, default=list)
    mitre_attack_techniques = Column(JSON, default=list)
    
    # Hunt query
    query_type = Column(String, index=True)  # sql, lucene, sigma, custom
    query_definition = Column(JSON, nullable=False)  # Query definition
    query_parameters = Column(JSON, default=dict)  # Query parameters
    
    # Time scope
    time_range_start = Column(DateTime, index=True)
    time_range_end = Column(DateTime, index=True)
    lookback_days = Column(Integer, default=30)
    
    # Execution state
    status = Column(String, default="draft", index=True)  # draft, running, completed, failed, cancelled
    progress_percentage = Column(Integer, default=0)
    
    # Results
    results_count = Column(Integer, default=0)
    findings_count = Column(Integer, default=0)  # Number of suspicious findings
    incidents_created = Column(Integer, default=0)  # Incidents created from hunt
    results_data = Column(JSON, default=dict)  # Summary of results
    
    # Timing
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    duration_seconds = Column(Integer)
    
    # Assignment
    assigned_to = Column(String, index=True)
    team = Column(String)
    
    # Metadata
    tags = Column(JSON, default=list)
    is_template = Column(Boolean, default=False)  # Whether this is a reusable template
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String)
    
    # Relationships
    investigation_notes = relationship("InvestigationNote", back_populates="threat_hunt", cascade="all, delete-orphan")

    __table_args__ = (
        Index('idx_threat_hunts_org_status', 'org_id', 'status'),
        Index('idx_threat_hunts_assigned', 'assigned_to', 'status'),
        Index('idx_threat_hunts_time_range', 'time_range_start', 'time_range_end'),
    )


class AlertPriority(Base):
    """
    Alert prioritization and triage tracking
    
    Requirements: 7.1
    """
    __tablename__ = "alert_priorities"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(String, index=True, nullable=False)
    
    # Associated event
    security_event_id = Column(Integer, ForeignKey("security_events.id"), nullable=False, unique=True)
    
    # Priority calculation
    priority_score = Column(Float, nullable=False, index=True)  # 0-100 calculated priority
    priority_level = Column(String, index=True)  # critical, high, medium, low, informational
    
    # Scoring factors
    severity_score = Column(Float, default=0.0)  # Score from event severity
    asset_criticality_score = Column(Float, default=0.0)  # Score from affected asset importance
    threat_intel_score = Column(Float, default=0.0)  # Score from threat intelligence
    behavioral_score = Column(Float, default=0.0)  # Score from behavioral analysis
    business_impact_score = Column(Float, default=0.0)  # Score from business context
    
    # ML-based scoring
    ml_model_version = Column(String)
    ml_prediction_score = Column(Float)  # ML model prediction
    ml_confidence = Column(Float)  # Confidence in ML prediction
    
    # Triage state
    triage_status = Column(String, default="pending", index=True)  # pending, acknowledged, investigating, resolved
    acknowledged_at = Column(DateTime)
    acknowledged_by = Column(String)
    
    # Suppression
    is_suppressed = Column(Boolean, default=False, index=True)
    suppression_reason = Column(String)  # duplicate, false_positive, maintenance, etc.
    suppressed_by = Column(String)
    suppressed_at = Column(DateTime)
    
    # Metrics
    time_to_acknowledge_seconds = Column(Integer)  # MTTA metric
    time_to_respond_seconds = Column(Integer)  # MTTR metric
    
    # Metadata
    tags = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    security_event = relationship("SecurityEvent", foreign_keys=[security_event_id])

    __table_args__ = (
        Index('idx_alert_priority_org_level', 'org_id', 'priority_level'),
        Index('idx_alert_priority_score_status', 'priority_score', 'triage_status'),
        Index('idx_alert_priority_suppressed', 'is_suppressed', 'triage_status'),
    )
