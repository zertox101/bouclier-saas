# 🛡️ CYBERDETECT — Cyber Operating System Design Specification
## Levels 6-9: Enterprise SOC Platform Evolution

> **Version**: 2.0 | **Author**: Senior Cybersecurity Product Architect  
> **Target**: Enterprise SOC, MSSP, CISO/Board  
> **Status**: Production-Ready Design Specification

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# LEVEL 6 — MITRE ATT&CK VISUAL MAPPING SYSTEM
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 6.1 Architecture Overview

The MITRE ATT&CK Matrix UI transforms complex threat intelligence into an **intuitive kill-chain visualization** that allows analysts to understand attack progression in under 5 seconds.

### Core Layout Structure
```
┌─────────────────────────────────────────────────────────────────────────┐
│  🛡️ MITRE ATT&CK NAVIGATOR                           [AI Insights] [⚙]│
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐│
│ │ Recon   │ Resource│ Initial │Execution│Persist  │Priv Esc │ Defense ││
│ │         │ Dev     │ Access  │         │         │         │ Evasion ││
│ ├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤│
│ │ [T1595] │ [T1583] │ [T1566] │ [T1059] │ [T1547] │ [T1548] │ [T1562] ││
│ │ Active  │ Acquire │Phishing │Command  │Boot/Auto│ Abuse   │Impair   ││
│ │ Scan    │Infra    │         │Line     │Start    │Elevation│Defenses ││
│ │ ●●●●○   │ ●○○○○   │ ●●●●●   │ ●●●●●   │ ●●●○○   │ ●●○○○   │ ●●●●○   ││
│ └─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘│
│                                                                         │
│ ┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐          │
│ │Credential│Discovery│ Lateral │Collection│ C2      │Exfil    │          │
│ │ Access  │         │ Movement│         │         │         │          │
│ └─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘          │
├─────────────────────────────────────────────────────────────────────────┤
│ 🤖 AI INSIGHT: 87% match to APT29 (Cozy Bear) — Next predicted: T1021  │
└─────────────────────────────────────────────────────────────────────────┘
```

## 6.2 Technique Node States & Visual Design

### State Definitions
| State | Color | Glow Effect | Icon | Meaning |
|-------|-------|-------------|------|---------|
| **Clean** | `--bg-2` (Dark) | None | ○ | No detection in environment |
| **Detected** | `--warning` (Amber) | Soft pulse | ◐ | Technique observed, not triaged |
| **Active** | `--danger` (Red) | Strong pulse | ● | Active threat, requires action |
| **Blocked** | `--neon-1` (Cyan) | Static glow | ◉ | Successfully mitigated |
| **Historical** | `--neon-4` (Purple) | Dim | ◔ | Past incident, reference only |

### Node Component Structure
```tsx
interface TechniqueNode {
  id: string;                    // e.g., "T1566.001"
  name: string;                  // "Spearphishing Attachment"
  tactic: string;                // "Initial Access"
  state: 'clean' | 'detected' | 'active' | 'blocked' | 'historical';
  confidence: number;            // 0-100 AI confidence
  eventCount: number;            // Associated events
  lastSeen?: Date;
  linkedIncident?: string;
  aiPrediction?: {
    nextTechnique: string;
    probability: number;
    reasoning: string;
  };
}
```

### CSS Token Mapping
```css
.technique-node {
  --node-clean: rgba(22, 22, 38, 0.8);
  --node-detected: rgba(255, 190, 0, 0.15);
  --node-active: rgba(255, 60, 90, 0.2);
  --node-blocked: rgba(0, 255, 170, 0.15);
  --node-historical: rgba(180, 120, 255, 0.1);
}

.technique-node--active {
  animation: threat-pulse 1.5s ease-in-out infinite;
  box-shadow: 0 0 20px rgba(255, 60, 90, 0.4);
  border: 1px solid rgba(255, 60, 90, 0.6);
}

@keyframes threat-pulse {
  0%, 100% { box-shadow: 0 0 20px rgba(255, 60, 90, 0.4); }
  50% { box-shadow: 0 0 40px rgba(255, 60, 90, 0.7); }
}
```

## 6.3 Attack Path Visualization

### Kill Chain Flow Rendering
- **Connection Lines**: SVG paths connecting detected techniques
- **Flow Direction**: Left-to-right following ATT&CK chronology
- **Line Styles**:
  - Solid = confirmed progression
  - Dashed = AI-inferred correlation
  - Animated = real-time activity

