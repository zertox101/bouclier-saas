'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Shield, LayoutDashboard, AlertTriangle, Activity,
  FileText, BookOpen, Radar, LogOut,
  ChevronLeft, ChevronRight, Crosshair, Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const analystNavSections = [
  {
    title: "SOC Operations",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/soc/dashboard" },
      { icon: AlertTriangle, label: "Incidents", href: "/soc/incidents", badge: "Live" },
      { icon: Activity, label: "Alerts", href: "/soc/alerts" },
      { icon: FileText, label: "Cases", href: "/soc/cases" },
    ]
  },
  {
    title: "Intelligence",
    items: [
      { icon: BookOpen, label: "Playbooks", href: "/soc/playbooks" },
      { icon: Radar, label: "Threat Intel", href: "/soc/threat-intel" },
      { icon: Brain, label: "Analysis", href: "/soc/analysis" },
      { icon: Crosshair, label: "Hunting", href: "/soc/hunting" },
    ]
  },
  {
    title: "Reporting",
    items: [
      { icon: FileText, label: "Reports", href: "/soc/reports" },
      { icon: Activity, label: "Audit Trail", href: "/soc/audit" },
    ]
  }
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
}

export default function AnalystSidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userInitial = (session?.user?.name?.[0] || 'A').toUpperCase();
  const userName = session?.user?.name || 'Analyst';

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 bottom-0 z-[60] flex flex-col',
        'transition-all duration-300 ease-in-out',
        'border-r',
        isCollapsed ? 'w-[68px]' : 'w-[240px]'
      )}
      style={{
        background: 'rgba(8, 12, 18, 0.97)',
        backdropFilter: 'blur(24px)',
        borderColor: 'rgba(255,255,255,0.06)',
      }}
    >
      <div className={cn(
        'flex items-center h-16 px-4 shrink-0 border-b',
        'border-white/[0.05]',
        isCollapsed ? 'justify-center' : 'gap-3'
      )}>
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-lg bg-amber-600 flex items-center justify-center shadow-lg shadow-amber-600/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#080C12] shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
        </div>

        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col overflow-hidden"
            >
              <span className="text-[13px] font-bold text-white leading-tight tracking-wide">
                SOC Analyst
              </span>
              <span className="text-[10px] text-amber-400 leading-tight font-medium">
                Security Operations
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              'p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-white/5 transition-all shrink-0',
              isCollapsed && 'hidden'
            )}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="mx-auto mt-2 p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-white/5 transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      <nav className="flex-1 overflow-y-auto scrollbar-hide py-4 px-2 space-y-5">
        {analystNavSections.map((section) => (
          <div key={section.title}>
            {!isCollapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-600">
                {section.title}
              </p>
            )}

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      'group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 relative',
                      isActive
                        ? 'bg-amber-600/15 text-white border border-amber-500/20'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]',
                      isCollapsed && 'justify-center px-0'
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-amber-400 rounded-r-full" />
                    )}

                    <item.icon
                      className={cn(
                        'shrink-0 transition-colors',
                        isCollapsed ? 'w-5 h-5' : 'w-4 h-4',
                        isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'
                      )}
                    />

                    {!isCollapsed && (
                      <span className="flex-1 text-[13px] font-medium truncate">
                        {item.label}
                      </span>
                    )}

                    {!isCollapsed && item.badge && (
                      <span className={cn(
                        'text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide',
                        item.badge === 'Live' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                        'bg-white/5 text-slate-500 border border-white/5'
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mx-4 h-px bg-white/[0.05]" />

      <div className={cn('p-3 shrink-0 flex flex-col gap-4', isCollapsed && 'items-center')}>
        {isCollapsed ? (
          <button
            onClick={() => signOut()}
            title={userName}
            className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-bold text-sm shadow-md hover:scale-105 transition-transform"
          >
            {userInitial}
          </button>
        ) : (
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all group cursor-pointer">
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {userInitial}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-[#080C12]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-white truncate">{userName}</p>
              <p className="text-[10px] text-amber-400 font-medium">SOC Analyst</p>
            </div>
            <button
              onClick={() => signOut()}
              className="p-1 rounded text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
