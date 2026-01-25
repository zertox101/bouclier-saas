import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { UnifiedScanResult, Severity } from "@/types/schema";

// --- Configuration & Branding ---
const BRAND_COLOR = "#0891b2"; // Cyan-600
const SECONDARY_COLOR = "#334155"; // Slate-700
const COMPANY_NAME = "SHIELD SECURITY SYSTEMS";
const CONFIDENTIALITY_NOTICE = "CONFIDENTIAL - RESTRICTED DISTRIBUTION";

// --- Helper Functions ---
const addHeader = (doc: jsPDF, title: string) => {
    doc.setFillColor(BRAND_COLOR);
    doc.rect(0, 0, 210, 20, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(title.toUpperCase(), 14, 13);
    doc.setFontSize(10);
    doc.text(COMPANY_NAME, 170, 13);
};

const addFooter = (doc: jsPDF, pageNum: number) => {
    const pageHeight = doc.internal.pageSize.height;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, pageHeight - 15, 196, pageHeight - 15);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(CONFIDENTIALITY_NOTICE, 14, pageHeight - 10);
    doc.text(`Page ${pageNum}`, 190, pageHeight - 10);
};

const addSectionTitle = (doc: jsPDF, title: string, y: number) => {
    doc.setFontSize(14);
    doc.setTextColor(BRAND_COLOR);
    doc.setFont("helvetica", "bold");
    doc.text(title, 14, y);
    doc.setLineWidth(0.5);
    doc.setDrawColor(BRAND_COLOR);
    doc.line(14, y + 2, 196, y + 2);
    return y + 10;
};

// --- Template Generators ---

// D1: Pentest Report
const generatePentestReport = (doc: jsPDF, data: UnifiedScanResult) => {
    let y = 30;

    // 1. Executive Summary
    y = addSectionTitle(doc, "1. Executive Summary", y);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    const summaryText = `This penetration test was conducted on ${new Date(data.timestamp).toLocaleDateString()} targeting ${data.target?.identifier}. The objective was to identify security vulnerabilities and provide remediation steps.`;
    doc.text(doc.splitTextToSize(summaryText, 180), 14, y);
    y += 20;

    doc.setFont("helvetica", "bold");
    doc.text(`Risk Score: ${data.summary.risk_score}/100`, 14, y);
    doc.text(`Total Findings: ${data.summary.total_findings}`, 80, y);
    y += 15;

    // 2. Findings Summary Table
    y = addSectionTitle(doc, "2. Findings Overview", y);

    const findingsData = data.findings?.map(f => [
        f.id, f.title, f.severity.toUpperCase(), "Confirmed", f.cvss?.score || "-"
    ]) || [];

    autoTable(doc, {
        startY: y,
        head: [['ID', 'Title', 'Severity', 'Status', 'CVSS']],
        body: findingsData,
        headStyles: { fillColor: SECONDARY_COLOR },
    });

    // @ts-ignore
    y = doc.lastAutoTable.finalY + 15;

    // 3. Detailed Findings
    data.findings?.forEach((f, index) => {
        if (y > 250) { doc.addPage(); y = 30; }

        y = addSectionTitle(doc, `3.${index + 1} ${f.title}`, y);

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Description:", 14, y);
        doc.setFont("helvetica", "normal");
        doc.text(doc.splitTextToSize(f.description, 180), 14, y + 5);
        y += 20 + (doc.splitTextToSize(f.description, 180).length * 4);

        doc.setFont("helvetica", "bold");
        doc.text("Remediation:", 14, y);
        doc.setTextColor(0, 100, 0); // Dark Green for fix
        doc.setFont("helvetica", "normal");
        doc.text(doc.splitTextToSize(f.recommendation, 180), 14, y + 5);
        doc.setTextColor(0, 0, 0);

        y += 20 + (doc.splitTextToSize(f.recommendation, 180).length * 4);

        if (f.evidence?.stdout_snippet) {
            doc.setFont("courier", "normal");
            doc.setFillColor(245, 245, 245);
            doc.rect(14, y, 182, 15, "F");
            doc.text(doc.splitTextToSize(f.evidence.stdout_snippet.substring(0, 200), 180), 16, y + 5);
            y += 25;
            doc.setFont("helvetica", "normal");
        }

        y += 10;
    });
};

