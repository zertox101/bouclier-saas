"use client";

import { useState, useEffect } from "react";
import { Settings, Save } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function PlatformSettingsPage() {
    const [settings, setSettings] = useState<any>({});
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        apiClient("/api/admin/platform/settings")
            .then(d => { setSettings((d as any)?.settings || d); setLoaded(true); })
            .catch(() => setLoaded(true));
    }, []);

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4"><Settings className="w-6 h-6 text-purple-400" /><h1 className="text-2xl font-bold text-white">Platform Settings</h1></div>
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2"><Save className="w-3 h-3" /> Save</button>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5">
                <p className="text-xs text-slate-500">
                    {loaded ? "Platform settings loaded. Use the API at /api/admin/platform/settings to manage configuration." : "Loading settings..."}
                </p>
                {loaded && <pre className="mt-4 text-[10px] font-mono text-slate-400 bg-slate-950 p-4 rounded-lg overflow-auto max-h-96">{JSON.stringify(settings, null, 2)}</pre>}
            </div>
        </div>
    );
}
