"use client";

import { useState } from "react";
import { Download, FileJson, FileSpreadsheet, FileText, X, Check, Loader2 } from "lucide-react";

interface ExportDialogProps {
    isOpen: boolean;
    onClose: () => void;
    data: any[];
    filename?: string;
}

type ExportFormat = "json" | "csv" | "pdf";

export default function ExportDialog({
    isOpen,
    onClose,
    data,
    filename = "shield_export",
}: ExportDialogProps) {
    const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("json");
    const [isExporting, setIsExporting] = useState(false);
    const [exportSuccess, setExportSuccess] = useState(false);

    if (!isOpen) return null;

    const formats = [
        {
            id: "json" as const,
            label: "JSON",
            icon: FileJson,
            description: "Format brut pour intégration API",
            color: "text-yellow-400",
        },
        {
            id: "csv" as const,
            label: "CSV",
            icon: FileSpreadsheet,
            description: "Tableur Excel / Google Sheets",
            color: "text-green-400",
        },
        {
            id: "pdf" as const,
            label: "PDF",
            icon: FileText,
            description: "Rapport imprimable",
            color: "text-red-400",
        },
    ];

    const exportToJSON = () => {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        downloadBlob(blob, `${filename}.json`);
    };

    const exportToCSV = () => {
        if (data.length === 0) return;

        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(","),
            ...data.map(row =>
                headers.map(header => {
                    const value = row[header];
                    // Escape commas and quotes
                    if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                }).join(",")
            ),
        ];

        const csvString = csvRows.join("\n");
        const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
        downloadBlob(blob, `${filename}.csv`);
    };

    const exportToPDF = () => {
        // Create a simple HTML-based PDF export
        const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>SHIELD Security Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: #0f172a; color: #fff; }
          h1 { color: #22d3ee; border-bottom: 2px solid #22d3ee; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #1e293b; color: #22d3ee; padding: 12px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #334155; }
          tr:hover { background: #1e293b; }
          .header { display: flex; justify-content: space-between; align-items: center; }
          .timestamp { color: #64748b; font-size: 12px; }
          .critical { color: #ef4444; }
          .high { color: #fb923c; }
          .medium { color: #facc15; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🛡️ SHIELD Security Report</h1>
          <span class="timestamp">Généré le ${new Date().toLocaleString('fr-FR')}</span>
        </div>
        <table>
          <thead>
            <tr>
              ${data.length > 0 ? Object.keys(data[0]).map(key => `<th>${key}</th>`).join("") : ""}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${Object.values(row).map(val => `<td>${val}</td>`).join("")}
              </tr>
            `).join("")}
          </tbody>
        </table>
        <p style="margin-top: 30px; color: #64748b; font-size: 11px;">
          Total: ${data.length} événements | SHIELD Security Framework v2.0
        </p>
      </body>
      </html>
    `;

        const blob = new Blob([htmlContent], { type: "text/html" });
        const url = URL.createObjectURL(blob);

        // Open in new window for printing
        const printWindow = window.open(url, "_blank");
        if (printWindow) {
            printWindow.onload = () => {
                printWindow.print();
            };
        }
    };

    const downloadBlob = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleExport = async () => {
        setIsExporting(true);

        // Simulate slight delay for UX
        await new Promise(resolve => setTimeout(resolve, 500));

        switch (selectedFormat) {
            case "json":
                exportToJSON();
                break;
            case "csv":
                exportToCSV();
                break;
            case "pdf":
                exportToPDF();
                break;
        }

        setIsExporting(false);
        setExportSuccess(true);

        setTimeout(() => {
            setExportSuccess(false);
            onClose();
        }, 1500);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 animate-in fade-in zoom-in-95 duration-200">
                <div className="rounded-xl border border-slate-800 bg-slate-900/95 shadow-2xl backdrop-blur-sm">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-800 p-4">
                        <div className="flex items-center gap-2">
                            <Download className="h-5 w-5 text-cyan-400" />
                            <h2 className="text-lg font-semibold text-white">Exporter les données</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-4">
                        <p className="text-sm text-slate-400">
                            Sélectionnez le format d'export pour {data.length} événements
                        </p>

                        {/* Format Options */}
                        <div className="space-y-2">
                            {formats.map((format) => (
                                <button
                                    key={format.id}
                                    onClick={() => setSelectedFormat(format.id)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition ${selectedFormat === format.id
                                            ? "border-cyan-500/50 bg-cyan-500/10"
                                            : "border-slate-800 hover:border-slate-700 hover:bg-slate-800/50"
                                        }`}
                                >
                                    <format.icon className={`h-6 w-6 ${format.color}`} />
                                    <div className="flex-1 text-left">
                                        <div className="text-sm font-medium text-white">{format.label}</div>
                                        <div className="text-[11px] text-slate-500">{format.description}</div>
                                    </div>
                                    {selectedFormat === format.id && (
                                        <div className="h-5 w-5 rounded-full bg-cyan-500 flex items-center justify-center">
                                            <Check className="h-3 w-3 text-white" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 border-t border-slate-800 p-4">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-sm font-medium text-white hover:from-cyan-400 hover:to-blue-500 transition disabled:opacity-50"
                        >
                            {isExporting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Export en cours...
                                </>
                            ) : exportSuccess ? (
                                <>
                                    <Check className="h-4 w-4" />
                                    Exporté!
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4" />
                                    Exporter
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
