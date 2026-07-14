"""
Forensic PDF Report Generator - Expert SOC Analyst Level
Génère des rapports PDF professionnels avec charts, tables, et analyse détaillée
"""
from datetime import datetime
from typing import Dict, Any
import json


class ForensicPDFGenerator:
    """
    Generate professional forensic PDF reports
    """
    
    @staticmethod
    def generate_html_report(audit_data: Dict[str, Any]) -> str:
        """
        Generate comprehensive HTML report (can be converted to PDF)
        """
        metadata = audit_data.get("metadata", {})
        exec_summary = audit_data.get("executive_summary", {})
        timeline = audit_data.get("timeline_analysis", {})
        vectors = audit_data.get("attack_vector_analysis", {})
        iocs = audit_data.get("ioc_extraction", {})
        mitre = audit_data.get("mitre_attack_mapping", {})
        network = audit_data.get("network_flow_analysis", {})
        threat_intel = audit_data.get("threat_intelligence", {})
        risk = audit_data.get("risk_assessment", {})
        recommendations = audit_data.get("recommendations", [])
        artifacts = audit_data.get("forensic_artifacts", {})
        custody = audit_data.get("chain_of_custody", {})
        
        html = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Advanced Forensic Audit Report - {metadata.get('report_id', 'N/A')}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
        
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        
        body {{
            font-family: 'Inter', sans-serif;
            background: #0a0a0f;
            color: #e2e8f0;
            line-height: 1.6;
            padding: 40px;
        }}
        
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background: #050505;
            border: 1px solid rgba(255,255,255,0.05);
        }}
        
        /* Header */
        .header {{
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            padding: 60px 80px;
            border-bottom: 3px solid #22c55e;
            position: relative;
        }}
        
        .classification {{
            position: absolute;
            top: 30px;
            right: 80px;
            background: #ef4444;
            color: #fff;
            padding: 8px 20px;
            font-size: 12px;
            font-weight: 900;
            letter-spacing: 2px;
            border-radius: 4px;
        }}
        
        .header h1 {{
            font-size: 42px;
            font-weight: 900;
            color: #fff;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: -1px;
        }}
        
        .header .subtitle {{
            font-size: 16px;
            color: #94a3b8;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 3px;
        }}
        
        .header .report-id {{
            margin-top: 20px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 14px;
            color: #64748b;
        }}
        
        /* Content */
        .content {{
            padding: 80px;
        }}
        
        .section {{
            margin-bottom: 80px;
        }}
        
        .section-title {{
            font-size: 28px;
            font-weight: 900;
            color: #fff;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 2px solid rgba(34, 197, 94, 0.3);
            text-transform: uppercase;
            letter-spacing: -0.5px;
        }}
        
        .section-subtitle {{
            font-size: 18px;
            font-weight: 700;
            color: #22c55e;
            margin: 30px 0 15px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
        }}
        
        /* Stats Grid */
        .stats-grid {{
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 40px;
        }}
        
        .stat-card {{
            background: #0a0a0f;
            border: 1px solid rgba(255,255,255,0.05);
            padding: 30px;
            border-radius: 12px;
            text-align: center;
        }}
        
        .stat-card .label {{
            font-size: 11px;
            font-weight: 900;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 15px;
            display: block;
        }}
        
        .stat-card .value {{
            font-size: 36px;
            font-weight: 900;
            color: #fff;
            font-family: 'JetBrains Mono', monospace;
        }}
        
        .stat-card .subvalue {{
            font-size: 12px;
            color: #64748b;
            margin-top: 8px;
        }}
        
        /* Risk Score */
        .risk-score {{
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            border: 2px solid;
            padding: 40px;
            border-radius: 16px;
            text-align: center;
            margin: 40px 0;
        }}
        
        .risk-score.critical {{ border-color: #ef4444; }}
        .risk-score.high {{ border-color: #f97316; }}
        .risk-score.medium {{ border-color: #eab308; }}
        .risk-score.low {{ border-color: #22c55e; }}
        
        .risk-score .score {{
            font-size: 72px;
            font-weight: 900;
            font-family: 'JetBrains Mono', monospace;
            margin-bottom: 10px;
        }}
        
        .risk-score.critical .score {{ color: #ef4444; }}
        .risk-score.high .score {{ color: #f97316; }}
        .risk-score.medium .score {{ color: #eab308; }}
        .risk-score.low .score {{ color: #22c55e; }}
        
        .risk-score .level {{
            font-size: 24px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 3px;
        }}
        
        /* Table */
        table {{
            width: 100%;
            border-collapse: separate;
            border-spacing: 0 8px;
            margin: 20px 0;
        }}
        
        th {{
            text-align: left;
            padding: 15px 20px;
            color: #64748b;
            font-size: 11px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }}
        
        td {{
            padding: 20px;
            background: #0a0a0f;
            border-top: 1px solid rgba(255,255,255,0.05);
            border-bottom: 1px solid rgba(255,255,255,0.05);
            font-size: 14px;
        }}
        
        td:first-child {{
            border-left: 1px solid rgba(255,255,255,0.05);
            border-radius: 8px 0 0 8px;
        }}
        
        td:last-child {{
            border-right: 1px solid rgba(255,255,255,0.05);
            border-radius: 0 8px 8px 0;
        }}
        
        /* Severity Badge */
        .severity {{
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 1px;
            display: inline-block;
        }}
        
        .severity.critical {{
            background: rgba(239, 68, 68, 0.1);
            color: #ef4444;
            border: 1px solid rgba(239, 68, 68, 0.3);
        }}
        
        .severity.high {{
            background: rgba(249, 115, 22, 0.1);
            color: #f97316;
            border: 1px solid rgba(249, 115, 22, 0.3);
        }}
        
        .severity.medium {{
            background: rgba(234, 179, 8, 0.1);
            color: #eab308;
            border: 1px solid rgba(234, 179, 8, 0.3);
        }}
        
        .severity.low {{
            background: rgba(34, 197, 94, 0.1);
            color: #22c55e;
            border: 1px solid rgba(34, 197, 94, 0.3);
        }}
        
        /* List */
        .finding-list {{
            list-style: none;
            margin: 20px 0;
        }}
        
        .finding-list li {{
            background: #0a0a0f;
            border-left: 3px solid #22c55e;
            padding: 20px 30px;
            margin-bottom: 15px;
            border-radius: 0 8px 8px 0;
        }}
        
        .finding-list li strong {{
            color: #22c55e;
            font-weight: 700;
        }}
        
        /* Recommendation Card */
        .recommendation {{
            background: #0a0a0f;
            border: 1px solid rgba(255,255,255,0.05);
            border-left: 4px solid;
            padding: 30px;
            margin-bottom: 20px;
            border-radius: 0 12px 12px 0;
        }}
        
        .recommendation.critical {{ border-left-color: #ef4444; }}
        .recommendation.high {{ border-left-color: #f97316; }}
        .recommendation.medium {{ border-left-color: #eab308; }}
        
        .recommendation .title {{
            font-size: 18px;
            font-weight: 700;
            color: #fff;
            margin-bottom: 10px;
        }}
        
        .recommendation .description {{
            color: #94a3b8;
            margin-bottom: 15px;
        }}
        
        .recommendation .actions {{
            list-style: none;
            margin-top: 15px;
        }}
        
        .recommendation .actions li {{
            padding: 8px 0;
            padding-left: 25px;
            position: relative;
            color: #cbd5e1;
        }}
        
        .recommendation .actions li:before {{
            content: "→";
            position: absolute;
            left: 0;
            color: #22c55e;
            font-weight: 900;
        }}
        
        /* Code Block */
        .code {{
            background: #000;
            border: 1px solid rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 8px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 13px;
            color: #22c55e;
            overflow-x: auto;
            margin: 20px 0;
        }}
        
        /* Footer */
        .footer {{
            background: #0a0a0f;
            padding: 40px 80px;
            border-top: 1px solid rgba(255,255,255,0.05);
            text-align: center;
            color: #475569;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
        }}
        
        .footer .timestamp {{
            margin-top: 10px;
            font-family: 'JetBrains Mono', monospace;
            color: #64748b;
        }}
        
        /* Page Break for PDF */
        .page-break {{
            page-break-after: always;
        }}
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="classification">{metadata.get('classification', 'TLP:RED')}</div>
            <h1>Advanced Forensic Audit Report</h1>
            <div class="subtitle">Expert SOC Analyst Level</div>
            <div class="report-id">Report ID: {metadata.get('report_id', 'N/A')}</div>
        </div>
        
        <!-- Content -->
        <div class="content">
            <!-- Executive Summary -->
            <div class="section">
                <h2 class="section-title">Executive Summary</h2>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <span class="label">Total Events</span>
                        <div class="value">{exec_summary.get('total_events', 0):,}</div>
                    </div>
                    <div class="stat-card">
                        <span class="label">Critical</span>
                        <div class="value">{exec_summary.get('severity_breakdown', {}).get('critical', 0)}</div>
                        <div class="subvalue">High: {exec_summary.get('severity_breakdown', {}).get('high', 0)}</div>
                    </div>
                    <div class="stat-card">
                        <span class="label">Unique Sources</span>
                        <div class="value">{exec_summary.get('unique_source_ips', 0)}</div>
                    </div>
                    <div class="stat-card">
                        <span class="label">Attack Types</span>
                        <div class="value">{len(exec_summary.get('top_attack_types', []))}</div>
                    </div>
                </div>
                
                <!-- Risk Score -->
                <div class="risk-score {risk.get('risk_level', 'medium').lower()}">
                    <div class="score">{risk.get('risk_score', 0)}/100</div>
                    <div class="level">{risk.get('risk_level', 'UNKNOWN')} RISK</div>
                </div>
                
                <!-- Key Findings -->
                <h3 class="section-subtitle">Key Findings</h3>
                <ul class="finding-list">
"""
        
        for finding in exec_summary.get('key_findings', []):
            html += f"                    <li>{finding}</li>\n"
        
        html += """
                </ul>
            </div>
            
            <div class="page-break"></div>
            
            <!-- Attack Vector Analysis -->
            <div class="section">
                <h2 class="section-title">Attack Vector Analysis</h2>
                
                <table>
                    <thead>
                        <tr>
                            <th>Attack Type</th>
                            <th>Count</th>
                            <th>Severity</th>
                            <th>Unique Sources</th>
                            <th>First Seen</th>
                        </tr>
                    </thead>
                    <tbody>
"""
        
        for vector_name, vector_data in list(vectors.get('vectors', {}).items())[:10]:
            critical_count = vector_data.get('severity_distribution', {}).get('critical', 0)
            high_count = vector_data.get('severity_distribution', {}).get('high', 0)
            severity_class = 'critical' if critical_count > 0 else ('high' if high_count > 0 else 'medium')
            
            html += f"""
                        <tr>
                            <td><strong>{vector_name}</strong></td>
                            <td>{vector_data.get('count', 0)}</td>
                            <td><span class="severity {severity_class}">{severity_class}</span></td>
                            <td>{vector_data.get('unique_sources', 0)}</td>
                            <td>{vector_data.get('first_seen', 'N/A')[:19]}</td>
                        </tr>
"""
        
        html += """
                    </tbody>
                </table>
            </div>
            
            <div class="page-break"></div>
            
            <!-- MITRE ATT&CK Mapping -->
            <div class="section">
                <h2 class="section-title">MITRE ATT&CK Framework Mapping</h2>
                
                <p style="color: #94a3b8; margin-bottom: 30px;">
                    Detected tactics: <strong style="color: #22c55e;">{mitre.get('coverage', 0)}</strong> | 
                    Most used: <strong style="color: #22c55e;">{mitre.get('most_used_tactic', 'N/A')}</strong>
                </p>
                
                <table>
                    <thead>
                        <tr>
                            <th>Tactic</th>
                            <th>Technique</th>
                            <th>Count</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
"""
        
        for tactic, tactic_data in list(mitre.get('tactics', {}).items())[:10]:
            for technique, tech_data in list(tactic_data.get('techniques', {}).items())[:3]:
                html += f"""
                        <tr>
                            <td><strong>{tactic}</strong></td>
                            <td><code style="color: #22c55e;">{technique}</code></td>
                            <td>{tech_data.get('count', 0)}</td>
                            <td>{tech_data.get('description', 'N/A')[:100]}</td>
                        </tr>
"""
        
        html += """
                    </tbody>
                </table>
            </div>
            
            <div class="page-break"></div>
            
            <!-- IOC Extraction -->
            <div class="section">
                <h2 class="section-title">Indicators of Compromise (IOCs)</h2>
                
                <h3 class="section-subtitle">Malicious IP Addresses</h3>
                <div class="code">
"""
        
        for ip in iocs.get('malicious_ips', [])[:20]:
            html += f"{ip}\n"
        
        html += """
                </div>
                
                <h3 class="section-subtitle">Suspicious Ports</h3>
                <div class="code">
"""
        
        for port in iocs.get('suspicious_ports', [])[:15]:
            html += f"Port {port}\n"
        
        html += """
                </div>
            </div>
            
            <div class="page-break"></div>
            
            <!-- Recommendations -->
            <div class="section">
                <h2 class="section-title">Security Recommendations</h2>
"""
        
        for rec in recommendations:
            priority_class = rec.get('priority', 'medium').lower()
            html += f"""
                <div class="recommendation {priority_class}">
                    <div class="title">
                        <span class="severity {priority_class}">{rec.get('priority', 'MEDIUM')}</span>
                        {rec.get('title', 'N/A')}
                    </div>
                    <div class="description">{rec.get('description', 'N/A')}</div>
                    <ul class="actions">
"""
            for action in rec.get('actions', []):
                html += f"                        <li>{action}</li>\n"
            
            html += """
                    </ul>
                </div>
"""
        
        html += f"""
            </div>
            
            <!-- Chain of Custody -->
            <div class="section">
                <h2 class="section-title">Chain of Custody</h2>
                
                <table>
                    <tr>
                        <td><strong>Evidence ID</strong></td>
                        <td>{custody.get('evidence_id', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td><strong>Collected By</strong></td>
                        <td>{custody.get('collected_by', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td><strong>Collection Time</strong></td>
                        <td>{custody.get('collected_at', 'N/A')[:19]}</td>
                    </tr>
                    <tr>
                        <td><strong>Evidence Type</strong></td>
                        <td>{custody.get('evidence_type', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td><strong>Evidence Count</strong></td>
                        <td>{custody.get('evidence_count', 0):,} events</td>
                    </tr>
                    <tr>
                        <td><strong>Integrity Hash</strong></td>
                        <td><code style="color: #22c55e;">{custody.get('integrity_hash', 'N/A')}</code></td>
                    </tr>
                </table>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            BOUCLIER Advanced Cyber Defense Platform • Expert SOC Analyst Report
            <div class="timestamp">Generated: {metadata.get('generated_at', 'N/A')[:19]}</div>
        </div>
    </div>
</body>
</html>
"""
        
        return html
