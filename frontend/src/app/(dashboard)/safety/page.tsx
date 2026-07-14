"use client";

import { ApprovalQueuePanel, EmergencyStopButton, AutomationStatusIndicator } from "@/components/safety/AutomationSafetyUI";

export default function SafetyControlsPage() {
    return (
        <div className="min-h-screen p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-text-1">Automation Safety Controls</h1>
                    <p className="text-xs text-text-3">Human decision gates & approval queue</p>
                </div>

                <div className="flex items-center gap-4">
                    <AutomationStatusIndicator />
                    <EmergencyStopButton />
                </div>
            </div>

            <ApprovalQueuePanel />
        </div>
    );
}
