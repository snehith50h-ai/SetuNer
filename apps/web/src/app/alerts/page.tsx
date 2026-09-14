"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  ShieldAlert,
  ArrowRight,
  Filter,
  Search,
  Check,
  Radio,
  Zap,
  MapPin,
  Route,
  Volume2,
  VolumeX,
  RefreshCw,
  Eye,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Alert } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTime, formatRelativeTime } from "@/lib/utils";
import { useRealtimeAlerts } from "@/hooks/useRealtimeAlerts";
import { AlertDetailModal, AlertDetailData } from "@/components/alerts/AlertDetailModal";

export default function AlertsPage() {
  const queryClient = useQueryClient();
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [showAcknowledged, setShowAcknowledged] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedAlertModal, setSelectedAlertModal] = useState<AlertDetailData | null>(null);

  const {
    summary,
    isConnected,
    soundEnabled,
    setSoundEnabled,
    acknowledgeAlert,
    isAcknowledging,
  } = useRealtimeAlerts();

  const { data: alerts, isLoading, refetch, isFetching } = useQuery<Alert[]>({
    queryKey: ["alerts", selectedSeverity, showAcknowledged],
    queryFn: () => {
      let endpoint = `/alerts?is_acknowledged=${showAcknowledged}&limit=100&`;
      if (selectedSeverity !== "ALL") endpoint += `severity=${selectedSeverity}&`;
      return apiClient<Alert[]>(endpoint);
    },
    refetchInterval: 4000,
  });

  const ackMutation = useMutation({
    mutationFn: (alertId: string) =>
      apiClient<Alert>(`/alerts/${alertId}/acknowledge`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["alerts-summary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });

  const filteredAlerts = useMemo(() => {
    if (!alerts) return [];
    if (!searchQuery.trim()) return alerts;
    const q = searchQuery.toLowerCase();
    return alerts.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.alert_code.toLowerCase().includes(q) ||
        (a.what_happened && a.what_happened.toLowerCase().includes(q)) ||
        (a.who_is_affected && a.who_is_affected.toLowerCase().includes(q))
    );
  }, [alerts, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
            <Radio className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>Operational Threat Intelligence</span>
            <span className="text-slate-300">•</span>
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              isConnected
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-slate-100 text-slate-600 border border-slate-200"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-emerald-500 animate-ping" : "bg-slate-400"}`} />
              {isConnected ? "LIVE WEBSOCKET STREAM" : "POLLING ACTIVE (4s)"}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-amber-600" />
            Real-Time Threat Warnings & Actionable Feed
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Continuous automated telemetry from USGS seismic sensors, GDACS disaster alerts, Open-Meteo flood models, and transit sensors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              soundEnabled
                ? "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                : "bg-slate-100 text-slate-400 border-slate-200"
            }`}
            title={soundEnabled ? "Audio chimes active" : "Audio chimes muted"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? "Audio ON" : "Muted"}</span>
          </button>

          {/* Active / Acknowledged Toggle */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setShowAcknowledged(false)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !showAcknowledged ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Active Threats ({summary?.total_unacknowledged ?? 0})
            </button>
            <button
              onClick={() => setShowAcknowledged(true)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                showAcknowledged ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Acknowledged Archive
            </button>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs"
            title="Refresh feed"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-brand-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Real-time Threat Counter Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/90 flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-[10px] uppercase font-bold tracking-wider">Critical Threats</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-900 font-mono">
              {summary?.critical_count ?? 0}
            </span>
            <span className="text-[10px] text-rose-600 font-semibold">Immediate Blockages</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/90 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[10px] uppercase font-bold tracking-wider">High Warnings</span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-900 font-mono">
              {summary?.high_count ?? 0}
            </span>
            <span className="text-[10px] text-amber-600 font-semibold">Severe Risk / Delays</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/90 flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-700">
            <span className="text-[10px] uppercase font-bold tracking-wider">Medium Advisory</span>
            <Info className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-900 font-mono">
              {summary?.medium_count ?? 0}
            </span>
            <span className="text-[10px] text-blue-600 font-semibold">Cautionary Corridors</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-700">
            <span className="text-[10px] uppercase font-bold tracking-wider">Unacknowledged Total</span>
            <Bell className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {summary?.total_unacknowledged ?? 0}
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">Require Dispatch Action</span>
          </div>
        </div>
      </div>

      {/* Filter Controls & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-sm text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 mr-1">Severity:</span>
          {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedSeverity === sev
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search road (e.g. NH-6), hazard, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-slate-50/70"
          />
        </div>
      </div>

      {/* Alert Feed Cards */}
      {isLoading ? (
        <LoadingState message="Connecting to early warning threat queue..." />
      ) : filteredAlerts.length === 0 ? (
        <EmptyState
          title={searchQuery ? "No Matching Threats Found" : "No Unresolved Alerts"}
          description={
            searchQuery
              ? "Try adjusting your search terms or clearing the severity filter."
              : "All operational alerts have been acknowledged and resolved."
          }
          icon={CheckCircle}
        />
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-6 rounded-2xl border bg-white shadow-card space-y-5 transition-all hover:shadow-md ${
                alert.severity === "CRITICAL"
                  ? "border-rose-300 ring-1 ring-rose-200/50"
                  : alert.severity === "HIGH"
                  ? "border-amber-300 ring-1 ring-amber-200/40"
                  : "border-slate-200/80"
              }`}
            >
              {/* Alert Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <StatusBadge status={alert.severity} size="md" />
                  <span className="font-bold text-slate-900 text-sm tracking-tight">
                    {alert.title}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-slate-400 text-xs font-medium">
                  <span className="font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-bold">
                    {alert.alert_code}
                  </span>
                  <span>•</span>
                  <span>{formatRelativeTime(alert.created_at)}</span>
                </div>
              </div>

              {/* 4-Section Operational Analysis Breakdown (WHAT, WHY, WHO, ACTION) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">
                    1. What Happened
                  </span>
                  <p className="text-slate-700 leading-relaxed text-xs">{alert.what_happened}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">
                    2. Why It Matters
                  </span>
                  <p className="text-slate-700 leading-relaxed text-xs">{alert.why_it_matters}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">
                    3. Who Is Affected
                  </span>
                  <p className="text-slate-700 leading-relaxed text-xs">{alert.who_is_affected}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-brand-50/70 border border-brand-200/80 space-y-1.5">
                  <span className="text-brand-700 text-[10px] uppercase font-bold tracking-wider block flex items-center gap-1">
                    <Zap className="w-3 h-3 text-brand-600" />
                    4. Available Action
                  </span>
                  <p className="text-brand-950 leading-relaxed font-semibold text-xs">{alert.recommended_action}</p>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Link
                    href="/map"
                    className="px-3.5 py-1.5 rounded-full bg-slate-50 hover:bg-white text-slate-700 text-xs font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.02),inset_0_0_0_1px_rgba(203,213,225,0.4)] transition-all duration-300 ease-out hover:shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_0_0_1px_rgba(203,213,225,0.6)] active:scale-[0.98] inline-flex items-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5 text-brand-500" />
                    <span>View on Map</span>
                  </Link>
                  <Link
                    href="/routes"
                    className="px-3.5 py-1.5 rounded-full bg-slate-50 hover:bg-white text-slate-700 text-xs font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.02),inset_0_0_0_1px_rgba(203,213,225,0.4)] transition-all duration-300 ease-out hover:shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_0_0_1px_rgba(203,213,225,0.6)] active:scale-[0.98] inline-flex items-center gap-1.5"
                  >
                    <Route className="w-3.5 h-3.5 text-purple-500" />
                    <span>Plan Detour</span>
                  </Link>
                  <button
                    onClick={() =>
                      setSelectedAlertModal({
                        id: alert.id,
                        alert_code: alert.alert_code,
                        title: alert.title,
                        severity: alert.severity,
                        what_happened: alert.what_happened,
                        why_it_matters: alert.why_it_matters,
                        who_is_affected: alert.who_is_affected,
                        recommended_action: alert.recommended_action,
                        created_at: alert.created_at,
                        is_acknowledged: alert.is_acknowledged,
                      })
                    }
                    className="px-3.5 py-1.5 rounded-full bg-slate-50 hover:bg-white text-slate-700 text-xs font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.02),inset_0_0_0_1px_rgba(203,213,225,0.4)] transition-all duration-300 ease-out hover:shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_0_0_1px_rgba(203,213,225,0.6)] active:scale-[0.98] inline-flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>Deep Briefing</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-xs">
                    Triggered at {formatDateTime(alert.created_at)}
                  </span>

                  {!alert.is_acknowledged && (
                    <button
                      onClick={() => ackMutation.mutate(alert.id)}
                      disabled={ackMutation.isPending}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Acknowledge Threat
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Modal */}
      <AlertDetailModal
        alert={selectedAlertModal}
        isOpen={!!selectedAlertModal}
        onClose={() => setSelectedAlertModal(null)}
        onAcknowledge={(id) => {
          ackMutation.mutate(id);
          setSelectedAlertModal(null);
        }}
        isAcknowledging={ackMutation.isPending}
      />
    </div>
  );
}
