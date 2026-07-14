"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X, ChevronRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TacticalConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  severity?: 'critical' | 'warning' | 'info';
  confirmText?: string;
}

export function TacticalConfirm({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  severity = 'critical',
  confirmText = 'Execute_Command'
}: TacticalConfirmProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={cn(
              "relative w-full max-w-lg bg-[#0a0a0f] border rounded-[40px] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.9)]",
              severity === 'critical' ? 'border-red-500/30' : 'border-blue-500/30'
            )}
          >
            {/* Header Scanline Effect */}
            <div className={cn(
              "absolute top-0 left-0 right-0 h-1",
              severity === 'critical' ? 'bg-red-500 shadow-[0_0_20px_#EF4444]' : 'bg-blue-500 shadow-[0_0_20px_#3B82F6]'
            )} />

            <div className="p-10 space-y-8">
               <div className="flex items-center gap-6">
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl",
                    severity === 'critical' ? 'bg-red-600/20 text-red-500' : 'bg-blue-600/20 text-blue-500'
                  )}>
                     <ShieldAlert className="w-8 h-8" />
                  </div>
                  <div>
                     <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-1 italic">Tactical_Authorization</h2>
                     <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">{title}</h3>
                  </div>
               </div>

               <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                  <p className="text-[13px] text-slate-300 leading-relaxed font-bold uppercase tracking-tight">
                    {message}
                  </p>
               </div>

               <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4 text-[9px] font-mono text-slate-600 uppercase tracking-widest px-2">
                     <Zap className="w-3 h-3" /> Root_Access_Confirmed // Level_4_Audit_Ready
                  </div>
                  <div className="flex gap-4">
                     <button 
                        onClick={onClose}
                        className="flex-1 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all"
                     >
                        Abort_Action
                     </button>
                     <button 
                        onClick={() => { onConfirm(); onClose(); }}
                        className={cn(
                          "flex-[1.5] py-5 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3 group",
                          severity === 'critical' ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'
                        )}
                     >
                        {confirmText} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                     </button>
                  </div>
               </div>
            </div>

            {/* Footer decoration */}
            <div className="h-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-center">
               <div className="w-24 h-0.5 bg-white/10 rounded-full" />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
