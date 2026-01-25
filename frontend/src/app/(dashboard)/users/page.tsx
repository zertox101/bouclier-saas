"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { User, Shield, Key, MoreHorizontal } from "lucide-react"

const USERS = [
    { id: 1, name: "Alexander Hunt", role: "Administrator", lastActive: "Just now", status: "Active", mfa: true },
    { id: 2, name: "Sarah Connor", role: "Analyst", lastActive: "2 hours ago", status: "Active", mfa: true },
    { id: 3, name: "John Smith", role: "Auditor", lastActive: "2 days ago", status: "Inactive", mfa: false },
]

export default function UsersPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <User className="text-cyan-400" /> Users & Access Control
                    </h1>
                    <p className="text-slate-400">Manage RBAC policies and personnel</p>
                </div>
                <Button variant="cyber">Invite User</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Roles Summary */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Role Hierarchy</CardTitle>
                        <CardDescription>Active permission sets</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-500/10 rounded-lg"><Shield className="w-5 h-5 text-red-500" /></div>
                                <div>
                                    <div className="font-bold text-slate-200">Administrator</div>
                                    <div className="text-xs text-slate-500">Full system access, Policy management</div>
                                </div>
                            </div>
                            <Badge variant="outline">2 Active</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg"><Key className="w-5 h-5 text-blue-500" /></div>
                                <div>
                                    <div className="font-bold text-slate-200">Security Analyst</div>
                                    <div className="text-xs text-slate-500">Read logs, Manage alerts</div>
                                </div>
                            </div>
                            <Badge variant="outline">5 Active</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Pending Invites</CardTitle>
                        <CardDescription>Awaiting activation</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-slate-500 text-center py-8">
                            No pending invitations
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>MFA</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {USERS.map(user => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium text-slate-200">{user.name}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell>
                                    <Badge variant={user.status === 'Active' ? 'success' : 'secondary'}>{user.status}</Badge>
                                </TableCell>
                                <TableCell>
                                    {user.mfa ? <span className="text-emerald-400 text-xs">Enabled</span> : <span className="text-red-400 text-xs">Disabled</span>}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
