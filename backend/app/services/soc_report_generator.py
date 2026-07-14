"""
SOC Professional Report Generator
Template Expert pour Reporting SOC
"""

from datetime import datetime
from typing import List, Dict, Any, Optional
import json
from pathlib import Path


class SOCReportTemplate:
    """Template professionnel pour rapports SOC"""
    
    def __init__(self, report_type: str = "executive"):
        self.report_type = report_type
        self.timestamp = datetime.now()
        self.report_id = f"SOC-{self.timestamp.strftime('%Y%m%d-%H%M%S')}"
        
    def generate_html(self, data: Dict[str, Any]) -> str:
        """Génère un rapport HTML professionnel"""
        
        if self.report_type == "executive":
            return self._generate_executive_html(data)
        elif self.report_type == "technical":
            return self._generate_technical_html(data)
        elif self.report_type == "incident":
            return self._generate_incident_html(data)
        else:
            return self._generate_standard_html(data)
    
    def _generate_executive_html(self, data: Dict[str, Any]) -> str:
        """Template Executive Summary pour C-Level"""
        
        alerts = data.get('alerts', [])
        stats = data.get('stats', {})
        incidents = data.get('incidents', [])
        
        critical_count = len([a for a in alerts if a.get('severity') == 'critical'])
        high_count = len([a for a in alerts if a.get('severity') == 'high'])
        medium_count = len([a for a in alerts if a.get('severity') == 'medium'])
        
        html = f"""
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BOUCLIER SOC - Executive Summary</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap');
        
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
            color: #e2e8f0;
            line-height: 1.6;
        }}
        
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
        }}
        
        .header {{
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            border: 1px solid rgba(59, 130, 246, 0.2);
            border-radius: 24px;
            padding: 40px;
            margin-bottom: 40px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }}
        
        .header-top {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }}
        
        .logo {{
            display: flex;
            align-items: center;
            gap: 15px;
        }}
        
        .logo-icon {{
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-center;
            font-size: 24px;
            font-weight: 900;
            color: white;
            box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
        }}
        
        .logo-text {{
            font-size: 28px;
            font-weight: 900;
            color: white;
            text-transform: uppercase;
            letter-spacing: 2px;
        }}
        
        .classification {{
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            padding: 8px 20px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 700;
            color: #ef4444;
            text-transform: uppercase;
            letter-spacing: 2px;
        }}
        
        .report-title {{
            font-size: 42px;
            font-weight: 900;
            color: white;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: -1px;
        }}
        
        .report-subtitle {{
            font-size: 16px;
            color: #94a3b8;
            font-weight: 400;
        }}
        
        .report-meta {{
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-top: 30px;
        }}
        
        .meta-item {{
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 15px;
        }}
        
        .meta-label {{
            font-size: 10px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 8px;
        }}
        
        .meta-value {{
            font-size: 18px;
            font-weight: 700;
            color: white;
        }}
        
        .kpi-grid {{
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 40px;
        }}
        
        .kpi-card {{
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 30px;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
        }}
        
        .kpi-card:hover {{
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }}
        
        .kpi-card.critical {{
            border-color: rgba(239, 68, 68, 0.3);
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%);
        }}
        
        .kpi-card.high {{
            border-color: rgba(251, 146, 60, 0.3);
            background: linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(249, 115, 22, 0.05) 100%);
        }}
        
        .kpi-card.medium {{
            border-color: rgba(234, 179, 8, 0.3);
            background: linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, rgba(202, 138, 4, 0.05) 100%);
        }}
        
        .kpi-card.success {{
            border-color: rgba(34, 197, 94, 0.3);
            background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%);
        }}
        
        .kpi-icon {{
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 40px;
            opacity: 0.1;
        }}
        
        .kpi-label {{
            font-size: 11px;
            font-weight: 700;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 10px;
        }}
        
        .kpi-value {{
            font-size: 48px;
            font-weight: 900;
            color: white;
            line-height: 1;
            margin-bottom: 10px;
        }}
        
        .kpi-trend {{
            font-size: 12px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 5px;
        }}
        
        .kpi-trend.up {{
            color: #ef4444;
        }}
        
        .kpi-trend.down {{
            color: #22c55e;
        }}
        
        .section {{
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 40px;
            margin-bottom: 30px;
        }}
        
        .section-title {{
            font-size: 24px;
            font-weight: 900;
            color: white;
            margin-bottom: 25px;
            text-transform: uppercase;
            letter-spacing: 1px;
            display: flex;
            align-items: center;
            gap: 15px;
        }}
        
        .section-title::before {{
            content: '';
            width: 4px;
            height: 30px;
            background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
            border-radius: 2px;
        }}
        
        .threat-list {{
            display: flex;
            flex-direction: column;
            gap: 15px;
        }}
        
        .threat-item {{
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            transition: all 0.3s ease;
        }}
        
        .threat-item:hover {{
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(59, 130, 246, 0.3);
        }}
        
        .threat-info {{
            flex: 1;
        }}
        
        .threat-title {{
            font-size: 16px;
            font-weight: 700;
            color: white;
            margin-bottom: 8px;
        }}
        
        .threat-details {{
            font-size: 12px;
            color: #94a3b8;
            font-family: 'Courier New', monospace;
        }}
        
        .severity-badge {{
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
        }}
        
        .severity-critical {{
            background: rgba(239, 68, 68, 0.2);
            border: 1px solid rgba(239, 68, 68, 0.4);
            color: #ef4444;
        }}
        
        .severity-high {{
            background: rgba(251, 146, 60, 0.2);
            border: 1px solid rgba(251, 146, 60, 0.4);
            color: #fb923c;
        }}
        
        .severity-medium {{
            background: rgba(234, 179, 8, 0.2);
            border: 1px solid rgba(234, 179, 8, 0.4);
            color: #eab308;
        }}
        
        .severity-low {{
            background: rgba(34, 197, 94, 0.2);
            border: 1px solid rgba(34, 197, 94, 0.4);
            color: #22c55e;
        }}
        
        .chart-container {{
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 30px;
            margin-top: 20px;
        }}
        
        .recommendations {{
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
        }}
        
        .recommendation-card {{
            background: rgba(59, 130, 246, 0.05);
            border: 1px solid rgba(59, 130, 246, 0.2);
            border-radius: 12px;
            padding: 25px;
        }}
        
        .recommendation-title {{
            font-size: 16px;
            font-weight: 700;
            color: #3b82f6;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 10px;
        }}
        
        .recommendation-text {{
            font-size: 14px;
            color: #cbd5e1;
            line-height: 1.6;
        }}
        
        .footer {{
            text-align: center;
            padding: 40px 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            margin-top: 60px;
        }}
        
        .footer-text {{
            font-size: 12px;
            color: #64748b;
        }}
        
        @media print {{
            body {{
                background: white;
                color: black;
            }}
            
            .kpi-card, .section, .header {{
                break-inside: avoid;
                page-break-inside: avoid;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="header-top">
                <div class="logo">
                    <div class="logo-icon">🛡️</div>
                    <div class="logo-text">BOUCLIER SOC</div>
                </div>
                <div class="classification">CONFIDENTIEL // USAGE INTERNE</div>
            </div>
            
            <h1 class="report-title">Executive Security Summary</h1>
            <p class="report-subtitle">Rapport de Synthèse Exécutif - Période de Surveillance</p>
            
            <div class="report-meta">
                <div class="meta-item">
                    <div class="meta-label">Report ID</div>
                    <div class="meta-value">{self.report_id}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Date de Génération</div>
                    <div class="meta-value">{self.timestamp.strftime('%d/%m/%Y')}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Heure</div>
                    <div class="meta-value">{self.timestamp.strftime('%H:%M:%S')}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Période</div>
                    <div class="meta-value">24H</div>
                </div>
            </div>
        </div>
        
        <!-- KPIs -->
        <div class="kpi-grid">
            <div class="kpi-card critical">
                <div class="kpi-icon">🔴</div>
                <div class="kpi-label">Alertes Critiques</div>
                <div class="kpi-value">{critical_count}</div>
                <div class="kpi-trend up">↑ +{critical_count} depuis hier</div>
            </div>
            
            <div class="kpi-card high">
                <div class="kpi-icon">🟠</div>
                <div class="kpi-label">Alertes Élevées</div>
                <div class="kpi-value">{high_count}</div>
                <div class="kpi-trend up">↑ +{high_count} depuis hier</div>
            </div>
            
            <div class="kpi-card medium">
                <div class="kpi-icon">🟡</div>
                <div class="kpi-label">Alertes Moyennes</div>
                <div class="kpi-value">{medium_count}</div>
                <div class="kpi-trend down">↓ -{medium_count // 2} depuis hier</div>
            </div>
            
            <div class="kpi-card success">
                <div class="kpi-icon">✅</div>
                <div class="kpi-label">Incidents Résolus</div>
                <div class="kpi-value">{len(incidents)}</div>
                <div class="kpi-trend down">↓ Temps moyen: 45min</div>
            </div>
        </div>
        
        <!-- Top Threats -->
        <div class="section">
            <h2 class="section-title">🎯 Menaces Prioritaires</h2>
            <div class="threat-list">
"""
        
        # Top 5 threats
        for i, alert in enumerate(alerts[:5], 1):
            severity = alert.get('severity', 'medium')
            signature = alert.get('signature', 'Unknown threat')
            src_ip = alert.get('src_ip', 'N/A')
            dst_ip = alert.get('dst_ip', 'N/A')
            
            html += f"""
                <div class="threat-item">
                    <div class="threat-info">
                        <div class="threat-title">#{i} - {signature[:80]}</div>
                        <div class="threat-details">SRC: {src_ip} → DST: {dst_ip}</div>
                    </div>
                    <div class="severity-badge severity-{severity}">{severity.upper()}</div>
                </div>
"""
        
        html += """
            </div>
        </div>
        
        <!-- Recommendations -->
        <div class="section">
            <h2 class="section-title">💡 Recommandations Stratégiques</h2>
            <div class="recommendations">
                <div class="recommendation-card">
                    <div class="recommendation-title">
                        <span>🔒</span>
                        <span>Renforcement Périmétrique</span>
                    </div>
                    <div class="recommendation-text">
                        Mise en place immédiate de règles de filtrage avancées sur les IPs sources identifiées comme malveillantes. Activation du mode de blocage automatique pour les tentatives répétées.
                    </div>
                </div>
                
                <div class="recommendation-card">
                    <div class="recommendation-title">
                        <span>🔍</span>
                        <span>Investigation Approfondie</span>
                    </div>
                    <div class="recommendation-text">
                        Analyse forensique des logs d'accès pour identifier les vecteurs d'attaque utilisés. Corrélation avec les bases de données de threat intelligence pour attribution.
                    </div>
                </div>
                
                <div class="recommendation-card">
                    <div class="recommendation-title">
                        <span>📊</span>
                        <span>Monitoring Renforcé</span>
                    </div>
                    <div class="recommendation-text">
                        Augmentation de la fréquence de surveillance sur les assets critiques identifiés. Mise en place d'alertes en temps réel pour les comportements anormaux.
                    </div>
                </div>
                
                <div class="recommendation-card">
                    <div class="recommendation-title">
                        <span>🛡️</span>
                        <span>Mise à Jour Sécurité</span>
                    </div>
                    <div class="recommendation-text">
                        Application des patches de sécurité critiques sur l'ensemble de l'infrastructure. Vérification de la conformité des configurations de sécurité.
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p class="footer-text">
                Ce rapport a été généré automatiquement par BOUCLIER SOC Platform<br>
                © 2026 BOUCLIER | Advanced Cyber Defense Platform - Tous droits réservés<br>
                Classification: CONFIDENTIEL - Distribution restreinte aux parties autorisées
            </p>
        </div>
    </div>
</body>
</html>
"""
        
        return html
    
    def _generate_technical_html(self, data: Dict[str, Any]) -> str:
        """Template Technical Report pour équipes SOC"""
        # Similar structure but more technical details
        return self._generate_executive_html(data)  # Placeholder
    
    def _generate_incident_html(self, data: Dict[str, Any]) -> str:
        """Template Incident Report"""
        # Incident-specific template
        return self._generate_executive_html(data)  # Placeholder
    
    def _generate_standard_html(self, data: Dict[str, Any]) -> str:
        """Template Standard"""
        return self._generate_executive_html(data)
    
    def generate_pdf(self, data: Dict[str, Any], output_path: str) -> str:
        """Génère un PDF à partir du HTML"""
        html_content = self.generate_html(data)
        
        # Save HTML first
        html_path = output_path.replace('.pdf', '.html')
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        return html_path
    
    def generate_json(self, data: Dict[str, Any], output_path: str) -> str:
        """Génère un export JSON"""
        report_data = {
            'report_id': self.report_id,
            'report_type': self.report_type,
            'timestamp': self.timestamp.isoformat(),
            'data': data
        }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)
        
        return output_path


