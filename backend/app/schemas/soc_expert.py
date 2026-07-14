"""
Pydantic schemas for SOC Expert Operation API validation.

This module defines request/response schemas for all SOC Expert endpoints including:
- Security Event management
- Incident Response operations
- Playbook execution
- Threat Intelligence packages
"""

from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
import re


# ============================================================================
# Enums for validation
# ============================================================================

class SeverityLevel(str, Enum):
    """Severity levels for security events and incidents"""
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"
    INFORMATIONAL = "Informational"


class IncidentStatus(str, Enum):
    """Incident lifecycle states"""
    NEW = "New"
    ACKNOWLEDGED = "Acknowledged"
    INVESTIGATING = "Investigating"
    CONTAINED = "Contained"
    RESOLVED = "Resolved"
    CLOSED = "Closed"


class PlaybookStatus(str, Enum):
    """Playbook execution status"""
    PENDING = "Pending"
    RUNNING = "Running"
    PAUSED = "Paused"
    COMPLETED = "Completed"
    FAILED = "Failed"
    CANCELLED = "Cancelled"


class EventType(str, Enum):
    """Security event types"""
    MALWARE = "Malware"
    INTRUSION = "Intrusion"
    DATA_EXFILTRATION = "Data Exfiltration"
    CREDENTIAL_COMPROMISE = "Credential Compromise"
    DDOS = "DDoS"
    PHISHING = "Phishing"
    RANSOMWARE = "Ransomware"
    LATERAL_MOVEMENT = "Lateral Movement"
    PRIVILEGE_ESCALATION = "Privilege Escalation"
    ANOMALY = "Anomaly"
    OTHER = "Other"


class SourceModule(str, Enum):
    """Platform modules that can generate security events"""
    GOTHAM_THREAT_MAP = "Gotham Threat Map"
    REDHOUND_PRO = "RedHound Pro"
    OSINT_360 = "OSINT 360"
    KALI_ARSENAL = "Kali Arsenal"
    SHADOW_ROOT = "Shadow Root"
    SENTINEL_DASH = "Sentinel Dash"
    RED_TEAM_OPS = "Red Team Ops"
    EXTERNAL_FEED = "External Feed"


class ActionType(str, Enum):
    """Response action types"""
    ISOLATE_ASSET = "isolate_asset"
    BLOCK_IP = "block_ip"
    BLOCK_DOMAIN = "block_domain"
    COLLECT_FORENSICS = "collect_forensics"
    NOTIFY_STAKEHOLDER = "notify_stakeholder"
    EXECUTE_COMMAND = "execute_command"
    MANUAL_APPROVAL = "manual_approval"


class ThreatIntelConfidence(str, Enum):
    """Confidence levels for threat intelligence"""
    CONFIRMED = "Confirmed"
    PROBABLE = "Probable"
    POSSIBLE = "Possible"
    DOUBTFUL = "Doubtful"
    UNKNOWN = "Unknown"


# ============================================================================
# Security Event Schemas
# ============================================================================

class SecurityEventCreate(BaseModel):
    """Schema for creating a new security event"""
    
    title: str = Field(..., min_length=3, max_length=255, description="Event title")
    description: str = Field(..., min_length=10, description="Detailed event description")
    event_type: EventType = Field(..., description="Type of security event")
    severity: SeverityLevel = Field(..., description="Event severity level")
    source_module: SourceModule = Field(..., description="Module that generated the event")
    
    # IOC fields
    source_ip: Optional[str] = Field(None, description="Source IP address")
    destination_ip: Optional[str] = Field(None, description="Destination IP address")
    domain: Optional[str] = Field(None, description="Associated domain")
    file_hash: Optional[str] = Field(None, description="File hash (MD5, SHA1, SHA256)")
    url: Optional[str] = Field(None, description="Associated URL")
    
    # Context fields
    affected_assets: List[str] = Field(default_factory=list, description="List of affected asset IDs")
    mitre_attack_techniques: List[str] = Field(default_factory=list, description="MITRE ATT&CK technique IDs")
    threat_actor: Optional[str] = Field(None, description="Attributed threat actor")
    
    # Additional metadata
    raw_data: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Raw event data")
    tags: List[str] = Field(default_factory=list, description="Custom tags")
    
    @field_validator('source_ip', 'destination_ip')
    @classmethod
    def validate_ip_address(cls, v):
        """Validate IP address format"""
        if v is None:
            return v
        # Basic IPv4/IPv6 validation
        ipv4_pattern = r'^(\d{1,3}\.){3}\d{1,3}$'
        ipv6_pattern = r'^([0-9a-fA-F]{0,4}:){7}[0-9a-fA-F]{0,4}$'
        if not (re.match(ipv4_pattern, v) or re.match(ipv6_pattern, v)):
            raise ValueError('Invalid IP address format')
        return v
    
    @field_validator('file_hash')
    @classmethod
    def validate_file_hash(cls, v):
        """Validate file hash format (MD5, SHA1, SHA256)"""
        if v is None:
            return v
        if not re.match(r'^[a-fA-F0-9]{32}$|^[a-fA-F0-9]{40}$|^[a-fA-F0-9]{64}$', v):
            raise ValueError('Invalid hash format. Must be MD5 (32), SHA1 (40), or SHA256 (64) hex string')
        return v.lower()
    
    @field_validator('mitre_attack_techniques')
    @classmethod
    def validate_mitre_techniques(cls, v):
        """Validate MITRE ATT&CK technique IDs"""
        if not v:
            return v
        pattern = r'^T\d{4}(\.\d{3})?$'
        for technique in v:
            if not re.match(pattern, technique):
                raise ValueError(f'Invalid MITRE ATT&CK technique ID: {technique}. Must match pattern T####.### or T####')
        return v


