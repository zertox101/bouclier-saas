"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Building, Globe } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function OrgSettingsPage() {
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        apiClient("/api/org/settings").then(setSettings).catch(() => {});
    }, []);

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4"><Settings className="w-6 h-6 text-emerald-400" /><h1 className="text-2xl font-bold text-white">Organization Settings</h1></div>
                <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2"><Save className="w-3 h-3" /> Save</button>
            </div>
            {settings && (
                <div className="grid gap-4">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5 flex items-center gap-4">
                        <Building className="w-5 h-5 text-slate-500" />
                        <div><p className="text-sm font-bold text-white">{settings.name}</p><p className="text-[10px] text-slate-500">{settings.slug}</p></div>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5 flex items-center gap-4">
                        <Globe className="w-5 h-5 text-slate-500" />
                        <div><p className="text-sm font-bold text-white capitalize">{settings.plan} Plan</p><p className="text-[10px] text-slate-500 capitalize">{settings.subscription_status?.toLowerCase()} subscription</p></div>
                    </div>
                    {settings.settings && Object.keys(settings.settings).length > 0 && (
                        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5">
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">Custom Settings</p>
                            <pre className="text-[10px] font-mono text-slate-400 bg-slate-950 p-4 rounded-lg overflow-auto">{JSON.stringify(settings.settings, null, 2)}</pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
