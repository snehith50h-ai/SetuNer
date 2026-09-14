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
            <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105">
              <Radio className="w-4 h-4 text-white" />
            </div>
            {sidebarOpen && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold tracking-tight text-slate-900 leading-none">
                  SETU-ROUTE
                </span>
                <span className="text-[10px] text-slate-500 font-medium mt-1 leading-none">
                  Logistics Intelligence
                </span>
              </div>
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