### Path Confidence Indicators
```
Attack Path: T1566 → T1059 → T1547 → T1003
             ━━━━━━━ ━━━━━━━ ━ ━ ━ ━
             (100%)  (95%)   (72% inferred)
```

## 6.4 AI Insights Panel

### AI Intelligence Components
| Component | Purpose | Update Frequency |
|-----------|---------|------------------|
| **APT Attribution** | Match to known threat actor TTPs | On detection |
| **Attack Likelihood** | Probability of escalation | Real-time |
| **Next Move Prediction** | Predicted next technique | On detection |
| **Kill Chain Stage** | Current position in attack | Real-time |
| **Recommended Actions** | Contextual response steps | On detection |

### AI Confidence Display
```
┌─────────────────────────────────────────────────┐
│ 🤖 SENTINEL AI ANALYSIS                         │
├─────────────────────────────────────────────────┤
│ APT MATCH: APT29 (Cozy Bear)         [87%] ████│
│ KILL CHAIN: Execution Phase           [4/14]   │
│                                                 │
│ NEXT PREDICTED TECHNIQUE:                       │
│ ┌─────────────────────────────────────────────┐ │
│ │ T1021.001 — Remote Desktop Protocol         │ │
│ │ Confidence: 73%                             │ │
│ │ Reasoning: Historical pattern + current     │ │
│ │ lateral movement indicators                 │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ⚡ RECOMMENDED: Block RDP on affected hosts    │
└─────────────────────────────────────────────────┘
```

## 6.5 UX Rules for MITRE View

1. **5-Second Rule**: Analyst must understand attack status in ≤5 seconds
2. **Progressive Disclosure**: Overview → Tactic → Technique → Event details
3. **No Dead Zones**: Every node is clickable with drill-down capability
4. **Color Consistency**: State colors match platform semantic tokens
5. **Keyboard Navigation**: Arrow keys traverse matrix, Enter expands node
6. **Real-time Updates**: New detections animate into view (slide + glow)

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# LEVEL 7 — INCIDENT RESPONSE PLAYBOOKS UI
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 7.1 Playbook Architecture

### Core Concept
Every incident type maps to a pre-defined playbook. The system **auto-attaches** the most relevant playbook on incident creation, eliminating analyst decision fatigue.

### Playbook Data Model
```typescript
interface Playbook {
  id: string;
  name: string;                    // "Ransomware Containment"
  triggerConditions: string[];     // Auto-attach rules
  severity: 'critical' | 'high' | 'medium' | 'low';
  estimatedTime: number;           // Minutes
  steps: PlaybookStep[];
  aiOptimizations?: AIOptimization[];
}

interface PlaybookStep {
  id: string;
  order: number;
  title: string;
  description: string;
  type: 'automated' | 'manual' | 'approval';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  automationId?: string;           // Link to automation script
  assignee?: string;
  dependencies: string[];          // Step IDs that must complete first
  estimatedDuration: number;
  actualDuration?: number;
  evidence?: Evidence[];
  aiSuggestion?: string;
}

interface AIOptimization {
  type: 'skip' | 'reorder' | 'add';
  stepId?: string;
  reasoning: string;
  confidence: number;
}
```

## 7.2 Playbook UI Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  📋 PLAYBOOK: Phishing Response                    ⏱ 23min avg │ 8 steps│
├─────────────────────────────────────────────────────────────────────────┤
│  INCIDENT: INC-2024-0847 — Credential Harvest Attempt                   │
│  PROGRESS: ████████░░░░░░░░░░ 45%                    [4/8 Complete]    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ STEP 1: Isolate Affected Endpoint              [AUTO] ✓ COMPLETE │  │
│  │ Executed in 12s • Evidence: 3 artifacts                         │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                     │                                   │
│                                     ▼                                   │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ STEP 2: Block Sender Domain                    [AUTO] ✓ COMPLETE │  │
│  │ Added evil-domain.com to blocklist                              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                     │                                   │
│                                     ▼                                   │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ STEP 3: Extract IOCs from Email                [AUTO] ✓ COMPLETE │  │
│  │ 4 IOCs extracted → T1566.001 mapped                             │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                     │                                   │
│                                     ▼                                   │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ STEP 4: Interview User                      [MANUAL] ● RUNNING   │  │
│  │ Assigned to: analyst@soc.com                                    │  │
│  │ 🤖 AI: Consider skipping — user already self-reported [78%]     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                     │                                   │
│                                     ▼                                   │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ STEP 5: Reset User Credentials              [APPROVAL] ○ PENDING │  │
│  │ Requires: Security Lead approval                                │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## 7.3 Step State Machine

