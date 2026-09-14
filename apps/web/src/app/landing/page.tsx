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
    <div className="min-h-screen bg-mesh-canvas text-slate-900 flex flex-col font-sans relative selection:bg-brand-500 selection:text-white overflow-hidden">
      {/* Ambient Lighting Glow Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-brand-500/15 blur-[120px]" />
        <div className="absolute top-1/4 -right-24 w-96 h-96 rounded-full bg-sky-400/12 blur-[130px]" />
        <div className="absolute top-2/3 -left-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute -bottom-24 right-1/4 w-[480px] h-[480px] rounded-full bg-purple-500/10 blur-[140px]" />
      </div>

      {/* Top Header */}
      <header className="glass-header border-b border-white/70 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-500 flex items-center justify-center shadow-md shadow-brand-500/25">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-base text-slate-900">SETU-ROUTE</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50/80 text-brand-700 border border-brand-200 shadow-xs">
                  SIH 2026 / 26002
                </span>
              </div>
              <p className="text-[10px] text-slate-500 tracking-tight">
                Ministry of Development of North Eastern Region (MDoNER)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl glass-pill text-xs font-semibold text-slate-700">
              <Clock className="w-3.5 h-3.5 text-brand-600" />
              <span>{liveTime || "19:30:00 IST"}</span>
            </div>
            <LanguageSelector />
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md shadow-brand-500/20"
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
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50/80 border border-emerald-300/60 text-emerald-800 text-xs font-semibold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
                <span className="font-bold">OPERATIONAL STATUS: ACTIVE</span>
                <span className="text-emerald-300">|</span>
                <span>8 Corridors Monitored</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                  See the road before you send the vehicle.
                </h1>
                <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
                  Real-time accessibility intelligence, disruption prediction, and adaptive multi-criteria routing for essential logistics across the North Eastern Region.
                </p>
              </div>

              {/* Primary Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold tracking-wide transition-all shadow-lg shadow-brand-500/25 hover:scale-[1.02]"
                >
                  <span>Open Command Center</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/map"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl glass-pill hover:bg-white/90 text-slate-800 text-sm font-bold transition-all shadow-glass-sm"
                >
                  <Layers className="w-4 h-4 text-brand-600" />
                  <span>View Network Status</span>
                </Link>

                <Link
                  href="/reports"
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl glass-pill hover:bg-white/90 text-slate-700 hover:text-slate-900 text-sm font-semibold transition-all shadow-glass-sm"
                >
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <span>Field PWA</span>
                </Link>
              </div>

              {/* Operational Proof Points */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/60">
                <div className="glass-card glass-card-hover p-4 rounded-3xl border border-white/80 shadow-glass-sm">
                  <div className="text-2xl font-extrabold text-slate-900">8 States</div>
                  <div className="text-xs text-slate-500 mt-0.5">Assam, Meghalaya, Sikkim + 5</div>
                </div>
                <div className="glass-card glass-card-hover p-4 rounded-3xl border border-white/80 shadow-glass-sm">
                  <div className="text-2xl font-extrabold text-amber-600">92.4%</div>
                  <div className="text-xs text-slate-500 mt-0.5">Corridor Passability Rate</div>
                </div>
                <div className="glass-card glass-card-hover p-4 rounded-3xl border border-white/80 shadow-glass-sm">
                  <div className="text-2xl font-extrabold text-emerald-600">&lt; 1.2s</div>
                  <div className="text-xs text-slate-500 mt-0.5">Dynamic Reroute Time</div>
                </div>
              </div>
            </div>

            {/* Right Column: Regional GIS Preview Panel */}
            <div className="lg:col-span-5 glass-panel rounded-3xl border border-white/80 shadow-glass overflow-hidden">
              <div className="px-5 py-4 border-b border-white/60 bg-white/40 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-brand-600" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Regional Corridor Intelligence
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50/80 text-emerald-700 border border-emerald-300/60 shadow-xs">
                  LIVE TELEMETRY
                </span>
              </div>

              {/* Corridor List Table */}
              <div className="divide-y divide-white/50">
                {CORRIDORS.map((c) => (
                  <div key={c.code} className="p-4 hover:bg-white/60 transition-colors flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{c.code}</span>
                        <span className="text-xs text-slate-600 font-medium">{c.name}</span>
                      </div>
                      {c.alert && (
                        <div className="flex items-center gap-1 text-xs font-bold text-rose-600">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{c.alert}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border backdrop-blur-xs ${
                          c.status === "PASSABLE"
                            ? "bg-emerald-50/80 text-emerald-700 border-emerald-300/60"
                            : c.status === "WARNING"
                            ? "bg-amber-50/80 text-amber-700 border-amber-300/60"
                            : "bg-rose-50/80 text-rose-700 border-rose-300/60 animate-pulse"
                        }`}
                      >
                        {c.status}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono mt-1">Score: {c.score}/100</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Map Launch Callout */}
              <div className="p-4 bg-white/40 border-t border-white/60 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Interactive GIS with Terrain & Slope Risk</span>
                <Link
                  href="/map"
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                >
                  <span>Open GIS Map</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 4 Pillars of Intelligence Architecture */}
        <section className="border-t border-white/60 py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                System Architecture
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
                Closed-Loop Accessibility & Logistics Intelligence
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-card glass-card-hover p-6 rounded-3xl border border-white/80 space-y-2.5 shadow-glass-sm">
                <div className="w-10 h-10 rounded-2xl bg-brand-50/80 border border-brand-200/80 flex items-center justify-center text-brand-600 shadow-xs">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">1. Real-Time Sensing</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Ingests vehicle GPS telemetry, IMD rainfall feeds, road clearance sensor logs, and authenticated offline field reports.
                </p>
              </div>

              <div className="glass-card glass-card-hover p-6 rounded-3xl border border-white/80 space-y-2.5 shadow-glass-sm">
                <div className="w-10 h-10 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-center text-amber-600 shadow-xs">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">2. AI Disruption Prediction</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Gradient-boosted machine learning calculates landslide risk, flash flood likelihood, and road accessibility scores per highway segment.
                </p>
              </div>

              <div className="glass-card glass-card-hover p-6 rounded-3xl border border-white/80 space-y-2.5 shadow-glass-sm">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 flex items-center justify-center text-indigo-600 shadow-xs">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">3. Multi-Criteria Routing</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Network graph optimization dynamically computes fastest, lowest-risk, and weather-resilient alternate corridors with ETA predictions.
                </p>
              </div>

              <div className="glass-card glass-card-hover p-6 rounded-3xl border border-white/80 space-y-2.5 shadow-glass-sm">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">4. Decision Support</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Command center dispatchers confirm automated reroutes, dispatch field response, and notify critical medical and fuel consignments.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="glass-header border-t border-white/70 py-6 text-slate-500 text-xs relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-slate-800 font-semibold">SETU-ROUTE Platform</span> — Ministry of Development of North Eastern Region (MDoNER), Government of India.
          </div>
          <div className="flex items-center gap-6 font-medium">
            <Link href="/" className="hover:text-brand-600 transition-colors">Command Center</Link>
            <Link href="/map" className="hover:text-brand-600 transition-colors">GIS Map</Link>
            <Link href="/reports" className="hover:text-brand-600 transition-colors">Field PWA</Link>
            <Link href="/admin" className="hover:text-brand-600 transition-colors">System Health</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