class SecurityEventResponse(BaseModel):
    """Schema for security event response"""
    
    id: int
    title: str
    description: str
    event_type: str
    severity: str
    source_module: str
    
    source_ip: Optional[str]
    destination_ip: Optional[str]
    domain: Optional[str]
    file_hash: Optional[str]
    url: Optional[str]
    
    affected_assets: List[str]
    mitre_attack_techniques: List[str]
    threat_actor: Optional[str]
    
    risk_score: Optional[float] = Field(None, description="Calculated risk score (0-100)")
    enrichment_data: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Enriched context data")
    
    raw_data: Dict[str, Any]
    tags: List[str]
    
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class SecurityEventUpdate(BaseModel):
    """Schema for updating a security event"""
    
    severity: Optional[SeverityLevel] = None
    tags: Optional[List[str]] = None
    threat_actor: Optional[str] = None
    mitre_attack_techniques: Optional[List[str]] = None


# ============================================================================
# Incident Response Schemas
# ============================================================================

class IncidentCreate(BaseModel):
    """Schema for creating a new incident"""
    
    title: str = Field(..., min_length=3, max_length=255, description="Incident title")
    description: str = Field(..., min_length=10, description="Detailed incident description")
    severity: SeverityLevel = Field(..., description="Incident severity")
    
    # Assignment
    assigned_to: Optional[str] = Field(None, description="Analyst username assigned to incident")
    
    # Related data
    security_event_ids: List[int] = Field(default_factory=list, description="Related security event IDs")
    affected_assets: List[str] = Field(default_factory=list, description="Affected asset identifiers")
    
    # Classification
    incident_type: Optional[EventType] = Field(None, description="Primary incident type")
    mitre_attack_techniques: List[str] = Field(default_factory=list, description="MITRE ATT&CK techniques")
    
    # Additional context
    tags: List[str] = Field(default_factory=list, description="Custom tags")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional metadata")


class IncidentUpdate(BaseModel):
    """Schema for updating an incident"""
    
    status: Optional[IncidentStatus] = None
    severity: Optional[SeverityLevel] = None
    assigned_to: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    
    # Closure fields (required when status = Closed)
    resolution_notes: Optional[str] = Field(None, min_length=10, description="Resolution notes (required for closure)")
    closure_reason: Optional[str] = Field(None, description="Reason for closure")
    
    @model_validator(mode='after')
    def validate_closure_fields(self):
        """Ensure resolution notes and closure reason are provided when closing incident"""
        if self.status == IncidentStatus.CLOSED:
            if not self.resolution_notes:
                raise ValueError('resolution_notes is required when closing an incident')
            if not self.closure_reason:
                raise ValueError('closure_reason is required when closing an incident')
        
        return self


