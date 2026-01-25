"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Badge } from "../../../components/ui/badge"
import { Copy, Globe, ArrowRight, Download } from "lucide-react"

export default function DeployPage() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005";
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
                    <Globe className="text-cyan-400" /> Client Integration Guide
                </h1>
                <p className="text-slate-400">Deploy SHIELD protection to your applications in 3 simple steps.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Steps */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Step 1: Get Key */}
                    <Card className="border-l-4 border-l-cyan-500">
                        <CardHeader>
                            <Badge variant="outline" className="w-fit mb-2 border-cyan-500/30 text-cyan-400">Step 1</Badge>
                            <CardTitle>Get your API Key</CardTitle>
                            <CardDescription>Authentication token required for SDK access.</CardDescription>
                        </CardHeader>
                        <CardContent className="bg-slate-950/50 rounded-b-lg mx-6 mb-6 p-4 border border-slate-800">
                            <div className="flex items-center justify-between">
                                <code className="font-mono text-emerald-400">sk-shield-live-8f92-x912</code>
                                <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText("sk-shield-live-8f92-x912")}>
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Step 2: Install SDK */}
                    <Card className="border-l-4 border-l-purple-500">
                        <CardHeader>
                            <Badge variant="outline" className="w-fit mb-2 border-purple-500/30 text-purple-400">Step 2</Badge>
                            <CardTitle>Install Client SDK</CardTitle>
                            <CardDescription>Download the lightweight connector for your language.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="python" className="w-full">
                                <TabsList className="bg-slate-900 border border-slate-800">
                                    <TabsTrigger value="python">Python / Flask</TabsTrigger>
                                    <TabsTrigger value="node">Node.js</TabsTrigger>
                                </TabsList>
                                <TabsContent value="python" className="mt-4">
                                    <div className="bg-black p-4 rounded-lg border border-slate-800 font-mono text-sm relative group">
                                        <span className="text-slate-500"># Install dependencies</span><br />
                                        <span className="text-white">pip install requests</span><br /><br />
                                        <span className="text-slate-500"># Download SDK (See 'Download' button above)</span>
                                        <Button size="icon" variant="ghost" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Copy className="w-4 h-4 text-slate-400" />
                                        </Button>
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <Button variant="outline" className="text-xs" onClick={() => window.open(`${apiBase}/static/shield_sdk.py`)}>
                                            <Download className="w-3 h-3 mr-2" /> Download shield_client.py
                                        </Button>
                                    </div>
                                </TabsContent>
                                <TabsContent value="node" className="mt-4">
                                    <div className="bg-black p-4 rounded-lg border border-slate-800 font-mono text-sm">
                                        <span className="text-slate-500">// Install via NPM (Coming Soon)</span><br />
                                        <span className="text-white">npm install @shield-security/client-sdk</span>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    {/* Step 3: Implement Code */}
                    <Card className="border-l-4 border-l-emerald-500">
                        <CardHeader>
                            <Badge variant="outline" className="w-fit mb-2 border-emerald-500/30 text-emerald-400">Step 3</Badge>
                            <CardTitle>Integrate & Protect</CardTitle>
                            <CardDescription>Add the middleware to your application entry point.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-slate-950 p-4 rounded-lg font-mono text-xs overflow-x-auto border border-slate-800">
                                <pre className="text-slate-300">
                                    {`from flask import Flask, request, abort
from shield_client import ShieldClient

app = Flask(__name__)
# Initialize SHIELD
shield = ShieldClient(api_key="sk-shield-live-8f92-x912")

@app.before_request
def shield_firewall():
    # Scan every incoming request
    is_safe, threat = shield.scan_request(
        method=request.method,
        url=request.path,
        headers=request.headers,
        body=request.get_data(as_text=True),
        ip=request.remote_addr
    )

    if not is_safe:
        print(f"Blocked {threat['type']}")
        abort(403, description="Blocked by SHIELD SaaS")
`}
                                </pre>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-500">
                                Verify Integration <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Right Column: Status & Info */}
                <div className="space-y-6">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-sm uppercase tracking-wider text-slate-400">Connectivity Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-300">SaaS Gateway</span>
                                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10">Online</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-300">Latency</span>
                                <span className="font-mono text-cyan-400 text-sm">24ms</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-300">Active Agents</span>
                                <span className="font-mono text-white text-sm">0</span>
                            </div>

                            <div className="pt-4 border-t border-slate-800">
                                <div className="text-xs text-slate-500 mb-2">Endpoint URL</div>
                                <code className="block bg-black p-2 rounded text-xs text-slate-300">
                                    {apiBase}/api
                                </code>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
