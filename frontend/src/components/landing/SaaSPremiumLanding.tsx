"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Shield, Zap, Terminal, Activity, ChevronRight, Lock,
  Target, Globe, Cpu, Eye, Code, Command, Database,
  AlertTriangle, ShieldAlert, Radar, Scan, Fingerprint,
  ChevronLeft, Play, Pause
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AnimatedCounter } from "./AnimatedCounter";
import { GlowCard } from "./GlowCard";
import { ScrollReveal } from "./ScrollReveal";
import { ParticleField } from "./ParticleField";
import { TypingTerminal } from "./TypingTerminal";
import { StatusBadge } from "./StatusBadge";
import { SectionHeader } from "./SectionHeader";
import { FloatingOrb } from "./FloatingOrb";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SOC_CONCEPTS = [
  {
    icon: Radar,
    title: "SOC Monitoring",
    subtitle: "Real-time Surveillance",
    description: "24/7 continuous monitoring of your entire infrastructure. AI-powered anomaly detection catches threats before they escalate.",
    color: "from-cyan-500 to-blue-600",
    glowColor: "rgba(6, 182, 212, 0.3)",
    metrics: [{ label: "Events/sec", value: "1.2M" }, { label: "Detection", value: "<50ms" }],
  },
  {
    icon: ShieldAlert,
    title: "Threat Intelligence",
    subtitle: "Proactive Defense",
    description: "Global threat feeds, darknet monitoring, and adversary tracking. Know your enemy before they strike.",
    color: "from-purple-500 to-indigo-600",
    glowColor: "rgba(147, 51, 234, 0.3)",
    metrics: [{ label: "IoCs", value: "4.2B" }, { label: "Feeds", value: "200+" }],
  },
  {
    icon: Fingerprint,
    title: "Incident Response",
    subtitle: "Autonomous Containment",
    description: "AI-driven playbooks execute containment in seconds. Isolate compromised hosts, revoke credentials, block malicious IPs automatically.",
    color: "from-amber-500 to-orange-600",
    glowColor: "rgba(245, 158, 11, 0.3)",
    metrics: [{ label: "Response", value: "<1s" }, { label: "Auto-block", value: "99.7%" }],
  },
];

const TRAFFIC_ARCS = [
  { from: "Firewall", to: "IDS", angle: 45, color: "#06b6d4", label: "Filtered Traffic" },
  { from: "IDS", to: "SIEM", angle: 90, color: "#8b5cf6", label: "Alert Correlation" },
  { from: "SIEM", to: "SOAR", angle: 135, color: "#f59e0b", label: "Auto Response" },
  { from: "SOAR", to: "Firewall", angle: 180, color: "#ef4444", label: "Block Rule Push" },
  { from: "Firewall", to: "EDR", angle: 225, color: "#10b981", label: "Endpoint Telemetry" },
  { from: "EDR", to: "SIEM", angle: 270, color: "#3b82f6", label: "Log Aggregation" },
];

const SLIDER_FEATURES = [
  {
    title: "Autonomous Pentesting",
    description: "AI agents that probe your perimeter continuously using zero-day techniques and MITRE ATT&CK frameworks.",
    icon: Target,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    terminalLines: [
      "> deploying recon agent...",
      "> scanning 65535 ports...",
      "> CVE-2024-6387 detected on port 22",
      "> generating exploit payload...",
      "> access granted ✓",
    ],
  },
  {
    title: "Darknet Intelligence",
    description: "Monitor underground forums, marketplaces, and paste sites for leaked credentials and threat actor chatter.",
    icon: Eye,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    terminalLines: [
      "> connecting to tor relay...",
      "> scraping darknet forums...",
      "> ALERT: credential leak detected",
      "> matching 847 emails...",
      "> threat score: CRITICAL",
    ],
  },
  {
    title: "Neural Log Analysis",
    description: "LLM-powered triage that eliminates alert fatigue. Correlates events across billions of log entries in real-time.",
    icon: Brain,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    terminalLines: [
      "> ingesting 2.5M events/sec...",
      "> correlation engine active...",
      "> anomaly cluster detected",
      "> false positive filtered: 94%",
      "> actionable alert: 1 (verified)",
    ],
  },
];

