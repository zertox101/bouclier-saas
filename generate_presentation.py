#!/usr/bin/env python3
"""
Bouclier SaaS — Présentation Générique PDF
Génère une présentation professionnelle du projet avec schémas architecturaux.
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import (
    HexColor, white, black, Color,
    red, green, blue, orange, purple, cyan, yellow
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, Image, KeepTogether, HRFlowable
)
from reportlab.graphics.shapes import (
    Drawing, Rect, Circle, Line, String, Group, Polygon, Ellipse, Wedge
)
from reportlab.graphics import renderPDF
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics.charts.piecharts import Pie
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import math
import os

# ─── COLORS ───────────────────────────────────────────────────────────────────
DARK_BG       = HexColor("#0a0e1a")
CARD_BG       = HexColor("#111827")
ACCENT_CYAN   = HexColor("#06b6d4")
ACCENT_BLUE   = HexColor("#3b82f6")
ACCENT_PURPLE = HexColor("#8b5cf6")
ACCENT_GREEN  = HexColor("#10b981")
ACCENT_RED    = HexColor("#ef4444")
ACCENT_ORANGE = HexColor("#f59e0b")
ACCENT_PINK   = HexColor("#ec4899")
TEXT_WHITE     = HexColor("#f1f5f9")
TEXT_GRAY      = HexColor("#94a3b8")
BORDER_GRAY    = HexColor("#1e293b")
GRADIENT_START = HexColor("#0f172a")
GRADIENT_END   = HexColor("#1e1b4b")

# ─── STYLES ───────────────────────────────────────────────────────────────────
styles = getSampleStyleSheet()

style_title = ParagraphStyle(
    'BouclierTitle', parent=styles['Title'],
    fontSize=42, leading=50, textColor=TEXT_WHITE,
    alignment=TA_CENTER, spaceAfter=20,
    fontName='Helvetica-Bold'
)

style_subtitle = ParagraphStyle(
    'BouclierSubtitle', parent=styles['Normal'],
    fontSize=16, leading=22, textColor=ACCENT_CYAN,
    alignment=TA_CENTER, spaceAfter=10,
    fontName='Helvetica'
)

style_h1 = ParagraphStyle(
    'BouclierH1', parent=styles['Heading1'],
    fontSize=28, leading=34, textColor=TEXT_WHITE,
    alignment=TA_LEFT, spaceAfter=15, spaceBefore=20,
    fontName='Helvetica-Bold'
)

style_h2 = ParagraphStyle(
    'BouclierH2', parent=styles['Heading2'],
    fontSize=20, leading=26, textColor=ACCENT_CYAN,
    alignment=TA_LEFT, spaceAfter=10, spaceBefore=10,
    fontName='Helvetica-Bold'
)

style_h3 = ParagraphStyle(
    'BouclierH3', parent=styles['Heading3'],
    fontSize=14, leading=18, textColor=ACCENT_BLUE,
    alignment=TA_LEFT, spaceAfter=8, spaceBefore=5,
    fontName='Helvetica-Bold'
)

style_body = ParagraphStyle(
    'BouclierBody', parent=styles['Normal'],
    fontSize=11, leading=16, textColor=TEXT_GRAY,
    alignment=TA_JUSTIFY, spaceAfter=8,
    fontName='Helvetica'
)

style_body_white = ParagraphStyle(
    'BouclierBodyWhite', parent=styles['Normal'],
    fontSize=11, leading=16, textColor=TEXT_WHITE,
    alignment=TA_JUSTIFY, spaceAfter=8,
    fontName='Helvetica'
)

style_bullet = ParagraphStyle(
    'BouclierBullet', parent=styles['Normal'],
    fontSize=10, leading=14, textColor=TEXT_GRAY,
    alignment=TA_LEFT, spaceAfter=4, leftIndent=20,
    bulletIndent=8, fontName='Helvetica',
    bulletFontName='Helvetica', bulletFontSize=10
)

style_small = ParagraphStyle(
    'BouclierSmall', parent=styles['Normal'],
    fontSize=9, leading=12, textColor=TEXT_GRAY,
    alignment=TA_LEFT, spaceAfter=4,
    fontName='Helvetica'
)

style_footer = ParagraphStyle(
    'BouclierFooter', parent=styles['Normal'],
    fontSize=8, leading=10, textColor=TEXT_GRAY,
    alignment=TA_CENTER,
    fontName='Helvetica'
)

style_stat_num = ParagraphStyle(
    'StatNum', parent=styles['Normal'],
    fontSize=36, leading=40, textColor=ACCENT_CYAN,
    alignment=TA_CENTER, fontName='Helvetica-Bold'
)

style_stat_label = ParagraphStyle(
    'StatLabel', parent=styles['Normal'],
    fontSize=10, leading=13, textColor=TEXT_GRAY,
    alignment=TA_CENTER, fontName='Helvetica'
)


# ─── PAGE BACKGROUND ──────────────────────────────────────────────────────────
def draw_bg(canvas_obj, doc):
    """Draw dark gradient background on every page."""
    w, h = A4
    canvas_obj.saveState()
    # Gradient background
    steps = 50
    for i in range(steps):
        ratio = i / steps
        r = 0.039 + ratio * (0.118 - 0.039)
        g = 0.055 + ratio * (0.106 - 0.055)
        b = 0.102 + ratio * (0.294 - 0.102)
        y = h - (h * i / steps)
        canvas_obj.setFillColorRGB(r, g, b)
        canvas_obj.rect(0, y - h / steps, w, h / steps + 1, fill=1, stroke=0)
    # Top accent line
    canvas_obj.setStrokeColor(ACCENT_CYAN)
    canvas_obj.setLineWidth(2)
    canvas_obj.line(30, h - 25, w - 30, h - 25)
    # Footer
    canvas_obj.setFont("Helvetica", 7)
    canvas_obj.setFillColor(TEXT_GRAY)
    canvas_obj.drawCentredString(w / 2, 15, f"Bouclier SaaS — Présentation Technique — Page {doc.page}")
    canvas_obj.restoreState()


def draw_cover_bg(canvas_obj, doc):
    """Special cover page background."""
    w, h = A4
    canvas_obj.saveState()
    # Dark gradient
    steps = 60
    for i in range(steps):
        ratio = i / steps
        r = 0.039 + ratio * 0.08
        g = 0.055 + ratio * 0.05
        b = 0.102 + ratio * 0.20
        y = h - (h * i / steps)
        canvas_obj.setFillColorRGB(r, g, b)
        canvas_obj.rect(0, y - h / steps, w, h / steps + 1, fill=1, stroke=0)
    # Large cyan accent circle
    canvas_obj.setFillColor(Color(0.024, 0.714, 0.831, alpha=0.08))
    canvas_obj.circle(w / 2, h / 2 + 60, 200, fill=1, stroke=0)
    canvas_obj.setFillColor(Color(0.024, 0.714, 0.831, alpha=0.04))
    canvas_obj.circle(w / 2, h / 2 + 60, 300, fill=1, stroke=0)
    # Shield icon
    draw_shield(canvas_obj, w / 2, h / 2 + 80, 60)
    canvas_obj.restoreState()


def draw_shield(c, cx, cy, size):
    """Draw a shield icon."""
    c.saveState()
    c.setFillColor(ACCENT_CYAN)
    c.setStrokeColor(white)
    c.setLineWidth(2)
    # Shield path
    p = c.beginPath()
    p.moveTo(cx, cy + size)
    p.lineTo(cx + size * 0.7, cy + size * 0.6)
    p.lineTo(cx + size * 0.7, cy - size * 0.1)
    p.lineTo(cx, cy - size * 0.7)
    p.lineTo(cx - size * 0.7, cy - size * 0.1)
    p.lineTo(cx - size * 0.7, cy + size * 0.6)
    p.close()
    c.drawPath(p, fill=1, stroke=1)
    # Inner checkmark
    c.setStrokeColor(white)
    c.setLineWidth(3)
    c.line(cx - 15, cy, cx - 3, cy - 18)
    c.line(cx - 3, cy - 18, cx + 20, cy + 15)
    c.restoreState()


# ─── HELPER: Card ─────────────────────────────────────────────────────────────
def make_card(content_paragraphs, accent_color=ACCENT_CYAN, width=480):
    """Create a styled card with accent left border."""
    inner = []
    for p in content_paragraphs:
        inner.append(p)
    t = Table([[inner]], colWidths=[width - 20])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), CARD_BG),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_GRAY),
        ('LEFTPADDING', (0, 0), (-1, -1), 15),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LINEBEFOREDECOR', (0, 0), (0, -1), 3, accent_color),
    ]))
    return t


def make_stat_card(number, label, color=ACCENT_CYAN):
    """Create a stat card."""
    num_p = Paragraph(f'<font color="{color.hexval()}" size="32"><b>{number}</b></font>', style_stat_num)
    lbl_p = Paragraph(f'<font color="#94a3b8" size="9">{label}</font>', style_stat_label)
    t = Table([[num_p], [lbl_p]], colWidths=[110])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), CARD_BG),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_GRAY),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    return t


# ─── ARCHITECTURE DIAGRAM ────────────────────────────────────────────────────
def create_architecture_diagram():
    """Create the main architecture diagram."""
    d = Drawing(500, 320)

    # Background
    d.add(Rect(0, 0, 500, 320, fillColor=HexColor("#0f172a"), strokeColor=None))

    # Title
    d.add(String(250, 300, "ARCHITECTURE BOUCLIER SAAS", fontSize=12,
                 fillColor=ACCENT_CYAN, textAnchor='middle', fontName='Helvetica-Bold'))

    # --- User / Browser ---
    d.add(Rect(200, 255, 100, 35, fillColor=ACCENT_PURPLE, strokeColor=white, strokeWidth=0.5, rx=6))
    d.add(String(250, 268, "USER/BROWSER", fontSize=8, fillColor=white, textAnchor='middle', fontName='Helvetica-Bold'))

    # Arrow down
    d.add(Line(250, 255, 250, 235, strokeColor=ACCENT_CYAN, strokeWidth=1.5))
    d.add(String(270, 242, "HTTPS :80", fontSize=7, fillColor=TEXT_GRAY))

    # --- Gateway ---
    d.add(Rect(175, 195, 150, 35, fillColor=ACCENT_BLUE, strokeColor=white, strokeWidth=0.5, rx=6))
    d.add(String(250, 208, "GATEWAY (Nginx)", fontSize=8, fillColor=white, textAnchor='middle', fontName='Helvetica-Bold'))

    # Arrows from gateway
    # To Frontend
    d.add(Line(175, 212, 100, 165, strokeColor=ACCENT_GREEN, strokeWidth=1))
    d.add(Rect(30, 135, 140, 30, fillColor=ACCENT_GREEN, strokeColor=white, strokeWidth=0.5, rx=5))
    d.add(String(100, 148, "FRONTEND :3002", fontSize=7, fillColor=white, textAnchor='middle', fontName='Helvetica-Bold'))
    d.add(String(55, 127, "Next.js 118 pages", fontSize=6, fillColor=TEXT_GRAY, textAnchor='middle'))

    # To Backend
    d.add(Line(250, 195, 250, 165, strokeColor=ACCENT_CYAN, strokeWidth=1))
    d.add(Rect(185, 135, 130, 30, fillColor=ACCENT_CYAN, strokeColor=white, strokeWidth=0.5, rx=5))
    d.add(String(250, 148, "BACKEND :8005", fontSize=7, fillColor=white, textAnchor='middle', fontName='Helvetica-Bold'))
    d.add(String(250, 127, "FastAPI + WebSocket", fontSize=6, fillColor=TEXT_GRAY, textAnchor='middle'))

    # To Tools-API
    d.add(Line(325, 212, 400, 165, strokeColor=ACCENT_ORANGE, strokeWidth=1))
    d.add(Rect(340, 135, 130, 30, fillColor=ACCENT_ORANGE, strokeColor=white, strokeWidth=0.5, rx=5))
    d.add(String(405, 148, "TOOLS-API :8100", fontSize=7, fillColor=white, textAnchor='middle', fontName='Helvetica-Bold'))
    d.add(String(405, 127, "Kali Linux 104 tools", fontSize=6, fillColor=TEXT_GRAY, textAnchor='middle'))

    # --- Backend connections ---
    # To Postgres
    d.add(Line(215, 135, 120, 85, strokeColor=ACCENT_BLUE, strokeWidth=1))
    d.add(Rect(55, 55, 130, 30, fillColor=HexColor("#1e40af"), strokeColor=white, strokeWidth=0.5, rx=5))
    d.add(String(120, 68, "POSTGRES :5433", fontSize=7, fillColor=white, textAnchor='middle', fontName='Helvetica-Bold'))

    # To Redis
    d.add(Line(285, 135, 380, 85, strokeColor=ACCENT_RED, strokeWidth=1))
    d.add(Rect(320, 55, 120, 30, fillColor=ACCENT_RED, strokeColor=white, strokeWidth=0.5, rx=5))
    d.add(String(380, 68, "REDIS :6380", fontSize=7, fillColor=white, textAnchor='middle', fontName='Helvetica-Bold'))

    # To Ollama AI
    d.add(Line(250, 135, 250, 85, strokeColor=ACCENT_PURPLE, strokeWidth=1))
    d.add(Rect(185, 55, 130, 30, fillColor=ACCENT_PURPLE, strokeColor=white, strokeWidth=0.5, rx=5))
    d.add(String(250, 68, "OLLAMA AI :11434", fontSize=7, fillColor=white, textAnchor='middle', fontName='Helvetica-Bold'))

    # ZAP Scanner
    d.add(Line(405, 135, 450, 85, strokeColor=ACCENT_PINK, strokeWidth=1))
    d.add(Rect(410, 55, 80, 30, fillColor=ACCENT_PINK, strokeColor=white, strokeWidth=0.5, rx=5))
    d.add(String(450, 68, "ZAP :8082", fontSize=7, fillColor=white, textAnchor='middle', fontName='Helvetica-Bold'))

    # Kali Attacker
    d.add(Line(100, 135, 50, 85, strokeColor=ACCENT_RED, strokeWidth=1))
    d.add(Rect(10, 55, 80, 30, fillColor=HexColor("#991b1b"), strokeColor=white, strokeWidth=0.5, rx=5))
    d.add(String(50, 68, "KALI", fontSize=7, fillColor=white, textAnchor='middle', fontName='Helvetica-Bold'))

    # Network labels
    d.add(String(250, 20, "6 Networks: bouclier-net | public-net | core-net | offensive-net | ai-net | academy-net",
                 fontSize=6, fillColor=TEXT_GRAY, textAnchor='middle'))

    return d


# ─── SERVICES DIAGRAM ────────────────────────────────────────────────────────
def create_services_grid():
    """Create a visual grid of all services."""
    d = Drawing(500, 280)
    d.add(Rect(0, 0, 500, 280, fillColor=HexColor("#0f172a"), strokeColor=None))
    d.add(String(250, 262, "10 SERVICES DOCKER", fontSize=11,
                 fillColor=ACCENT_CYAN, textAnchor='middle', fontName='Helvetica-Bold'))

    services = [
        ("Gateway", "Nginx Reverse Proxy", ":80", ACCENT_BLUE, 0),
        ("Frontend", "Next.js Dashboard", ":3002", ACCENT_GREEN, 1),
        ("Backend", "FastAPI Core", ":8005", ACCENT_CYAN, 2),
        ("Tools-API", "Kali Arsenal", ":8100", ACCENT_ORANGE, 3),
        ("PostgreSQL", "Database", ":5433", HexColor("#1e40af"), 4),
        ("Redis", "Cache & Streams", ":6380", ACCENT_RED, 5),
        ("Ollama", "Local AI (Llama)", ":11434", ACCENT_PURPLE, 6),
        ("ZAP", "Web Scanner", ":8082", ACCENT_PINK, 7),
        ("Kali", "Threat Simulation", "—", HexColor("#991b1b"), 8),
        ("RAPTOR", "AI Research", "—", ACCENT_ORANGE, 9),
    ]

    cols = 5
    cell_w = 90
    cell_h = 65
    start_x = 25
    start_y = 225

    for name, desc, port, color, idx in services:
        col = idx % cols
        row = idx // cols
        x = start_x + col * (cell_w + 8)
        y = start_y - row * (cell_h + 10)

        d.add(Rect(x, y - cell_h + 10, cell_w, cell_h,
                    fillColor=CARD_BG, strokeColor=color, strokeWidth=1, rx=4))
        # Color top bar
        d.add(Rect(x, y - 5, cell_w, 5, fillColor=color, strokeColor=None))
        # Name
        d.add(String(x + cell_w / 2, y - 20, name, fontSize=8,
                     fillColor=white, textAnchor='middle', fontName='Helvetica-Bold'))
        # Desc
        d.add(String(x + cell_w / 2, y - 32, desc, fontSize=6,
                     fillColor=TEXT_GRAY, textAnchor='middle'))
        # Port
        d.add(String(x + cell_w / 2, y - 45, port, fontSize=7,
                     fillColor=color, textAnchor='middle', fontName='Helvetica-Bold'))

    return d


# ─── FRONTEND PAGES DIAGRAM ──────────────────────────────────────────────────
def create_frontend_diagram():
    """Create frontend modules overview."""
    d = Drawing(500, 300)
    d.add(Rect(0, 0, 500, 300, fillColor=HexColor("#0f172a"), strokeColor=None))
    d.add(String(250, 280, "FRONTEND — 118 PAGES / MODULES", fontSize=11,
                 fillColor=ACCENT_GREEN, textAnchor='middle', fontName='Helvetica-Bold'))

    categories = [
        ("SECURITY OPERATIONS", ACCENT_RED, [
            "Threat Monitor", "Incidents", "Alerts", "Cases",
            "SOC Dashboard", "Hunting", "Playbooks", "Threat Intel"
        ]),
        ("OFFENSIVE TOOLS", ACCENT_ORANGE, [
            "Neural Pentest", "RAPTOR AI", "WSTG Scanner", "Red Team",
            "Purple Team", "AI Pentester", "Arsenal", "Scanner"
        ]),
        ("INTELLIGENCE", ACCENT_PURPLE, [
            "Mythos AI", "OSINT", "Network Intel", "Globe",
            "MITRE ATT&CK", "Threat Map", "Attack Path", "AI Agent"
        ]),
        ("COMPLIANCE & GRC", ACCENT_BLUE, [
            "GRC", "Evidence", "Audit Report", "Compliance",
            "Governance", "Documents", "Settings", "Assets"
        ]),
    ]

    start_y = 250
    col_w = 120

    for cat_idx, (cat_name, color, items) in enumerate(categories):
        x = 15 + cat_idx * (col_w + 5)
        y = start_y

        # Category header
        d.add(Rect(x, y - 20, col_w, 22, fillColor=color, strokeColor=None, rx=3))
        d.add(String(x + col_w / 2, y - 14, cat_name, fontSize=6,
                     fillColor=white, textAnchor='middle', fontName='Helvetica-Bold'))

        # Items
        for i, item in enumerate(items):
            iy = y - 35 - i * 28
            d.add(Rect(x + 5, iy - 20, col_w - 10, 24, fillColor=CARD_BG, strokeColor=BORDER_GRAY, strokeWidth=0.5, rx=3))
            d.add(String(x + col_w / 2, iy - 12, item, fontSize=7,
                         fillColor=TEXT_WHITE, textAnchor='middle'))

    return d


# ─── FLOW DIAGRAM ────────────────────────────────────────────────────────────
def create_flow_diagram():
    """Create the offensive flow diagram."""
    d = Drawing(500, 200)
    d.add(Rect(0, 0, 500, 200, fillColor=HexColor("#0f172a"), strokeColor=None))
    d.add(String(250, 180, "OFFENSIVE WORKFLOW — FULL PENTEST PIPELINE", fontSize=10,
                 fillColor=ACCENT_RED, textAnchor='middle', fontName='Helvetica-Bold'))

    steps = [
        ("1. RECON", "Nmap, Masscan\nOSINT, DNS", ACCENT_BLUE),
        ("2. SCAN", "Nuclei, Nikto\nWSTG, ZAP", ACCENT_CYAN),
        ("3. EXPLOIT", "SQLMap, Hydra\nRAPTOR AI", ACCENT_RED),
        ("4. ANALYZE", "Mythos AI\nKill Chain", ACCENT_PURPLE),
        ("5. REPORT", "PDF Report\nRemediation", ACCENT_GREEN),
    ]

    box_w = 80
    box_h = 55
    start_x = 20
    y = 95

    for i, (title, desc, color) in enumerate(steps):
        x = start_x + i * (box_w + 15)
        # Box
        d.add(Rect(x, y - box_h, box_w, box_h, fillColor=CARD_BG, strokeColor=color, strokeWidth=1.5, rx=5))
        # Top accent
        d.add(Rect(x, y - 3, box_w, 3, fillColor=color, strokeColor=None))
        # Title
        d.add(String(x + box_w / 2, y - 18, title, fontSize=7,
                     fillColor=color, textAnchor='middle', fontName='Helvetica-Bold'))
        # Desc lines
        lines = desc.split('\n')
        for li, line in enumerate(lines):
            d.add(String(x + box_w / 2, y - 32 - li * 11, line, fontSize=6,
                         fillColor=TEXT_GRAY, textAnchor='middle'))

        # Arrow to next
        if i < len(steps) - 1:
            ax = x + box_w + 2
            d.add(Line(ax, y - box_h / 2, ax + 11, y - box_h / 2,
                       strokeColor=ACCENT_CYAN, strokeWidth=1.5))
            # Arrowhead
            d.add(Polygon([ax + 11, y - box_h / 2, ax + 7, y - box_h / 2 - 3, ax + 7, y - box_h / 2 + 3],
                          fillColor=ACCENT_CYAN, strokeColor=None))

    # Bottom note
    d.add(String(250, 30, "Pipeline automatisé : chaque phase alimente la suivante via WebSocket temps réel",
                 fontSize=7, fillColor=TEXT_GRAY, textAnchor='middle'))

    return d


# ─── BUILD PDF ────────────────────────────────────────────────────────────────
def build_presentation():
    output_path = os.path.join(os.path.dirname(__file__), "Bouclier_SaaS_Presentation.pdf")

    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=30, rightMargin=30,
        topMargin=40, bottomMargin=40
    )

    story = []
    w = A4[0] - 60  # usable width

    # ═══════════════════════════════════════════════════════════════════════════
    # PAGE 1 — COVER
    # ═══════════════════════════════════════════════════════════════════════════
    story.append(Spacer(1, 80))
    story.append(Paragraph("BOUCLIER", style_title))
    story.append(Paragraph("SAAS", ParagraphStyle('BigTitle', parent=style_title, fontSize=56, textColor=ACCENT_CYAN)))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="40%", thickness=2, color=ACCENT_CYAN, spaceAfter=15))
    story.append(Paragraph("Plateforme Intégrée de Cybersécurité Offensive & Defensive", style_subtitle))
    story.append(Spacer(1, 8))
    story.append(Paragraph("118 modules  |  104 outils  |  10 services  |  6 réseaux", ParagraphStyle(
        'StatsLine', parent=style_body, fontSize=12, textColor=TEXT_GRAY, alignment=TA_CENTER)))
    story.append(Spacer(1, 40))

    # Stats row
    stat_data = [[
        make_stat_card("118", "Pages Frontend", ACCENT_GREEN),
        make_stat_card("104", "Outils Kali", ACCENT_ORANGE),
        make_stat_card("10", "Services Docker", ACCENT_CYAN),
        make_stat_card("53", "Tests Intégration", ACCENT_PURPLE),
    ]]
    stat_table = Table(stat_data, colWidths=[125, 125, 125, 125])
    stat_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(stat_table)
    story.append(Spacer(1, 60))
    story.append(Paragraph("Présentation Technique — Juin 2026", ParagraphStyle(
        'DateLine', parent=style_body, fontSize=11, textColor=ACCENT_CYAN, alignment=TA_CENTER)))
    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════════
    # PAGE 2 — ARCHITECTURE GLOBALE
    # ═══════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("1. Architecture Globale", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT_CYAN, spaceAfter=15))
    story.append(Paragraph(
        "Bouclier SaaS est une plateforme cloud-native de cybersécurité construite sur une "
        "architecture microservices. Chaque service est conteneurisé via Docker et communiquera "
        "via des réseaux isolés pour une sécurité optimale.",
        style_body
    ))
    story.append(Spacer(1, 10))
    story.append(create_architecture_diagram())
    story.append(Spacer(1, 15))
    story.append(Paragraph(
        "<b>Principe :</b> Le Gateway Nginx route le trafic vers le Frontend (Next.js), le Backend (FastAPI) "
        "et l'API Tools (Kali). Le Backend orchestre les analyses via WebSocket temps réel et interagit "
        "avec la base PostgreSQL, le cache Redis, et le moteur IA local Ollama.",
        style_body
    ))
    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════════
    # PAGE 3 — 10 SERVICES
    # ═══════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("2. Les 10 Services Docker", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT_CYAN, spaceAfter=15))
    story.append(create_services_grid())
    story.append(Spacer(1, 15))

    services_detail = [
        ("Gateway (Nginx)", ACCENT_BLUE,
         "Reverse proxy avec SSL termination, rate limiting, et health checks. "
         "Route le trafic vers Frontend, Backend et Tools-API. Sécurisé : read-only, "
         "cap_drop ALL, 256MB max."),
        ("Frontend (Next.js)", ACCENT_GREEN,
         "Dashboard React avec 118 pages de production. Interfaces : SOC, Offensive, "
         "Intelligence, GRC, Admin. Build Docker sans volume mount. WebSocket temps réel "
         "pour les scans live."),
        ("Backend (FastAPI)", ACCENT_CYAN,
         "API REST + WebSocket. 52 routes : auth, scans, incidents, threats, AI, OSINT, "
         "forensics, compliance. Intégration LLM (Llama 3.1 70B via NVIDIA). "
         "Kill Chain Cyber en 5 phases."),
        ("Tools-API (Kali)", ACCENT_ORANGE,
         "104 outils de pentest sur Kali Linux : Nmap, Masscan, Nuclei, SQLMap, Hydra, "
         "Metasploit, RAPTOR AI, WSTG-Scan, Flipper Zero. Exécution async avec jobs "
         "et streaming logs."),
    ]
    for name, color, desc in services_detail:
        story.append(make_card([
            Paragraph(f'<font color="{color.hexval()}" size="12"><b>{name}</b></font>', style_h3),
            Paragraph(desc, style_body)
        ], color))
        story.append(Spacer(1, 6))

    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════════
    # PAGE 4 — INFRA & DATA
    # ═══════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("3. Infrastructure & Données", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT_CYAN, spaceAfter=15))

    infra_services = [
        ("PostgreSQL 15", HexColor("#1e40af"),
         "Base de données principale. Engagements, findings, alertes, incidents. "
         "GeoIP lookup pour enrichment des IPs. 2 bases : principale + telemetry externe."),
        ("Redis 7", ACCENT_RED,
         "Cache distribué et streaming Pub/Sub. Gestion des sessions, rate limiting, "
         "et file d'attente pour les scans asynchrones. Port 6380."),
        ("Ollama AI", ACCENT_PURPLE,
         "Moteur d'IA local pour l'analyse de menaces. Llama 3.1 70B via NVIDIA API. "
         "Utilisé par Mythos AI pour le Kill Chain Analysis et la génération de rapports."),
        ("OWASP ZAP", ACCENT_PINK,
         "Scanner de vulnérabilités web automatisé. Intégré aux modules WSTG Scanner "
         "et Offensive Consultant pour les tests DAST."),
        ("Kali Attacker", HexColor("#991b1b"),
         "Container de simulation d'attaques Purple Team. Scans périodiques toutes les 60s "
         "vers le backend pour enrichir les données de détection."),
    ]
    for name, color, desc in infra_services:
        story.append(make_card([
            Paragraph(f'<font color="{color.hexval()}" size="12"><b>{name}</b></font>', style_h3),
            Paragraph(desc, style_body)
        ], color))
        story.append(Spacer(1, 5))

    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════════
    # PAGE 5 — OFFENSIVE WORKFLOW
    # ═══════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("4. Pipeline Offensif Complet", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT_RED, spaceAfter=15))
    story.append(create_flow_diagram())
    story.append(Spacer(1, 15))

    story.append(Paragraph("Module Neural Pentest Suite", style_h2))
    story.append(Paragraph(
        "Centre de commandement principal pour les opérations de pentest. Intègre :",
        style_body
    ))
    neural_features = [
        "MITRE ATT&CK Heatmap — visualisation des tactiques et techniques couvertes",
        "Kill Chain en 7 phases — event-driven avec avancement en temps réel",
        "Circular Gauges — Bypass Rate, Compute Score, Velocity Index",
        "Scan Results Table — triable avec PoC et remediation par finding",
        "Live Attack Stream — logs d'attaque en direct via WebSocket",
        "Sélecteur Nmap/Masscan — choix du scanner avec paramètres custom",
        "Export JSON/TXT — rapport complet du scan",
    ]
    for feat in neural_features:
        story.append(Paragraph(f"<bullet>&bull;</bullet> {feat}", style_bullet))

    story.append(Spacer(1, 10))
    story.append(Paragraph("Module RAPTOR AI", style_h2))
    story.append(Paragraph(
        "Recursive Autonomous Penetration Testing and Observation Robot. "
        "Framework d'autonomie de recherche de sécurité :",
        style_body
    ))
    raptor_modes = [
        "<b>Scan</b> — Analyse Semgrep + CodeQL, détection de vulnérabilités dans le code",
        "<b>Agentic</b> — Pipeline complet autonome : scan → exploit → patch",
        "<b>SCA</b> — Analyse de dépendances et chaîne d'approvisionnement",
        "<b>Understand</b> — Cartographie de la surface d'attaque",
        "<b>Validate</b> — Validation d'exploitabilité avec PoC généré",
    ]
    for mode in raptor_modes:
        story.append(Paragraph(f"<bullet>&bull;</bullet> {mode}", style_bullet))

    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════════
    # PAGE 6 — WSTG SCANNER & OWASP
    # ═══════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("5. OWASP WSTG Scanner", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT_ORANGE, spaceAfter=15))
    story.append(Paragraph(
        "Scanner de sécurité web basé sur les standards OWASP Web Security Testing Guide. "
        "13 modules d'analyse avec détection automatique des vulnérabilités.",
        style_body
    ))
    story.append(Spacer(1, 10))

    wstg_modules = [
        ("Information Gathering", "Nmap, Nuclei, FFUF vhost/dir busting, Spidering"),
        ("Configuration Management", "Server headers, TLS config, CORS, CSP"),
        ("Authentication Testing", "Brute force, session management, JWT analysis"),
        ("Authorization Testing", "IDOR, privilege escalation, access control"),
        ("Session Management", "Cookie security, CSRF, token analysis"),
        ("Input Validation", "SQLi, XSS, SSRF, SSTI, XXE — détection auto"),
        ("Error Handling", "Error messages, stack traces, information disclosure"),
        ("Cryptography", "TLS version, cipher suites, certificate validation"),
        ("Business Logic", "Workflow bypass, data manipulation testing"),
        ("Client-Side Testing", "DOM XSS, clickjacking, postMessage analysis"),
        ("API Testing", "REST/GraphQL endpoint enumeration et fuzzing"),
        ("WordPress Scan", "WPScan intégré — thèmes, plugins, credentials"),
        ("Active Directory", "LDAP injection, AS-REP roasting, Kerberoasting"),
    ]

    mod_data = []
    for i, (mod, desc) in enumerate(wstg_modules):
        mod_data.append([
            Paragraph(f'<font color="#06b6d4"><b>{i+1}.</b></font> {mod}', style_small),
            Paragraph(desc, style_small)
        ])

    mod_table = Table(mod_data, colWidths=[160, 320])
    mod_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), CARD_BG),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_GRAY),
        ('LINEBELOW', (0, 0), (-1, -2), 0.5, BORDER_GRAY),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(mod_table)
    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════════
    # PAGE 7 — FRONTEND MODULES
    # ═══════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("6. Frontend — 118 Modules", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT_GREEN, spaceAfter=15))
    story.append(create_frontend_diagram())
    story.append(Spacer(1, 15))

    story.append(Paragraph("Principaux Domaines Fonctionnels", style_h2))

    domains = [
        ("Security Operations Center (SOC)", ACCENT_RED,
         "Dashboard temps réel, gestion des alertes, incidents, cas d'investigation, "
         "threat hunting, playbooks automatisés, threat intelligence feeds."),
        ("Offensive Security", ACCENT_ORANGE,
         "Neural Pentest Suite, RAPTOR AI, WSTG Scanner, Red Team ops, "
         "Purple Team exercises, AI Pentester autonome, Arsenal 104 outils."),
        ("Intelligence & Recon", ACCENT_PURPLE,
         "Mythos AI (Kill Chain), OSINT multi-sources, Network Intelligence, "
         "Globe visualization, MITRE ATT&CK mapping, Threat Map mondial."),
        ("GRC & Compliance", ACCENT_BLUE,
         "Framework GRC complet, gestion des preuves (evidence), rapports d'audit, "
         "conformité réglementaire, gouvernance, gestion des actifs."),
    ]
    for name, color, desc in domains:
        story.append(make_card([
            Paragraph(f'<font color="{color.hexval()}" size="11"><b>{name}</b></font>', style_h3),
            Paragraph(desc, style_body)
        ], color))
        story.append(Spacer(1, 5))

    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════════
    # PAGE 8 — WEBSOCKET & REAL-TIME
    # ═══════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("7. Temps Réel & WebSocket", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT_CYAN, spaceAfter=15))
    story.append(Paragraph(
        "Toute la communication de scan est en temps réel via WebSocket. "
        "Le frontend reçoit les logs, progressions et résultats en direct.",
        style_body
    ))
    story.append(Spacer(1, 10))

    ws_actions = [
        ("stats", "Statistiques globales du SOC (engagements, findings, risk score)"),
        ("subscribe", "S'abonner aux mises à jour temps réel d'un engagement"),
        ("scan", "Lancer un scan Nmap/Masscan avec streaming logs"),
        ("mythos_analyze", "Analyse Kill Chain Cyber par Mythos AI"),
        ("wstg_scan", "Lancer un scan OWASP WSTG complet"),
        ("raptor_scan", "Lancer RAPTOR AI en mode autonome"),
        ("ping", "Heartbeat de connexion WebSocket"),
    ]

    ws_data = [[
        Paragraph('<font color="#06b6d4"><b>Action</b></font>', style_small),
        Paragraph('<font color="#06b6d4"><b>Description</b></font>', style_small),
    ]]
    for action, desc in ws_actions:
        ws_data.append([
            Paragraph(f'<font color="#f59e0b"><b>{action}</b></font>', style_small),
            Paragraph(desc, style_small),
        ])

    ws_table = Table(ws_data, colWidths=[120, 360])
    ws_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HexColor("#1e293b")),
        ('BACKGROUND', (0, 1), (-1, -1), CARD_BG),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_GRAY),
        ('LINEBELOW', (0, 0), (-1, -2), 0.5, BORDER_GRAY),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(ws_table)
    story.append(Spacer(1, 15))

    story.append(Paragraph("Hook Frontend : useOffensiveWS", style_h2))
    story.append(Paragraph(
        "Auto-reconnect avec backoff exponentiel, file d'attente de messages, "
        "support des messages raptor_*, wstg_*, scan_*, mythos_*. "
        "Le flushQueue est safe pour éviter les pertes de données.",
        style_body
    ))

    story.append(Spacer(1, 15))
    story.append(Paragraph("Backend : offensive_ws.py", style_h2))
    story.append(Paragraph(
        "52 routes backend orchestrant les scans. Fallback simulation si les outils "
        "ne sont pas disponibles. Streaming des logs en temps réel via Redis Pub/Sub.",
        style_body
    ))

    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════════
    # PAGE 9 — AI & MYTHOS
    # ═══════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("8. Intelligence Artificielle", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT_PURPLE, spaceAfter=15))

    story.append(Paragraph("Mythos AI — Cyber Kill Chain", style_h2))
    mythos_phases = [
        ("Phase 1: Reconnaissance", "Collecte d'informations sur la cible (OSINT, DNS, port scan)"),
        ("Phase 2: Weaponization", "Création des payloads et outils d'exploitation"),
        ("Phase 3: Delivery", "Livraison de l'attaque (phishing, exploit, injection)"),
        ("Phase 4: Exploitation", "Exécution de l'exploit et compromission"),
        ("Phase 5: Post-Exploitation", "Pivotement, élévation de privilèges, exfiltration"),
    ]
    for phase, desc in mythos_phases:
        story.append(Paragraph(
            f"<bullet>&bull;</bullet> <font color='#8b5cf6'><b>{phase}</b></font> — {desc}",
            style_bullet
        ))

    story.append(Spacer(1, 12))
    story.append(Paragraph("Ollama — IA Locale", style_h2))
    story.append(Paragraph(
        "Moteur d'IA local basé sur Llama 3.1 70B (via NVIDIA API). Utilisé pour :",
        style_body
    ))
    ollama_uses = [
        "Analyse automatique des findings de sécurité",
        "Génération de rapports de remédiation",
        "Classification des alertes par sévérité",
        "Recommandations de patch et de configuration",
        "Enrichissement des données de threat intelligence",
    ]
    for use in ollama_uses:
        story.append(Paragraph(f"<bullet>&bull;</bullet> {use}", style_bullet))

    story.append(Spacer(1, 12))
    story.append(Paragraph("HumanLayer — Opérations Hybrides", style_h2))
    story.append(Paragraph(
        "Module d'opérations hybrides humain-IA. RedOps (offensif) et BlueOps (défensif) "
        "avec supervision humaine pour les actions critiques.",
        style_body
    ))

    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════════
    # PAGE 10 — SÉCURITÉ & DÉPLOIEMENT
    # ═══════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("9. Sécurité & Déploiement", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT_RED, spaceAfter=15))

    story.append(Paragraph("Sécurité Docker", style_h2))
    sec_features = [
        "cap_drop ALL — chaque container ne garde que les permissions strictement nécessaires",
        "no-new-privileges — empêche l'élévation de privilèges dans les containers",
        "read_only — filesystem du Gateway en lecture seule",
        "Health checks — surveillance continue de chaque service",
        "Resource limits — CPU et mémoire limités par container",
        "Network isolation — 6 réseaux Docker séparés par domaine de responsabilité",
    ]
    for feat in sec_features:
        story.append(Paragraph(f"<bullet>&bull;</bullet> {feat}", style_bullet))

    story.append(Spacer(1, 12))
    story.append(Paragraph("Stratégie de Déploiement", style_h2))
    story.append(Paragraph(
        "Build Docker optimisé sans Docker Desktop. Le build production du frontend "
        "génère 118 pages statiques servies par Nginx. Le backend utilise des volumes "
        "mounts uniquement en développement. En production, les images sont pré-buildées.",
        style_body
    ))

    story.append(Spacer(1, 12))
    story.append(Paragraph("Testing", style_h2))
    story.append(Paragraph(
        "<b>53 tests d'intégration</b> couvrant : PDF generation, status API, "
        "engagement types, engagements CRUD, findings, filtres, WebSocket (ping, "
        "stats, scan, masscan). Tous les tests passent en 60 secondes.",
        style_body
    ))

    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════════
    # PAGE 11 — RÉCAPITULATIF TECHNIQUE
    # ═══════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("10. Stack Technique Complet", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT_CYAN, spaceAfter=15))

    stack_data = [
        [Paragraph('<font color="#06b6d4"><b>Couche</b></font>', style_small),
         Paragraph('<font color="#06b6d4"><b>Technologie</b></font>', style_small),
         Paragraph('<font color="#06b6d4"><b>Détails</b></font>', style_small)],
        [Paragraph('Frontend', style_small),
         Paragraph('Next.js 14 + React', style_small),
         Paragraph('118 pages, WebSocket, TailwindCSS, production Docker', style_small)],
        [Paragraph('Backend', style_small),
         Paragraph('FastAPI + Python', style_small),
         Paragraph('52 routes REST, WebSocket, async/await, Pydantic', style_small)],
        [Paragraph('Tools-API', style_small),
         Paragraph('Kali Linux + FastAPI', style_small),
         Paragraph('104 outils, jobs async, streaming logs', style_small)],
        [Paragraph('Database', style_small),
         Paragraph('PostgreSQL 15', style_small),
         Paragraph('GeoIP, embeddings, 2 bases de données', style_small)],
        [Paragraph('Cache', style_small),
         Paragraph('Redis 7', style_small),
         Paragraph('Pub/Sub, sessions, rate limiting, queues', style_small)],
        [Paragraph('IA', style_small),
         Paragraph('Ollama + Llama 3.1 70B', style_small),
         Paragraph('Analyse locale, NVIDIA API, RAPTOR AI', style_small)],
        [Paragraph('Scanner', style_small),
         Paragraph('OWASP ZAP', style_small),
         Paragraph('DAST automatisé, API intégrée', style_small)],
        [Paragraph('Pentest', style_small),
         Paragraph('Kali Linux', style_small),
         Paragraph('Nmap, Masscan, SQLMap, Hydra, Nuclei, RAPTOR', style_small)],
        [Paragraph('Gateway', style_small),
         Paragraph('Nginx', style_small),
         Paragraph('Reverse proxy, SSL, rate limiting, health checks', style_small)],
        [Paragraph('Infra', style_small),
         Paragraph('Docker Compose', style_small),
         Paragraph('10 containers, 6 réseaux, health checks, limits', style_small)],
    ]

    stack_table = Table(stack_data, colWidths=[80, 150, 250])
    stack_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HexColor("#1e293b")),
        ('BACKGROUND', (0, 1), (-1, -1), CARD_BG),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_GRAY),
        ('LINEBELOW', (0, 0), (-1, -2), 0.5, BORDER_GRAY),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LINEBEFOREDECOR', (0, 1), (0, -1), 2, ACCENT_CYAN),
    ]))
    story.append(stack_table)

    story.append(Spacer(1, 25))
    story.append(Paragraph(
        "Bouclier SaaS — Plateforme Intégrée de Cybersécurité Offensive & Defensive",
        ParagraphStyle('EndTitle', parent=style_title, fontSize=18, textColor=ACCENT_CYAN)
    ))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "Conçu et développé avec les technologies les plus avancées en cybersécurité.",
        ParagraphStyle('EndSub', parent=style_body, alignment=TA_CENTER)
    ))
    story.append(Spacer(1, 5))
    story.append(Paragraph(
        "118 modules  |  104 outils  |  10 services  |  53 tests  |  6 réseaux",
        ParagraphStyle('EndStats', parent=style_body, fontSize=12, textColor=ACCENT_CYAN, alignment=TA_CENTER)
    ))

    # ─── BUILD ────────────────────────────────────────────────────────────────
    doc.build(story, onFirstPage=draw_cover_bg, onLaterPages=draw_bg)
    print(f"PDF générée : {output_path}")
    return output_path


if __name__ == "__main__":
    build_presentation()
