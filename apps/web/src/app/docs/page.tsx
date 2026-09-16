"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Layers, Shield, Activity, Compass, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const SECTIONS = [
  { id: "introduction", title: "Introduction", icon: BookOpen },
  { id: "the-challenge", title: "The Regional Challenge", icon: Compass },
  { id: "architecture", title: "Intelligence Architecture", icon: Layers },
  { id: "core-modules", title: "Core Modules", icon: Activity },
  { id: "security", title: "Security & Access", icon: Shield },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("introduction");

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = SECTIONS.map(s => document.getElementById(s.id));
      const scrollPosition = window.scrollY + 250; // offset

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const el = sectionElements[i];
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(SECTIONS[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.offsetTop - 120;
      window.scrollTo({ top: offsetTop, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-brand-500 selection:text-white relative overflow-hidden">
      
      {/* Liquid Ambient Backgrounds */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-blue-600 blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[40%] -left-[10%] w-[40vw] h-[40vw] rounded-full bg-rose-600 blur-[100px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-[10%] right-[20%] w-[60vw] h-[60vw] rounded-full bg-purple-600 blur-[140px]" 
        />
      </div>

      {/* Header (Liquid Glass) */}
      <header className="fixed top-0 inset-x-0 z-50 bg-slate-950/40 backdrop-blur-2xl border-b border-white/5 h-20 flex items-center px-6 md:px-12 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/login" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
              <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold tracking-wide">Back</span>
            </Link>
            
            <div className="w-px h-8 bg-white/10 hidden md:block"></div>
            
            <div className="flex items-center gap-4">
              {/* Logo from login */}
              <div className="relative w-10 h-10 rounded-full border-[2px] border-[#0f172a] bg-white flex flex-col items-center justify-start pt-[5px] overflow-hidden shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                <span className="text-[7px] font-black tracking-[0.1em] text-[#0f172a] leading-[1]">SETU</span>
                <span className="text-[7px] font-black tracking-[0.1em] text-[#0f172a] leading-[1]">NER</span>
                <div className="absolute bottom-[-1px] left-1/2 -translate-x-1/2 w-[110%]">
                  <svg viewBox="0 0 100 45" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                    <path d="M50 5 L15 45 L85 45 Z" fill="#0f172a" />
                    <path d="M50 5 L35 23 L42 26 L50 18 L58 27 L65 22 Z" fill="white" />
                    <path d="M25 18 L-5 45 L55 45 Z" fill="#0284c7" />
                    <path d="M25 18 L12 30 L18 32 L25 26 L32 33 L38 29 Z" fill="white" />
                    <path d="M75 14 L45 45 L105 45 Z" fill="#0ea5e9" />
                    <path d="M75 14 L62 26 L68 29 L75 23 L82 31 L88 26 Z" fill="white" />
                    <path d="M-10 40 Q 25 30 50 42 T 110 38 L 110 45 L -10 45 Z" fill="#38bdf8" />
                    <path d="M-10 43 Q 25 35 50 44 T 110 42 L 110 45 L -10 45 Z" fill="#0284c7" opacity="0.5" />
                  </svg>
                </div>
              </div>
              <span className="font-bold text-white tracking-tight text-lg">SETU-NER <span className="font-light text-slate-400">Docs</span></span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row px-4 md:px-8 py-32 gap-12 items-start relative z-10">
        
        {/* Liquid Drop Sidebar */}
        <aside className="w-full md:w-64 shrink-0 md:sticky md:top-32 space-y-2 relative">
          <div className="absolute -left-4 top-0 bottom-0 w-px bg-white/5" />
          
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 px-4">Contents</h3>
          
          <div className="flex flex-col gap-2 relative">
            {SECTIONS.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => scrollTo(sec.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 relative group ${
                    isActive ? "text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {/* Liquid Active Drop Background */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-white/10 border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-md"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}

                  {/* Left Liquid Indicator Pill */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className="absolute -left-[17px] w-1.5 h-6 bg-brand-500 rounded-r-full shadow-[0_0_15px_rgba(14,165,233,0.8)]"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}

                  <sec.icon className={`w-4 h-4 relative z-10 transition-colors duration-300 ${isActive ? "text-brand-400" : "opacity-50 group-hover:opacity-100"}`} />
                  <span className="relative z-10 tracking-wide">{sec.title}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 max-w-3xl pb-32">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-20"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[10px] font-bold tracking-widest uppercase mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse shadow-[0_0_10px_rgba(14,165,233,0.8)]" />
              Official Guidebook
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight leading-[1.1]">
              SETU-NER <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-blue-400 to-purple-400">
                Intelligence Platform
              </span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed font-light max-w-2xl">
              The unified command center for real-time logistics optimization and disruption prediction in the North Eastern Region.
            </p>
          </motion.div>

          <div className="space-y-32">
            
            <Section id="introduction" icon={BookOpen} title="Introduction">
              <p className="leading-relaxed mb-6 text-lg font-light">
                <strong className="text-white font-semibold">SETU-NER</strong> (System for Evaluation of Transport Utilities & Regional Optimization in Uncertain Terrain Environments) is a bespoke logistics platform developed for the Ministry of Development of North Eastern Region (MDoNER).
              </p>
              <p className="leading-relaxed mb-8 text-lg font-light text-slate-400">
                Its primary use case is ensuring the uninterrupted flow of essential supplies (medical resources, fuel, food) across highly volatile geographies prone to sudden extreme weather and terrain failures.
              </p>
              
              <div className="relative overflow-hidden bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl group hover:border-brand-500/30 transition-colors duration-500 shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-500/20 transition-colors duration-700" />
                <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-start">
                  <div className="shrink-0 p-3 bg-brand-500/20 rounded-2xl border border-brand-500/30 text-brand-400 shadow-[0_0_20px_rgba(14,165,233,0.2)]">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xl mb-3 tracking-tight">Primary Objective</h4>
                    <p className="text-slate-300 leading-relaxed font-light">
                      To transition reactive disaster logistics into a proactive, AI-driven routing ecosystem that saves lives, time, and resources by foreseeing supply chain disruptions before they occur.
                    </p>
                  </div>
                </div>
              </div>
            </Section>

            <Section id="the-challenge" icon={Compass} title="The Regional Challenge" color="amber">
              <p className="leading-relaxed mb-8 text-lg font-light text-slate-400">
                The North Eastern Region (NER) of India spans eight states with some of the most challenging topography in the world. High-altitude mountain passes, dense tropical forests, and turbulent river systems define the landscape.
              </p>
              <div className="grid gap-4">
                {[
                  { title: "Geological Instability", desc: "Constant threat of landslides blocking critical arterial highways (e.g., NH-6)." },
                  { title: "Climatic Extremes", desc: "Sudden flash floods capable of wiping out bridges and submerging routes." },
                  { title: "Information Asymmetry", desc: "Dispatchers relied on delayed communication leading to trapped convoys." }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-5 p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors shadow-lg backdrop-blur-sm">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.8)]" />
                    <div>
                      <strong className="text-white block mb-1 text-lg">{item.title}</strong>
                      <span className="text-slate-400 font-light">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="architecture" icon={Layers} title="Intelligence Architecture" color="indigo">
              <p className="leading-relaxed mb-10 text-lg font-light text-slate-400">
                SETU-NER operates on a closed-loop intelligence cycle consisting of four distinct pillars, processing gigabytes of telemetry in real-time.
              </p>
              
              <div className="grid gap-6">
                {[
                  { num: "1", title: "Real-Time Sensing", desc: "Ingests multi-modal data streams including GPS telemetry, IMD satellite feeds, and offline Field PWA reports." },
                  { num: "2", title: "AI Disruption Prediction", desc: "Proprietary ML engine calculates hazard risks (landslides, floods) and assigns a dynamic passability score." },
                  { num: "3", title: "Multi-Criteria Routing", desc: "Network graph optimization computes safest, fastest alternate corridors the moment risk thresholds are breached." },
                  { num: "4", title: "Decision Support", desc: "Provides dispatchers with a single pane of glass to confirm reroutes and notify medical/fuel stakeholders." }
                ].map((pillar, i) => (
                  <div key={i} className="p-8 bg-white/[0.03] border border-white/10 rounded-3xl backdrop-blur-md hover:bg-white/[0.06] hover:border-indigo-500/30 transition-all duration-500 group relative overflow-hidden shadow-xl">
                    <div className="absolute -inset-x-full bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-[shimmer_2s_infinite] transition-opacity" />
                    <h3 className="font-bold text-white flex items-center gap-4 mb-4 text-xl tracking-tight">
                      <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-black shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                        {pillar.num}
                      </span>
                      {pillar.title}
                    </h3>
                    <p className="text-slate-400 leading-relaxed font-light pl-12">
                      {pillar.desc}
                    </p>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="core-modules" icon={Activity} title="Core Modules" color="rose">
              <div className="space-y-12">
                {[
                  { title: "Command Center Dashboard", desc: "The nerve center for HQ and Regional Admins. Visualizes live fleet positions, active incidents, and corridor health. Includes the Timeline Inspector." },
                  { title: "Interactive GIS Map", desc: "High-fidelity 3D map overlaying weather patterns, terrain slope steepness, and active hazard zones directly onto the road network." },
                  { title: "Field PWA (Progressive Web App)", desc: "Built for officers in zero-connectivity zones. Allows offline incident reporting with geotagging. Syncs automatically when reconnected." }
                ].map((mod, i) => (
                  <div key={i} className="relative pl-8 border-l-2 border-white/10 hover:border-rose-500/50 transition-colors duration-500">
                    <div className="absolute left-[-5px] top-2 w-2 h-2 rounded-full bg-white/20 hover:bg-rose-500 transition-colors" />
                    <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{mod.title}</h3>
                    <p className="text-slate-400 leading-relaxed font-light text-lg">
                      {mod.desc}
                    </p>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="security" icon={Shield} title="Security & Access" color="emerald">
              <p className="leading-relaxed mb-8 text-lg font-light text-slate-400">
                As a government platform, SETU-NER enforces strict Role-Based Access Control (RBAC). Actions are heavily audited and constrained based on jurisdictional boundaries.
              </p>
              <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-2xl">
                <table className="w-full text-left text-sm border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.05]">
                      <th className="p-6 font-semibold text-white tracking-wide">Role</th>
                      <th className="p-6 font-semibold text-white tracking-wide">Scope</th>
                      <th className="p-6 font-semibold text-white tracking-wide">Capabilities</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      { role: "Super Admin (HQ)", scope: "Pan-NER", cap: "Global oversight, user management, system overrides." },
                      { role: "Regional Admin", scope: "State Level", cap: "State-wide routing control, resource allocation." },
                      { role: "District Officer", scope: "District Level", cap: "Incident verification, local dispatcher coordination." },
                      { role: "Field Officer", scope: "On-Ground", cap: "Incident reporting (offline), status updates." }
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-white/[0.03] transition-colors">
                        <td className="p-6 font-medium text-white">{row.role}</td>
                        <td className="p-6 text-slate-400"><span className="px-3 py-1 bg-white/10 border border-white/5 rounded-full text-xs font-semibold shadow-inner">{row.scope}</span></td>
                        <td className="p-6 text-slate-400 font-light">{row.cap}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          </div>
        </main>
      </div>
    </div>
  );
}

// Wrapper for scrolling animation sections
function Section({ id, icon: Icon, title, color = "brand", children }: any) {
  const colors: Record<string, string> = {
    brand: "text-brand-400 border-brand-500/30 bg-brand-500/10 shadow-[0_0_20px_rgba(14,165,233,0.15)]",
    amber: "text-amber-400 border-amber-500/30 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.15)]",
    indigo: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.15)]",
    rose: "text-rose-400 border-rose-500/30 bg-rose-500/10 shadow-[0_0_20px_rgba(243,33,113,0.15)]",
    emerald: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.15)]",
  };

  return (
    <motion.section 
      id={id} 
      className="scroll-mt-32"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center gap-5 mb-10">
        <div className={`p-4 rounded-2xl border ${colors[color]} backdrop-blur-md`}>
          <Icon className="w-7 h-7" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}
