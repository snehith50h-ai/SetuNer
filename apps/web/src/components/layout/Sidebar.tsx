"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  Truck,
  Package,
  AlertTriangle,
  Route,
  BarChart3,
  ClipboardList,
  Bell,
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
  Compass,
  Radio,
  Layers,
  TrendingUp,
  X,
} from "lucide-react";
import { useUiStore } from "@/stores/uiStore";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { label: "Command Center", href: "/", icon: LayoutDashboard },
  { label: "Live Map", href: "/map", icon: MapPin },
  { label: "Vehicles", href: "/vehicles", icon: Truck },
  { label: "Deliveries", href: "/deliveries", icon: Package },
  { label: "Incidents", href: "/incidents", icon: AlertTriangle },
  { label: "Routes", href: "/routes", icon: Route },
  { label: "Statistics", href: "/statistics", icon: TrendingUp },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Field Reports", href: "/reports", icon: ClipboardList },
  { label: "Alerts", href: "/alerts", icon: Bell },
];

const SECONDARY_ITEMS = [
  { label: "Landing Overview", href: "/landing", icon: Compass },
  { label: "Administration", href: "/admin", icon: Shield },
  { label: "Settings", href: "/settings", icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUiStore();

  // Auto-collapse sidebar on mobile screens on initial load
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [setSidebarOpen]);

  // Close mobile drawer when user navigates to a new page
  const handleNavClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col glass-sidebar transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          sidebarOpen
            ? "translate-x-0 w-64 shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
            : "-translate-x-full md:translate-x-0 md:w-16 shadow-none"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200/60 bg-transparent">
          <Link
            href="/"
            onClick={handleNavClick}
            className="flex items-center gap-3 overflow-hidden group"
          >
            <div className="relative w-9 h-9 rounded-full border-[2px] border-[#0f172a] bg-white flex flex-col items-center justify-start pt-[5px] overflow-hidden shadow-sm shrink-0 transition-transform group-hover:scale-105">
              <span className="text-[6px] font-black tracking-[0.1em] text-[#0f172a] leading-[1]">SETU</span>
              <span className="text-[6px] font-black tracking-[0.1em] text-[#0f172a] leading-[1]">NER</span>
              
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
            {sidebarOpen && (
              <span className="font-bold text-lg tracking-tight aurora-text whitespace-nowrap">
                SETU NER
              </span>
            )}
          </Link>

          {/* Desktop collapse button */}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.85] hidden md:flex border border-transparent hover:border-slate-200/60 hover:shadow-sm"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {/* Mobile close button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/60 transition-colors md:hidden border border-transparent hover:border-white/50"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
          {sidebarOpen && (
            <div className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
              Operational Modules
            </div>
          )}
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-full text-xs font-medium transition-colors group relative",
                    isActive
                      ? "text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                  )}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0 transition-colors z-10 relative",
                      isActive ? "text-brand-600" : "text-slate-400 group-hover:text-slate-600"
                    )}
                  />
                  {sidebarOpen && <span className="truncate z-10 relative font-semibold">{item.label}</span>}
                  
                  {isActive && (
                    <motion.div
                      layoutId="activeSidebarTab"
                      className="absolute inset-0 rounded-full glass-pill z-0"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Secondary Divider & Links */}
          <div className="pt-6 mt-2 space-y-1">
            {sidebarOpen && (
              <div className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                System & Portal
              </div>
            )}
            {SECONDARY_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-full text-xs font-medium transition-colors group relative",
                    isActive
                      ? "text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                  )}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0 transition-colors z-10 relative",
                      isActive ? "text-brand-600" : "text-slate-400 group-hover:text-slate-600"
                    )}
                  />
                  {sidebarOpen && <span className="truncate z-10 relative font-semibold">{item.label}</span>}
                  
                  {isActive && (
                    <motion.div
                      layoutId="activeSidebarTab"
                      className="absolute inset-0 rounded-full glass-pill z-0"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer Tagline */}
        {sidebarOpen && (
          <div className="p-3.5 bg-slate-900 m-3 rounded-xl shadow-lg border border-slate-800">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-semibold text-slate-100 tracking-wide">MDoNER Live Link</span>
            </div>
            <p className="text-[10px] text-slate-400 italic">
              "See the road before you send the vehicle."
            </p>
          </div>
        )}
      </aside>
    </>
  );
};
