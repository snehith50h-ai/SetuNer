"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Clock,
  ExternalLink,
  X,
  Check,
  Radio,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Alert } from "@/types";
import { formatRelativeTime } from "@/lib/utils";
import { useToast } from "@/components/ui/ToastProvider";
import { SlidingTabs } from "@/components/ui/SlidingTabs";

import { AlertDetailModal, AlertDetailData } from "@/components/alerts/AlertDetailModal";

export const NotificationCenter: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<"unread" | "all" | "critical">("unread");
  const [selectedAlert, setSelectedAlert] = useState<AlertDetailData | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ["alerts"],
    queryFn: () => apiClient<Alert[]>("/alerts?limit=50"),
    refetchInterval: 4000,
  });

  const ackMutation = useMutation({
    mutationFn: async (alertId: string) => {
      return apiClient(`/alerts/${alertId}/acknowledge`, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["alerts-summary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      addToast({
        title: "Alert Acknowledged",
        description: "Status updated in regional audit logs.",
        type: "success",
      });
    },
  });

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadAlerts = alerts.filter((a) => !a.is_acknowledged);
  const criticalAlerts = alerts.filter((a) => a.severity === "CRITICAL");

  let filtered = alerts;
  if (tab === "unread") filtered = unreadAlerts;
  if (tab === "critical") filtered = criticalAlerts;

  return (
    <div className="relative text-xs" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-md hover:bg-slate-200/50 text-slate-600 hover:text-slate-900 transition-colors active:scale-95"
        aria-label="Notification Center"
      >
        <Bell className="w-[18px] h-[18px]" />
        <span className="t-badge" data-open={unreadAlerts.length > 0 ? "true" : "false"}>
          <span className="t-badge-dot flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-[0_0_8px_rgba(244,63,94,0.6)]">
            {unreadAlerts.length > 9 ? "9+" : unreadAlerts.length}
          </span>
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-3xl glass-modal border border-white/80 shadow-glass-lg z-50 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)]">
          {/* Header */}
          <div className="p-4 border-b border-white/60 flex items-center justify-between bg-white/40 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-brand-50/80 border border-brand-200/60 flex items-center justify-center text-brand-600 shadow-xs">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Operational Alerts</h4>
                <p className="text-[11px] text-slate-500">Real-time corridor and hazard feed</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-50/80 border border-rose-200/80 text-rose-700 text-[10px] font-bold shadow-xs">
              {unreadAlerts.length} Unread
            </span>
          </div>

          {/* Filter Tabs */}
          <div className="border-b border-slate-100 bg-slate-50/70 p-2 flex justify-center">
            <SlidingTabs
              tabs={[
                { id: 'unread', label: `Unread (${unreadAlerts.length})` },
                { id: 'critical', label: `Critical (${criticalAlerts.length})` },
                { id: 'all', label: `All (${alerts.length})` },
              ]}
              activeId={tab}
              onChange={(id) => setTab(id as 'unread' | 'critical' | 'all')}
            />
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto p-3 space-y-2.5 max-h-[50vh]">
            {filtered.length === 0 ? (
              <div className="py-10 text-center text-slate-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-medium text-xs text-slate-600">No alerts in this view</p>
                <p className="text-[11px] text-slate-400">All corridors operate within normal variance.</p>
              </div>
            ) : (
              filtered.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border transition-all space-y-2 ${
                    !alert.is_acknowledged
                      ? "bg-white border-slate-200/90 shadow-xs hover:border-slate-300"
                      : "bg-slate-50/60 border-slate-100 opacity-80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                        alert.severity === "CRITICAL"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : alert.severity === "HIGH"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {formatRelativeTime(alert.created_at)}
                    </span>
                  </div>

                  <h5 className="font-semibold text-slate-900 text-xs">{alert.title}</h5>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {alert.what_happened}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setSelectedAlert({
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
                        });
                        setIsOpen(false);
                      }}
                      className="text-[11px] text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <span>Inspect 4-Part Briefing</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    {!alert.is_acknowledged && (
                      <button
                        onClick={() => ackMutation.mutate(alert.id)}
                        disabled={ackMutation.isPending}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium flex items-center gap-1 transition-colors"
                      >
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Acknowledge</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/80 text-center">
            <Link
              href="/alerts"
              onClick={() => setIsOpen(false)}
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold inline-flex items-center gap-1"
            >
              <span>Open Full Alert Center</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* 4-Part Operational Detail Modal */}
      <AlertDetailModal
        alert={selectedAlert}
        isOpen={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onAcknowledge={(id) => {
          ackMutation.mutate(id);
          setSelectedAlert(null);
        }}
        isAcknowledging={ackMutation.isPending}
      />
    </div>
  );
};

