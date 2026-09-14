"use client";

import React, { useEffect, useState, useRef } from "react";
import { useConnectionStore } from "@/lib/connection-store";
import { syncManager } from "@/lib/sync-manager";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Clock,
  Radio,
  Server,
  Activity,
  Layers,
  ChevronDown,
  X,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export const ConnectionIndicator: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    connectionState,
    latencyMs,
    wsConnected,
    pendingSyncCount,
    syncProgress,
    lastSyncTime,
    lastEventTime,
    activeSources,
    refreshPendingCount,
    checkConnectivity,
  } = useConnectionStore();

  useEffect(() => {
    setMounted(true);
    syncManager.initListeners();
    refreshPendingCount();
    checkConnectivity();
  }, [refreshPendingCount, checkConnectivity]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleManualSync = (e: React.MouseEvent) => {
    e.stopPropagation();
    syncManager.syncOutbox();
  };

  const handleReconnect = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await checkConnectivity();
  };

  if (!mounted) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        <span className="font-semibold text-[11px]">INITIALIZING</span>
      </div>
    );
  }

  // Section 64: Never claim LIVE if not genuinely connected
  const isTrulyLive = wsConnected && connectionState === "ONLINE";
  const isReconnecting = !wsConnected && connectionState !== "OFFLINE";
  const isOffline = connectionState === "OFFLINE";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors cursor-pointer select-none hover:bg-slate-200/50 ${
          isTrulyLive
            ? "text-slate-700"
            : isReconnecting
            ? "text-amber-600"
            : "text-rose-600"
        }`}
        title="Click to inspect real-time data sources and network telemetry"
        aria-label="Real-time Connection Status"
      >
        <span
          className={`w-1.5 h-1.5 rounded-full shadow-[0_0_6px_currentColor] ${
            isTrulyLive
              ? "bg-emerald-500 animate-pulse text-emerald-500"
              : isReconnecting
              ? "bg-amber-500 animate-ping text-amber-500"
              : "bg-rose-500 text-rose-500"
          }`}
        />
        <span className="font-semibold text-[12px] tracking-tight uppercase">
          {isTrulyLive ? "Live" : isReconnecting ? "Reconnecting" : "Offline"}
        </span>

        {latencyMs > 0 && isTrulyLive && (
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline ml-0.5">
            ({latencyMs}ms)
          </span>
        )}
      </button>

      {/* Interactive Telemetry & Active Sources Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200/90 rounded-2xl shadow-floating z-50 p-4 space-y-3.5 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-600" />
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Real-Time Telemetry Hub</h4>
                <p className="text-[10px] text-slate-400">Section 41 Gateway Observability</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Core Transport Matrix */}
          <div className="grid grid-cols-2 gap-2 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">WebSocket Link</span>
              <span
                className={`font-bold text-xs inline-flex items-center gap-1 ${
                  wsConnected ? "text-emerald-700" : "text-amber-700"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? "bg-emerald-500" : "bg-amber-500"}`} />
                {wsConnected ? "Connected (All)" : "Reconnecting..."}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">HTTP Gateway Latency</span>
              <span className="font-mono font-bold text-xs text-slate-700">
                {latencyMs > 0 ? `${latencyMs} ms` : "Unreachable"}
              </span>
            </div>
          </div>

          {/* Last Event / Sync Status */}
          <div className="space-y-1 text-[11px] text-slate-500 px-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Latest Live Broadcast:</span>
              <span className="font-medium text-slate-700 truncate max-w-[170px]">
                {lastEventTime || "Awaiting incoming stream"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Outbox Queue:</span>
              <span className="font-medium text-slate-700">
                {pendingSyncCount > 0 ? `${pendingSyncCount} reports pending` : "All records synced"}
              </span>
            </div>
          </div>

          {/* Active Data Sources Section */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
              Active Ingestion Streams ({activeSources.length})
            </span>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {activeSources.map((source) => (
                <div
                  key={source.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="font-semibold text-slate-800 text-[11px] truncate">
                        {source.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {source.category} • {source.description}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono text-emerald-600 block">
                      {source.latencyMs}ms
                    </span>
                    <span className="text-[9px] text-slate-400 block">{source.lastUpdated}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              onClick={handleReconnect}
              className="flex-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Ping & Refresh</span>
            </button>
            {pendingSyncCount > 0 && (
              <button
                onClick={handleManualSync}
                className="flex-1 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync Outbox ({pendingSyncCount})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
