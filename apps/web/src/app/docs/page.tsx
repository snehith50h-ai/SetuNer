"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search, 
  Terminal, 
  Cpu, 
  Network, 
  BookOpen, 
  ChevronRight, 
  Menu, 
  X,
  Copy,
  CheckCircle2,
  ExternalLink,
  Code
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- CONTENT DATA ---

const DOC_PAGES = {
  "overview": {
    category: "Getting Started",
    title: "Overview",
    icon: BookOpen,
    content: (
      <div className="space-y-6">
        <p className="text-slate-600 leading-relaxed text-lg">
          SETU-NER is an AI-powered logistics intelligence platform designed for the Ministry of Development of North Eastern Region (MDoNER). It provides real-time disruption prediction and dynamic rerouting across the 8 North Eastern states.
        </p>
        
        <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4 border-b border-slate-200 pb-2">Key Capabilities</h3>
        <ul className="space-y-4 text-slate-600">
          <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> <span><strong>Real-time Telemetry:</strong> Ingests GPS and IMD (meteorological) data streams with sub-second latency.</span></li>
          <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> <span><strong>Predictive ML Pipeline:</strong> Gradient Boosting models predict landslide and flood risks before they occur.</span></li>
          <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> <span><strong>Offline-First Edge Clients:</strong> PWA field reporting works in zero-connectivity mountain zones using IndexedDB.</span></li>
        </ul>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 mt-8">
          <h4 className="font-semibold text-blue-900 mb-2 text-sm uppercase tracking-wider">Note on Environments</h4>
          <p className="text-blue-800 text-sm">
            The production environment runs on specialized GovCloud infrastructure. For local development, ensure your `.env` is configured with the staging database URLs.
          </p>
        </div>
      </div>
    )
  },
  "architecture": {
    category: "System Design",
    title: "Architecture",
    icon: Network,
    content: (
      <div className="space-y-6">
        <p className="text-slate-600 leading-relaxed">
          The system follows an event-driven microservices architecture optimized for high-throughput spatial data processing.
        </p>

        <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4 border-b border-slate-200 pb-2">Infrastructure Layers</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2"><Terminal className="w-4 h-4 text-slate-400"/> Frontend (Client)</h4>
            <p className="text-sm text-slate-600">Next.js 14 App Router, React Server Components, Zustand for state management, MapLibre GL for WebGL spatial rendering.</p>
          </div>
          <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2"><Cpu className="w-4 h-4 text-slate-400"/> Backend (API)</h4>
            <p className="text-sm text-slate-600">FastAPI (Python 3.11), Uvicorn ASGI, Pydantic V2 validation, WebSocket gateway for live telemetry broadcasting.</p>
          </div>
          <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2"><Network className="w-4 h-4 text-slate-400"/> Data Persistence</h4>
            <p className="text-sm text-slate-600">PostgreSQL 16 with PostGIS for spatial queries, Redis 7 for Pub/Sub messaging and ephemeral telemetry caching.</p>
          </div>
        </div>

        <CodeBlock language="bash" title="Local Stack Startup">
{`# Start the Redis cache
docker run -d -p 6379:6379 redis:alpine

# Start FastAPI backend
cd apps/api
uvicorn app.main:app --reload --port 8008

# Start Next.js client
cd apps/web
npm run dev`}
        </CodeBlock>
      </div>
    )
  },
  "ml-pipeline": {
    category: "System Design",
    title: "Machine Learning Pipeline",
    icon: Cpu,
    content: (
      <div className="space-y-6">
        <p className="text-slate-600 leading-relaxed">
          The ML engine continuously monitors all 8 North Eastern highway corridors, calculating localized hazard risks to assign a dynamic passability score (0-100).
        </p>

        <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4 border-b border-slate-200 pb-2">Disruption Risk Predictor</h3>
        <p className="text-slate-600 text-sm mb-4">
          We utilize a Scikit-Learn <code>GradientBoostingClassifier</code> trained on 10 years of historical landslide and flood data across the NER corridors.
        </p>

        <div className="bg-slate-900 rounded-xl p-5 text-slate-300 font-mono text-sm overflow-x-auto shadow-inner">
          <div className="text-slate-500 mb-2">// Feature vector structure</div>
          <div><span className="text-purple-400">const</span> <span className="text-blue-300">features</span> = [</div>
          <div className="pl-4">rainfall_intensity_mm_hr, <span className="text-slate-500">// IMD API</span></div>
          <div className="pl-4">soil_saturation_index,</div>
          <div className="pl-4">topographic_slope_gradient,</div>
          <div className="pl-4">fleet_speed_degradation_pct</div>
          <div>];</div>
        </div>

        <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4 border-b border-slate-200 pb-2">Physics-Aware ETA Engine</h3>
        <p className="text-slate-600 mb-4">
          Standard distance-over-speed calculations fail in mountain logistics. SETU-NER uses a multi-factor topographic penalty engine.
        </p>
        
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm text-slate-800 text-center">
          ETA = Base_Time × (Surface_Factor) × (Rainfall_Factor) × (Gradient_Penalty) + Queue_Delay
        </div>
      </div>
    )
  },
  "api-reference": {
    category: "Developers",
    title: "API Reference",
    icon: Code,
    content: (
      <div className="space-y-6">
        <p className="text-slate-600 leading-relaxed">
          The SETU-NER backend exposes a REST API for state mutations and a WebSocket gateway for high-frequency telemetry.
        </p>

        <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4 border-b border-slate-200 pb-2">REST Endpoints</h3>
        
        <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
          <div className="bg-slate-50 p-3 border-b border-slate-200 flex items-center gap-3">
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded">GET</span>
            <code className="text-sm font-semibold text-slate-700">/api/v1/corridors/status</code>
          </div>
          <div className="p-4 bg-white">
            <p className="text-sm text-slate-600 mb-3">Returns the live operational status and ML risk scores of all monitored highways.</p>
            <CodeBlock language="json" title="Response">
{`{
  "data": [
    {
      "id": "nh-6-sonapur",
      "status": "RESTRICTED",
      "risk_score": 82.5,
      "weather_condition": "HEAVY_RAIN"
    }
  ]
}`}
            </CodeBlock>
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4 border-b border-slate-200 pb-2">WebSocket Gateway</h3>
        <p className="text-slate-600 text-sm mb-4">
          Connect to <code>wss://api.setu-ner.gov.in/ws/telemetry</code> to receive a firehose of fleet coordinate updates. Authentication requires a valid JWT passed in the sub-protocol header.
        </p>
      </div>
    )
  }
};