```
                    ┌──────────────┐
                    │   PENDING    │
                    └──────┬───────┘
                           │ trigger
                           ▼
          ┌────────────────────────────────┐
          │           RUNNING              │
          └────────────────────────────────┘
           │              │              │
     success│        fail │        skip  │
           ▼              ▼              ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │ COMPLETED│   │  FAILED  │   │  SKIPPED │
    └──────────┘   └────┬─────┘   └──────────┘
                        │ retry
                        ▼
                 Back to RUNNING
```

## 7.4 Step Type Visual Coding

| Type | Badge | Border Color | Behavior |
|------|-------|--------------|----------|
| **Automated** | `[AUTO]` | `--neon-2` (Cyan) | Executes immediately, no user action |
| **Manual** | `[MANUAL]` | `--neon-4` (Purple) | Requires analyst to mark complete |
| **Approval** | `[APPROVAL]` | `--warning` (Amber) | Blocked until authorized user approves |

### Step Card Component
```css
.playbook-step {
  @apply rounded-xl border p-4 transition-all duration-300;
}

.playbook-step--pending {
  @apply border-white/10 bg-[rgb(var(--bg-2))]/50 opacity-60;
}

.playbook-step--running {
  @apply border-[rgb(var(--neon-1))]/40 bg-[rgb(var(--neon-1))]/5;
  animation: step-active 2s ease-in-out infinite;
}

.playbook-step--completed {
  @apply border-[rgb(var(--success))]/30 bg-[rgb(var(--success))]/5;
}

.playbook-step--failed {
  @apply border-[rgb(var(--danger))]/40 bg-[rgb(var(--danger))]/10;
}
```

## 7.5 AI Optimization Suggestions

The AI continuously analyzes playbook execution and suggests:

1. **Skip Recommendations**: "User already reported incident, interview step unnecessary"
2. **Reorder Suggestions**: "Run credential reset before isolation to prevent lockout"
3. **Additional Steps**: "Consider adding threat hunt based on IOC patterns"

### AI Suggestion UI Pattern
```
┌─────────────────────────────────────────────────┐
│ 🤖 AI OPTIMIZATION AVAILABLE                    │
│                                                 │
│ SUGGESTION: Skip Step 4 (User Interview)        │
│ CONFIDENCE: 78%                                 │
│                                                 │
│ REASONING: User self-reported the phishing      │
│ attempt within 3 minutes. Standard interview    │
│ questions already answered in initial report.   │
│                                                 │
│ [Accept & Skip]  [Reject & Continue]  [Modify]  │
└─────────────────────────────────────────────────┘
```

## 7.6 UX Principles for Playbooks

1. **Zero Ambiguity**: Analyst always knows what to do next
2. **Visual Progress**: Vertical flow shows completion state at a glance
3. **Minimal Clicks**: Auto-expand current step, collapse completed
4. **Evidence Attachment**: Every step can capture artifacts
5. **Time Tracking**: Actual vs estimated duration visible
6. **Audit Trail**: Every action logged with timestamp and user

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# LEVEL 8 — CLIENT-FACING VS INTERNAL SOC MODES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 8.1 Mode Architecture

The platform operates in two synchronized modes sharing the same real-time backend but with **role-based UI rendering**.

### Mode Toggle Implementation
```typescript
type ViewMode = 'soc' | 'client';

interface UserContext {
  mode: ViewMode;
  role: 'analyst' | 'lead' | 'manager' | 'client' | 'executive';
  clientId?: string;
  permissions: Permission[];
}

// Component-level mode awareness
const IncidentCard = ({ incident, mode }: Props) => {
  if (mode === 'client') {
    return <ClientIncidentCard incident={sanitize(incident)} />;
  }
  return <SOCIncidentCard incident={incident} />;
};
```

## 8.2 SOC Mode (Internal) — Full Technical Visibility

### What SOC Analysts See
| Data Type | Display | Example |
|-----------|---------|---------|
| MITRE IDs | Full technique codes | T1566.001, T1059.001 |
| IOCs | Complete hashes, IPs, domains | `5d41402abc4b2a76b9719d911017c592` |
| Raw Events | Full log entries | Sysmon EventID 1, Process Create |
| Tool Names | Detection sources | CrowdStrike, Sentinel, ZAP |
| Timeline | Microsecond precision | 2024-01-15T14:23:45.123456Z |
| Severity Logic | CVSS, threat scoring | CVSS 9.8, TLP:AMBER |

