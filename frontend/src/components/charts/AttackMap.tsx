'use client';
import React from 'react';

export const AttackMap = () => {
    return (
        <div className="w-full h-[300px] bg-slate-900 rounded-xl relative overflow-hidden flex items-center justify-center border border-slate-800">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950"></div>
            
            {/* Simulation of Map dots */}
            <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
            <div className="absolute top-1/3 left-1/2 w-2 h-2 bg-yellow-500 rounded-full animate-ping delay-75"></div>
            <div className="absolute top-2/3 right-1/4 w-2 h-2 bg-blue-500 rounded-full animate-ping delay-150"></div>
            
            <p className="z-10 text-slate-500 font-mono text-xs">
                Global Threat Map [Simulation Mode]
            </p>
        </div>
    );
}