"use client"

import { useSession } from "next-auth/react"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Badge } from "../../../components/ui/badge"
import { Settings, Check, Bell, Key, Shield, Download, Terminal, CheckCircle, XCircle, Loader2, Scan, Globe, FileText, Wrench, Activity } from "lucide-react"

// Scanner installation status type
interface ScannerModule {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    installed: boolean;
    version?: string;
}

export default function SettingsPage() {
    const { data: session } = useSession();
    const [scannerModules, setScannerModules] = useState<ScannerModule[]>([
        {
            id: 'vuln_scanner',
            name: 'Vulnerability Scanner',
            description: 'Local system vulnerability assessment with port scanning, service detection, and security checks',
            icon: <Scan className="w-5 h-5" />,
            installed: true,
            version: '1.0.0'
        },
        {
            id: 'network_scanner',
            name: 'Network Scanner',
            description: 'Discover and assess all devices on your local network',
            icon: <Globe className="w-5 h-5" />,
            installed: true,
            version: '1.0.0'
        },
        {
            id: 'pdf_reports',
            name: 'PDF Report Generator',
            description: 'Export scan results as detailed PDF reports',
            icon: <FileText className="w-5 h-5" />,
            installed: true,
            version: '1.0.0'
        },
        {
            id: 'remediation_engine',
            name: 'Remediation Engine',
            description: 'Automatic fix recommendations and step-by-step remediation guides',
            icon: <Wrench className="w-5 h-5" />,
            installed: true,
            version: '1.0.0'
        },
        {
            id: 'notifications',
            name: 'Real-time Notifications',
            description: 'Instant alerts for critical vulnerabilities and security events',
            icon: <Bell className="w-5 h-5" />,
            installed: true,
            version: '1.0.0'
        },
    ]);

    const [installing, setInstalling] = useState<string | null>(null);
    const [notificationSettings, setNotificationSettings] = useState({
        critical: true,
        high: true,
        medium: false,
        low: false,
        email: true,
        push: true,
        slack: false,
    });

    const [emailConfig, setEmailConfig] = useState({
        host: "smtp.gmail.com",
        port: "587",
        user: "admin@shield.io",
        pass: "••••••••",
        from: "alerts@shield.io"
    });

    const [apiKeys, setApiKeys] = useState<{ id: string, key: string, created: string, name: string }[]>([
        { id: '1', key: 'sk-shield-live-8f92-x912', created: '2024-05-15', name: 'Production API' }
    ]);

    const handleInstall = async (moduleId: string) => {
        setInstalling(moduleId);
        // Simulate installation
        await new Promise(resolve => setTimeout(resolve, 2000));
        setScannerModules(prev => prev.map(m =>
            m.id === moduleId ? { ...m, installed: true, version: '1.0.0' } : m
        ));
        setInstalling(null);
    };

    const handleUninstall = async (moduleId: string) => {
        setInstalling(moduleId);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setScannerModules(prev => prev.map(m =>
            m.id === moduleId ? { ...m, installed: false, version: undefined } : m
        ));
        setInstalling(null);
    };

    const generateApiKey = () => {
        const newKey = `sk-shield-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}-${Date.now().toString(36)}`;
        setApiKeys([...apiKeys, {
            id: Date.now().toString(),
            key: newKey,
            created: new Date().toISOString().split('T')[0],
            name: `Key ${apiKeys.length + 1}`
        }]);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Settings className="text-cyan-400" /> System Settings
                </h1>
                <p className="text-slate-400">Configure global security parameters and scanner modules</p>
            </div>

            <Tabs defaultValue="modules" className="w-full">
                <TabsList className="grid w-full grid-cols-5 max-w-3xl bg-slate-900 border border-slate-800">
                    <TabsTrigger value="modules">Modules</TabsTrigger>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="api">API Keys</TabsTrigger>
                    <TabsTrigger value="system">System</TabsTrigger>
                </TabsList>

                {/* Modules Tab - Scanner Installation */}
                <TabsContent value="modules">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Download className="w-5 h-5 text-cyan-400" />
                                Scanner Modules
                            </CardTitle>
                            <CardDescription>Install and manage security scanner components</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {scannerModules.map((module) => (
                                <div
                                    key={module.id}
                                    className="flex items-center justify-between p-4 border border-slate-800 rounded-lg bg-slate-950 hover:border-slate-700 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-lg ${module.installed ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                                            {module.icon}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-slate-200">{module.name}</span>
                                                {module.installed && (
                                                    <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                                                        v{module.version}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 mt-1">{module.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {module.installed ? (
                                            <>
                                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                                    onClick={() => handleUninstall(module.id)}
                                                    disabled={installing === module.id}
                                                >
                                                    {installing === module.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : 'Uninstall'}
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                size="sm"
                                                className="bg-cyan-600 hover:bg-cyan-500"
                                                onClick={() => handleInstall(module.id)}
                                                disabled={installing === module.id}
                                            >
                                                {installing === module.id ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                        Installing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Install
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Python Scripts Info */}
                            <Card className="bg-slate-900/50 border-slate-800">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Terminal className="w-4 h-4 text-cyan-400" />
                                        Python Scanner Scripts
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-slate-400 space-y-2">
                                    <p>The following Python scripts are available in your installation:</p>
                                    <div className="bg-slate-950 p-3 rounded-lg font-mono text-xs space-y-1">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                                            <span className="text-slate-300">scripts/simulation/vuln_scanner.py</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                                            <span className="text-slate-300">scripts/simulation/network_scanner.py</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                                            <span className="text-slate-300">scripts/simulation/attack_sim.py</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">
                                        Run with: <code className="bg-slate-800 px-2 py-1 rounded">python scripts/simulation/vuln_scanner.py</code>
                                    </p>
                                </CardContent>
                            </Card>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* General Tab */}
                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>Organization Details</CardTitle>
                            <CardDescription>Manage your workspace profile.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="org">Organization Name</Label>
                                <Input id="org" value={session?.user?.orgName || "Loading..."} readOnly className="opacity-70" />
                                <p className="text-[10px] text-slate-500">Managed by System Administrator</p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Contact Email</Label>
                                <Input id="email" value={session?.user?.email || ""} readOnly className="opacity-70" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="plan">Subscription Plan</Label>
                                <div className="flex items-center gap-2">
                                    <Input id="plan" value={session?.user?.orgPlan || "FREE"} readOnly className="w-auto opacity-70" />
                                    {session?.user?.orgPlan === 'FREE' && (
                                        <Button variant="outline" size="sm" className="text-neon-1 border-neon-1/30 hover:bg-neon-1/10">Upgrade to Pro</Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button disabled>Save Changes (Read Only)</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>Security Policies</CardTitle>
                            <CardDescription>Enforce compliance across the organization.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 border border-slate-800 rounded-lg bg-slate-950">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-emerald-500" />
                                    <div>
                                        <div className="font-medium text-slate-200">Enforce MFA</div>
                                        <div className="text-sm text-slate-500">Require 2FA for all users</div>
                                    </div>
                                </div>
                                <div className="h-6 w-11 bg-cyan-500 rounded-full relative cursor-pointer">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 border border-slate-800 rounded-lg bg-slate-950">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-amber-500" />
                                    <div>
                                        <div className="font-medium text-slate-200">Session Timeout</div>
                                        <div className="text-sm text-slate-500">Auto-lock after 15 minutes</div>
                                    </div>
                                </div>
                                <div className="h-6 w-11 bg-cyan-500 rounded-full relative cursor-pointer">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 border border-slate-800 rounded-lg bg-slate-950">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-red-500" />
                                    <div>
                                        <div className="font-medium text-slate-200">Auto-Block Critical Threats</div>
                                        <div className="text-sm text-slate-500">Automatically quarantine critical findings</div>
                                    </div>
                                </div>
                                <div className="h-6 w-11 bg-slate-700 rounded-full relative cursor-pointer">
                                    <div className="absolute left-1 top-1 w-4 h-4 bg-slate-400 rounded-full"></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="w-5 h-5 text-cyan-400" />
                                Notification Settings
                            </CardTitle>
                            <CardDescription>Configure when and how you receive security alerts.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Alert Levels */}
                            <div>
                                <h3 className="font-medium text-slate-200 mb-3">Alert Levels</h3>
                                <div className="space-y-3">
                                    {[
                                        { key: 'critical', label: 'Critical', color: 'text-red-400', desc: 'Immediate threats requiring urgent action' },
                                        { key: 'high', label: 'High', color: 'text-orange-400', desc: 'Significant vulnerabilities found' },
                                        { key: 'medium', label: 'Medium', color: 'text-yellow-400', desc: 'Moderate security concerns' },
                                        { key: 'low', label: 'Low', color: 'text-green-400', desc: 'Minor issues and informational alerts' },
                                    ].map((level) => (
                                        <div key={level.key} className="flex items-center justify-between p-3 border border-slate-800 rounded-lg bg-slate-950">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${level.color.replace('text', 'bg')}`}></div>
                                                <div>
                                                    <div className={`font-medium ${level.color}`}>{level.label}</div>
                                                    <div className="text-xs text-slate-500">{level.desc}</div>
                                                </div>
                                            </div>
                                            <div
                                                className={`h-6 w-11 rounded-full relative cursor-pointer ${notificationSettings[level.key as keyof typeof notificationSettings]
                                                    ? 'bg-cyan-500'
                                                    : 'bg-slate-700'
                                                    }`}
                                                onClick={() => setNotificationSettings(prev => ({
                                                    ...prev,
                                                    [level.key]: !prev[level.key as keyof typeof notificationSettings]
                                                }))}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notificationSettings[level.key as keyof typeof notificationSettings]
                                                    ? 'right-1'
                                                    : 'left-1'
                                                    }`}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Notification Channels */}
                            <div>
                                <h3 className="font-medium text-slate-200 mb-3">Notification Channels</h3>
                                <div className="space-y-3">
                                    {[
                                        { key: 'email', label: 'Email Notifications', icon: '📧', desc: 'Receive alerts via email' },
                                        { key: 'push', label: 'Push Notifications', icon: '🔔', desc: 'Browser push notifications' },
                                        { key: 'slack', label: 'Slack Integration', icon: '💬', desc: 'Send alerts to Slack channel' },
                                    ].map((channel) => (
                                        <div key={channel.key} className="flex items-center justify-between p-3 border border-slate-800 rounded-lg bg-slate-950">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">{channel.icon}</span>
                                                <div>
                                                    <div className="font-medium text-slate-200">{channel.label}</div>
                                                    <div className="text-xs text-slate-500">{channel.desc}</div>
                                                </div>
                                            </div>
                                            <div
                                                className={`h-6 w-11 rounded-full relative cursor-pointer ${notificationSettings[channel.key as keyof typeof notificationSettings]
                                                    ? 'bg-cyan-500'
                                                    : 'bg-slate-700'
                                                    }`}
                                                onClick={() => setNotificationSettings(prev => ({
                                                    ...prev,
                                                    [channel.key]: !prev[channel.key as keyof typeof notificationSettings]
                                                }))}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notificationSettings[channel.key as keyof typeof notificationSettings]
                                                    ? 'right-1'
                                                    : 'left-1'
                                                    }`}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* SMTP Configuration Section (ADDED) */}
                            {notificationSettings.email && (
                                <div className="p-4 border border-slate-800 rounded-lg bg-slate-900/50 space-y-4">
                                    <h3 className="font-medium text-cyan-400 flex items-center gap-2">
                                        📧 SMTP Email Configuration
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="smtp-host">SMTP Host</Label>
                                            <Input
                                                id="smtp-host"
                                                value={emailConfig.host}
                                                onChange={(e) => setEmailConfig({ ...emailConfig, host: e.target.value })}
                                                className="bg-slate-950 border-slate-800"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="smtp-port">Port</Label>
                                            <Input
                                                id="smtp-port"
                                                value={emailConfig.port}
                                                onChange={(e) => setEmailConfig({ ...emailConfig, port: e.target.value })}
                                                className="bg-slate-950 border-slate-800"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="smtp-user">Username</Label>
                                            <Input
                                                id="smtp-user"
                                                value={emailConfig.user}
                                                onChange={(e) => setEmailConfig({ ...emailConfig, user: e.target.value })}
                                                className="bg-slate-950 border-slate-800"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="smtp-pass">Password</Label>
                                            <Input
                                                id="smtp-pass"
                                                type="password"
                                                value={emailConfig.pass}
                                                onChange={(e) => setEmailConfig({ ...emailConfig, pass: e.target.value })}
                                                className="bg-slate-950 border-slate-800"
                                            />
                                        </div>
                                        <div className="grid gap-2 col-span-2">
                                            <Label htmlFor="smtp-from">From Email</Label>
                                            <Input
                                                id="smtp-from"
                                                value={emailConfig.from}
                                                onChange={(e) => setEmailConfig({ ...emailConfig, from: e.target.value })}
                                                className="bg-slate-950 border-slate-800"
                                            />
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline" className="w-full">Test Email Connection</Button>
                                </div>
                            )}

                        </CardContent>
                        <CardFooter>
                            <Button>Save Notification Settings</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* API Keys */}
                <TabsContent value="api">
                    <Card>
                        <CardHeader>
                            <CardTitle>API Key Management</CardTitle>
                            <CardDescription>Manage keys used for external integrations.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {apiKeys.map((apiKey) => (
                                <div key={apiKey.id} className="p-4 border border-slate-800 rounded-lg bg-slate-950">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Key className="w-5 h-5 text-cyan-400" />
                                            <div>
                                                <div className="font-medium text-slate-200">{apiKey.name}</div>
                                                <div className="text-sm text-slate-500 font-mono">{apiKey.key}</div>
                                                <div className="text-xs text-slate-600 mt-1">Created: {apiKey.created}</div>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">Active</Badge>
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                navigator.clipboard.writeText(apiKey.key);
                                            }}
                                        >
                                            Copy Key
                                        </Button>
                                        <Button variant="outline" size="sm" className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                                            onClick={() => setApiKeys(apiKeys.filter(k => k.id !== apiKey.id))}
                                        >
                                            Revoke
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            <div className="p-4 border border-dashed border-slate-700 rounded-lg bg-slate-900/50 flex flex-col items-center justify-center text-center gap-2">
                                <Key className="w-8 h-8 text-slate-600" />
                                <h3 className="text-slate-300 font-medium">Create Additional API Key</h3>
                                <p className="text-xs text-slate-500 max-w-sm mb-2">Generate a new key to access the SHIELD Threat Detection API programmatically.</p>
                                <Button variant="outline" size="sm" onClick={generateApiKey}>Generate New Key</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* System Tab */}
                <TabsContent value="system">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="text-cyan-400" /> Module Health
                                </CardTitle>
                                <CardDescription>CPU and Memory usage per microservice</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    { name: "API Gateway", cpu: "12%", mem: "140MB", status: "ONLINE", color: "emerald" },
                                    { name: "Threat Detection Engine", cpu: "45%", mem: "850MB", status: "PROCESSING", color: "cyan" },
                                    { name: "Log Ingestor", cpu: "5%", mem: "80MB", status: "IDLE", color: "slate" },
                                    { name: "Traffic Analyzer", cpu: "28%", mem: "320MB", status: "ACTIVE", color: "emerald" }
                                ].map((s, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 border border-slate-800 rounded bg-slate-900/50">
                                        <div>
                                            <div className="font-bold text-slate-200">{s.name}</div>
                                            <div className="text-xs text-slate-500">PID: {1000 + i * 50}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-mono text-cyan-400">CPU: {s.cpu}</div>
                                            <div className="text-xs font-mono text-indigo-400">MEM: {s.mem}</div>
                                        </div>
                                        <Badge variant="outline" className={`text-${s.color}-400 border-${s.color}-500/30`}>{s.status}</Badge>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Terminal className="text-amber-400" /> System Logs (Tail)
                                </CardTitle>
                                <CardDescription>Last 10 system events</CardDescription>
                            </CardHeader>
                            <CardContent className="bg-black p-4 font-mono text-xs text-green-400 h-[300px] overflow-auto rounded-b-xl">
                                <div className="space-y-1">
                                    <span className="block text-slate-500">[SYSTEM] Backend services initializing...</span>
                                    <span className="block text-blue-400">[INFO] Detection Engine loaded model v2.1</span>
                                    <span className="block text-slate-500">[NET] Listening on port 8000 (Gateway)</span>
                                    <span className="block text-slate-500">[NET] Listening on port 8004 (DDoS)</span>
                                    <span className="block text-yellow-400">[WARN] High traffic detected on wlan0</span>
                                    <span className="block text-emerald-400">[AUTH] User 'admin' logged in from 127.0.0.1</span>
                                    <span className="block text-red-500">[ALERT] SQL Injection blocked from 192.168.1.50</span>
                                    <span className="block text-slate-500">[INFO] Threat Map updated (5 points found)</span>
                                    <span className="block text-slate-500">[INFO] Database sync completed in 0.04s</span>
                                    <span className="block text-cyan-400 animate-pulse">_</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