class IncidentResponse(BaseModel):
    """Schema for incident response"""
    
    id: int
    title: str
    description: str
    severity: str
    status: str
    
    assigned_to: Optional[str]
    created_by: Optional[str]
    
    security_event_ids: List[int]
    affected_assets: List[str]
    
    incident_type: Optional[str]
    mitre_attack_techniques: List[str]
    
    tags: List[str]
    metadata: Dict[str, Any]
    
    # Timeline
    timeline: List[Dict[str, Any]] = Field(default_factory=list, description="Incident timeline events")
    
    # Metrics
    time_to_acknowledge: Optional[int] = Field(None, description="Time to acknowledge in seconds")
    time_to_resolve: Optional[int] = Field(None, description="Time to resolve in seconds")
    
    # Closure
    resolution_notes: Optional[str]
    closure_reason: Optional[str]
    
    created_at: datetime
    updated_at: Optional[datetime]
    acknowledged_at: Optional[datetime]
    resolved_at: Optional[datetime]
    closed_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class IncidentTimelineEntry(BaseModel):
    """Schema for incident timeline entry"""
    
    timestamp: datetime
    action: str = Field(..., description="Action description")
    user: str = Field(..., description="User who performed the action")
    details: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional details")


# ============================================================================
# Playbook Execution Schemas
# ============================================================================

class PlaybookStepConfig(BaseModel):
    """Schema for playbook step configuration"""
    
    step_id: str = Field(..., description="Unique step identifier")
    step_type: ActionType = Field(..., description="Type of action to perform")
    name: str = Field(..., min_length=3, max_length=255, description="Step name")
    description: Optional[str] = Field(None, description="Step description")
    
    # Execution parameters
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Step-specific parameters")
    timeout_seconds: int = Field(300, ge=1, le=3600, description="Step timeout in seconds")
    
    # Dependencies
    depends_on: List[str] = Field(default_factory=list, description="Step IDs this step depends on")
    
    # Error handling
    continue_on_error: bool = Field(False, description="Continue playbook if this step fails")
    retry_count: int = Field(0, ge=0, le=5, description="Number of retries on failure")


class PlaybookCreate(BaseModel):
    """Schema for creating a playbook"""
    
    name: str = Field(..., min_length=3, max_length=255, description="Playbook name")
    description: str = Field(..., min_length=10, description="Playbook description")
    
    # Trigger configuration
    trigger_conditions: Dict[str, Any] = Field(..., description="Conditions that trigger this playbook")
    auto_execute: bool = Field(False, description="Automatically execute when triggered")
    
    # Steps
    steps: List[PlaybookStepConfig] = Field(..., min_items=1, description="Playbook steps")
    
    # Metadata
    tags: List[str] = Field(default_factory=list, description="Playbook tags")
    mitre_attack_techniques: List[str] = Field(default_factory=list, description="Relevant MITRE ATT&CK techniques")
    
    @field_validator('steps')
    @classmethod
    def validate_step_dependencies(cls, steps):
        """Validate that step dependencies reference valid step IDs"""
        step_ids = {step.step_id for step in steps}
        for step in steps:
            for dep in step.depends_on:
                if dep not in step_ids:
                    raise ValueError(f'Step {step.step_id} depends on non-existent step {dep}')
        return steps


class PlaybookExecutionRequest(BaseModel):
    """Schema for requesting playbook execution"""
    
    playbook_id: int = Field(..., description="Playbook ID to execute")
    incident_id: Optional[int] = Field(None, description="Associated incident ID")
    
    # Override parameters
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Override default parameters")
    
    # Execution options
    require_approval: bool = Field(False, description="Require manual approval before execution")
    notify_on_completion: bool = Field(True, description="Send notification when execution completes")


class PlaybookStepResult(BaseModel):
    """Schema for playbook step execution result"""
    
    step_id: str
    step_name: str
    status: PlaybookStatus
    
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    duration_seconds: Optional[float]
    
    result: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Step execution result")
    error_message: Optional[str] = Field(None, description="Error message if step failed")
    
    retry_count: int = Field(0, description="Number of retries attempted")


class PlaybookExecutionStatus(BaseModel):
    """Schema for playbook execution status"""
    
    execution_id: int
    playbook_id: int
    playbook_name: str
    incident_id: Optional[int]
    
    status: PlaybookStatus
    
    # Progress
    total_steps: int
    completed_steps: int
    failed_steps: int
    
    # Step results
    step_results: List[PlaybookStepResult] = Field(default_factory=list, description="Individual step results")
    
    # Timing
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    duration_seconds: Optional[float]
    
    # Execution context
    executed_by: Optional[str] = Field(None, description="User who initiated execution")
    error_message: Optional[str] = Field(None, description="Overall error message if execution failed")
    
    class Config:
        from_attributes = True


