"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Server, Network, ShieldCheck } from "lucide-react";
import DatacenterSensors from "./expert/DatacenterSensors";
import NetworkHub from "./expert/NetworkHub";
import DeviceSecurity from "./expert/DeviceSecurity";

const TABS = [
  { id: "datacenter", label: "Datacenter Sensors", icon: Server },
  { id: "network", label: "Europe Network Hub", icon: Network },
  { id: "devices", label: "Employee Device Security", icon: ShieldCheck },
];

export default function PremiumExpertDashboard() {
  const [activeTab, setActiveTab] = useState(TABS[0].id);

  return (
    <div className="min-h-[90vh] bg-[#1a122e] rounded-3xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-purple-500/20 flex flex-col font-sans relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #181124 0%, #110c18 100%)' }}>
      
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/4 w-1/2 h-64 bg-purple-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-1/2 h-64 bg-blue-600/10 blur-[100px] pointer-events-none" />

      {/* Tabs Header */}
      <div className="flex items-center gap-4 mb-6 z-10">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                isActive
                  ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/20"
                  : "bg-transparent text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <tab.icon className={`w-4 h-4 ${isActive ? "text-purple-400" : ""}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 relative z-10 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === "datacenter" && (
            <motion.div
              key="datacenter"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full"
            >
              <DatacenterSensors />
            </motion.div>
          )}
          {activeTab === "network" && (
            <motion.div
              key="network"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full"
            >
              <NetworkHub />
            </motion.div>
          )}
          {activeTab === "devices" && (
            <motion.div
              key="devices"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full"
            >
              <DeviceSecurity />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
