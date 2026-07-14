"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldAlert, Lock, Zap, Radio, Terminal, X, ShieldCheck, 
    AlertTriangle, Fingerprint, Activity, Power, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function LockdownSystem() {
    const [isActive, setIsActive] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [authCode, setAuthCode] = useState("");
    const [status, setStatus] = useState("ISOLATING_NETWORK_NODES");
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        const handleLockdownTrigger = () => {
            setShowConfirm(true);
        };
        window.addEventListener('execute-lockdown', handleLockdownTrigger);
        return () => window.removeEventListener('execute-lockdown', handleLockdownTrigger);
    }, []);

    const executeLockdown = () => {
        setShowConfirm(false);
        setIsActive(true);
    };

    const handleUnlock = () => {
        if (authCode === "NEXUS-RECOVERY-2026") {
            setIsVerifying(true);
            setTimeout(() => {
                setIsActive(false);
                setAuthCode("");
                setIsVerifying(false);
                window.dispatchEvent(new CustomEvent('notify', { 
                    detail: { message: "Lockdown lifted. Systems returning to normal operation.", type: 'success' } 
                }));
            }, 2500);
        } else {
            setAuthCode("");
            setStatus("INVALID_AUTHORIZATION_CODE");
            setTimeout(() => setStatus("AWAITING_RECOVERY_KEY"), 2000);
        }
    };

    return (
        <>
            {/* ── PHASE 1: TACTICAL AUTHORIZATION (CLEAN SENIOR VERSION) ── */}
            <AnimatePresence>
                {showConfirm && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[10000] bg-black/98 backdrop-blur-xl flex items-center justify-center p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-xl relative"
                        >
                            {/* Close Button */}
                            <button 
                                onClick={() => setShowConfirm(false)}
                                className="absolute -top-12 right-0 p-2 text-slate-500 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="space-y-12 text-center">
                                {/* Minimalist Icon */}
                                <div className="w-16 h-16 border-2 border-red-500/20 rounded-full flex items-center justify-center mx-auto">
                                   <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-[10px] font-black text-red-500 uppercase tracking-[0.6em]">Tactical_Authorization</h2>
                                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Execute_Global_Lockdown</h1>
                                    <p className="text-[13px] text-slate-400 font-medium leading-relaxed max-w-md mx-auto">
                                        This action will isolate all neural nodes and disconnect the perimeter firewall immediately. All active sessions will be terminated.
                                    </p>
                                </div>

                                <div className="py-4 border-y border-white/5">
                                   <span className="text-[9px] font-mono font-black text-emerald-500 uppercase tracking-[0.3em]">
                                      Root_Access_Confirmed // Level_4_Audit_Ready
                                   </span>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <button 
                                        onClick={executeLockdown}
                                        className="w-full py-5 bg-red-600 hover:bg-red-500 text-white text-[11px] font-black uppercase tracking-[0.4em] rounded-full transition-all shadow-[0_10px_40px_rgba(220,38,38,0.2)]"
                                    >
                                        Confirm_Isolation
                                    </button>
                                    <button 
                                        onClick={() => setShowConfirm(false)}
                                        className="w-full py-5 bg-transparent border border-white/10 hover:border-white/30 text-slate-500 hover:text-white text-[11px] font-black uppercase tracking-[0.4em] rounded-full transition-all"
                                    >
                                        Abort_Action
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── PHASE 2: GLOBAL LOCKDOWN OVERLAY (STAYS IMMERSIVE) ── */}
            <AnimatePresence>
                {isActive && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[10001] bg-[#050000] flex flex-col items-center justify-center overflow-hidden"
                        >
                            {/* Close Button for Simulation Exit */}
                            <button 
                                onClick={() => setIsActive(false)}
                                className="absolute top-10 right-10 p-2 text-red-900 hover:text-red-500 transition-colors z-[10002]"
                            >
                                <X className="w-8 h-8" />
                            </button>

                            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                             style={{ backgroundImage: 'linear-gradient(rgba(220, 38, 38, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(220, 38, 38, 0.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
                        
                        <div className="relative z-10 flex flex-col items-center max-w-4xl w-full px-10 text-center">
                            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="w-24 h-24 rounded-full border-2 border-red-600 flex items-center justify-center mb-10 shadow-[0_0_50px_rgba(220,38,38,0.2)]">
                                <ShieldAlert className="w-10 h-10 text-red-500 animate-pulse" />
                            </motion.div>

                            <h1 className="text-6xl font-black text-red-500 uppercase tracking-tighter italic mb-4">GLOBAL_LOCKDOWN</h1>
                            <p className="text-[10px] font-black text-red-900 uppercase tracking-[0.8em] mb-12">Protocol_7_Active // Systems_Isolated</p>

                            <div className="w-full max-w-md space-y-6">
                                <div className="relative">
                                    <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-900" />
                                    <input 
                                        type="password"
                                        value={authCode}
                                        onChange={(e) => setAuthCode(e.target.value.toUpperCase())}
                                        placeholder="ENTER_RECOVERY_KEY"
                                        className="w-full bg-red-950/20 border border-red-900/30 rounded-full py-5 px-12 text-center text-[12px] font-mono font-black text-red-500 placeholder:text-red-950 focus:outline-none focus:border-red-600 transition-all uppercase"
                                    />
                                </div>
                                <button onClick={handleUnlock} disabled={isVerifying} className="w-full py-5 rounded-full bg-red-600 text-white text-[11px] font-black uppercase tracking-[0.4em] hover:bg-red-500 transition-all">
                                    {isVerifying ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Verify_Authority"}
                                </button>
                                <div className="text-[9px] font-black text-red-900 uppercase tracking-widest mt-8 animate-pulse">● {status}</div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