// --- COMPONENTS ---

const CodeBlock = ({ language, title, children }: { language: string, title?: string, children: React.ReactNode }) => {
  const [copied, setCopied] = useState(false);
  
  const copy = () => {
    navigator.clipboard.writeText(children?.toString() || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 bg-[#0f111a] my-4 shadow-sm">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-[#1a1d27] border-b border-white/10">
          <span className="text-xs text-slate-400 font-mono">{title}</span>
          <button onClick={copy} className="text-slate-400 hover:text-white transition-colors">
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      )}
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono text-slate-300">
          <code>{children}</code>
        </pre>
      </div>
    </div>
  );
};

export default function TechDocsPage() {
  const [activePageId, setActivePageId] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const activePage = DOC_PAGES[activePageId as keyof typeof DOC_PAGES];

  // Group pages by category
  const categories = Object.entries(DOC_PAGES).reduce((acc, [id, page]) => {
    if (!acc[page.category]) acc[page.category] = [];
    acc[page.category].push({ id, ...page });
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-brand-500 selection:text-white flex flex-col">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 h-14 flex items-center px-4 md:px-6 justify-between">
        <div className="flex items-center gap-4">
          <button className="md:hidden p-1 text-slate-500" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          
          <Link href="/login" className="flex items-center gap-2 group">
            {/* Minimal Logo */}
            <div className="w-7 h-7 rounded bg-slate-900 flex items-center justify-center">
              <svg viewBox="0 0 100 45" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-auto">
                <path d="M50 5 L15 45 L85 45 Z" fill="#38bdf8" />
                <path d="M50 5 L35 23 L42 26 L50 18 L58 27 L65 22 Z" fill="white" />
              </svg>
            </div>
            <span className="font-bold text-slate-900 tracking-tight text-sm hidden sm:block">SETU-NER</span>
            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-mono ml-1 hidden sm:block">v2.0</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex relative group cursor-text">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-slate-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search documentation..." 
              className="pl-9 pr-4 py-1.5 bg-slate-100 border border-slate-200 rounded-md text-sm w-64 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded text-slate-400 font-mono">⌘</kbd>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded text-slate-400 font-mono">K</kbd>
            </div>
          </div>
          
          <div className="w-px h-4 bg-slate-200 hidden md:block"></div>
          
          <Link href="/login" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1">
            Sign In <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        
        {/* Left Sidebar (Desktop) */}
        <aside className="hidden md:block w-64 shrink-0 border-r border-slate-200 py-8 pr-6 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto custom-scrollbar">
          <nav className="space-y-8">
            {Object.entries(categories).map(([category, pages]) => (
              <div key={category}>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 px-2">{category}</h4>
                <ul className="space-y-1">
                  {pages.map((page) => {
                    const isActive = activePageId === page.id;
                    return (
                      <li key={page.id}>
                        <button
                          onClick={() => setActivePageId(page.id)}
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm transition-colors ${
                            isActive 
                              ? "bg-brand-50 text-brand-700 font-medium" 
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          }`}
                        >
                          {page.title}
                          {isActive && <motion.div layoutId="active-indicator" className="w-1 h-4 bg-brand-500 rounded-full" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-slate-900/50 z-50 md:hidden backdrop-blur-sm"
              />
              <motion.div 
                initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="fixed inset-y-0 left-0 w-72 bg-white z-50 p-6 shadow-2xl md:hidden overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-8">
                  <span className="font-bold text-slate-900 tracking-tight">SETU-NER Docs</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-slate-400 hover:text-slate-900 bg-slate-100 rounded-md">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <nav className="space-y-8">
                  {Object.entries(categories).map(([category, pages]) => (
                    <div key={category}>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 px-2">{category}</h4>
                      <ul className="space-y-1">
                        {pages.map((page) => (
                          <li key={page.id}>
                            <button
                              onClick={() => { setActivePageId(page.id); setMobileMenuOpen(false); }}
                              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                                activePageId === page.id ? "bg-brand-50 text-brand-700 font-medium" : "text-slate-600"
                              }`}
                            >
                              {page.title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 py-10 px-6 md:px-12 lg:px-16 flex justify-center">
          <div className="w-full max-w-3xl">
            
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-8 font-medium">
              <span>{activePage.category}</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-900">{activePage.title}</span>
            </div>

            <motion.div
              key={activePageId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-4xl font-extrabold text-slate-900 mb-8 tracking-tight">{activePage.title}</h1>
              
              <article className="prose prose-slate prose-a:text-brand-600 hover:prose-a:text-brand-700 max-w-none">
                {activePage.content}
              </article>
              
              {/* Pagination Footer */}
              <div className="mt-20 pt-8 border-t border-slate-200 flex justify-between">
                <div className="text-sm text-slate-500">
                  Was this page helpful? <button className="text-slate-900 font-medium ml-2 hover:underline">Yes</button> / <button className="text-slate-900 font-medium hover:underline">No</button>
                </div>
                <div className="text-sm">
                  <a href="#" className="text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors">
                    Edit this page on GitHub <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </main>

        {/* Right Sidebar (Table of Contents - Stubbed for visual) */}
        <aside className="hidden lg:block w-56 shrink-0 py-10 pl-6 sticky top-14 h-[calc(100vh-3.5rem)]">
          <h4 className="text-sm font-semibold text-slate-900 mb-4">On this page</h4>
          <ul className="space-y-2.5 text-sm text-slate-600 border-l border-slate-200">
            <li><a href="#" className="block pl-3 border-l -ml-px border-brand-500 text-brand-600 font-medium">Overview</a></li>
            <li><a href="#" className="block pl-3 border-l -ml-px border-transparent hover:border-slate-300 hover:text-slate-900 transition-colors">Key Capabilities</a></li>
            <li><a href="#" className="block pl-3 border-l -ml-px border-transparent hover:border-slate-300 hover:text-slate-900 transition-colors">Environments</a></li>
          </ul>
        </aside>

      </div>
    </div>
  );
}