### SOC Mode Visual Identity
```css
.soc-mode {
  --accent-primary: rgb(var(--neon-1));  /* Cyber green */
  --data-density: high;
  --typography-mode: monospace-heavy;
}

.soc-badge {
  @apply bg-[rgb(var(--danger))]/20 text-[rgb(var(--danger))] 
         border border-[rgb(var(--danger))]/30 text-xs font-mono;
}
```

### SOC Mode Layout
```
┌─────────────────────────────────────────────────────────────────────────┐
│ INCIDENT: INC-2024-0847                          [T1566.001] [CRITICAL] │
├─────────────────────────────────────────────────────────────────────────┤
│ DETECTION SOURCE: Microsoft Sentinel + CrowdStrike EDR                 │
│ FIRST SEEN: 2024-01-15T14:23:45.123456Z                                │
│ ASSET: WKSTN-FIN-042 (10.0.15.42) | User: jsmith@corp.local            │
├─────────────────────────────────────────────────────────────────────────┤
│ IOCs EXTRACTED:                                                         │
│ • SHA256: 5d41402abc4b2a76b9719d911017c592ba7d6e7ad9c...               │
│ • Domain: malicious-payload[.]com (VirusTotal: 48/72)                  │
│ • IP: 185.234.72.19 (RU) — Known C2 infrastructure                     │
├─────────────────────────────────────────────────────────────────────────┤
│ RAW EVENT LOG:                                                          │
│ {"EventID":1,"ProcessGuid":"{...}","CommandLine":"powershell.exe       │
│ -encodedCommand JABzAD0ATgBlAHcA...","ParentImage":"OUTLOOK.EXE"}      │
└─────────────────────────────────────────────────────────────────────────┘
```

## 8.3 Client Mode (Executive) — Business Language Only

### What Clients See
| Data Type | Display | Example |
|-----------|---------|---------|
| MITRE IDs | **Hidden** | — |
| IOCs | **Hidden** | — |
| Raw Events | **Hidden** | — |
| Tool Names | Generic description | "Our detection systems" |
| Timeline | Human-readable | "Yesterday at 2:23 PM" |
| Severity | Business impact | "High Business Risk" |

### Client Mode Visual Identity
```css
.client-mode {
  --accent-primary: rgb(var(--neon-4));  /* Calm purple */
  --data-density: low;
  --typography-mode: readable;
}

.client-badge {
  @apply bg-[rgb(var(--p-500))]/20 text-[rgb(var(--p-400))] 
         rounded-full px-3 py-1 text-sm font-medium;
}
```

