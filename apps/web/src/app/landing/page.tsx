"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Radio,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Compass,
  Layers,
  Activity,
  ChevronRight,
  Clock,
  Sparkles,
  MapPin,
  Truck,
  CheckCircle2,
} from "lucide-react";
import { useLanguageStore, translations } from "@/lib/i18n";
import { LanguageSelector } from "@/components/ui/LanguageSelector";

const CORRIDORS = [
  { code: "NH-27", name: "Guwahati - Siliguri Corridor", status: "PASSABLE", risk: "LOW", score: 94 },
  { code: "NH-6", name: "Guwahati - Shillong - Silchar", status: "DISRUPTED", risk: "CRITICAL", score: 28, alert: "Sonapur Landslide" },
  { code: "NH-10", name: "Siliguri - Gangtok Highway", status: "WARNING", risk: "ELEVATED", score: 58, alert: "Heavy Rainfall" },
  { code: "NH-29", name: "Dimapur - Kohima Highway", status: "PASSABLE", risk: "LOW", score: 88 },
  { code: "NH-37", name: "Nagaon - Dibrugarh Highway", status: "PASSABLE", risk: "LOW", score: 91 },
];

export default function LandingPage() {
  const { currentLanguage, t } = useLanguageStore();
  const [liveTime, setLiveTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setLiveTime(now.toLocaleTimeString("en-IN", { hour12: false, timeZone: "Asia/Kolkata" }) + " IST");
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col font-sans relative selection:bg-red-500 selection:text-white overflow-hidden">
      {/* Ambient Lighting Glow Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
        <div className="absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full bg-red-600/20 blur-[120px]" />
        <div className="absolute top-1/4 -right-24 w-[600px] h-[600px] rounded-full bg-blue-900/40 blur-[140px]" />
        <div className="absolute top-2/3 -left-20 w-80 h-80 rounded-full bg-rose-600/15 blur-[120px]" />
        <div className="absolute -bottom-24 right-1/4 w-[500px] h-[500px] rounded-full bg-indigo-900/30 blur-[140px]" />
      </div>

      {/* Top Header */}
      <header className="glass-dark border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-md shadow-red-500/25">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-base text-white">SETU-ROUTE</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-900/50 text-blue-300 border border-blue-700/50 shadow-xs">
                  SIH 2026 / 26002
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-tight">
                Ministry of Development of North Eastern Region (MDoNER)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl glass-pill border border-white/5 text-xs font-semibold text-slate-300">
              <Clock className="w-3.5 h-3.5 text-red-500" />
              <span>{liveTime || "19:30:00 IST"}</span>
            </div>
            <LanguageSelector />
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md shadow-red-500/20"
            >
              <span>{t("nav_command_center")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 relative z-10">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Mission & Core Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-xs font-semibold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
                <span className="font-bold">OPERATIONAL STATUS: ACTIVE</span>
                <span className="text-emerald-700">|</span>
                <span className="text-emerald-200">8 Corridors Monitored</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  See the road before you send the vehicle.
                </h1>
                <p className="text-base text-slate-300 leading-relaxed max-w-2xl">
                  Real-time accessibility intelligence, disruption prediction, and adaptive multi-criteria routing for essential logistics across the North Eastern Region.
                </p>
              </div>

              {/* Primary Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold tracking-wide transition-all shadow-lg shadow-red-500/25 hover:scale-[1.02]"
                >
                  <span>Open Command Center</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/map"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl glass-pill border border-white/5 hover:bg-white/10 text-white text-sm font-bold transition-all shadow-glass-sm"
                >
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span>View Network Status</span>
                </Link>

                <Link
                  href="/reports"
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl glass-pill border border-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-semibold transition-all shadow-glass-sm"
                >
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>Field PWA</span>
                </Link>
              </div>

              {/* Operational Proof Points */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                <div className="glass-card glass-card-hover p-4 rounded-3xl border border-white/10 shadow-glass-sm">
                  <div className="text-2xl font-extrabold text-white">8 States</div>
                  <div className="text-xs text-slate-400 mt-0.5">Assam, Meghalaya, Sikkim + 5</div>
                </div>
                <div className="glass-card glass-card-hover p-4 rounded-3xl border border-white/10 shadow-glass-sm">
                  <div className="text-2xl font-extrabold text-amber-400">92.4%</div>
                  <div className="text-xs text-slate-400 mt-0.5">Corridor Passability Rate</div>
                </div>
                <div className="glass-card glass-card-hover p-4 rounded-3xl border border-white/10 shadow-glass-sm">
                  <div className="text-2xl font-extrabold text-emerald-400">&lt; 1.2s</div>
                  <div className="text-xs text-slate-400 mt-0.5">Dynamic Reroute Time</div>
                </div>
              </div>
            </div>

            {/* Right Column: Regional GIS Preview Panel */}
            <div className="lg:col-span-5 glass-dark rounded-3xl border border-white/10 shadow-glass overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10 bg-black/20 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Regional Corridor Intelligence
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-900/50 text-emerald-300 border border-emerald-700/50 shadow-xs">
                  LIVE TELEMETRY
                </span>
              </div>

              {/* Corridor List Table */}
              <div className="divide-y divide-white/10">
                {CORRIDORS.map((c) => (
                  <div key={c.code} className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{c.code}</span>
                        <span className="text-xs text-slate-300 font-medium">{c.name}</span>
                      </div>
                      {c.alert && (
                        <div className="flex items-center gap-1 text-xs font-bold text-rose-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{c.alert}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border backdrop-blur-xs ${
                          c.status === "PASSABLE"
                            ? "bg-emerald-900/50 text-emerald-300 border-emerald-700/50"
                            : c.status === "WARNING"
                            ? "bg-amber-900/50 text-amber-300 border-amber-700/50"
                            : "bg-rose-900/50 text-rose-300 border-rose-700/50 animate-pulse"
                        }`}
                      >
                        {c.status}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono mt-1">Score: {c.score}/100</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Map Launch Callout */}
              <div className="p-4 bg-black/20 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Interactive GIS with Terrain & Slope Risk</span>
                <Link
                  href="/map"
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
                >
                  <span>Open GIS Map</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 4 Pillars of Intelligence Architecture */}
        <section className="border-t border-white/10 py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                System Architecture
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-1 tracking-tight">
                Closed-Loop Accessibility & Logistics Intelligence
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-card glass-card-hover p-6 rounded-3xl border border-white/10 space-y-2.5 shadow-glass-sm">
                <div className="w-10 h-10 rounded-2xl bg-blue-900/50 border border-blue-700/50 flex items-center justify-center text-blue-400 shadow-xs">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">1. Real-Time Sensing</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Ingests vehicle GPS telemetry, IMD rainfall feeds, road clearance sensor logs, and authenticated offline field reports.
                </p>
              </div>

              <div className="glass-card glass-card-hover p-6 rounded-3xl border border-white/10 space-y-2.5 shadow-glass-sm">
                <div className="w-10 h-10 rounded-2xl bg-amber-900/50 border border-amber-700/50 flex items-center justify-center text-amber-400 shadow-xs">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">2. AI Disruption Prediction</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Gradient-boosted machine learning calculates landslide risk, flash flood likelihood, and road accessibility scores per highway segment.
                </p>
              </div>

              <div className="glass-card glass-card-hover p-6 rounded-3xl border border-white/10 space-y-2.5 shadow-glass-sm">
                <div className="w-10 h-10 rounded-2xl bg-indigo-900/50 border border-indigo-700/50 flex items-center justify-center text-indigo-400 shadow-xs">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">3. Multi-Criteria Routing</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Network graph optimization dynamically computes fastest, lowest-risk, and weather-resilient alternate corridors with ETA predictions.
                </p>
              </div>

              <div className="glass-card glass-card-hover p-6 rounded-3xl border border-white/10 space-y-2.5 shadow-glass-sm">
                <div className="w-10 h-10 rounded-2xl bg-emerald-900/50 border border-emerald-700/50 flex items-center justify-center text-emerald-400 shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">4. Decision Support</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Command center dispatchers confirm automated reroutes, dispatch field response, and notify critical medical and fuel consignments.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="glass-dark border-t border-white/10 py-6 text-slate-400 text-xs relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-slate-200 font-semibold">SETU-ROUTE Platform</span> — Ministry of Development of North Eastern Region (MDoNER), Government of India.
          </div>
          <div className="flex items-center gap-6 font-medium">
            <Link href="/" className="hover:text-white transition-colors">Command Center</Link>
            <Link href="/map" className="hover:text-white transition-colors">GIS Map</Link>
            <Link href="/reports" className="hover:text-white transition-colors">Field PWA</Link>
            <Link href="/admin" className="hover:text-white transition-colors">System Health</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
