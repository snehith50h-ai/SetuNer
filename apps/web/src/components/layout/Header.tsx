"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Globe,
  Activity,
  Clock,
  User as UserIcon,
  Menu,
  Shield,
  Radio,
  Command,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { useUiStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";
import { ConnectionIndicator } from "@/components/ui/ConnectionIndicator";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { NotificationCenter } from "@/components/ui/NotificationCenter";
import { GlobalSearchModal } from "@/components/ui/GlobalSearchModal";
import { cn } from "@/lib/utils";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Command Center", subtitle: "NER Real-time Telemetry & Logistics Oversight" },
  "/map": { title: "Live GIS Map", subtitle: "Regional Corridor Intelligence & Multi-layer GIS" },
  "/vehicles": { title: "Fleet Vehicles", subtitle: "Live Telemetry, Speed & Convoy Tracking" },
  "/deliveries": { title: "Consignments", subtitle: "Critical Medical & Supply Lifeline Deliveries" },
  "/incidents": { title: "Incident Triage", subtitle: "Landslide, Cloudburst & Hazard Management" },
  "/routes": { title: "Route Optimizer", subtitle: "Multi-Criteria AI Risk-Aware Graph Solver" },
  "/statistics": { title: "Statistics & Impact", subtitle: "Logistics Efficiency, Risk Mitigation & Operational Impact Analytics" },
  "/analytics": { title: "Operational Analytics", subtitle: "Regional Trends & Accessibility Indices" },
  "/reports": { title: "Field Reports", subtitle: "PWA Offline Incident Submission & Outbox" },
  "/alerts": { title: "Alerts Center", subtitle: "Actionable 4-Part Telemetry Notifications" },
  "/admin": { title: "System Health & Audit", subtitle: "Infrastructure Matrix & Audit Trail" },
  "/settings": { title: "Settings", subtitle: "Platform Configuration & Telemetry Rates" },
  "/landing": { title: "Landing Overview", subtitle: "Ministry Regional Logistics Portal" },
};

const ClockWidget = () => {
  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const formatted = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      });
      setTimeStr(`${formatted} IST`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden 2xl:flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-slate-200/50 transition-colors cursor-default text-slate-700">
      <Clock className="w-4 h-4 text-slate-500" />
      <span suppressHydrationWarning className="font-mono text-[12px] font-semibold tracking-tight">{timeStr || "IST"}</span>
    </div>
  );
};

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUiStore();
  const { user } = useAuthStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const pageInfo = PAGE_TITLES[pathname] || {
    title: "SETU-ROUTE Intelligence",
    subtitle: "MDoNER Logistics Command",
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 right-0 z-30 h-16 bg-white/70 backdrop-blur-2xl border-b border-slate-200/50 transition-all duration-300 flex items-center justify-between px-4 lg:px-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]",
          sidebarOpen ? "left-0 md:left-64" : "left-0 md:left-16"
        )}
      >
        {/* Left: Mobile toggle & Breadcrumb */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 md:hidden transition-colors active:scale-95"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex flex-col justify-center">
            <div className="flex items-center gap-1.5 text-[12px] text-slate-500 font-semibold tracking-tight">
              <Link href="/" className="hover:text-slate-900 transition-colors">SETU-ROUTE</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-900">{pageInfo.title}</span>
            </div>
            <span className="text-[11px] text-slate-400 hidden xl:block truncate max-w-[240px] font-medium tracking-tight mt-0.5">
              {pageInfo.subtitle}
            </span>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-md mx-4 lg:mx-8 min-w-[120px]">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full bg-slate-100/80 hover:bg-slate-200/60 rounded-full px-4 py-2 flex items-center justify-between transition-all group cursor-pointer shadow-[inset_0_0_0_1px_rgba(0,0,0,0.03)]"
          >
            <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
              <span className="truncate text-[13px] font-medium text-slate-500">Search command center...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white shadow-sm border border-slate-200/60 text-[10px] text-slate-500 font-bold tracking-widest shrink-0">
              <Command className="w-3 h-3" /> K
            </kbd>
          </button>
        </div>

        {/* Right: Controls & Profile */}
        <div className="flex items-center justify-end gap-2 sm:gap-3.5 shrink-0">
          {/* System Health */}
          <div className="hidden 2xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50/80 text-emerald-700 text-[11px] font-bold tracking-tight border border-emerald-100/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
            System Healthy
          </div>

          <ConnectionIndicator />
          <LanguageSelector />
          <NotificationCenter />
          <ClockWidget />

          {/* User Profile */}
          <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-slate-200/80 h-8">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
              {user?.full_name ? user.full_name[0] : "A"}
            </div>
            <div className="hidden md:flex flex-col justify-center">
              <span className="text-[13px] font-bold text-slate-900 leading-none tracking-tight">
                {user?.full_name || "Operations Lead"}
              </span>
              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-extrabold mt-1">
                {user?.role || "ADMIN"}
              </span>
            </div>
            
            <button 
              onClick={() => useAuthStore.getState().logout()}
              className="ml-1 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors active:scale-95"
              title="Sign Out"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