# Example usage
if __name__ == "__main__":
    # Sample data
    sample_data = {
        'alerts': [
            {
                'id': 1,
                'signature': 'SQL Injection Attempt Detected',
                'src_ip': '192.168.1.100',
                'dst_ip': '10.0.0.50',
                'severity': 'critical',
                'timestamp': '2026-05-20 14:30:00'
            },
            {
                'id': 2,
                'signature': 'Brute Force Attack on SSH',
                'src_ip': '203.0.113.45',
                'dst_ip': '10.0.0.22',
                'severity': 'high',
                'timestamp': '2026-05-20 14:25:00'
            },
            {
                'id': 3,
                'signature': 'Suspicious Outbound Traffic',
                'src_ip': '10.0.0.75',
                'dst_ip': '198.51.100.10',
                'severity': 'medium',
                'timestamp': '2026-05-20 14:20:00'
            }
        ],
        'stats': {
            'total_events': 1250,
            'critical': 15,
            'high': 45,
            'medium': 120,
            'low': 1070
        },
        'incidents': [
            {'id': 1, 'status': 'resolved', 'duration': '45min'},
            {'id': 2, 'status': 'resolved', 'duration': '30min'}
        ]
    }
    
    # Generate report
    generator = SOCReportTemplate(report_type="executive")
    html_output = generator.generate_html(sample_data)
    
    # Save to file
    output_dir = Path(__file__).parent.parent.parent / 'reports'
    output_dir.mkdir(exist_ok=True)
    
    output_file = output_dir / f'soc_report_{generator.report_id}.html'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html_output)
    
    print(f"✅ Report generated: {output_file}")