class PlaybookExecutionControl(BaseModel):
    """Schema for controlling playbook execution"""
    
    action: str = Field(..., pattern="^(pause|resume|cancel)$", description="Control action")
    reason: Optional[str] = Field(None, description="Reason for the action")


# ============================================================================
# Threat Intelligence Schemas
# ============================================================================

class IndicatorOfCompromise(BaseModel):
    """Schema for an Indicator of Compromise (IOC)"""
    
    ioc_type: str = Field(..., pattern="^(ip|domain|url|hash|email)$", description="IOC type")
    value: str = Field(..., min_length=1, description="IOC value")
    confidence: ThreatIntelConfidence = Field(..., description="Confidence level")
    
    first_seen: Optional[datetime] = Field(None, description="First observation timestamp")
    last_seen: Optional[datetime] = Field(None, description="Last observation timestamp")
    
    tags: List[str] = Field(default_factory=list, description="IOC tags")
    context: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional context")


class ThreatActorInfo(BaseModel):
    """Schema for threat actor information"""
    
    name: str = Field(..., min_length=1, description="Threat actor name or identifier")
    aliases: List[str] = Field(default_factory=list, description="Known aliases")
    
    motivation: Optional[str] = Field(None, description="Threat actor motivation")
    sophistication: Optional[str] = Field(None, description="Sophistication level")
    
    associated_campaigns: List[str] = Field(default_factory=list, description="Associated campaigns")
    target_sectors: List[str] = Field(default_factory=list, description="Targeted industry sectors")


class ThreatIntelligencePackage(BaseModel):
    """Schema for threat intelligence package"""
    
    title: str = Field(..., min_length=3, max_length=255, description="TI package title")
    description: str = Field(..., min_length=10, description="Detailed description")
    
    # Classification
    threat_type: EventType = Field(..., description="Primary threat type")
    severity: SeverityLevel = Field(..., description="Threat severity")
    confidence: ThreatIntelConfidence = Field(..., description="Overall confidence level")
    
    # IOCs
    indicators: List[IndicatorOfCompromise] = Field(default_factory=list, description="Indicators of compromise")
    
    # TTPs
    mitre_attack_techniques: List[str] = Field(default_factory=list, description="MITRE ATT&CK techniques")
    ttps_description: Optional[str] = Field(None, description="Tactics, Techniques, and Procedures description")
    
    # Threat actor
    threat_actor: Optional[ThreatActorInfo] = Field(None, description="Associated threat actor")
    
    # Analysis
    analysis_notes: Optional[str] = Field(None, description="Analyst notes and findings")
    recommendations: List[str] = Field(default_factory=list, description="Recommended actions")
    
    # Metadata
    source: str = Field(..., description="Intelligence source")
    tags: List[str] = Field(default_factory=list, description="Custom tags")
    references: List[str] = Field(default_factory=list, description="External references and URLs")
    
    # Provenance
    created_by: Optional[str] = Field(None, description="Analyst who created the package")
    shared_with: List[str] = Field(default_factory=list, description="Teams/analysts with access")
    
    @field_validator('indicators')
    @classmethod
    def validate_indicators(cls, v):
        """Ensure at least one indicator is provided"""
        if not v:
            raise ValueError('At least one indicator of compromise must be provided')
        return v


class ThreatIntelligenceResponse(BaseModel):
    """Schema for threat intelligence package response"""
    
    id: int
    title: str
    description: str
    
    threat_type: str
    severity: str
    confidence: str
    
    indicators: List[IndicatorOfCompromise]
    mitre_attack_techniques: List[str]
    ttps_description: Optional[str]
    
    threat_actor: Optional[ThreatActorInfo]
    
    analysis_notes: Optional[str]
    recommendations: List[str]
    
    source: str
    tags: List[str]
    references: List[str]
    
    created_by: Optional[str]
    shared_with: List[str]
    
    created_at: datetime
    updated_at: Optional[datetime]
    
    # Matching statistics
    matched_events_count: Optional[int] = Field(0, description="Number of matching security events")
    
    class Config:
        from_attributes = True


