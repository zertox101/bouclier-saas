import React from 'react';
import { Shield } from 'lucide-react';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">

            {/* Background Cyber Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-cyan-500 opacity-20 blur-[100px]"></div>
            </div>

            {/* Logo */}
            <div className="mb-8 z-10 flex items-center gap-2">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 shadow-xl">
                    <Shield className="w-10 h-10 text-cyan-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tighter">
                        CYBER<span className="text-cyan-400">SHIELD</span>
                    </h1>
                    <p className="text-slate-500 text-xs font-mono tracking-widest uppercase">
                        Secure Access Portal v10.0
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="w-full max-w-md z-10 animate-in fade-in zoom-in-95 duration-500">
                {children}
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-slate-600 text-xs font-mono z-10">
                <p>RESTRICTED ACCESS. UNAUTHORIZED ENTRY LOGGED.</p>
                <p className="mt-2">ID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
            </div>

        </div>
    );
}