// D5: Red Team Report
const generateRedTeamReport = (doc: jsPDF, data: UnifiedScanResult) => {
    let y = 30;

    // 1. Mission Overview
    y = addSectionTitle(doc, "1. Operation Summary", y);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const summary = `Red Team Operation ID ${data.scan_id}. Target: ${data.target?.identifier}. Simulated Steps: ${data.summary.simulated_steps}.`;
    doc.text(doc.splitTextToSize(summary, 180), 14, y);
    y += 20;

    // 2. Attack Timeline
    y = addSectionTitle(doc, "2. Attack Path Execution", y);
    const timelineData = data.simulated_timeline?.map(s => [
        `T${s.step}`, s.technique, s.label, s.result
    ]) || [];

    autoTable(doc, {
        startY: y,
        head: [['Step', 'Technique', 'Action', 'Outcome']],
        body: timelineData,
        headStyles: { fillColor: [185, 28, 28] }, // Red header
    });

    // @ts-ignore
    y = doc.lastAutoTable.finalY + 15;

    // 3. Defenses Evaded/Triggered (Findings)
    y = addSectionTitle(doc, "3. Defensive Gaps", y);
    if (data.findings) {
        data.findings.forEach(f => {
            doc.setFont("helvetica", "bold");
            doc.text(`[${f.severity.toUpperCase()}] ${f.title}`, 14, y);
            doc.setFont("helvetica", "normal");
            doc.text(f.recommendation, 14, y + 6);
            y += 15;
        });
    }
}

// D2: SOC/Honeypot Report
const generateSoCReport = (doc: jsPDF, data: UnifiedScanResult) => {
    let y = 30;
    y = addSectionTitle(doc, "1. Incident Header", y);
    doc.setFontSize(10);
    doc.text(`Incident ID: ${data.scan_id}`, 14, y);
    doc.text(`Source: Honeypot / SIEM`, 14, y + 5);
    doc.text(`Detected: ${new Date(data.timestamp).toLocaleString()}`, 14, y + 10);
    y += 25;

    y = addSectionTitle(doc, "2. Captured Events (IOCs)", y);
    const eventData = data.events?.map(e => [
        new Date(e.timestamp).toLocaleTimeString(), e.source_ip, e.geo, e.attack_type
    ]) || [];

    autoTable(doc, {
        startY: y,
        head: [['Time', 'Source IP', 'Geo', 'Attack Type']],
        body: eventData,
        headStyles: { fillColor: [249, 115, 22] }, // Orange
    });
}

// --- Main Generator Function ---
export const generatePDFResult = (data: UnifiedScanResult) => {
    const doc = new jsPDF();

    // Cover Page
    doc.setFillColor(20, 20, 25); // Dark background
    doc.rect(0, 0, 210, 297, "F");

    doc.setTextColor(6, 182, 212); // Cyan
    doc.setFontSize(30);
    doc.setFont("helvetica", "bold");
    doc.text(COMPANY_NAME, 105, 100, { align: "center" });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text(data.tool.replace('_', ' ').toUpperCase() + " REPORT", 105, 115, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Target: ${data.target?.identifier}`, 105, 130, { align: "center" });
    doc.text(`Date: ${new Date(data.timestamp).toLocaleDateString()}`, 105, 138, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(CONFIDENTIALITY_NOTICE, 105, 280, { align: "center" });

    doc.addPage();

    // Header on Content Pages
    addHeader(doc, `${data.tool.replace('_', ' ').toUpperCase()} REPORT`);

    // Switch based on tool type
    if (data.tool === "vuln_scanner" || data.tool === "network_scanner" || data.tool === "mobile_security") {
        generatePentestReport(doc, data);
    } else if (data.tool === "c2_simulator") {
        generateRedTeamReport(doc, data);
    } else if (data.tool === "honeypot" || data.tool === "threat_hunting") {
        generateSoCReport(doc, data);
    } else {
        // Default Fallback
        generatePentestReport(doc, data);
    }

    // Footer on last page
    addFooter(doc, doc.getNumberOfPages());

    doc.save(`${data.tool}_report_${data.scan_id}.pdf`);
};
