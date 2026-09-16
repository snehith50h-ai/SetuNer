"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Radio,
  ChevronRight,
  X,
  Volume2,
  VolumeX,
  Check,
  ShieldAlert,
  ArrowRight,
  Eye,
} from "lucide-react";
import { useRealtimeAlerts } from "@/hooks/useRealtimeAlerts";
import { AlertDetailModal, AlertDetailData } from "@/components/alerts/AlertDetailModal";

export const RealtimeAlertTicker: React.FC = () => {
  const {
    summary,
    isConnected,
    soundEnabled,
    setSoundEnabled,
    acknowledgeAlert,
    isAcknowledging,
  } = useRealtimeAlerts();

  const [isDismissed, setIsDismissed] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AlertDetailData | null>(null);

  const totalUnacked = summary?.total_unacknowledged ?? 0;
  const criticalCount = summary?.critical_count ?? 0;
  const highCount = summary?.high_count ?? 0;
  const latest = summary?.latest_threat;

  if (isDismissed) {
    // Render a minimal floating pill on the bottom-left so user can restore it anytime
    if (criticalCount > 0 || highCount > 0) {
      return (
        <>
          <button
            onClick={() => setIsDismissed(false)}
            className="fixed bottom-4 left-4 z-40 px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-floating flex items-center gap-2 animate-bounce cursor-pointer border border-rose-400"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>
              {criticalCount} Critical Threat{criticalCount !== 1 ? "s" : ""}
            </span>
          </button>
          <AlertDetailModal
            alert={selectedAlert}
            isOpen={!!selectedAlert}
            onClose={() => setSelectedAlert(null)}
            onAcknowledge={(id) => {
              acknowledgeAlert(id);
              setSelectedAlert(null);
            }}
            isAcknowledging={isAcknowledging}
          />
        </>
      );
    }
    return null;
  }

  // If there are critical or high threats
  const hasUrgentThreats = criticalCount > 0 || highCount > 0;

  if (!hasUrgentThreats && totalUnacked === 0) {
    return null;
  }

  return (
    <div className="w-full flex justify-center py-3 px-4 pointer-events-none sticky top-20 z-40">
      <div
        className={`pointer-events-auto max-w-[1680px] w-full rounded-full text-xs font-medium transition-all duration-500 backdrop-blur-2xl border ${
          criticalCount > 0
            ? "bg-white/30 text-slate-800 border-white/60 shadow-[0_8px_32px_0_rgba(225,29,72,0.15),inset_0_2px_8px_rgba(255,255,255,0.8)]"
            : highCount > 0
            ? "bg-white/30 text-slate-800 border-white/60 shadow-[0_8px_32px_0_rgba(217,119,6,0.15),inset_0_2px_8px_rgba(255,255,255,0.8)]"
            : "bg-white/20 text-slate-800 border-white/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.1),inset_0_2px_8px_rgba(255,255,255,0.6)]"
        }`}
      >
        <div className="px-5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Emergency beacon & Active threat title */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${criticalCount > 0 ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${criticalCount > 0 ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
            </span>

            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border shrink-0 shadow-sm ${
              criticalCount > 0 ? "bg-rose-500/10 text-rose-700 border-rose-500/30" : "bg-amber-500/10 text-amber-700 border-amber-500/30"
            }`}>
              {criticalCount > 0 ? "CRITICAL ALERT" : "OPERATIONAL WARNING"}
            </span>

            <div className="truncate flex items-center gap-2">
              <span className="font-bold truncate">
                {latest ? latest.title : `${totalUnacked} Active Operational Alerts Detected`}
              </span>
              {latest?.alert_code && (
                <span className="hidden md:inline-block font-mono text-[10px] bg-slate-900/5 border border-slate-900/10 px-1.5 py-0.5 rounded text-slate-700 shrink-0">
                  {latest.alert_code}
                </span>
              )}
            </div>
          </div>

          {/* Right: Threat count metrics, actions & controls */}
          <div className="flex items-center gap-2 shrink-0 justify-end flex-wrap">
            <div className="flex items-center gap-1 text-[11px] font-bold">
              {criticalCount > 0 && (
                <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-700 border border-rose-500/20">
                  {criticalCount} Critical
                </span>
              )}
              {highCount > 0 && (
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 border border-amber-500/20">
                  {highCount} High
                </span>
              )}
            </div>

            {latest && (
              <button
                onClick={() =>
                  setSelectedAlert({
                    id: latest.id,
                    alert_code: latest.alert_code,
                    title: latest.title,
                    severity: latest.severity,
                    what_happened: latest.what_happened,
                    why_it_matters: latest.why_it_matters,
                    who_is_affected: latest.who_is_affected,
                    recommended_action: latest.recommended_action,
                    created_at: latest.created_at,
                  })
                }
                className="px-3 py-1.5 rounded-full bg-white/40 hover:bg-white/60 text-slate-800 font-bold text-[11px] transition-all duration-300 ease-out active:scale-[0.96] flex items-center gap-1.5 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_2px_8px_rgba(0,0,0,0.05)] border border-white/50 backdrop-blur-md"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Inspect 4-Part Briefing</span>
              </button>
            )}

            {latest && (
              <button
                onClick={() => acknowledgeAlert(latest.id)}
                disabled={isAcknowledging}
                className="px-3 py-1.5 rounded-full bg-white text-emerald-700 hover:bg-emerald-50 font-bold text-[11px] transition-all duration-300 ease-out active:scale-[0.96] flex items-center gap-1.5 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.1)] disabled:opacity-50 border border-white"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Acknowledge</span>
              </button>
            )}

            <Link
              href="/alerts"
              className="px-3 py-1.5 rounded-full bg-white/30 hover:bg-white/50 text-slate-800 font-semibold text-[11px] transition-colors flex items-center gap-1 shadow-[inset_0_1px_2px_rgba(255,255,255,0.6)] border border-white/40 backdrop-blur-md"
            >
              <span>All Alerts ({totalUnacked})</span>
              <ChevronRight className="w-3 h-3" />
            </Link>

            {/* Sound Mute/Unmute Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Mute alert audio chimes" : "Enable alert audio chimes"}
              className="p-1 rounded-lg hover:bg-black/5 text-slate-600 transition-colors"
              aria-label="Toggle Sound"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 opacity-60" />}
            </button>

            {/* Minimize / Dismiss */}
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 rounded-lg hover:bg-black/5 text-slate-600 transition-colors"
              aria-label="Minimize alert banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
      {/* Interactive 4-Part Detail Modal */}
      <AlertDetailModal
        alert={selectedAlert}
        isOpen={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onAcknowledge={(id) => {
          acknowledgeAlert(id);
          setSelectedAlert(null);
        }}
        isAcknowledging={isAcknowledging}
      />
    </div>
  );
};