const FEATURES = [
  { icon: Target, title: "Autonomous Pentesting", desc: "Deploy AI agents that probe your perimeter continuously using zero-day techniques.", highlight: "text-blue-500" },
  { icon: Database, title: "Dataset Intelligence", desc: "Access 40+ high-fidelity datasets (IoT, IDS, Malware) for custom model training.", highlight: "text-emerald-400" },
  { icon: Activity, title: "Telemetry Fusion", desc: "Real-time log aggregation with sub-millisecond querying capabilities.", highlight: "text-indigo-400" },
  { icon: Cpu, title: "Neural Engines", desc: "LLM-powered log analysis and incident triage to eliminate alert fatigue.", highlight: "text-purple-400" },
];

const METRICS = [
  { label: "Queries / sec", value: "2.5M+", trend: "+12%" },
  { label: "Threats Blocked", value: "99.98%", trend: "+0.01%" },
  { label: "P99 Latency", value: "14ms", trend: "-2ms" },
];

function Brain(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
      <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/>
      <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/>
      <path d="M3.477 10.896a4 4 0 0 1 .585-.396"/>
      <path d="M19.938 10.5a4 4 0 0 1 .585.396"/>
      <path d="M6 18a4 4 0 0 1-1.967-.516"/>
      <path d="M19.967 17.484A4 4 0 0 1 18 18"/>
    </svg>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ANIMATED ARC TRAFFIC SVG
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function ArcTrafficVisualization() {
  const [activeArc, setActiveArc] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveArc((prev) => (prev + 1) % TRAFFIC_ARCS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const cx = 300;
  const cy = 300;
  const r = 180;

  return (
    <div className="relative w-full max-w-[600px] mx-auto aspect-square">
      {/* Glow background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_70%)]" />

      <svg viewBox="0 0 600 600" className="w-full h-full">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Outer ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
        <circle cx={cx} cy={cy} r={r + 40} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>

        {/* SOCs positioned around circle */}
        {TRAFFIC_ARCS.map((arc, i) => {
          const angle = (i * 60 - 90) * (Math.PI / 180);
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          const isActive = i === activeArc;

          return (
            <g key={i}>
              {/* Connection line to center */}
              <line
                x1={cx} y1={cy} x2={x} y2={y}
                stroke={isActive ? arc.color : "rgba(255,255,255,0.05)"}
                strokeWidth={isActive ? 2 : 1}
                strokeDasharray={isActive ? "none" : "4 4"}
                opacity={isActive ? 1 : 0.3}
                filter={isActive ? "url(#glow)" : undefined}
              />

              {/* Animated pulse on active arc */}
              {isActive && (
                <>
                  <circle cx={x} cy={y} r="20" fill={arc.color} opacity="0.1">
                    <animate attributeName="r" from="20" to="40" dur="2s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" from="0.1" to="0" dur="2s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx={x} cy={y} r="8" fill={arc.color} opacity="0.3">
                    <animate attributeName="r" from="8" to="15" dur="1.5s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" from="0.3" to="0" dur="1.5s" repeatCount="indefinite"/>
                  </circle>
                </>
              )}

              {/* SOC Node */}
              <circle
                cx={x} cy={y} r="24"
                fill={isActive ? arc.color : "rgba(255,255,255,0.03)"}
                stroke={isActive ? arc.color : "rgba(255,255,255,0.1)"}
                strokeWidth={isActive ? 2 : 1}
                opacity={isActive ? 1 : 0.5}
              />

              {/* Label */}
              <text
                x={x} y={y + 40}
                textAnchor="middle"
                fill={isActive ? arc.color : "#666"}
                fontSize="11"
                fontWeight="700"
                fontFamily="monospace"
              >
                {arc.from}
              </text>
            </g>
          );
        })}

        {/* Center hub */}
        <circle cx={cx} cy={cy} r="40" fill="rgba(6,182,212,0.05)" stroke="rgba(6,182,212,0.2)" strokeWidth="1"/>
        <circle cx={cx} cy={cy} r="20" fill="rgba(6,182,212,0.1)" stroke="rgba(6,182,212,0.3)" strokeWidth="1"/>
        <text x={cx} y={cy + 4} textAnchor="middle" fill="#06b6d4" fontSize="10" fontWeight="900" fontFamily="monospace">
          SOC
        </text>

        {/* Animated data flow particles */}
        {(() => {
          const activeData = TRAFFIC_ARCS[activeArc];
          if (!activeData) return null;
          const fromIdx = TRAFFIC_ARCS.findIndex(a => a.from === activeData.from);
          const toIdx = TRAFFIC_ARCS.findIndex(a => a.to === activeData.to);
          const fromAngle = (fromIdx * 60 - 90) * (Math.PI / 180);
          const toAngle = (toIdx * 60 - 90) * (Math.PI / 180);
          const x1 = cx + r * Math.cos(fromAngle);
          const y1 = cy + r * Math.sin(fromAngle);
          const x2 = cx + r * Math.cos(toAngle);
          const y2 = cy + r * Math.sin(toAngle);

          return (
            <circle r="3" fill={activeData.color} filter="url(#glow)">
              <animateMotion dur="2s" repeatCount="indefinite" path={`M${x1},${y1} L${x2},${y2}`}/>
            </circle>
          );
        })()}

        {/* Arc label */}
        <text x={cx} y={cy + 70} textAnchor="middle" fill={TRAFFIC_ARCS[activeArc].color} fontSize="13" fontWeight="600" fontFamily="monospace">
          {TRAFFIC_ARCS[activeArc].label}
        </text>
      </svg>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SOC CONCEPT SLIDER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function SOCConceptSlider() {
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SOC_CONCEPTS.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + SOC_CONCEPTS.length) % SOC_CONCEPTS.length);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(next, 4000);
    return () => clearInterval(interval);
  }, [isPlaying, next]);

  const concept = SOC_CONCEPTS[current];

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Main card */}
      <div className="relative rounded-2xl border border-white/[0.08] bg-[#0A0A0F] overflow-hidden">
        {/* Top glow line */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"/>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Left: Concept info */}
          <div className="p-8 lg:p-12 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-6", `border-white/[0.08] bg-white/[0.02]`)}>
                  <concept.icon className={cn("w-4 h-4", `text-cyan-400`)} />
                  <span className="text-[11px] font-bold text-white uppercase tracking-widest">{concept.subtitle}</span>
                </div>

                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">{concept.title}</h3>
                <p className="text-[#A1A1AA] text-[15px] leading-relaxed mb-8">{concept.description}</p>

                {/* Metrics */}
                <div className="flex gap-8">
                  {concept.metrics.map((m, i) => (
                    <div key={i}>
                      <div className="text-2xl font-bold text-white">{m.value}</div>
                      <div className="text-[11px] text-[#A1A1AA] uppercase tracking-wider">{m.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Animated visualization */}
          <div className="relative h-64 lg:h-auto min-h-[300px] flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.08)_0%,transparent_70%)]"/>
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5 }}
                className="relative z-10"
              >
                <div className={cn("w-32 h-32 rounded-2xl flex items-center justify-center mx-auto", `bg-gradient-to-br ${concept.color}`)}>
                  <concept.icon className="w-16 h-16 text-white" />
                </div>
                {/* Orbiting particles */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full border border-white/5 relative">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 rounded-full bg-white/30"
                        style={{
                          top: "50%",
                          left: "50%",
                          transform: `rotate(${i * 120}deg) translateX(96px) translateY(-4px)`,
                          animation: `spin ${3 + i}s linear infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-4 left-8 lg:left-12 flex items-center gap-4 z-20">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            {isPlaying ? <Pause className="w-3 h-3 text-white" /> : <Play className="w-3 h-3 text-white" />}
          </button>
          <button onClick={prev} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <button onClick={next} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
          <div className="flex gap-2 ml-2">
            {SOC_CONCEPTS.map((_, i) => (
              <div
                key={i}
                className={cn("h-1 rounded-full transition-all duration-300", i === current ? "w-8 bg-cyan-500" : "w-2 bg-white/20")}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FEATURE SLIDER (3 rotating features)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function FeatureSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDER_FEATURES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const feature = SLIDER_FEATURES[current];

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
        >
          {/* Left: Info */}
          <div>
            <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-6", feature.border, feature.bg)}>
              <feature.icon className={cn("w-4 h-4", feature.color)} />
              <span className="text-[11px] font-bold text-white uppercase tracking-widest">{feature.title}</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">{feature.title}</h3>
            <p className="text-[#A1A1AA] text-[15px] leading-relaxed">{feature.description}</p>
          </div>

          {/* Right: Terminal */}
          <div className={cn("rounded-xl border overflow-hidden", feature.border, "bg-[#0A0A0F]")}>
            <div className="h-10 border-b border-white/[0.05] bg-white/[0.01] flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ED6A5E]"/>
              <div className="w-3 h-3 rounded-full bg-[#F4BF4F]"/>
              <div className="w-3 h-3 rounded-full bg-[#61C554]"/>
              <div className="text-[10px] text-slate-500 font-mono ml-4">bouclier-terminal</div>
            </div>
            <div className="p-5 min-h-[180px]">
              <TypingTerminal
                key={current}
                lines={feature.terminalLines}
                speed={25}
                lineDelay={600}
              />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="flex justify-center gap-3 mt-8">
        {SLIDER_FEATURES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              i === current ? "w-8 bg-white" : "w-2 bg-white/20 hover:bg-white/40"
            )}
          />
        ))}
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ANIMATED GRID BACKGROUND
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)"/>
      </svg>
      {/* Animated glow spots */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse"/>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: "1s"}}/>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN LANDING PAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function SaaSPremiumLanding() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const opacity1 = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#020205] text-[#A1A1AA] font-sans selection:bg-indigo-500/30 selection:text-white overflow-x-hidden">

      {/* ── ANIMATED BACKGROUND ── */}
      <AnimatedGrid />
      <ParticleField />
      <FloatingOrb size={400} color="rgba(99, 102, 241, 0.08)" delay={0} duration={10} className="top-20 left-1/4" />
      <FloatingOrb size={300} color="rgba(147, 51, 234, 0.06)" delay={2} duration={12} className="top-1/2 right-1/4" />
      <FloatingOrb size={250} color="rgba(6, 182, 212, 0.05)" delay={4} duration={14} className="bottom-1/4 left-1/3" />

      {/* ── SENIOR PRO NAVBAR ── */}
      <header className={cn(
        "fixed top-0 w-full z-50 transition-all duration-500",
        scrolled ? "bg-[#020205]/80 backdrop-blur-xl border-b border-white/[0.05] py-3" : "bg-transparent py-6"
      )}>
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 relative group cursor-pointer">
              <div className="absolute inset-0 bg-blue-500/20 blur-xl group-hover:bg-blue-500/40 transition-all opacity-0 group-hover:opacity-100"/>
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                <Shield className="w-5 h-5 text-white"/>
              </div>
              <span className="font-black text-xl tracking-tighter text-white ml-1 uppercase">Bouclier<span className="text-blue-400">.</span></span>
            </div>
            <nav className="hidden lg:flex items-center gap-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
              <a href="#platform" className="hover:text-white hover:tracking-[0.3em] transition-all duration-300">Platform</a>
              <a href="#soc" className="hover:text-white hover:tracking-[0.3em] transition-all duration-300">SOC</a>
              <a href="#traffic" className="hover:text-white hover:tracking-[0.3em] transition-all duration-300">Traffic</a>
              <a href="#pricing" className="hover:text-white hover:tracking-[0.3em] transition-all duration-300">Pricing</a>
              <div className="w-px h-3 bg-white/10"/>
              <div className="flex items-center gap-2 px-2 py-1 rounded bg-emerald-500/5 border border-emerald-500/10">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
                <span className="text-[9px] text-emerald-500">System Healthy</span>
              </div>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors hidden sm:block">Sign In</Link>
            <Link href="/overview">
              <button className="h-10 px-6 rounded-xl bg-white text-black text-[11px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all flex items-center gap-2 group">
                Deploy Hub <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform"/>
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 w-full overflow-hidden">

        {/* ── 1. HERO SECTION ── */}
        <section className="pt-40 md:pt-52 pb-24 px-6 flex flex-col items-center justify-center text-center min-h-[90vh] relative">
          <motion.div style={{ y: y1, opacity: opacity1 }} className="w-full max-w-4xl mx-auto z-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-md mb-8 hover:bg-white/[0.04] transition-colors cursor-pointer group"
            >
              <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"/>
              <span className="text-[12px] font-medium text-indigo-100">Introducing Autonomous Pentesting V2</span>
              <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-indigo-300 group-hover:translate-x-0.5 transition-all"/>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-[80px] font-semibold tracking-tighter text-white mb-6 leading-[1.05]"
            >
              Enterprise security,<br className="hidden md:block"/> engineered for speed.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg md:text-xl text-[#A1A1AA] mb-10 max-w-2xl mx-auto leading-relaxed font-normal"
            >
              Unify your offensive operations, live telemetry, and zero-trust architecture in one blazingly fast platform. Protect what matters without friction.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/overview">
                <button className="h-12 px-8 rounded-full bg-white text-black font-medium hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                  Start Building <ChevronRight className="w-4 h-4"/>
                </button>
              </Link>
              <button className="h-12 px-8 rounded-full border border-white/10 bg-white/[0.02] text-white font-medium hover:bg-white/[0.05] transition-all flex items-center gap-2 backdrop-blur-md">
                <Command className="w-4 h-4 text-slate-400"/> Read Documentation
              </button>
            </motion.div>
          </motion.div>

          {/* Glowing Product Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="relative w-full max-w-6xl mx-auto mt-24 z-20 group perspective-[2000px]"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#020205] via-transparent to-transparent z-10 h-full w-full pointer-events-none"/>
            <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-2xl blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-700"/>
            <div className="relative rounded-xl border border-white/[0.08] bg-[#0A0A0A] shadow-2xl overflow-hidden backdrop-blur-sm transform transition-transform duration-700 group-hover:rotate-x-2 group-hover:-translate-y-2">
              <div className="h-12 border-b border-white/[0.05] bg-white/[0.01] flex items-center px-4 gap-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-white/10"/>
                  <div className="w-3 h-3 rounded-full bg-white/10"/>
                  <div className="w-3 h-3 rounded-full bg-white/10"/>
                </div>
                <div className="w-full max-w-[200px] h-6 rounded-md bg-white/[0.03] border border-white/[0.05] mx-auto hidden md:flex items-center justify-center">
                  <span className="text-[10px] text-slate-500 font-mono">bouclier.app/dashboard</span>
                </div>
              </div>
              <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-80 group-hover:opacity-100 transition-opacity">
                <div className="col-span-2 space-y-6">
                  <div className="h-40 rounded-lg border border-white/[0.05] bg-gradient-to-b from-white/[0.03] to-transparent p-6 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-32 h-4 rounded bg-white/10"/>
                      <div className="w-16 h-4 rounded bg-emerald-500/20"/>
                    </div>
                    <svg className="absolute bottom-0 left-0 w-full h-24" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <path d="M0,100 L0,50 Q25,20 50,60 T100,30 L100,100 Z" fill="url(#grad)" opacity="0.3"/>
                      <path d="M0,50 Q25,20 50,60 T100,30" fill="none" stroke="rgba(99,102,241,1)" strokeWidth="2"/>
                      <defs>
                        <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="rgba(99,102,241,0.5)"/>
                          <stop offset="100%" stopColor="rgba(99,102,241,0)"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 rounded-lg border border-white/[0.05] bg-white/[0.01] p-4 flex flex-col justify-end">
                      <div className="w-12 h-8 rounded bg-white/10 mb-2"/>
                      <div className="w-24 h-2 rounded bg-white/5"/>
                    </div>
                    <div className="h-24 rounded-lg border border-white/[0.05] bg-white/[0.01] p-4 flex flex-col justify-end">
                      <div className="w-16 h-8 rounded bg-white/10 mb-2"/>
                      <div className="w-20 h-2 rounded bg-white/5"/>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-10 rounded-md border border-white/[0.05] bg-white/[0.02] flex items-center px-4">
                    <div className="w-4 h-4 rounded-full bg-red-400 mr-3"/>
                    <div className="w-full h-2 rounded bg-white/10"/>
                  </div>
                  <div className="h-10 rounded-md border border-white/[0.05] bg-white/[0.02] flex items-center px-4">
                    <div className="w-4 h-4 rounded-full bg-amber-400 mr-3"/>
                    <div className="w-full h-2 rounded bg-white/10"/>
                  </div>
                  <div className="h-32 rounded-lg border border-white/[0.05] bg-[#050505] p-4 relative font-mono text-[10px] text-slate-500 leading-relaxed overflow-hidden">
                    &gt; deploying agents<br/>
                    &gt; mapping subnets... ok<br/>
                    &gt; payload injected
                    <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#050505] to-transparent"/>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── 2. METRICS SHOWCASE ── */}
        <section className="py-20 border-y border-white/[0.05] bg-white/[0.01]">
          <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 divide-y md:divide-y-0 md:divide-x divide-white/[0.05]">
            {METRICS.map((metric, idx) => (
              <ScrollReveal key={idx} delay={idx * 0.1} className="flex flex-col items-center md:items-start pt-8 md:pt-0 md:pl-12 first:pt-0 first:md:pl-0">
                <div className="flex items-center gap-3 mb-2">
                  <AnimatedCounter
                    to={parseFloat(metric.value.replace(/[^0-9.]/g, ""))}
                    suffix={metric.value.replace(/[0-9.]/g, "")}
                    className="text-4xl md:text-5xl font-semibold text-white tracking-tighter"
                  />
                  <StatusBadge label={metric.trend} variant="success" />
                </div>
                <span className="text-[13px] font-medium text-[#A1A1AA]">{metric.label}</span>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ── 3. SOC CONCEPT SLIDER ── */}
        <section id="soc" className="py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <SectionHeader
              badge={{ icon: <Shield className="w-3.5 h-3.5 text-cyan-400" />, label: "SOC Operations" }}
              title="Security Operations Center, reimagined with AI."
              description="From monitoring to response, Bouclier's SOC platform automates the entire threat lifecycle. Human-speed defense is no longer enough."
            />
            <SOCConceptSlider />
          </div>
        </section>

        {/* ── 4. ARC TRAFFIC VISUALIZATION ── */}
        <section id="traffic" className="py-32 px-6 bg-white/[0.01] border-y border-white/[0.05] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.03)_0%,transparent_70%)]"/>
          <div className="max-w-6xl mx-auto relative z-10 grid lg:grid-cols-2 gap-16 items-center">
            <div className="max-w-lg">
              <SectionHeader
                badge={{ icon: <Activity className="w-3.5 h-3.5 text-cyan-400" />, label: "Network Traffic" }}
                title="Visualize your security flow."
                description="Watch how traffic flows through your security stack in real-time. From firewall to IDS, SIEM, SOAR, and back — every packet tracked."
                align="left"
              />
              <div className="grid grid-cols-2 gap-4">
                {TRAFFIC_ARCS.slice(0, 4).map((arc, i) => (
                  <div key={i} className="p-3 rounded-lg border border-white/[0.05] bg-white/[0.02]">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: arc.color}}/>
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">{arc.from} → {arc.to}</span>
                    </div>
                    <p className="text-[11px] text-[#A1A1AA]">{arc.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <ArcTrafficVisualization />
          </div>
        </section>

        {/* ── 5. FEATURE SLIDER ── */}
        <section id="platform" className="py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <SectionHeader
              badge={{ icon: <Zap className="w-3.5 h-3.5 text-indigo-400" />, label: "Core Features" }}
              title="Uncompromised power. Zero complexity."
              description="We completely reimagined what a security platform should feel like. Instant queries, autonomous offense, and invisible orchestration."
            />
            <FeatureSlider />
          </div>
        </section>

        {/* ── 6. FEATURES GRID ── */}
        <section className="py-32 px-6 bg-white/[0.01] border-y border-white/[0.05]">
          <div className="max-w-6xl mx-auto">
            <SectionHeader
              badge={{ icon: <Zap className="w-3.5 h-3.5 text-indigo-400" />, label: "Core Platform" }}
              title="Uncompromised power. Zero complexity."
              description="We completely reimagined what a security platform should feel like. Instant queries, autonomous offense, and invisible orchestration."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {FEATURES.map((feature, idx) => (
                <GlowCard key={idx} delay={idx * 0.1}>
                  <div className="p-8 md:p-10">
                    <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mb-8 relative z-10 shadow-sm group-hover:scale-105 transition-transform duration-500">
                      <feature.icon className={cn("w-5 h-5 transition-colors", feature.highlight)} />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-white tracking-tight relative z-10">{feature.title}</h3>
                    <p className="text-[#A1A1AA] text-[15px] leading-relaxed relative z-10">{feature.desc}</p>
                  </div>
                </GlowCard>
              ))}
            </div>
          </div>
        </section>

        {/* ── 7. CODE EXPERIENCE ── */}
        <section className="py-32 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_100%)]"/>
          <div className="max-w-6xl mx-auto relative z-10 grid lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal direction="left">
              <div className="max-w-lg">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-md mb-6">
                  <Code className="w-3.5 h-3.5 text-slate-400"/>
                  <span className="text-[12px] font-medium text-slate-300">Developer First</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter text-white mb-6 leading-tight">
                  Built for builders,<br/> engineered for operators.
                </h2>
                <p className="text-[#A1A1AA] mb-8 text-lg leading-relaxed">
                  Bouclier is API-first. Integrate directly into your CI/CD pipelines, trigger AI pentests on git pushes, and consume webhooks in sub-milliseconds.
                </p>
                <ul className="space-y-4 text-[15px] text-[#A1A1AA]">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500"/> Typesafe SDKs for React & Python
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500"/> Infrastructure as Code compatible
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500"/> Webhook Streaming pipelines
                  </li>
                </ul>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2}>
              <GlowCard glowColor="rgba(99, 102, 241, 0.1)">
                <div className="rounded-xl border border-white/[0.08] bg-[#0A0A0A] overflow-hidden">
                  <div className="h-12 border-b border-white/[0.05] bg-white/[0.01] flex items-center px-4 justify-between">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#ED6A5E]"/>
                      <div className="w-3 h-3 rounded-full bg-[#F4BF4F]"/>
                      <div className="w-3 h-3 rounded-full bg-[#61C554]"/>
                    </div>
                    <div className="text-[11px] text-[#A1A1AA] font-mono">bouclier.config.ts</div>
                  </div>
                  <div className="p-6 overflow-x-auto text-[13px] leading-relaxed font-mono">
                    <pre>
                      <span className="text-purple-400">import</span> {"{ "}Bouclier, AIStrategy{" }"} <span className="text-purple-400">from</span> <span className="text-green-400">"@bouclier/sdk"</span>;<br/><br/>
                      <span className="text-slate-500">// Initialize the Autonomous Sentinel</span><br/>
                      <span className="text-purple-400">const</span> client = <span className="text-purple-400">new</span> <span className="text-blue-300">Bouclier</span>({"{"}<br/>
                      {"  "}apiKey: process.env.<span className="text-blue-200">BOUCLIER_KEY</span>,<br/>
                      {"  "}mode: <span className="text-green-400">"zero-trust"</span><br/>
                      {"}"});<br/><br/>
                      <span className="text-purple-400">await</span> client.pentester.<span className="text-blue-300">deploy</span>({"{"}<br/>
                      {"  "}target: <span className="text-green-400">"production-cluster"</span>,<br/>
                      {"  "}strategy: AIStrategy.<span className="text-blue-200">MAXIMUM_PROBE</span>,<br/>
                      {"  "}autoPatch: <span className="text-amber-400">true</span><br/>
                      {"}"});
                    </pre>
                  </div>
                </div>
              </GlowCard>
            </ScrollReveal>
          </div>
        </section>

        {/* ── 8. PRICING ── */}
        <section id="pricing" className="py-32 px-6 bg-white/[0.01] border-y border-white/[0.05]">
          <div className="max-w-6xl mx-auto">
            <SectionHeader
              title="Transparent limits. Infinite scaling."
              description="Start for free, scale when you need the firepower."
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <ScrollReveal delay={0.1}>
                <GlowCard glowColor="rgba(255, 255, 255, 0.05)">
                  <div className="p-8">
                    <h3 className="text-lg font-medium text-white mb-2">Hobby</h3>
                    <p className="text-sm text-[#A1A1AA] mb-6">Perfect for side projects and local labs.</p>
                    <div className="flex items-baseline gap-1 mb-8">
                      <span className="text-5xl font-semibold tracking-tight text-white">$0</span>
                      <span className="text-[#A1A1AA]">/mo</span>
                    </div>
                    <button className="w-full h-10 rounded-lg bg-white/[0.05] text-white hover:bg-white/[0.1] transition-colors border border-white/[0.05] mb-8 font-medium text-sm">Deploy Free</button>
                    <ul className="space-y-4 text-sm text-[#A1A1AA]">
                      <li className="flex gap-3 items-center"><ChevronRight className="w-4 h-4 text-indigo-400"/> Up to 5 Endpoints</li>
                      <li className="flex gap-3 items-center"><ChevronRight className="w-4 h-4 text-indigo-400"/> Community Intelligence</li>
                      <li className="flex gap-3 items-center"><ChevronRight className="w-4 h-4 text-indigo-400"/> 7-day log retention</li>
                    </ul>
                  </div>
                </GlowCard>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <GlowCard glowColor="rgba(99, 102, 241, 0.15)">
                  <div className="p-8 relative">
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"/>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-medium text-white">Pro</h3>
                      <StatusBadge label="Recommended" variant="info" />
                    </div>
                    <p className="text-sm text-[#A1A1AA] mb-6">For scaling teams that need automation.</p>
                    <div className="flex items-baseline gap-1 mb-8">
                      <span className="text-5xl font-semibold tracking-tight text-white">$99</span>
                      <span className="text-[#A1A1AA]">/mo / user</span>
                    </div>
                    <button className="w-full h-10 rounded-lg bg-white text-black hover:bg-slate-200 transition-colors mb-8 font-medium text-sm shadow-[0_0_15px_rgba(255,255,255,0.1)]">Start Free Trial</button>
                    <ul className="space-y-4 text-sm text-[#A1A1AA]">
                      <li className="flex gap-3 items-center"><ChevronRight className="w-4 h-4 text-indigo-400"/> Unlimited Endpoints</li>
                      <li className="flex gap-3 items-center"><ChevronRight className="w-4 h-4 text-indigo-400"/> Autonomous AI Pentesting</li>
                      <li className="flex gap-3 items-center"><ChevronRight className="w-4 h-4 text-indigo-400"/> 1-Year Log Retention</li>
                      <li className="flex gap-3 items-center"><ChevronRight className="w-4 h-4 text-indigo-400"/> Priority Slack Support</li>
                    </ul>
                  </div>
                </GlowCard>
              </ScrollReveal>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="relative border-t border-white/[0.08] bg-[#020205] pt-24 pb-12 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"/>
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-20">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white"/>
                </div>
                <span className="font-black text-xl text-white tracking-tighter uppercase">Bouclier<span className="text-blue-400">.</span></span>
              </div>
              <p className="text-sm text-slate-500 max-w-xs leading-relaxed mb-8 font-medium">
                The next generation of autonomous cybersecurity infrastructure. Engineered for teams that demand absolute speed and zero friction.
              </p>
              <div className="flex gap-4">
                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Lock className="w-3 h-3"/> SOC2 TYPE II
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Shield className="w-3 h-3"/> ISO 27001
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-6">Product</h4>
              <ul className="space-y-4 text-[13px] text-slate-500 font-medium">
                <li><a href="#" className="hover:text-white transition-colors">Tactical Hub</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Neural Engine</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Darknet Map</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Fleet Ops</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-6">Resources</h4>
              <ul className="space-y-4 text-[13px] text-slate-500 font-medium">
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">API Keys</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blue Team Labs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-6">Company</h4>
              <ul className="space-y-4 text-[13px] text-slate-500 font-medium">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-6">Infrastructure</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[12px] font-bold text-emerald-400">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"/>
                  All Systems Operational
                </div>
                <p className="text-[10px] text-slate-600 font-mono">Uptime: 99.998%</p>
                <p className="text-[10px] text-slate-600 font-mono">Location: CASABLANCA-1</p>
              </div>
            </div>
          </div>
          <div className="pt-12 border-t border-white/[0.05] flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-6 text-[10px] font-black text-slate-600 uppercase tracking-widest">
              <span>© 2026 BOUCLIER SECURITY INC.</span>
              <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-white/10"/>
              <span className="text-slate-500">ENGINEERED IN CASABLANCA</span>
            </div>
            <div className="flex gap-8 text-[11px] text-slate-500 font-bold uppercase tracking-widest">
              <a href="#" className="hover:text-white transition-all hover:tracking-[0.2em]">Twitter</a>
              <a href="#" className="hover:text-white transition-all hover:tracking-[0.2em]">GitHub</a>
              <a href="#" className="hover:text-white transition-all hover:tracking-[0.2em]">Discord</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CheckCircle2(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  );
}