class ThreatIntelligenceUpdate(BaseModel):
    """Schema for updating threat intelligence package"""
    
    description: Optional[str] = None
    severity: Optional[SeverityLevel] = None
    confidence: Optional[ThreatIntelConfidence] = None
    
    indicators: Optional[List[IndicatorOfCompromise]] = None
    mitre_attack_techniques: Optional[List[str]] = None
    
    analysis_notes: Optional[str] = None
    recommendations: Optional[List[str]] = None
    
    tags: Optional[List[str]] = None
    shared_with: Optional[List[str]] = None


# ============================================================================
# Search and Filter Schemas
# ============================================================================

class SearchQuery(BaseModel):
    """Schema for advanced search queries"""
    
    query: str = Field(..., min_length=1, description="Search query string")
    
    # Filters
    severity: Optional[List[SeverityLevel]] = Field(None, description="Filter by severity levels")
    event_types: Optional[List[EventType]] = Field(None, description="Filter by event types")
    source_modules: Optional[List[SourceModule]] = Field(None, description="Filter by source modules")
    
    # Time range
    start_time: Optional[datetime] = Field(None, description="Start of time range")
    end_time: Optional[datetime] = Field(None, description="End of time range")
    
    # Pagination
    page: int = Field(1, ge=1, description="Page number")
    page_size: int = Field(50, ge=1, le=1000, description="Results per page")
    
    # Sorting
    sort_by: str = Field("created_at", description="Field to sort by")
    sort_order: str = Field("desc", pattern="^(asc|desc)$", description="Sort order")


class SearchResult(BaseModel):
    """Schema for search results"""
    
    total_count: int = Field(..., description="Total number of matching results")
    page: int
    page_size: int
    total_pages: int
    
    results: List[Dict[str, Any]] = Field(default_factory=list, description="Search results")
    
    # Facets for filtering
    facets: Optional[Dict[str, Dict[str, int]]] = Field(
        default_factory=dict,
        description="Facet counts for filtering (e.g., severity distribution)"
    )


# ============================================================================
# Correlation Schemas
# ============================================================================

class CorrelationRule(BaseModel):
    """Schema for correlation rule"""
    
    name: str = Field(..., min_length=3, max_length=255, description="Rule name")
    description: str = Field(..., min_length=10, description="Rule description")
    
    # Rule logic
    rule_type: str = Field(..., pattern="^(ioc_match|temporal|pattern)$", description="Rule type")
    conditions: Dict[str, Any] = Field(..., description="Rule conditions (JSON DSL)")
    
    # Configuration
    time_window_seconds: Optional[int] = Field(None, ge=1, le=86400, description="Time window for correlation")
    severity: SeverityLevel = Field(..., description="Severity of generated incidents")
    
    # Status
    enabled: bool = Field(True, description="Whether rule is active")
    
    # Metadata
    tags: List[str] = Field(default_factory=list, description="Rule tags")
    created_by: Optional[str] = Field(None, description="Analyst who created the rule")


class CorrelationGraphNode(BaseModel):
    """Schema for correlation graph node"""
    
    id: str = Field(..., description="Node ID")
    type: str = Field(..., description="Node type (event, incident, asset)")
    label: str = Field(..., description="Node label")
    
    properties: Dict[str, Any] = Field(default_factory=dict, description="Node properties")


class CorrelationGraphEdge(BaseModel):
    """Schema for correlation graph edge"""
    
    source: str = Field(..., description="Source node ID")
    target: str = Field(..., description="Target node ID")
    relationship: str = Field(..., description="Relationship type")
    
    properties: Dict[str, Any] = Field(default_factory=dict, description="Edge properties")


class CorrelationGraph(BaseModel):
    """Schema for correlation graph visualization"""
    
    nodes: List[CorrelationGraphNode] = Field(default_factory=list, description="Graph nodes")
    edges: List[CorrelationGraphEdge] = Field(default_factory=list, description="Graph edges")
    
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Graph metadata")


# ============================================================================
# Threat Hunt Schemas
# ============================================================================

