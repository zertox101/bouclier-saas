import { UnifiedScanResult } from "@/types/schema";

export const MOCK_SCAN_RESULTS: Record<string, UnifiedScanResult> = {
    // 1. Vulnerability Scanner (Standard)
    "vuln-scan-001": {
        tool: "vuln_scanner",
        scan_id: "uuid-vuln-001",
        timestamp: "2025-12-10T20:15:00Z",
        target: { type: "web_app", identifier: "portal.example.com" },
        summary: {
            status: "completed",
            duration_seconds: 420,
            total_findings: 2,
            risk_score: 67.5,
        },
        findings: [
            {
                id: "VULN-2025-001",
                title: "Outdated TLS version (TLS 1.0 enabled)",
                type: "vulnerability",
                severity: "high",
                cvss: { score: 6.5, vector: "AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N" },
                mitre: ["T1588"],
                affected: [
                    { resource_type: "service", resource_id: "portal.example.com:443" },
                ],
                description:
                    "The server accepts connections using TLS 1.0, which has known cryptographic weaknesses. Attackers could decrypt traffic or perform man-in-the-middle attacks.",
                evidence: {
                    stdout_snippet: "Supported protocols: TLSv1, TLSv1.1, TLSv1.2",
                },
                recommendation:
                    "Disable TLS 1.0 and 1.1. Configure the server to support only TLS 1.2 and TLS 1.3 with strong cipher suites.",
                references: [
                    {
                        type: "link",
                        url: "https://www.example.org/tls-guidance",
                        title: "TLS Guidance",
                    },
                ],
                confidence: "high",
                metadata: { scanner_version: "3.1.0" },
            },
            {
                id: "VULN-2025-002",
                title: "Reflected Cross-Site Scripting (R-XSS) in /search",
                type: "vulnerability",
                severity: "medium",
                cvss: { score: 5.0, vector: "AV:N/AC:L/PR:N/UI:R/S:U/C:L/I:L/A:N" },
                mitre: ["T1059.007"],
                affected: [{ resource_type: "endpoint", resource_id: "/search" }],
                description:
                    "Unsanitized user input from the 'q' parameter is reflected in the page response.",
                evidence: {
                    stdout_snippet: "Payload <script>alert(1)</script> reflected in response",
                },
                recommendation:
                    "Implement proper output encoding/escaping for all user input.",
                confidence: "medium",
            },
        ],
        kpis: { critical: 0, high: 1, medium: 1, low: 0 },
    },

    // 2. Network Scanner
    "net-scan-001": {
        tool: "network_scanner",
        scan_id: "uuid-net-001",
        timestamp: "2025-12-10T19:00:00Z",
        target: { type: "ip_range", identifier: "192.168.1.0/24" },
        summary: {
            status: "completed",
            duration_seconds: 120,
            total_findings: 2,
            risk_score: 35.0,
        },
        findings: [
            {
                id: "NET-001",
                title: "Host 192.168.1.10 open SSH",
                type: "service",
                severity: "low",
                affected: [{ resource_type: "host", resource_id: "192.168.1.10" }],
                description: "SSH port 22 open (service: OpenSSH 7.2p2)",
                recommendation:
                    "Ensure SSH uses key-based auth and disable password auth.",
                confidence: "high",
                metadata: { os_guess: "Linux" },
            }
        ],
        kpis: { critical: 0, high: 0, medium: 0, low: 1 },
    },

    // 3. C2 Simulator
    "c2-sim-001": {
        tool: "c2_simulator",
        scan_id: "uuid-c2-001",
        timestamp: "2025-12-10T23:00:00Z",
        target: { type: "network_segment", identifier: "10.0.5.0/24" },
        summary: {
            status: "completed",
            duration_seconds: 95,
            risk_score: 72.0,
            simulated_steps: 4,
        },
        simulated_timeline: [
            {
                step: 1,
                technique: "T1059",
                label: "Initial Execution",
                result: "Simulated execution succeeded (sandbox environment)"
            },
            {
                step: 2,
                technique: "T1105",
                label: "Simulated Beacon Callback",
                result: "Outbound request detected"
            },
            {
                step: 3,
                technique: "T1041",
                label: "Simulated Data Exfiltration",
                result: "Low-volume mock data exfil generated"
            },
            {
                step: 4,
                technique: "T1562",
                label: "Defense Evasion Check",
                result: "EDR detected and blocked"
            }
        ],
        findings: [
            {
                id: "C2-F-001",
                title: "Outbound Traffic Allowed",
                type: "misconfiguration",
                severity: "high",
                description: "Network allows outbound traffic to untrusted external IPs.",
                recommendation: "Restrict outbound firewall rules and apply egress filtering.",
                mitre: ["T1105"],
                confidence: "high"
            }
        ],
        kpis: { critical: 0, high: 1, medium: 0, low: 0 }
    },

    // 4. Honeypot
    "honey-001": {
        tool: "honeypot",
        scan_id: "uuid-honey-001",
        timestamp: "2025-12-10T20:00:00Z",
        target: { type: "service", identifier: "ssh-honeypot" },
        summary: {
            status: "active",
            risk_score: 60,
            captured_events: 14,
            unique_attackers: 5,
        },
        events: [
            {
                timestamp: "2025-12-10T19:05:12Z",
                source_ip: "185.22.14.90",
                geo: "RU",
                attack_type: "Bruteforce Attempt",
                attempted_user: "root",
                evidence: "Invalid authentication attempt"
            },
            {
                timestamp: "2025-12-10T19:31:56Z",
                source_ip: "102.44.20.11",
                geo: "MA",
                attack_type: "Protocol Scan",
                evidence: "Multiple malformed SSH packets"
            }
        ],
        kpis: {
            bruteforce_count: 9,
            scan_count: 5,
            avg_attempts_per_attacker: 3,
            critical: 0, high: 1, medium: 1, low: 0 // Adding standard kpis for compatibility
        },
        findings: []
    },

    // 5. Threat Hunting
    "hunt-001": {
        tool: "threat_hunting",
        scan_id: "uuid-hunt-001",
        timestamp: "2025-12-10T21:15:00Z",
        target: { type: "logs_cluster", identifier: "siem://production" },
        summary: {
            status: "completed",
            duration_seconds: 180,
            events_analyzed: 15423,
            ioc_hits: 3,
            risk_score: 80
        },
        iocs_detected: [
            {
                id: "IOC-001",
                type: "malicious_ip",
                indicator: "45.89.14.22",
                confidence: "high",
                evidence_count: 12,
                mitre: ["T1041"]
            },
            {
                id: "IOC-002",
                type: "suspicious_hash",
                indicator: "sha256:e8ab3c9d...",
                confidence: "medium",
                evidence_count: 2,
                mitre: ["T1059"]
            }
        ],
        correlated_incidents: [
            {
                incident_id: "INC-449",
                summary: "Possible lateral movement",
                severity: "high",
                related_hosts: ["10.0.5.12", "10.0.5.15"],
                mitre: ["T1021", "T1080"]
            }
        ],
        kpis: { critical: 0, high: 2, medium: 1, low: 0 },
        findings: []
    },

    // 6. Post-Quantum Crypto
    "pqc-001": {
        tool: "post_quantum_crypto",
        scan_id: "uuid-pq-001",
        timestamp: "2025-12-10T17:55:00Z",
        target: { "type": "web_app", "identifier": "api.example.com" },
        summary: {
            status: "completed",
            duration_seconds: 40,
            risk_score: 40,
            pq_cipher_support: false
        },
        findings: [
            {
                id: "PQ-001",
                title: "No Post-Quantum Key Exchange",
                type: "misconfiguration",
                severity: "medium",
                description: "Server does not support post-quantum key exchange (Kyber).",
                recommendation: "Enable hybrid TLS with Kyber/Dilithium for forward secrecy.",
                confidence: "high"
            }
        ],
        kpis: { critical: 0, high: 0, medium: 1, low: 0 }
    },

    // 7. Mobile Security
    "mob-001": {
        tool: "mobile_security",
        scan_id: "uuid-mob-001",
        timestamp: "2025-12-10T17:20:00Z",
        target: { "type": "apk", "identifier": "bank-app.apk" },
        summary: {
            status: "completed",
            permissions_count: 24,
            dangerous_permissions: 3,
            risk_score: 58
        },
        dangerous_permissions: [
            "READ_SMS",
            "ACCESS_FINE_LOCATION",
            "READ_CONTACTS"
        ],
        findings: [
            {
                id: "MOB-002",
                title: "Insecure Data Transmission",
                type: "vulnerability",
                severity: "medium",
                description: "App sends analytics data in plaintext.",
                recommendation: "Use HTTPS and certificate pinning.",
                confidence: "medium"
            }
        ],
        kpis: { critical: 0, high: 0, medium: 1, low: 0 }
    },

    // 8. Zero Trust
    "zt-001": {
        tool: "zero_trust_audit",
        scan_id: "uuid-zt-001",
        timestamp: "2025-12-10T18:20:00Z",
        target: { type: "domain", identifier: "internal.corp" },
        summary: {
            status: "completed",
            risk_score: 36, // 100 - 64
            score_overall: 64,
            categories: {
                identity: 70,
                device: 50,
                network: 60,
                workload: 78
            }
        },
        findings: [
            {
                id: "ZT-004",
                title: "Gap: Continuous Auth",
                type: "misconfiguration",
                severity: "high",
                description: "No continuous authentication for remote users",
                recommendation: "Enable continuous verification using device health signals",
                confidence: "high"
            }
        ],
        kpis: { critical: 0, high: 1, medium: 0, low: 0 }
    }
};
