"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUiStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";
import { useRealtimeTelemetry } from "@/hooks/useRealtimeTelemetry";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { RealtimeAlertTicker } from "@/components/alerts/RealtimeAlertTicker";
import { GlobalErrorBoundary } from "@/components/ui/GlobalErrorBoundary";
import { SmoothScrolling } from "@/components/ui/SmoothScrolling";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const RootLayoutClient: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { sidebarOpen } = useUiStore();
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && mounted) {
      const publicPaths = ['/login', '/landing', '/docs'];
      const isPublicPath = publicPaths.includes(pathname);
      
      if (!isAuthenticated && !isPublicPath) {
        router.push('/login');
      } else if (isAuthenticated && pathname === '/login') {
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, pathname, router, mounted]);

  // Global real-time WebSocket connection to /ws/all
  // Only connect if authenticated to avoid 401s on websocket
  useRealtimeTelemetry();

  // Show a blank or loading state while checking auth to prevent UI flashes
  if (!mounted || isLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full" />
    </div>;
  }

  // If on a public page (and not authenticated), render a clean layout without sidebar/header
  const publicPaths = ['/login', '/landing', '/docs'];
  if (publicPaths.includes(pathname)) {
    return (
      <div className="min-h-screen w-full bg-slate-50">
        <GlobalErrorBoundary>
          {children}
        </GlobalErrorBoundary>
      </div>
    );
  }

  return (
    <SmoothScrolling>
      <div className="min-h-screen flex bg-mesh-canvas text-foreground relative selection:bg-brand-500 selection:text-white">
      {/* Ambient Lighting Orbs for Glassmorphism Refraction */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-brand-500/15 blur-[120px]" />
        <div className="absolute top-1/4 -right-24 w-96 h-96 rounded-full bg-sky-400/12 blur-[130px]" />
        <div className="absolute top-2/3 -left-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute -bottom-24 right-1/4 w-[480px] h-[480px] rounded-full bg-purple-500/10 blur-[140px]" />
      </div>

      <Sidebar />

      {/* Main Layout Column dynamically offset by sidebar width on desktop */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 relative z-10",
          sidebarOpen ? "md:pl-64" : "md:pl-16"
        )}
      >
        <Header />

        {/* Real-time ticker positioned cleanly below fixed header */}
        <div className="pt-24">
          <RealtimeAlertTicker />
        </div>

        {/* Main Content Area safely centered within available content width */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1680px] mx-auto min-w-0">
          <GlobalErrorBoundary>
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="w-full h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </GlobalErrorBoundary>
        </main>
      </div>
    </div>
    </SmoothScrolling>
  );
};