class ThreatHuntStatus(str, Enum):
    """Threat hunt execution status"""
    DRAFT = "draft"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ThreatHuntCreate(BaseModel):
    """Schema for creating a threat hunt"""
    
    name: str = Field(..., min_length=3, max_length=255, description="Hunt name")
    description: str = Field(..., min_length=10, description="Hunt description")
    hypothesis: str = Field(..., min_length=10, description="Hunt hypothesis - what are we looking for?")
    
    # Query configuration
    query_type: str = Field(..., pattern="^(sql|lucene|sigma|custom)$", description="Query type")
    query_definition: Dict[str, Any] = Field(..., description="Query definition")
    query_parameters: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Query parameters")
    
    # Time scope
    lookback_days: int = Field(30, ge=1, le=365, description="Number of days to look back")
    time_range_start: Optional[datetime] = Field(None, description="Custom start time")
    time_range_end: Optional[datetime] = Field(None, description="Custom end time")
    
    # MITRE ATT&CK alignment
    mitre_attack_techniques: List[str] = Field(default_factory=list, description="Relevant MITRE ATT&CK techniques")
    
    # Assignment
    assigned_to: Optional[str] = Field(None, description="Analyst assigned to hunt")
    
    # Metadata
    tags: List[str] = Field(default_factory=list, description="Hunt tags")
    is_template: bool = Field(False, description="Save as reusable template")


class ThreatHuntUpdate(BaseModel):
    """Schema for updating a threat hunt"""
    
    name: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = Field(None, min_length=10)
    hypothesis: Optional[str] = Field(None, min_length=10)
    
    status: Optional[ThreatHuntStatus] = None
    assigned_to: Optional[str] = None
    tags: Optional[List[str]] = None


class ThreatHuntResult(BaseModel):
    """Schema for threat hunt result item"""
    
    event_id: int = Field(..., description="Security event ID")
    timestamp: datetime = Field(..., description="Event timestamp")
    severity: str = Field(..., description="Event severity")
    
    title: str = Field(..., description="Event title")
    description: str = Field(..., description="Event description")
    
    match_score: Optional[float] = Field(None, description="Relevance score (0-1)")
    match_reason: Optional[str] = Field(None, description="Why this event matched")
    
    # Quick context
    source_ip: Optional[str] = None
    destination_ip: Optional[str] = None
    affected_assets: List[str] = Field(default_factory=list)


class ThreatHuntResponse(BaseModel):
    """Schema for threat hunt response"""
    
    id: int
    hunt_id: str
    name: str
    description: str
    hypothesis: str
    
    query_type: str
    query_definition: Dict[str, Any]
    
    status: str
    progress_percentage: int
    
    # Results summary
    results_count: int = Field(0, description="Total results found")
    findings_count: int = Field(0, description="Suspicious findings")
    incidents_created: int = Field(0, description="Incidents created from hunt")
    
    # Time scope
    time_range_start: Optional[datetime]
    time_range_end: Optional[datetime]
    lookback_days: int
    
    # MITRE ATT&CK
    mitre_attack_techniques: List[str]
    
    # Assignment
    assigned_to: Optional[str]
    team: Optional[str]
    
    # Timing
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    duration_seconds: Optional[int]
    
    # Metadata
    tags: List[str]
    is_template: bool
    created_at: datetime
    updated_at: Optional[datetime]
    created_by: Optional[str]
    
    class Config:
        from_attributes = True


class ThreatHuntExecuteRequest(BaseModel):
    """Schema for executing a threat hunt"""
    
    hunt_id: int = Field(..., description="Hunt ID to execute")
    notify_on_completion: bool = Field(True, description="Send notification when hunt completes")


class ThreatHuntResultsResponse(BaseModel):
    """Schema for threat hunt results response"""
    
    hunt_id: int
    hunt_name: str
    status: str
    
    total_results: int
    page: int
    page_size: int
    total_pages: int
    
    results: List[ThreatHuntResult] = Field(default_factory=list, description="Hunt results")
    
    # Summary statistics
    severity_distribution: Optional[Dict[str, int]] = Field(default_factory=dict)
    top_affected_assets: Optional[List[Dict[str, Any]]] = Field(default_factory=list)


# ============================================================================
# Alert Priority Schemas
# ============================================================================

