"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, ShieldCheck, Activity } from "lucide-react";

export default function DDoSPage() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005";
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [packetCount, setPacketCount] = useState(5000);
    const [byteCount, setByteCount] = useState(120000);
    const [protocol, setProtocol] = useState("TCP");
    const [tcpFlags, setTcpFlags] = useState("SYN");
    const [uniqueDstPorts, setUniqueDstPorts] = useState(100);

    const handleScan = async () => {
        setLoading(true);
        setResult(null);
        setError(null);
        try {
            const payload = {
                packet_count: Number(packetCount),
                byte_count: Number(byteCount),
                time_window: 1,
                protocol: protocol,
                tcp_flags: tcpFlags,
                unique_dst_ports: Number(uniqueDstPorts)
            };

            const res = await fetch(`${apiBase}/api/ddos/detect`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                throw new Error(`API error ${res.status}`);
            }
            const data = await res.json();
            setResult(data);
        } catch (e) {
            setError("Failed to connect to DDoS Service");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">DDoS Detection</h1>
                <Badge variant="outline" className="text-green-500 border-green-500">
                    AI Engine Online
                </Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Traffic Simulator</CardTitle>
                        <CardDescription>
                            Input network parameters to test the RBF-SVM Kernel Model.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Packet Rate (pps)</Label>
                                <Input type="number" value={packetCount} onChange={(e) => setPacketCount(Number(e.target.value))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Byte Rate (Bps)</Label>
                                <Input type="number" value={byteCount} onChange={(e) => setByteCount(Number(e.target.value))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Protocol</Label>
                                <Input value={protocol} onChange={(e) => setProtocol(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>TCP Flags</Label>
                                <Input value={tcpFlags} onChange={(e) => setTcpFlags(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Unique Dst Ports</Label>
                                <Input type="number" value={uniqueDstPorts} onChange={(e) => setUniqueDstPorts(Number(e.target.value))} />
                            </div>
                        </div>

                        <Button onClick={handleScan} disabled={loading} className="w-full mt-4">
                            {loading ? "Analyzing..." : "Analyze Traffic"}
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Detection Result</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center min-h-[200px]">
                        {!result && !loading && (
                            <div className="text-muted-foreground flex flex-col items-center">
                                <Activity className="h-10 w-10 mb-2 opacity-20" />
                                <p>Waiting for analysis...</p>
                            </div>
                        )}

                        {error && !loading && (
                            <div className="text-red-400 text-sm">{error}</div>
                        )}

                        {result && (
                            <div className="text-center space-y-4">
                                {result.is_ddos ? (
                                    <ShieldAlert className="h-16 w-16 text-red-500 mx-auto" />
                                ) : (
                                    <ShieldCheck className="h-16 w-16 text-green-500 mx-auto" />
                                )}
                                <div>
                                    <h3 className="text-2xl font-bold">{result.verdict}</h3>
                                    <p className="text-muted-foreground">Confidence: {(result.confidence * 100).toFixed(1)}%</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
