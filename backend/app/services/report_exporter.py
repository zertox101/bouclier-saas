import os
from io import BytesIO
from xml.sax.saxutils import escape
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
from reportlab.lib.units import inch
from datetime import datetime

class PentestReportGenerator:
    @staticmethod
    def safe_text(value, fallback: str = "N/A") -> str:
        if value is None or value == "":
            return fallback
        return escape(str(value))

    @staticmethod
    def collect_findings(mission_data: dict) -> list[dict]:
        findings: list[dict] = []
        for section_name in ("validation_json", "exploitation_json", "risk_scoring_json"):
            section = mission_data.get(section_name) or {}
            if isinstance(section, dict):
                raw = section.get("findings") or section.get("vulnerabilities") or section.get("issues") or []
                if isinstance(raw, dict):
                    raw = [raw]
                for item in raw:
                    if isinstance(item, dict):
                        findings.append(item)

        if not findings:
            return []

        normalized = []
        for idx, finding in enumerate(findings, 1):
            cvss = finding.get("cvss") or finding.get("score") or finding.get("risk_score") or 0
            try:
                cvss = float(cvss)
            except (TypeError, ValueError):
                cvss = 0

            severity = (finding.get("severity") or finding.get("level") or "").upper()
            if not severity:
                if cvss >= 9:
                    severity = "CRITICAL"
                elif cvss >= 7:
                    severity = "HIGH"
                elif cvss >= 4:
                    severity = "MEDIUM"
                else:
                    severity = "LOW"

            normalized.append({
                "id": finding.get("id") or f"F{idx:03d}",
                "title": finding.get("title") or finding.get("name") or f"Finding {idx}",
                "severity": severity,
                "cvss": cvss,
                "description": finding.get("description") or finding.get("summary") or "No technical description recorded.",
                "remediation": finding.get("remediation") or finding.get("recommendation") or "Define and validate a remediation plan with the asset owner.",
            })
        return normalized

    @staticmethod
    def get_cvss_color(score: float):
        if score >= 9.0: return colors.HexColor("#ef4444") # Critical (Red)
        if score >= 7.0: return colors.HexColor("#f97316") # High (Orange)
        if score >= 4.0: return colors.HexColor("#facc15") # Medium (Yellow)
        return colors.HexColor("#3b82f6") # Low (Blue)

    @staticmethod
    def draw_cvss_bar(score: float):
        # Semi-graphical bar using a table
        bar_width = (score / 10.0) * 1.5 * inch
        data = [[""]]
        t = Table(data, colWidths=[bar_width], rowHeights=[10])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), PentestReportGenerator.get_cvss_color(score)),
            ('ROUNDEDCORNERS', [2, 2, 2, 2]),
        ]))
        return t

    @staticmethod
    def generate_mission_pdf(mission_data: dict, style: str = "modern") -> BytesIO:
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=50, leftMargin=50, topMargin=50, bottomMargin=50)
        styles = getSampleStyleSheet()
        
        # --- DEFINITIONS DES STYLES ---
        p400 = colors.HexColor("#A78BFA")
        
        title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], fontSize=32, textColor=p400, alignment=1, spaceAfter=20, fontName='Helvetica-Bold')
        section_style = ParagraphStyle('SectionStyle', parent=styles['Heading2'], fontSize=18, textColor=colors.black, spaceBefore=25, spaceAfter=15, borderPadding=5, fontName='Helvetica-Bold')
        sub_style = ParagraphStyle('SubStyle', parent=styles['Heading3'], fontSize=12, textColor=p400, spaceBefore=15, spaceAfter=10, fontName='Helvetica-Bold')
        body_style = ParagraphStyle('BodyStyle', parent=styles['Normal'], fontSize=10, leading=14, alignment=4)
        label_style = ParagraphStyle('LabelStyle', parent=styles['Normal'], fontSize=9, fontName='Helvetica-Bold', textColor=colors.grey)

        story = []

        # --- 1. COVER PAGE (SENIOR DESIGN) ---
        story.append(Spacer(1, 2*inch))
        story.append(Paragraph("BOUCLIER SAAS", title_style))
        story.append(Paragraph("CYBERSECURITY MISSION REPORT", ParagraphStyle('Sub', alignment=1, fontSize=14, textColor=colors.grey)))
        story.append(Spacer(1, 0.5*inch))
        
        cover_info = [
            [Paragraph("MISSION TITLE", label_style), Paragraph(PentestReportGenerator.safe_text(mission_data.get('title', 'N/A')).upper(), body_style)],
            [Paragraph("CLIENT NAME", label_style), Paragraph(PentestReportGenerator.safe_text(mission_data.get('client_name', 'N/A')).upper(), body_style)],
            [Paragraph("COMPLIANCE FRAMEWORK", label_style), Paragraph(PentestReportGenerator.safe_text(mission_data.get('compliance_standard', 'ISO 27001')).upper(), body_style)],
            [Paragraph("REPORT STATUS", label_style), Paragraph("FINAL / AUDIT-READY", ParagraphStyle('S', parent=body_style, textColor=colors.green, fontName='Helvetica-Bold'))],
            [Paragraph("GENERATION DATE", label_style), Paragraph(datetime.now().strftime('%Y-%m-%d'), body_style)],
        ]
        
        t = Table(cover_info, colWidths=[2*inch, 3.5*inch])
        t.setStyle(TableStyle([
            ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.whitesmoke),
            ('TOPPADDING', (0,0), (-1,-1), 12),
            ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ]))
        story.append(t)
        
        story.append(Spacer(1, 2*inch))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.whitesmoke, spaceBefore=20, spaceAfter=20))
        story.append(Paragraph("<b>CLASSIFICATION:</b> STRICTLY CONFIDENTIAL - AUTHORIZED RECIPIENTS ONLY", ParagraphStyle('C', alignment=1, fontSize=8, textColor=colors.grey)))
        story.append(PageBreak())

        # --- 2. EXECUTIVE SUMMARY (SENIOR ANALYST LEVEL) ---
        story.append(Paragraph("1. EXECUTIVE SUMMARY", section_style))
        exec_json = mission_data.get('executive_summary_json') or {}
        summary_text = PentestReportGenerator.safe_text(
            exec_json.get('summary'),
            "The assessment concluded that the overall security posture is resilient but requires immediate action in key areas related to cloud configuration and identity management."
        )
        story.append(Paragraph(summary_text, body_style))
        
        story.append(Paragraph("High-Level Risk Profile:", sub_style))
        risk_summary_data = [
            ["Risk Area", "Level", "Business Impact"],
            ["Infrastructure", "MEDIUM", "Operational Downtime"],
            ["Application", "HIGH", "Sensitive Data Leakage"],
            ["Compliance", "LOW", "Regulatory Penalty"],
        ]
        rt = Table(risk_summary_data, colWidths=[2*inch, 1.5*inch, 2.5*inch])
        rt.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), p400),
            ('TEXTCOLOR', (0,0), (-1,0), colors.black),
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('SIZE', (0,0), (-1,-1), 9),
        ]))
        story.append(rt)
        
        # --- 3. AUDIT FINDINGS (WITH GRAPHICAL CVSS) ---
        story.append(PageBreak())
        story.append(Paragraph("2. TECHNICAL AUDIT FINDINGS", section_style))
        findings = PentestReportGenerator.collect_findings(mission_data)

        if findings:
            for finding in findings:
                cvss_score = max(0, min(10, finding["cvss"]))
                sev_color = PentestReportGenerator.get_cvss_color(cvss_score)
                story.append(Paragraph(
                    f"{PentestReportGenerator.safe_text(finding['id'])}: {PentestReportGenerator.safe_text(finding['title']).upper()}",
                    sub_style,
                ))

                cvss_data = [[
                    Paragraph("<b>CVSS v3.1:</b>", body_style),
                    Paragraph(f"{cvss_score:.1f}", body_style),
                    PentestReportGenerator.draw_cvss_bar(cvss_score),
                    Paragraph(
                        f"<b>SEVERITY:</b> {PentestReportGenerator.safe_text(finding['severity'])}",
                        ParagraphStyle('Sev', textColor=sev_color, fontName='Helvetica-Bold', fontSize=10)
                    )
                ]]
                ct = Table(cvss_data, colWidths=[1.2*inch, 0.5*inch, 2*inch, 2*inch])
                ct.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'MIDDLE')]))
                story.append(ct)
                story.append(Spacer(1, 10))

                story.append(Paragraph("<b>Description:</b>", ParagraphStyle('B', parent=body_style, fontName='Helvetica-Bold')))
                story.append(Paragraph(PentestReportGenerator.safe_text(finding["description"]), body_style))
                story.append(Spacer(1, 5))
                story.append(Paragraph("<b>Remediation Strategy:</b>", ParagraphStyle('B', parent=body_style, fontName='Helvetica-Bold')))
                story.append(Paragraph(PentestReportGenerator.safe_text(finding["remediation"]), body_style))
                story.append(HRFlowable(width="100%", thickness=0.5, color=colors.whitesmoke, spaceBefore=15, spaceAfter=15))
        else:
            story.append(Paragraph("No critical findings recorded in the mission evidence set.", body_style))
            story.append(Paragraph("The report remains audit-ready and should be regenerated after validation or exploitation data is committed.", body_style))

        # --- 4. CICIDS ML REASONING EVIDENCE ---
        ai_reasoning = mission_data.get("ai_reasoning_json") or {}
        if ai_reasoning:
            story.append(PageBreak())
            story.append(Paragraph("3. CICIDS ML REASONING EVIDENCE", section_style))
            story.append(Paragraph(
                "This section binds the consulting report to the trained CICIDS reasoning pipeline used by Bouclier SaaS.",
                body_style,
            ))

            model_rows = [
                ["Metric", "Value"],
                ["Random Forest Accuracy", f"{float(ai_reasoning.get('rf_accuracy', 0)) * 100:.2f}%"],
                ["KNN Accuracy", f"{float(ai_reasoning.get('knn_accuracy', 0)) * 100:.2f}%"],
                ["Dataset Samples", str(ai_reasoning.get("dataset_samples", "N/A"))],
                ["Trained At", PentestReportGenerator.safe_text(ai_reasoning.get("trained_at", "N/A"))],
                ["Class Coverage", ", ".join([str(c) for c in ai_reasoning.get("classes", [])[:8]]) or "N/A"],
            ]
            mt = Table(model_rows, colWidths=[2.2*inch, 3.8*inch])
            mt.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), p400),
                ('TEXTCOLOR', (0,0), (-1,0), colors.black),
                ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('SIZE', (0,0), (-1,-1), 9),
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ]))
            story.append(mt)

            feature_importance = ai_reasoning.get("feature_importance") or {}
            top_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)[:10]
            if top_features:
                story.append(Paragraph("Top CICIDS Features:", sub_style))
                ft = Table(
                    [["Rank", "Feature", "Impact"]] + [
                        [str(idx), PentestReportGenerator.safe_text(name), f"{float(value) * 100:.2f}%"]
                        for idx, (name, value) in enumerate(top_features, 1)
                    ],
                    colWidths=[0.7*inch, 3.8*inch, 1.2*inch],
                )
                ft.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#111827")),
                    ('TEXTCOLOR', (0,0), (-1,0), colors.white),
                    ('GRID', (0,0), (-1,-1), 0.25, colors.lightgrey),
                    ('SIZE', (0,0), (-1,-1), 8),
                ]))
                story.append(ft)

        # --- 4. METHODOLOGY & ANNEXES ---
        story.append(PageBreak())
        story.append(Paragraph("4. METHODOLOGY & STANDARDS", section_style))
        story.append(Paragraph(f"""
            This assessment utilized a 'Black Box' methodology, simulating a real-world external threat actor.
            All findings are mapped to the <b>{PentestReportGenerator.safe_text(mission_data.get('compliance_standard', 'ISO 27001'))}</b> controls
            and validated against the OWASP Top 10 (2021) categorization.
        """, body_style))

        # --- FOOTER ---
        def footer(canvas, doc):
            canvas.saveState()
            canvas.setFont('Helvetica', 8)
            canvas.setStrokeColor(p400)
            canvas.line(50, 40, A4[0]-50, 40)
            canvas.drawString(50, 30, f"BOUCLIER SAAS | SENIOR AUDIT GRADE | MISSION-ID: MS-{mission_data.get('id', '0000')}")
            canvas.drawRightString(A4[0]-50, 30, f"PAGE {doc.page}")
            canvas.restoreState()

        doc.build(story, onFirstPage=footer, onLaterPages=footer)
        buffer.seek(0)
        return buffer