class PriorityLevel(str, Enum):
    """Alert priority levels"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFORMATIONAL = "informational"


class TriageStatus(str, Enum):
    """Alert triage status"""
    PENDING = "pending"
    ACKNOWLEDGED = "acknowledged"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"


class AlertPriorityCreate(BaseModel):
    """Schema for creating alert priority"""
    
    security_event_id: int = Field(..., description="Associated security event ID")
    
    # Priority calculation (optional - can be auto-calculated)
    priority_score: Optional[float] = Field(None, ge=0, le=100, description="Manual priority score override")
    priority_level: Optional[PriorityLevel] = Field(None, description="Manual priority level override")
    
    # Scoring factors (optional overrides)
    severity_score: Optional[float] = Field(None, ge=0, le=100)
    asset_criticality_score: Optional[float] = Field(None, ge=0, le=100)
    threat_intel_score: Optional[float] = Field(None, ge=0, le=100)
    behavioral_score: Optional[float] = Field(None, ge=0, le=100)
    business_impact_score: Optional[float] = Field(None, ge=0, le=100)


class AlertPriorityUpdate(BaseModel):
    """Schema for updating alert priority"""
    
    triage_status: Optional[TriageStatus] = None
    
    # Suppression
    is_suppressed: Optional[bool] = None
    suppression_reason: Optional[str] = Field(None, description="Reason for suppression")
    
    tags: Optional[List[str]] = None


class AlertPriorityResponse(BaseModel):
    """Schema for alert priority response"""
    
    id: int
    security_event_id: int
    
    # Priority
    priority_score: float
    priority_level: str
    
    # Scoring breakdown
    severity_score: float
    asset_criticality_score: float
    threat_intel_score: float
    behavioral_score: float
    business_impact_score: float
    
    # ML scoring
    ml_model_version: Optional[str]
    ml_prediction_score: Optional[float]
    ml_confidence: Optional[float]
    
    # Triage
    triage_status: str
    acknowledged_at: Optional[datetime]
    acknowledged_by: Optional[str]
    
    # Suppression
    is_suppressed: bool
    suppression_reason: Optional[str]
    suppressed_by: Optional[str]
    suppressed_at: Optional[datetime]
    
    # Metrics
    time_to_acknowledge_seconds: Optional[int]
    time_to_respond_seconds: Optional[int]
    
    tags: List[str]
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class AlertQueueResponse(BaseModel):
    """Schema for alert queue response"""
    
    total_alerts: int
    pending_alerts: int
    acknowledged_alerts: int
    
    # Priority distribution
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    informational_count: int
    
    # Alerts list
    alerts: List[AlertPriorityResponse] = Field(default_factory=list)
    
    # Pagination
    page: int
    page_size: int
    total_pages: int


class AlertAcknowledgeRequest(BaseModel):
    """Schema for acknowledging alerts"""
    
    alert_ids: List[int] = Field(..., min_items=1, description="Alert IDs to acknowledge")
    notes: Optional[str] = Field(None, description="Acknowledgment notes")


class AlertSuppressRequest(BaseModel):
    """Schema for suppressing alerts"""
    
    alert_ids: List[int] = Field(..., min_items=1, description="Alert IDs to suppress")
    suppression_reason: str = Field(..., min_length=3, description="Reason for suppression")


# ============================================================================
# Investigation Note Schemas
# ============================================================================

class NoteType(str, Enum):
    """Investigation note types"""
    GENERAL = "general"
    FINDING = "finding"
    HYPOTHESIS = "hypothesis"
    ACTION = "action"
    RECOMMENDATION = "recommendation"


class NoteVisibility(str, Enum):
    """Note visibility levels"""
    PRIVATE = "private"
    TEAM = "team"
    ORGANIZATION = "organization"


class InvestigationNoteCreate(BaseModel):
    """Schema for creating an investigation note"""
    
    # Association (at least one required)
    incident_id: Optional[int] = Field(None, description="Associated incident ID")
    security_event_id: Optional[int] = Field(None, description="Associated security event ID")
    threat_hunt_id: Optional[int] = Field(None, description="Associated threat hunt ID")
    
    # Content
    title: Optional[str] = Field(None, max_length=255, description="Note title")
    content: str = Field(..., min_length=1, description="Note content (supports markdown)")
    note_type: NoteType = Field(NoteType.GENERAL, description="Note type")
    
    # Attachments
    attachments: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Attachments [{filename, url, type, size}]"
    )
    references: List[str] = Field(default_factory=list, description="Related URLs or IDs")
    
    # Visibility
    visibility: NoteVisibility = Field(NoteVisibility.TEAM, description="Note visibility")
    is_pinned: bool = Field(False, description="Pin note to top")
    
    # Metadata
    tags: List[str] = Field(default_factory=list, description="Note tags")
    
    @model_validator(mode='after')
    def validate_association(self):
        """Ensure at least one association is provided"""
        if not any([self.incident_id, self.security_event_id, self.threat_hunt_id]):
            raise ValueError('At least one association (incident_id, security_event_id, or threat_hunt_id) must be provided')
        
        return self


class InvestigationNoteUpdate(BaseModel):
    """Schema for updating an investigation note"""
    
    title: Optional[str] = Field(None, max_length=255)
    content: Optional[str] = Field(None, min_length=1)
    note_type: Optional[NoteType] = None
    
    attachments: Optional[List[Dict[str, Any]]] = None
    references: Optional[List[str]] = None
    
    visibility: Optional[NoteVisibility] = None
    is_pinned: Optional[bool] = None
    
    tags: Optional[List[str]] = None


class InvestigationNoteResponse(BaseModel):
    """Schema for investigation note response"""
    
    id: int
    
    # Associations
    incident_id: Optional[int]
    security_event_id: Optional[int]
    threat_hunt_id: Optional[int]
    
    # Content
    title: Optional[str]
    content: str
    note_type: str
    
    # Attachments
    attachments: List[Dict[str, Any]]
    references: List[str]
    
    # Visibility
    visibility: str
    is_pinned: bool
    
    # Metadata
    tags: List[str]
    created_at: datetime
    updated_at: Optional[datetime]
    created_by: Optional[str]
    last_modified_by: Optional[str]
    
    class Config:
        from_attributes = True


class InvestigationNotesListResponse(BaseModel):
    """Schema for investigation notes list response"""
    
    total_count: int
    notes: List[InvestigationNoteResponse] = Field(default_factory=list)
    
    # Pagination
    page: int
    page_size: int
    total_pages: int


# ============================================================================
# Dashboard Metrics Schemas
# ============================================================================

class DashboardMetrics(BaseModel):
    """Schema for real-time dashboard metrics"""
    
    # Incident metrics
    active_incidents: int = Field(..., description="Number of active incidents")
    critical_incidents: int = Field(..., description="Number of critical incidents")
    incidents_today: int = Field(..., description="Incidents created today")
    
    # Alert metrics
    pending_alerts: int = Field(..., description="Pending alerts requiring triage")
    alerts_per_hour: float = Field(..., description="Average alerts per hour")
    
    # Performance metrics
    mean_time_to_detect: Optional[float] = Field(None, description="MTTD in seconds")
    mean_time_to_respond: Optional[float] = Field(None, description="MTTR in seconds")
    mean_time_to_acknowledge: Optional[float] = Field(None, description="MTTA in seconds")
    
    # Threat metrics
    unique_threat_actors: int = Field(..., description="Unique threat actors detected")
    top_attack_types: List[Dict[str, Any]] = Field(default_factory=list, description="Top attack types")
    
    # Security posture
    security_posture_score: Optional[float] = Field(None, ge=0, le=100, description="Overall security posture score")
    
    # Severity distribution
    severity_distribution: Dict[str, int] = Field(
        default_factory=dict,
        description="Event count by severity"
    )
    
    # Timestamp
    generated_at: datetime = Field(default_factory=datetime.utcnow, description="Metrics generation timestamp")


class ThreatTrendData(BaseModel):
    """Schema for threat trend data"""
    
    time_range: str = Field(..., description="Time range (1h, 24h, 7d, 30d, 90d)")
    data_points: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Time series data points [{timestamp, count, severity}]"
    )
    
    # Trend analysis
    trend_direction: str = Field(..., pattern="^(increasing|decreasing|stable)$", description="Trend direction")
    percent_change: Optional[float] = Field(None, description="Percentage change from previous period")


# ============================================================================
# Export Schemas
# ============================================================================

class STIXExportRequest(BaseModel):
    """Schema for STIX 2.1 export request"""
    
    threat_intelligence_ids: List[int] = Field(..., min_items=1, description="TI package IDs to export")
    include_related_events: bool = Field(False, description="Include related security events")


class ReportExportRequest(BaseModel):
    """Schema for report export request"""
    
    report_type: str = Field(
        ...,
        pattern="^(incident_summary|threat_intelligence|daily_summary|soc_performance)$",
        description="Report type"
    )
    format: str = Field(..., pattern="^(pdf|json|csv)$", description="Export format")
    
    # Filters
    incident_ids: Optional[List[int]] = Field(None, description="Specific incident IDs")
    start_date: Optional[datetime] = Field(None, description="Report start date")
    end_date: Optional[datetime] = Field(None, description="Report end date")
    
    # Options
    include_visualizations: bool = Field(True, description="Include charts and graphs")
    include_raw_data: bool = Field(False, description="Include raw event data")