### Client Mode Layout
```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🛡️ SECURITY INCIDENT REPORT                                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  STATUS: ✓ CONTAINED                                                   │
│                                                                         │
│  WHAT HAPPENED:                                                         │
│  A phishing email was detected and blocked before any damage            │
│  occurred. Our team identified the threat within 3 minutes.             │
│                                                                         │
│  BUSINESS IMPACT: None — Threat neutralized                            │
│                                                                         │
│  ACTIONS TAKEN:                                                         │
│  ✓ Malicious email removed from all mailboxes                          │
│  ✓ Sender domain blocked organization-wide                             │
│  ✓ Affected user notified and credentials rotated                      │
│  ✓ Additional monitoring deployed                                       │
│                                                                         │
│  YOUR PROTECTION STATUS: 🟢 SECURE                                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## 8.4 Data Sanitization Rules

### Transformation Matrix
| SOC Field | Client Transformation |
|-----------|----------------------|
| `T1566.001` | "Email-based threat" |
| `CVE-2024-1234` | "Known software vulnerability" |
| `10.0.15.42` | "An internal workstation" |
| `CrowdStrike alert` | "Our security monitoring detected" |
| `CVSS 9.8 Critical` | "High Business Risk" |
| `powershell.exe -enc...` | *(hidden entirely)* |

### Sanitization Function
```typescript
function sanitizeForClient(incident: Incident): ClientIncident {
  return {
    id: incident.id,
    title: translateTechnicalTitle(incident.title),
    status: incident.status,
    statusLabel: getStatusLabel(incident.status),
    impactLevel: translateSeverity(incident.severity),
    summary: generateClientSummary(incident),
    actionsTaken: incident.actions.map(a => a.clientFriendlyDescription),
    timeline: formatHumanReadableTime(incident.timeline),
    // EXCLUDED: iocs, rawEvents, mitreIds, toolNames, technicalDetails
  };
}
```

## 8.5 Trust-Building Visual Elements for Clients

1. **Green Checkmarks**: Prominent success indicators
2. **Shield Icons**: Protection status always visible
3. **Progress Bars**: Show response progress without technical details
4. **Reassurance Language**: "Your systems are protected"
5. **No Red Without Context**: Red only with immediate "Resolved" status
6. **Clean Typography**: Large, readable fonts (16px+ body)

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# LEVEL 9 — CISO / BOARD EXECUTIVE DASHBOARD
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 9.1 Design Philosophy

> **"Understand everything in under 5 minutes."**

### Anti-Patterns (What to Avoid)
- ❌ Glowing neon effects
- ❌ Animated backgrounds
- ❌ "Hacker" aesthetics
- ❌ Dense data tables
- ❌ Technical jargon
- ❌ Real-time flickering updates

### Design Principles
- ✅ Clean, corporate aesthetic
- ✅ High contrast for readability
- ✅ Trend-focused visualizations
- ✅ Decision-enabling metrics
- ✅ Quarterly/monthly comparisons
- ✅ Print-friendly layouts

## 9.2 Executive Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  CYBERDETECT EXECUTIVE BRIEFING                        Q4 2024 Report  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                    OVERALL SECURITY POSTURE                       │ │
│  │                                                                   │ │
│  │                          ┌──────┐                                 │ │
│  │                          │  78  │                                 │ │
│  │                          │ /100 │                                 │ │
│  │                          └──────┘                                 │ │
│  │                         ▲ +5 from Q3                              │ │
│  │                                                                   │ │
│  │     LOW RISK ◄━━━━━━━━━━━━━━━●━━━━━━━━━━► HIGH RISK              │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐          │
│  │ INCIDENTS       │ │ MTTR            │ │ AUTOMATION      │          │
│  │                 │ │                 │ │                 │          │
│  │     127         │ │    4.2 hrs      │ │     73%         │          │
│  │   ▼ -23% QoQ    │ │   ▼ -1.8 hrs    │ │   ▲ +12%        │          │
│  │                 │ │                 │ │                 │          │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘          │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ INCIDENT TREND (12 MONTHS)                                      │   │
│  │ ▁▂▃▄▃▂▁▂▃▂▁▁                                                   │   │
│  │ J F M A M J J A S O N D                                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌───────────────────────────────┐ ┌───────────────────────────────┐   │
│  │ TOP ATTACK VECTORS           │ │ COMPLIANCE STATUS             │   │
│  │                              │ │                               │   │
│  │ 1. Email Threats    ███ 42% │ │ SOC 2 Type II    ✓ Compliant  │   │
│  │ 2. Web Exploits     ██░ 28% │ │ ISO 27001        ✓ Compliant  │   │
│  │ 3. Credential Abuse █░░ 18% │ │ PCI DSS          ⚠ 2 findings │   │
│  │ 4. Other            ░░░ 12% │ │ HIPAA            ✓ Compliant  │   │
│  └───────────────────────────────┘ └───────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## 9.3 Required Widgets & Their Purpose

### Widget 1: Overall Risk Score
| Attribute | Value |
|-----------|-------|
| **Purpose** | Single number representing security health |
| **Calculation** | Weighted composite of vulnerabilities, incidents, compliance |
| **Update Frequency** | Daily |
| **Decision Enabled** | "Are we getting better or worse?" |

### Widget 2: Incident Trend
| Attribute | Value |
|-----------|-------|
| **Purpose** | Show trajectory over time |
| **Visualization** | Minimal sparkline or bar chart |
| **Comparison** | YoY and QoQ |
| **Decision Enabled** | "Is our investment in security working?" |

### Widget 3: Mean Time to Respond (MTTR)
| Attribute | Value |
|-----------|-------|
| **Purpose** | Operational efficiency metric |
| **Target** | <4 hours for critical incidents |
| **Decision Enabled** | "Do we need more analysts or better tooling?" |

### Widget 4: Automation Coverage
| Attribute | Value |
|-----------|-------|
| **Purpose** | Show % of incidents auto-triaged/resolved |
| **Goal** | Demonstrate ROI of platform investment |
| **Decision Enabled** | "What % of work is human vs machine?" |

### Widget 5: Top Attack Vectors
| Attribute | Value |
|-----------|-------|
| **Purpose** | Know where threats come from |
| **Visualization** | Horizontal bar chart, no more than 5 items |
| **Decision Enabled** | "Where should we invest in defense?" |

### Widget 6: Compliance Posture
| Attribute | Value |
|-----------|-------|
| **Purpose** | Quick view of regulatory status |
| **Visualization** | Simple pass/fail/warning list |
| **Decision Enabled** | "Are we at legal or contractual risk?" |

### Widget 7: Strategic Threat Landscape
| Attribute | Value |
|-----------|-------|
| **Purpose** | Industry-specific threats targeting organization |
| **Source** | Threat intelligence feeds + AI analysis |
| **Decision Enabled** | "What threats should we prepare for?" |

## 9.4 Executive Mode Visual Design

### Color Palette (Corporate, Not Cyber)
```css
.executive-mode {
  --bg-primary: #FFFFFF;
  --bg-secondary: #F8FAFC;
  --text-primary: #1E293B;
  --text-secondary: #64748B;
  --accent-positive: #10B981;
  --accent-negative: #EF4444;
  --accent-neutral: #6366F1;
  --border-subtle: #E2E8F0;
}
```

### Typography
- **Headers**: Inter/Outfit, 600 weight, 24-32px
- **Body**: Inter, 400 weight, 14-16px
- **Metrics**: Inter, 700 weight, 48-64px
- **No monospace fonts** in executive view

### Widget Card Style
```css
.executive-widget {
  background: white;
  border-radius: 12px;
  border: 1px solid var(--border-subtle);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 24px;
}

