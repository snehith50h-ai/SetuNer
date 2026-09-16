"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Layers, Shield, Activity, Compass, ChevronRight, CheckCircle2 } from "lucide-react";

const SECTIONS = [
  { id: "introduction", title: "Introduction", icon: BookOpen },
  { id: "the-challenge", title: "The Regional Challenge", icon: Compass },
  { id: "architecture", title: "Intelligence Architecture", icon: Layers },
  { id: "core-modules", title: "Core Modules", icon: Activity },
  { id: "security", title: "Security & Access", icon: Shield },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("introduction");

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 font-sans selection:bg-brand-500 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center px-6 md:px-12">
        <Link href="/login" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mr-8">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-semibold">Back to Login</span>
        </Link>
        <div className="w-px h-6 bg-slate-200 mx-4 hidden md:block"></div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-900 text-white flex items-center justify-center font-bold text-[10px] tracking-wider">
            SN
          </div>
          <span className="font-bold text-slate-900 tracking-tight">SETU-ROUTE Documentation</span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row px-4 md:px-8 py-12 gap-12 items-start relative">
        
        {/* Table of Contents Sidebar */}
        <aside className="w-full md:w-64 shrink-0 md:sticky md:top-28 space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-3">Contents</h3>
          {SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => scrollTo(sec.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeSection === sec.id 
                  ? "bg-white shadow-sm text-brand-600 border border-slate-100" 
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <sec.icon className={`w-4 h-4 ${activeSection === sec.id ? "text-brand-500" : "opacity-50"}`} />
              {sec.title}
            </button>
          ))}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 max-w-3xl pb-32">
          
          <div className="mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">
              SETU-ROUTE Guidebook
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed font-light">
              The unified intelligence platform for real-time logistics optimization and disruption prediction in the North Eastern Region.
            </p>
          </div>

          <section id="introduction" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-200 pb-2">
              <BookOpen className="w-6 h-6 text-brand-500" /> Introduction
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              <strong className="text-slate-800">SETU-ROUTE</strong> (System for Evaluation of Transport Utilities & Regional Optimization in Uncertain Terrain Environments) is a bespoke logistics platform developed for the Ministry of Development of North Eastern Region (MDoNER).
            </p>
            <p className="text-slate-600 leading-relaxed">
              Its primary use case is ensuring the uninterrupted flow of essential supplies (medical resources, fuel, food) across highly volatile geographies prone to sudden extreme weather and terrain failures. By combining GIS telematics, AI prediction models, and live ground-truth reporting, SETU-ROUTE acts as a unified command center.
            </p>
            <div className="mt-6 bg-brand-50 border border-brand-100 rounded-2xl p-6 flex gap-4">
              <div className="shrink-0 mt-1">
                <CheckCircle2 className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <h4 className="font-semibold text-brand-900 mb-1">Primary Objective</h4>
                <p className="text-sm text-brand-700 leading-relaxed">
                  To transition reactive disaster logistics into a proactive, AI-driven routing ecosystem that saves lives, time, and resources by foreseeing supply chain disruptions before they occur.
                </p>
              </div>
            </div>
          </section>

          <section id="the-challenge" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-200 pb-2">
              <Compass className="w-6 h-6 text-amber-500" /> The Regional Challenge
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              The North Eastern Region (NER) of India spans eight states with some of the most challenging topography in the world. High-altitude mountain passes, dense tropical forests, and turbulent river systems define the landscape.
            </p>
            <ul className="space-y-4 my-6">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                <span className="text-slate-700"><strong className="text-slate-900">Geological Instability:</strong> Constant threat of landslides blocking critical arterial highways (e.g., NH-6).</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                <span className="text-slate-700"><strong className="text-slate-900">Climatic Extremes:</strong> Sudden flash floods capable of wiping out bridges and submerging low-lying supply routes.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                <span className="text-slate-700"><strong className="text-slate-900">Information Asymmetry:</strong> Dispatchers historically relied on delayed, fragmented communication from field operators leading to trapped convoys.</span>
              </li>
            </ul>
          </section>

          <section id="architecture" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-200 pb-2">
              <Layers className="w-6 h-6 text-indigo-500" /> Intelligence Architecture
            </h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              SETU-ROUTE operates on a closed-loop intelligence cycle consisting of four distinct pillars:
            </p>
            
            <div className="grid gap-6">
              <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-xs text-slate-500">1</span>
                  Real-Time Sensing
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Ingests multi-modal data streams including vehicle GPS telemetry, IMD (Indian Meteorological Department) satellite rainfall feeds, and authenticated offline reports from the Field PWA.
                </p>
              </div>

              <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-xs text-slate-500">2</span>
                  AI Disruption Prediction
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Our proprietary machine learning engine calculates localized hazard risks (landslides, flash floods) and assigns a dynamic "passability score" to every highway segment.
                </p>
              </div>

              <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-xs text-slate-500">3</span>
                  Multi-Criteria Routing
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Advanced network graph optimization immediately computes the safest, fastest alternate corridors the moment a primary route's risk threshold is breached.
                </p>
              </div>

              <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-xs text-slate-500">4</span>
                  Decision Support
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Provides dispatchers with a "single pane of glass" to confirm automated reroutes, trigger emergency protocols, and notify relevant medical or fuel stakeholders.
                </p>
              </div>
            </div>
          </section>

          <section id="core-modules" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-200 pb-2">
              <Activity className="w-6 h-6 text-rose-500" /> Core Modules
            </h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Command Center Dashboard</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  The nerve center for HQ and Regional Admins. Visualizes live fleet positions, active incidents, and corridor health. Includes the Timeline Inspector to review historical events and predictive graphs for future planning.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Interactive GIS Map</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  A high-fidelity 3D map overlaying weather patterns, terrain slope steepness, and active hazard zones directly onto the road network. Allows operators to visually assess the spatial context of a disruption.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Field PWA (Progressive Web App)</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  Built for officers operating in zero-connectivity zones. Allows for offline incident reporting with geotagging and image capture. Syncs automatically to the Command Center the moment the device reconnects to a network.
                </p>
              </div>
            </div>
          </section>

          <section id="security" className="scroll-mt-32">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-200 pb-2">
              <Shield className="w-6 h-6 text-emerald-500" /> Security & Access
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              As a government platform, SETU-ROUTE enforces strict Role-Based Access Control (RBAC). Actions are heavily audited and constrained based on jurisdictional boundaries.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse border border-slate-200 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="p-4 font-semibold border-b border-slate-200">Role</th>
                    <th className="p-4 font-semibold border-b border-slate-200">Scope</th>
                    <th className="p-4 font-semibold border-b border-slate-200">Capabilities</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  <tr>
                    <td className="p-4 font-medium text-slate-900 border-r border-slate-100">Super Admin (HQ)</td>
                    <td className="p-4 text-slate-600 border-r border-slate-100">Pan-NER</td>
                    <td className="p-4 text-slate-600">Global oversight, user management, system overrides.</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-slate-900 border-r border-slate-100">Regional Admin</td>
                    <td className="p-4 text-slate-600 border-r border-slate-100">State Level</td>
                    <td className="p-4 text-slate-600">State-wide routing control, resource allocation.</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-slate-900 border-r border-slate-100">District Officer</td>
                    <td className="p-4 text-slate-600 border-r border-slate-100">District Level</td>
                    <td className="p-4 text-slate-600">Incident verification, local dispatcher coordination.</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-slate-900 border-r border-slate-100">Field Officer</td>
                    <td className="p-4 text-slate-600 border-r border-slate-100">On-Ground</td>
                    <td className="p-4 text-slate-600">Incident reporting (offline), status updates.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
