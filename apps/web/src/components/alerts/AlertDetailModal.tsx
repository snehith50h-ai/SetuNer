"use client";

import React from "react";
import Link from "next/link";
import {
  X,
  AlertTriangle,
  ShieldAlert,
  Clock,
  MapPin,
  Route,
  CheckCircle2,
  ExternalLink,
  Zap,
  Info,
  Users,
  Check,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateTime, formatRelativeTime } from "@/lib/utils";

export interface AlertDetailData {
  id: string;
  alert_code: string;
  title: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | string;
  alert_type?: string;
  what_happened?: string;
  why_it_matters?: string;
  who_is_affected?: string;
  recommended_action?: string;
  entity_type?: string;
  entity_id?: string;
  source_name?: string;
  created_at?: string | null;
  is_acknowledged?: boolean;
}

interface AlertDetailModalProps {
  alert: AlertDetailData | null;
  isOpen: boolean;
  onClose: () => void;
  onAcknowledge?: (id: string) => void;
  isAcknowledging?: boolean;
}

export const AlertDetailModal: React.FC<AlertDetailModalProps> = ({
  alert,
  isOpen,
  onClose,
  onAcknowledge,
  isAcknowledging = false,
}) => {
  if (!isOpen || !alert) return null;

  const isCritical = alert.severity === "CRITICAL";
  const isHigh = alert.severity === "HIGH";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)]">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className={`p-6 border-b flex items-start justify-between gap-4 ${
            isCritical
              ? "bg-rose-50/70 border-rose-200/80"
              : isHigh
              ? "bg-amber-50/70 border-amber-200/80"
              : "bg-slate-50 border-slate-200/80"
          }`}
        >
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <StatusBadge status={alert.severity} size="md" />
              <span className="font-mono text-xs font-bold text-slate-600 bg-white/80 px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                {alert.alert_code}
              </span>
              {alert.source_name && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {alert.source_name}
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              {alert.title}
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Triggered {alert.created_at ? formatDateTime(alert.created_at) : "Recently"} (
                {alert.created_at ? formatRelativeTime(alert.created_at) : "Live"})
              </span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/80 hover:bg-white text-slate-400 hover:text-slate-700 border border-slate-200 shadow-xs transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4-Part Analysis Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-brand-600" />
            <span>4-Part Operational Threat Intelligence Briefing</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
            {/* 1. What Happened */}
            <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                <span>1. What Happened</span>
              </div>
              <p className="text-slate-800 leading-relaxed font-medium">
                {alert.what_happened || "Real-time hazard telemetry triggered an operational warning."}
              </p>
            </div>

            {/* 2. Why It Matters */}
            <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>2. Why It Matters</span>
              </div>
              <p className="text-slate-800 leading-relaxed font-medium">
                {alert.why_it_matters || "Poses potential delay, structural blockage, or safety hazard to transit."}
              </p>
            </div>

            {/* 3. Who Is Affected */}
            <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                <Users className="w-3.5 h-3.5 text-purple-600" />
                <span>3. Who Is Affected</span>
              </div>
              <p className="text-slate-800 leading-relaxed font-medium">
                {alert.who_is_affected || "Commercial freight, vital medical consignments, and interstate road convoys."}
              </p>
            </div>

            {/* 4. Actionable Mitigation */}
            <div className="p-4 rounded-2xl bg-brand-50/70 border border-brand-200 space-y-1.5">
              <div className="flex items-center gap-1.5 text-brand-800 font-bold text-[11px] uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-brand-600" />
                <span>4. Available Action</span>
              </div>
              <p className="text-brand-950 leading-relaxed font-semibold">
                {alert.recommended_action || "Divert along cleared alternative mountain bypass; alert field disaster relief crews."}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-5 border-t border-slate-200/80 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link
              href="/map"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs transition-colors inline-flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-brand-600" />
              <span>Inspect on Live Map</span>
            </Link>

            <Link
              href="/routes"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs transition-colors inline-flex items-center gap-1.5"
            >
              <Route className="w-3.5 h-3.5 text-purple-600" />
              <span>Detour Bypass</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-800 text-xs font-semibold transition-colors"
            >
              Dismiss
            </button>

            {onAcknowledge && (
              <button
                onClick={() => !alert.is_acknowledged && onAcknowledge(alert.id)}
                disabled={isAcknowledging || alert.is_acknowledged}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold shadow-xs transition-transform inline-flex items-center gap-1.5 disabled:opacity-50 ${alert.is_acknowledged ? 'bg-emerald-500 cursor-default' : 'bg-emerald-600 hover:bg-emerald-700 hover:scale-105'}`}
              >
                <div className="relative flex items-center justify-center w-4 h-4">
                  <Check className={`w-4 h-4 absolute transition-opacity duration-200 ${alert.is_acknowledged ? 'opacity-0' : 'opacity-100'}`} />
                  <span className="t-success-check absolute" data-state={alert.is_acknowledged ? "in" : "out"} aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                </div>
                <span>
                  {alert.is_acknowledged 
                    ? "Threat Acknowledged" 
                    : isAcknowledging 
                      ? "Updating..." 
                      : "Acknowledge Threat"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
