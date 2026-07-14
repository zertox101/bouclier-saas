'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Shield, LayoutDashboard, Terminal,
  Settings, Globe, ShieldAlert, Activity,
  Crosshair, Radar, Lock, LogOut,
  User, Fingerprint, Zap, Skull,
  Ghost, ChevronLeft, ChevronRight,
  Target, Brain, Package, Bot, Database, Bug, Radio, Server, Power, Cloud
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { TacticalConfirm } from '../shared/TacticalConfirm';
import { ThemeToggle } from '../shared/ThemeToggle';
import { useState } from 'react';

const navSections = [
  {
    title: "Executive Control",
    items: [
      { icon: Power,             label: "SaaS Control Center", href: "/saas-control",       badge: "Core" },
      { icon: LayoutDashboard, label: "Overview",            href: "/overview",               badge: "Live" },
      { icon: ShieldAlert,     label: "Operation SOC Expert", href: "/operation-soc-expert", badge: "New"  },
      { icon: Shield,          label: "Premium Expert View",  href: "/premium-expert",        badge: "Pro"  },
      { icon: Database,        label: "Available Datasets",   href: "/datasets",               badge: "Expert" },
      { icon: Radar,           label: "Threat Intelligence", href: "/threat-monitor",        badge: "AI"  },
    ]
  },
  {
    title: "Tactical Operations",
    items: [
      { icon: Crosshair,   label: "AI Pentester",      href: "/ai-pentester",   badge: "AI" },
      { icon: Terminal,    label: "Kali Linux Toolkit", href: "/tools",          badge: "Live" },
      { icon: Terminal,    label: "Kali Terminal",    href: "/terminal-kali",    badge: "Shell" },
      { icon: Server,      label: "RAPTOR AI",          href: "/raptor",         badge: "AI" },
      { icon: Target,      label: "Red Team Ops",      href: "/red-team" },
      { icon: Bug,         label: "RedHound Pro",      href: "/red-hound",    badge: "Pro" },
      { icon: Server,      label: "Infrastructure Status", href: "/infrastructure", badge: "Live" },
      { icon: Radio,       label: "WireTapper SIGINT", href: "/wiretapper",   badge: "HW" },
      { icon: Skull,       label: "Malware Lab",       href: "/malware-lab",  isPro: true },
      { icon: Shield,      label: "Offensive Consultant", href: "/offensive-consultant", badge: "Expert" },
      { icon: Crosshair,   label: "Neural Pentest Suite", href: "/neural-pentest",      badge: "Elite" },
      { icon: Shield,      label: "WSTG Web Scanner",    href: "/wstg-scanner",         badge: "Pro" },
    ]
  },
  {
    title: "Global Intelligence (Gotham Suite)",
    items: [
      { icon: Globe,       label: "Gaia 3D (Threat Map)", href: "/threat-map-pro" },
      { icon: Activity,    label: "Intelligence Graph",  href: "/graph",        badge: "New" },
      { icon: Fingerprint, label: "OSINT 360 Explorer",  href: "/osint",        isPro: true },
      { icon: Brain,       label: "Sentinel AI Hub",     href: "/sentinel",     badge: "AI" },
      { icon: Zap,         label: "Mini Agent Core",     href: "/mini-agent",    badge: "Elite" },
      { icon: Database,    label: "Neural Reasoning",    href: "/ai-reasoning", badge: "Live" },
      { icon: Shield,      label: "Mythos Intelligence", href: "/mythos-intelligence", badge: "Elite" },
    ]
  },
  {
    title: "Infrastructure Security",
    items: [
      { icon: Cloud,       label: "Cloud Security",      href: "/cloud-security", badge: "New" },
      { icon: Server,      label: "Kubernetes Security", href: "/k8s-security",   badge: "New" },
      { icon: Shield,      label: "Active Directory Lab", href: "/ad-lab",         badge: "New" },
      { icon: Radio,       label: "IoT Security",        href: "/iot-security",   badge: "New" },
      { icon: Globe,       label: "Smart City Emulator", href: "/smart-city",    badge: "New" },
    ]
  },
  {
    title: "Collaboration & Reporting",
    items: [
      { icon: ShieldAlert, label: "Alert Inbox",         href: "/alerts" },
      { icon: Bug,         label: "Detection Engineering", href: "/detection-engineering", badge: "New" },
      { icon: Package,     label: "Advanced Reports",   href: "/reports" },
      { icon: Ghost,       label: "Secure Chat",         href: "/chat" },
    ]
  }
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname   = usePathname();
  const { data: session } = useSession();
  const [showKillConfirm, setShowKillConfirm] = useState(false);

  const executeLockdown = () => {
    window.dispatchEvent(new CustomEvent('kill-switch-trigger'));
    setShowKillConfirm(false);
  };

  const userInitial = (session?.user?.name?.[0] || 'R').toUpperCase();
  const userName    = session?.user?.name || 'Administrator';

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
      {/* ── Brand ── */}
      <div className={cn(
        'flex items-center h-16 px-4 shrink-0 border-b',
        'border-white/[0.05]',
        isCollapsed ? 'justify-center' : 'gap-3'
      )}>
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
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
                Bouclier
              </span>
              <span className="text-[10px] text-blue-400 leading-tight font-medium">
                Tactical OS
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-1 ml-auto">
          {!isCollapsed && <ThemeToggle />}
          <Link
            href="/settings"
            className={cn(
              'p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-white/5 transition-all shrink-0',
              isCollapsed && 'hidden'
            )}
            title="System Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>
          {/* Collapse toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              'p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-white/5 transition-all shrink-0',
              isCollapsed && 'hidden'
            )}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expand button when collapsed */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="mx-auto mt-2 p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-white/5 transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto scrollbar-hide py-4 px-2 space-y-5">
        {navSections.map((section) => (
          <div key={section.title}>
            {/* Section Label */}
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
                        ? 'bg-blue-600/15 text-white border border-blue-500/20'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]',
                      isCollapsed && 'justify-center px-0'
                    )}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-400 rounded-r-full" />
                    )}

                    <item.icon
                      className={cn(
                        'shrink-0 transition-colors',
                        isCollapsed ? 'w-5 h-5' : 'w-4 h-4',
                        isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
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
                        item.badge === 'AI'   ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20' :
                        item.badge === 'New'  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' :
                        item.badge === 'Live' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                                                'bg-white/5 text-slate-500 border border-white/5'
                      )}>
                        {item.badge}
                      </span>
                    )}

                    {!isCollapsed && item.isPro && !item.badge && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Divider ── */}
      <div className="mx-4 h-px bg-white/[0.05]" />

      {/* ── User Footer ── */}
      <div className={cn('p-3 shrink-0 flex flex-col gap-4', isCollapsed && 'items-center')}>
        {!isCollapsed && (
          <Link 
            href="/danger-zone"
            className="group px-4 py-4 rounded-2xl bg-red-600/5 border border-red-500/10 hover:bg-red-600/10 hover:border-red-500/30 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-600/10 flex items-center justify-center border border-red-500/20">
                <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] font-black text-white uppercase tracking-widest">Danger_Zone</p>
                <p className="text-[8px] font-black text-red-500/60 uppercase tracking-widest">Level 5 Access</p>
              </div>
            </div>
            <ChevronRight className="w-3 h-3 text-slate-700 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
          </Link>
        )}

        {isCollapsed ? (
          <button
            onClick={() => signOut()}
            title={userName}
            className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-sm shadow-md hover:scale-105 transition-transform"
          >
            {userInitial}
          </button>
        ) : (
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all group cursor-pointer">
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {userInitial}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-[#080C12]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-white truncate">{userName}</p>
              <p className="text-[10px] text-blue-400 font-medium">Root Terminal</p>
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
      {/* Emergency Confirmation Dialog */}
      <TacticalConfirm 
        isOpen={showKillConfirm}
        onClose={() => setShowKillConfirm(false)}
        onConfirm={executeLockdown}
        title="Execute_Global_Lockdown"
        message="This action will isolate all neural nodes and disconnect the perimeter firewall immediately. All active sessions will be terminated."
        confirmText="Confirm_Isolation"
      />
    </aside>
  );
}