.executive-widget:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
```

## 9.5 Print/Export Requirements

1. **PDF Export**: One-click export to branded PDF
2. **PowerPoint**: Widgets exportable as slides
3. **Scheduled Reports**: Weekly/monthly email to distribution list
4. **Dark Mode Toggle**: Some executives prefer dark; option available

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# IMPLEMENTATION ROADMAP
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Phase 1: Foundation (Weeks 1-2)
- [ ] Create shared TypeScript interfaces for all new models
- [ ] Implement mode context provider (SOC vs Client vs Executive)
- [ ] Build base component library for mode-aware rendering
- [ ] Set up API endpoints for new data requirements

## Phase 2: MITRE ATT&CK (Weeks 3-4)
- [ ] Build MITRE matrix grid component
- [ ] Implement technique node with all states
- [ ] Create attack path visualization (SVG connections)
- [ ] Integrate AI insights panel
- [ ] Add drill-down modal for technique details

## Phase 3: Playbooks (Weeks 5-6)
- [ ] Build playbook engine state machine
- [ ] Create step components (auto/manual/approval)
- [ ] Implement progress visualization
- [ ] Add AI optimization suggestion UI
- [ ] Build evidence attachment system

## Phase 4: Dual Mode UI (Weeks 7-8)
- [ ] Implement data sanitization layer
- [ ] Build client-mode components
- [ ] Create mode switcher (for MSSP operators)
- [ ] QA test information leakage prevention
- [ ] Build client onboarding flow

## Phase 5: Executive Dashboard (Weeks 9-10)
- [ ] Build executive-specific component library
- [ ] Create all 7 core widgets
- [ ] Implement trend calculations
- [ ] Add PDF/export functionality
- [ ] Build scheduled report system

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# EXPERT ADDITIONS & RECOMMENDATIONS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Additional Features Not Requested But Critical

### 1. Session Recording Replay
For incident review, allow analysts to replay endpoint sessions as video-like timeline. Competitors like CrowdStrike offer this.

### 2. Collaborative Investigation Mode
Multiple analysts can annotate the same incident in real-time with presence indicators (like Figma).

### 3. SLA Countdown Timers
For MSSP operators, show countdown to client SLA breach on every incident card.

### 4. Client Health Score per Tenant
For MSSPs managing multiple clients, a per-client security health dashboard.

### 5. Threat Intel Overlay
Toggle to overlay threat intel feeds on MITRE matrix (e.g., "APT29 was seen using these techniques this month").

### 6. Mobile Companion App (Future)
Push notifications for critical alerts with approve/reject playbook steps from mobile.

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-07  
**Next Review**: After Phase 1 Implementation
