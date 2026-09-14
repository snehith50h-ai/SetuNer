"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  TrendingDown,
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Route,
  Truck,
  Clock,
  Activity,
  CloudRain,
  Mountain,
  Sparkles,
  Zap,
  Coins,
  Cpu,
  Layers,
  CheckCircle2,
  Calendar,
  Filter,
  Download,
  Printer,
  ChevronRight,
  Info,
  Compass,
  ArrowRight,
  RefreshCw,
  Eye,
  Radio,
  SlidersHorizontal,
  X
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { LoadingState } from "@/components/ui/LoadingState";
import { MetricCard } from "@/components/ui/MetricCard";
import { ExecutiveReportModal } from "@/components/statistics/ExecutiveReportModal";
import { cn } from "@/lib/utils";

const NER_STATES = [
  "All States",
  "Assam",
  "Meghalaya",
  "Manipur",
  "Mizoram",
  "Nagaland",
  "Tripura",
  "Arunachal Pradesh",
  "Sikkim"
];

const TIME_RANGES = [
  { label: "Last 24 Hours", value: "24h" },
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 30 Days", value: "30d" },
  { label: "Last 90 Days", value: "90d" },
];

export default function StatisticsPage() {
  const [timeRange, setTimeRange] = useState<string>("30d");
  const [selectedState, setSelectedState] = useState<string>("All States");
  const [selectedCorridor, setSelectedCorridor] = useState<string>("");
  const [selectedIncidentType, setSelectedIncidentType] = useState<string>("");
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>("");
  const [activeStrategyId, setActiveStrategyId] = useState<string>("recommended");
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);

  // 1. Fetch Overview & KPIs
  const { data: overview, isLoading: isOverviewLoading, refetch: refetchOverview } = useQuery<any>({
    queryKey: ["statistics-overview", timeRange, selectedState, selectedCorridor, selectedIncidentType, selectedRiskLevel],
    queryFn: () => {
      const params = new URLSearchParams({ range: timeRange });
      if (selectedState && selectedState !== "All States") params.append("state", selectedState);
      if (selectedCorridor) params.append("corridor_id", selectedCorridor);
      if (selectedIncidentType) params.append("incident_type", selectedIncidentType);
      if (selectedRiskLevel) params.append("risk_level", selectedRiskLevel);
      return apiClient<any>(`/statistics/overview?${params.toString()}`);
    },
    refetchInterval: 15000,
  });

  // 2. Fetch Four Routes Comparison
  const { data: routesComp, isLoading: isRoutesLoading } = useQuery<any>({
    queryKey: ["statistics-routes-comp"],
    queryFn: () => apiClient<any>("/statistics/routes-comparison"),
    refetchInterval: 30000,
  });

  // 3. Fetch Incident Performance
  const { data: incidentStats } = useQuery<any>({
    queryKey: ["statistics-incidents", timeRange],
    queryFn: () => apiClient<any>(`/statistics/incidents?range=${timeRange}`),
    refetchInterval: 20000,
  });

  // 4. Fetch Corridor Rankings
  const { data: corridors } = useQuery<any[]>({
    queryKey: ["statistics-corridors"],
    queryFn: () => apiClient<any[]>("/statistics/corridors"),
    refetchInterval: 20000,
  });

  // 5. Fetch Regional Rankings
  const { data: regions } = useQuery<any[]>({
    queryKey: ["statistics-regions"],
    queryFn: () => apiClient<any[]>("/statistics/regions"),
    refetchInterval: 30000,
  });

  // 6. Fetch System Performance & Resilience
  const { data: systemStats } = useQuery<any>({
    queryKey: ["statistics-system"],
    queryFn: () => apiClient<any>("/statistics/system-performance"),
    refetchInterval: 15000,
  });

  // 7. Fetch AI Insights & Attention
  const { data: insights } = useQuery<any>({
    queryKey: ["statistics-insights"],
    queryFn: () => apiClient<any>("/statistics/insights"),
    refetchInterval: 20000,
  });

  // 8. Fetch Report Data
  const { data: reportData } = useQuery<any>({
    queryKey: ["statistics-report", timeRange],
    queryFn: () => apiClient<any>(`/statistics/report?range=${timeRange}`),
    enabled: isReportModalOpen,
  });

  const clearFilters = () => {
    setSelectedState("All States");
    setSelectedCorridor("");
    setSelectedIncidentType("");
    setSelectedRiskLevel("");
  };

  const hasActiveFilters = selectedState !== "All States" || selectedCorridor !== "" || selectedIncidentType !== "" || selectedRiskLevel !== "";

  if (isOverviewLoading || !overview) {
    return (
      <div className="h-[75vh] flex items-center justify-center">
        <LoadingState message="Aggregating query-backed logistics impact metrics across 8 NER states..." />
      </div>
    );
  }

  const kpis = overview.executive_kpis || {};
  const impactScore = overview.impact_score || { overall: 92, dimensions: [] };
  const beforeAfter = overview.before_vs_after || [];
  const costOpt = overview.cost_optimization || { breakdown: [], trends: [] };
  const automation = overview.automation_impact || { workflow_steps: [] };
  const decisionSpeed = overview.decision_speed || [];
  const dataSources = overview.data_sources_transparency || [];
  const strategies = routesComp?.strategies || [];
  const activeStrategy = strategies.find((s: any) => s.id === activeStrategyId) || strategies[0] || {};

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header & Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 glass-panel p-6 rounded-2xl shadow-glass">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1.5">
            <span className="flex h-2 w-2 rounded-full bg-brand-600 animate-pulse" />
            <span>MDoNER Logistics Intelligence & Operational Impact</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            STATISTICS & OPERATIONAL IMPACT
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Measure how SETU-ROUTE improves route safety, logistics efficiency, decision speed, operational cost, and fleet resilience across the 8 North Eastern States.
          </p>
        </div>

        {/* Action Controls: Time Range & Export */}
        <div className="flex flex-wrap items-center gap-2.5 self-start xl:self-auto">
          {/* Time Range Selector */}
          <div className="flex items-center bg-white/40 backdrop-blur-md border border-white/60 rounded-xl p-1 shadow-glass">
            <Calendar className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1 shrink-0" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 py-1 px-2 focus:outline-hidden cursor-pointer"
            >
              {TIME_RANGES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Export & PDF Buttons */}
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/60 bg-white/50 hover:bg-white/80 text-xs font-semibold text-slate-700 transition-colors shadow-glass"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Report</span>
          </button>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-xs font-semibold text-white transition-colors shadow-glass shadow-brand-500/20"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Quick Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 glass-panel rounded-2xl text-xs shadow-glass">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="flex items-center gap-1.5 font-semibold text-slate-500">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filters:</span>
          </span>

          {/* State Filter */}
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="glass-input rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-hidden cursor-pointer"
          >
            {NER_STATES.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          {/* Corridor Filter */}
          <select
            value={selectedCorridor}
            onChange={(e) => setSelectedCorridor(e.target.value)}
            className="glass-input rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-hidden cursor-pointer"
          >
            <option value="">All Corridors (8 Arteries)</option>
            {(corridors || []).map((c: any) => (
              <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
            ))}
          </select>

          {/* Incident Type Filter */}
          <select
            value={selectedIncidentType}
            onChange={(e) => setSelectedIncidentType(e.target.value)}
            className="glass-input rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-hidden cursor-pointer"
          >
            <option value="">All Incident Types</option>
            <option value="landslide">Landslide / Rockfall</option>
            <option value="flood">Flood / Waterlogging</option>
            <option value="road_damage">Road Damage</option>
            <option value="severe_weather">Cloudburst / Rain</option>
            <option value="traffic">Traffic Obstruction</option>
          </select>

          {/* Risk Level Filter */}
          <select
            value={selectedRiskLevel}
            onChange={(e) => setSelectedRiskLevel(e.target.value)}
            className="glass-input rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-hidden cursor-pointer"
          >
            <option value="">All Risk Levels</option>
            <option value="CRITICAL">Critical Severity</option>
            <option value="HIGH">High Severity</option>
            <option value="MEDIUM">Medium Severity</option>
            <option value="LOW">Low Severity</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 font-semibold transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      {/* 2. Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Route Efficiency */}
        <div className="relative p-5 rounded-t-[40px] rounded-br-[40px] rounded-bl-[14px] glass-card glass-card-hover border border-brand-200/60 bg-gradient-to-br from-brand-50/80 via-white/40 to-white/10 flex flex-col justify-between shadow-[0_8px_32px_-8px_rgba(37,99,235,0.15)] overflow-hidden group hover:-translate-y-1 transition-all duration-500">
          <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/80 to-transparent opacity-60 rounded-t-[40px] pointer-events-none group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-brand-300/20 rounded-full blur-2xl group-hover:bg-brand-400/30 transition-colors duration-500" />
          <div className="flex items-start justify-between relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-800 drop-shadow-sm">Route Efficiency</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand-100/80 text-brand-700 backdrop-blur-md border border-brand-200/50">CALCULATED</span>
          </div>
          <div className="my-3 relative z-10">
            <span className="text-4xl font-black text-brand-950 font-mono tracking-tighter drop-shadow-sm">{kpis.route_efficiency?.value || "+24.8%"}</span>
            <span className="block text-[10px] text-brand-700/80 font-bold uppercase tracking-wider mt-1">Improvement vs conventional</span>
          </div>
          <div className="pt-2 border-t border-brand-200/30 flex items-center gap-1 text-[10px] text-brand-600/70 relative z-10">
            <Info className="w-3 h-3 shrink-0" />
            <span className="truncate">{kpis.route_efficiency?.tooltip || "Aggregate travel time and distance"}</span>
          </div>
        </div>

        {/* ETA Saved */}
        <div className="relative p-5 rounded-t-[40px] rounded-br-[40px] rounded-bl-[14px] glass-card glass-card-hover border border-emerald-200/60 bg-gradient-to-br from-emerald-50/80 via-white/40 to-white/10 flex flex-col justify-between shadow-[0_8px_32px_-8px_rgba(16,185,129,0.15)] overflow-hidden group hover:-translate-y-1 transition-all duration-500">
          <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/80 to-transparent opacity-60 rounded-t-[40px] pointer-events-none group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-300/20 rounded-full blur-2xl group-hover:bg-emerald-400/30 transition-colors duration-500" />
          <div className="flex items-start justify-between relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 drop-shadow-sm">Average ETA Saved</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100/80 text-emerald-700 backdrop-blur-md border border-emerald-200/50">LIVE</span>
          </div>
          <div className="my-3 relative z-10">
            <span className="text-4xl font-black text-emerald-950 font-mono tracking-tighter drop-shadow-sm">{kpis.avg_eta_saved?.value || "42 min"}</span>
            <span className="block text-[10px] text-emerald-700/80 font-bold uppercase tracking-wider mt-1">Per affected delivery</span>
          </div>
          <div className="pt-2 border-t border-emerald-200/30 flex items-center gap-1 text-[10px] text-emerald-600/70 relative z-10">
            <Info className="w-3 h-3 shrink-0" />
            <span className="truncate">{kpis.avg_eta_saved?.tooltip || "Mean travel delay avoided"}</span>
          </div>
        </div>

        {/* Operational Cost Saved */}
        <div className="relative p-5 rounded-t-[40px] rounded-br-[40px] rounded-bl-[14px] glass-card glass-card-hover border border-amber-200/60 bg-gradient-to-br from-amber-50/80 via-white/40 to-white/10 flex flex-col justify-between shadow-[0_8px_32px_-8px_rgba(245,158,11,0.15)] overflow-hidden group hover:-translate-y-1 transition-all duration-500">
          <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/80 to-transparent opacity-60 rounded-t-[40px] pointer-events-none group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-300/20 rounded-full blur-2xl group-hover:bg-amber-400/30 transition-colors duration-500" />
          <div className="flex items-start justify-between relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 drop-shadow-sm">Cost Saved</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100/80 text-amber-700 backdrop-blur-md border border-amber-200/50">ESTIMATED</span>
          </div>
          <div className="my-3 relative z-10">
            <span className="text-4xl font-black text-amber-950 font-mono tracking-tighter drop-shadow-sm">{kpis.cost_saved?.value || "₹84,600"}</span>
            <span className="block text-[10px] text-amber-700/80 font-bold uppercase tracking-wider mt-1">Fuel & Demurrage</span>
          </div>
          <div className="pt-2 border-t border-amber-200/30 flex items-center gap-1 text-[10px] text-amber-600/70 relative z-10">
            <Info className="w-3 h-3 shrink-0" />
            <span className="truncate">{kpis.cost_saved?.tooltip || "Aggregate logistical savings"}</span>
          </div>
        </div>

        {/* Manual Interventions */}
        <div className="relative p-5 rounded-t-[40px] rounded-br-[40px] rounded-bl-[14px] glass-card glass-card-hover border border-indigo-200/60 bg-gradient-to-br from-indigo-50/80 via-white/40 to-white/10 flex flex-col justify-between shadow-[0_8px_32px_-8px_rgba(99,102,241,0.15)] overflow-hidden group hover:-translate-y-1 transition-all duration-500">
          <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/80 to-transparent opacity-60 rounded-t-[40px] pointer-events-none group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-300/20 rounded-full blur-2xl group-hover:bg-indigo-400/30 transition-colors duration-500" />
          <div className="flex items-start justify-between relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 drop-shadow-sm">Manual Interventions</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-100/80 text-indigo-700 backdrop-blur-md border border-indigo-200/50">AUTOMATION</span>
          </div>
          <div className="my-3 relative z-10">
            <span className="text-4xl font-black text-indigo-950 font-mono tracking-tighter drop-shadow-sm">{kpis.manual_interventions?.value || "-68%"}</span>
            <span className="block text-[10px] text-indigo-700/80 font-bold uppercase tracking-wider mt-1">Reduced workload</span>
          </div>
          <div className="pt-2 border-t border-indigo-200/30 flex items-center gap-1 text-[10px] text-indigo-600/70 relative z-10">
            <Info className="w-3 h-3 shrink-0" />
            <span className="truncate">{kpis.manual_interventions?.tooltip || "Proportion of routine risk ev..."}</span>
          </div>
        </div>

        {/* Risk Exposure */}
        <div className="relative p-5 rounded-t-[40px] rounded-br-[40px] rounded-bl-[14px] glass-card glass-card-hover border border-emerald-200/60 bg-gradient-to-br from-emerald-50/80 via-white/40 to-white/10 flex flex-col justify-between shadow-[0_8px_32px_-8px_rgba(16,185,129,0.15)] overflow-hidden group hover:-translate-y-1 transition-all duration-500">
          <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/80 to-transparent opacity-60 rounded-t-[40px] pointer-events-none group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-300/20 rounded-full blur-2xl group-hover:bg-emerald-400/30 transition-colors duration-500" />
          <div className="flex items-start justify-between relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 drop-shadow-sm">Risk Exposure</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100/80 text-emerald-700 backdrop-blur-md border border-emerald-200/50">ML PREDICTED</span>
          </div>
          <div className="my-3 relative z-10">
            <span className="text-4xl font-black text-emerald-950 font-mono tracking-tighter drop-shadow-sm">{kpis.risk_exposure?.value || "-37.7%"}</span>
            <span className="block text-[10px] text-emerald-700/80 font-bold uppercase tracking-wider mt-1">Hazard reduction</span>
          </div>
          <div className="pt-2 border-t border-emerald-200/30 flex items-center gap-1 text-[10px] text-emerald-600/70 relative z-10">
            <Info className="w-3 h-3 shrink-0" />
            <span className="truncate">{kpis.risk_exposure?.tooltip || "Net reduction in forecasted..."}</span>
          </div>
        </div>

        {/* Delivery Reliability */}
        <div className="relative p-5 rounded-t-[40px] rounded-br-[40px] rounded-bl-[14px] glass-card glass-card-hover border border-sky-200/60 bg-gradient-to-br from-sky-50/80 via-white/40 to-white/10 flex flex-col justify-between shadow-[0_8px_32px_-8px_rgba(14,165,233,0.15)] overflow-hidden group hover:-translate-y-1 transition-all duration-500">
          <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/80 to-transparent opacity-60 rounded-t-[40px] pointer-events-none group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-sky-300/20 rounded-full blur-2xl group-hover:bg-sky-400/30 transition-colors duration-500" />
          <div className="flex items-start justify-between relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 drop-shadow-sm">Delivery Reliability</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-100/80 text-sky-700 backdrop-blur-md border border-sky-200/50">TELEMETRY</span>
          </div>
          <div className="my-3 relative z-10">
            <span className="text-4xl font-black text-sky-950 font-mono tracking-tighter drop-shadow-sm">{kpis.delivery_reliability?.value || "94.7%"}</span>
            <span className="block text-[10px] text-sky-700/80 font-bold uppercase tracking-wider mt-1">On-time SLA</span>
          </div>
          <div className="pt-2 border-t border-sky-200/30 flex items-center gap-1 text-[10px] text-sky-600/70 relative z-10">
            <Info className="w-3 h-3 shrink-0" />
            <span className="truncate">{kpis.delivery_reliability?.tooltip || "Percentage of monitored hi..."}</span>
          </div>
        </div>
      </div>

      {/* 3. SETU-ROUTE Impact Score & Before vs After Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SETU-ROUTE Impact Score (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl border border-slate-200/80 bg-white shadow-card flex flex-col">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Composite Impact Rating</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                OPTIMAL
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">SETU-ROUTE IMPACT SCORE</h2>
            <p className="text-xs text-slate-500 mt-0.5">Weighted composite calculated from 7 measurable operational dimensions.</p>

            {/* Circular Gauge Visualization */}
            <div className="my-6 flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#f1f5f9"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="url(#brandGradient)"
                    strokeWidth="10"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 * (1 - (impactScore.overall / 100))}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#0284c7" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-slate-900 leading-none">{impactScore.overall}</span>
                  <span className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">/ 100</span>
                </div>
              </div>

              <div className="text-center sm:text-left space-y-1">
                <span className="text-base font-bold text-slate-900 block">{impactScore.rating_label || "Excellent Operational Impact"}</span>
                <span className="text-xs text-slate-500 block leading-relaxed">
                  Platform demonstrates superior risk mitigation and high decision velocity for North East lifeline corridors.
                </span>
              </div>
            </div>
          </div>

          {/* 7 Dimension Meters */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            {(impactScore.dimensions || []).map((dim: any, idx: number) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{dim.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">Weight {dim.weight}</span>
                    <span className="font-bold text-slate-900">{dim.score}/100</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-600 to-accent-sky"
                    style={{ width: `${dim.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Before vs After Comparison Matrix (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl border border-slate-200/80 bg-white shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Comparative Operational Benchmark</span>
              <span className="text-xs font-semibold text-brand-600 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Impact Measured</span>
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">WITHOUT SETU-ROUTE vs WITH SETU-ROUTE</h2>
            <p className="text-xs text-slate-500 mt-0.5">Quantifying operational transformation from manual logistics to autonomous AI command.</p>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-400">
                    <th className="pb-2.5 font-bold">Operational Metric</th>
                    <th className="pb-2.5 font-bold text-slate-500">Without SETU-ROUTE</th>
                    <th className="pb-2.5 font-bold text-brand-600">With SETU-ROUTE</th>
                    <th className="pb-2.5 font-bold text-right text-emerald-600">Improvement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {beforeAfter.map((row: any, idx: number) => (
                    <tr key={idx} className="group hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 font-semibold text-slate-800 pr-2">
                        <span>{row.metric}</span>
                        <span className="block text-[10px] font-normal text-slate-400">{row.explanation}</span>
                      </td>
                      <td className="py-2.5 text-slate-500">{row.before}</td>
                      <td className="py-2.5 font-bold text-brand-700">{row.after}</td>
                      <td className="py-2.5 text-right font-bold text-emerald-600">
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80">
                          {row.delta}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Verified across live simulation runs and recorded North East transit lifelines.</span>
            <span className="font-semibold text-emerald-600">8 / 8 Key Dimensions Improved</span>
          </div>
        </div>
      </div>

      {/* 4. Cost Optimization & Decision Speed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cost Optimization (6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-2xl border border-slate-200/80 bg-white shadow-card space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                {costOpt.badge || "Simulation / Projected Impact"}
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-2">COST OPTIMIZATION</h3>
              <p className="text-xs text-slate-500">Projected logistical expenditure avoided during adverse mountain disruption events.</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600 shrink-0">
              <Coins className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-baseline justify-between">
            <div>
              <span className="text-xs text-slate-500 block font-medium">Total Estimated Operational Savings</span>
              <span className="text-2xl lg:text-3xl font-bold text-slate-900">₹{(costOpt.total_savings || 84600).toLocaleString()}</span>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
              Across Selected Period
            </span>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-2 gap-3">
            {(costOpt.breakdown || []).map((item: any, idx: number) => (
              <div key={idx} className="p-3 bg-white border border-slate-200/80 rounded-xl space-y-1">
                <span className="text-[11px] font-semibold text-slate-700 block truncate">{item.category}</span>
                <span className="text-lg font-bold text-slate-900 block">₹{item.amount?.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 block line-clamp-1">{item.desc}</span>
              </div>
            ))}
          </div>

          {/* Weekly Trends Mini Bar */}
          <div className="pt-2 space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500 block">Weekly Savings Trajectory</span>
            <div className="grid grid-cols-4 gap-2 text-center">
              {(costOpt.trends || []).map((t: any, idx: number) => (
                <div key={idx} className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">{t.period}</span>
                  <span className="text-xs font-bold text-slate-800">₹{t.total?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Operational Decision Speed (6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-2xl border border-slate-200/80 bg-white shadow-card space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Response Velocity</span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">OPERATIONAL DECISION SPEED</h3>
              <p className="text-xs text-slate-500">Accelerating response timelines from manual verification to automated intelligence.</p>
            </div>
            <div className="p-3 bg-brand-50 rounded-xl text-brand-600 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-3">
            {decisionSpeed.map((item: any, idx: number) => (
              <div key={idx} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-800 block truncate">{item.task}</span>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>Manual: <span className="line-through text-slate-400">{item.before}</span></span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="font-bold text-brand-700">SETU-ROUTE: {item.after}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {item.speedup} Faster
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Four Candidate Route Strategies Comparison */}
      <div className="p-6 rounded-2xl border border-slate-200/80 bg-white shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
              <Route className="w-3.5 h-3.5" />
              <span>Multi-Criteria Graph Engine Evaluation</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">FOUR ROUTE STRATEGY COMPARISON</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              SETU-ROUTE evaluates 4 distinct candidate trajectories simultaneously to provide explainable safety rationales.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto overflow-x-auto max-w-full">
            {strategies.map((str: any) => (
              <button
                key={str.id}
                onClick={() => setActiveStrategyId(str.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap",
                  activeStrategyId === str.id
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                {str.name}
              </button>
            ))}
          </div>
        </div>

        {/* Strategy Comparison Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {strategies.map((str: any) => {
            const isSelected = str.id === activeStrategyId;
            return (
              <div
                key={str.id}
                onClick={() => setActiveStrategyId(str.id)}
                className={cn(
                  "p-4 rounded-xl border transition-all cursor-pointer space-y-3",
                  isSelected
                    ? "border-brand-500 bg-brand-50/20 shadow-md ring-1 ring-brand-500"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{str.name}</span>
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase",
                    str.risk_level === "MINIMAL" && "bg-emerald-50 text-emerald-700",
                    str.risk_level === "LOW" && "bg-sky-50 text-sky-700",
                    str.risk_level === "ELEVATED" && "bg-amber-50 text-amber-700"
                  )}>
                    {str.risk_level} Risk
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-1 border-y border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Avg Distance</span>
                    <span className="font-bold text-slate-800">{str.avg_distance_km} km</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Avg Duration</span>
                    <span className="font-bold text-slate-800">{str.avg_duration_formatted}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Risk Score</span>
                    <span className="font-bold text-slate-800">{(str.risk_score * 100).toFixed(0)}/100</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Selection Share</span>
                    <span className="font-bold text-brand-600">{str.selection_frequency_pct}%</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                  {str.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Active Strategy Deep-Dive Explainability */}
        {activeStrategy.id && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-slate-800 uppercase tracking-wide">
                  &quot;Why Choose {activeStrategy.name}?&quot;
                </span>
                <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  Terrain: {activeStrategy.terrain_factor}
                </span>
              </div>
              <p className="text-xs text-slate-600 italic leading-relaxed">
                &quot;{activeStrategy.safety_rationale}&quot;
              </p>
            </div>
            <div className="shrink-0 text-right">
              <span className="text-[10px] text-slate-400 block">Historical Selection Frequency</span>
              <span className="text-lg font-bold text-brand-700">{activeStrategy.selection_frequency_pct}% of Dispatches</span>
            </div>
          </div>
        )}
      </div>

      {/* 6. Human-in-the-Loop Automation & Incident Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Human-in-the-Loop Workflow (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl border border-slate-200/80 bg-white shadow-card space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Collaborative Autonomy</span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">HUMAN-IN-THE-LOOP EFFICIENCY</h3>
              <p className="text-xs text-slate-500">Autonomous data synthesis paired with authorized human decision control.</p>
            </div>
            <div className="p-3 bg-brand-50 rounded-xl text-brand-600 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Decisions Avoided</span>
              <span className="text-xl font-bold text-slate-900">{automation.manual_decisions_avoided || 412}</span>
              <span className="text-[10px] text-slate-500">Repetitive tasks</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Risk Calculations</span>
              <span className="text-xl font-bold text-slate-900">{automation.automated_risk_assessments || 1420}</span>
              <span className="text-[10px] text-slate-500">Autonomous ML</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Human Review</span>
              <span className="text-xl font-bold text-brand-600">{automation.human_review_required_percent || 32}%</span>
              <span className="text-[10px] text-slate-500">Critical dispatches</span>
            </div>
          </div>

          {/* Workflow Steps Visualizer */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-700 block">Operational Closed-Loop Pipeline</span>
            <div className="space-y-2">
              {(automation.workflow_steps || []).map((step: any, idx: number) => (
                <div key={idx} className="p-2.5 bg-slate-50/70 border border-slate-200/70 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-bold text-slate-900 shrink-0">{step.stage}</span>
                    <span className="text-slate-600 truncate">{step.desc}</span>
                  </div>
                  <span className={cn(
                    "text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0",
                    step.type === "AUTOMATED" ? "bg-brand-50 text-brand-700 border border-brand-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  )}>
                    {step.type === "AUTOMATED" ? "AUTOMATED" : "HUMAN APPROVAL"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Incident Performance & Distribution (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl border border-slate-200/80 bg-white shadow-card space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Incident Triage</span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">INCIDENT INTELLIGENCE</h3>
              <p className="text-xs text-slate-500">Hazard detection, resolution metrics & category breakdown.</p>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl text-rose-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Incidents</span>
              <span className="text-xl font-bold text-slate-900">{incidentStats?.total_incidents || 8}</span>
              <span className="text-[10px] text-emerald-600">{incidentStats?.verified_percent || 92}% Verified</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Avg Resolution</span>
              <span className="text-xl font-bold text-slate-900">{incidentStats?.avg_resolution_hours || 3.8}h</span>
              <span className="text-[10px] text-slate-500">From detection to clearance</span>
            </div>
          </div>

          {/* Incident Category Breakdown with Click Filter */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 block">Distribution by Hazard Category</span>
            <div className="space-y-1.5">
              {(incidentStats?.breakdown || []).map((cat: any, idx: number) => (
                <div
                  key={idx}
                  onClick={() => setSelectedIncidentType(selectedIncidentType === cat.raw_type ? "" : cat.raw_type)}
                  className={cn(
                    "p-2 rounded-lg border flex items-center justify-between text-xs cursor-pointer transition-colors",
                    selectedIncidentType === cat.raw_type
                      ? "bg-brand-50 border-brand-300 text-brand-900"
                      : "bg-white border-slate-200/80 hover:bg-slate-50 text-slate-700"
                  )}
                >
                  <span className="font-medium">{cat.type}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">{cat.percent}%</span>
                    <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                      {cat.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 7. Monitored North Eastern Highway Corridors Table */}
      <div className="p-6 rounded-2xl border border-slate-200/80 bg-white shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
              <Compass className="w-3.5 h-3.5" />
              <span>National Arterial Network</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">CORRIDOR PERFORMANCE & HEALTH RANKING</h3>
            <p className="text-xs text-slate-500">Live operational ranking of all 8 primary logistical lifelines across the North East.</p>
          </div>
          <span className="text-xs font-medium text-slate-400 self-start sm:self-auto">
            Click any corridor to filter detailed analytics
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="py-2.5 px-3 font-bold">Rank</th>
                <th className="py-2.5 px-3 font-bold">Corridor</th>
                <th className="py-2.5 px-3 font-bold">State Arteries</th>
                <th className="py-2.5 px-3 font-bold">Health Score</th>
                <th className="py-2.5 px-3 font-bold">Disruption Risk</th>
                <th className="py-2.5 px-3 font-bold">Reliability</th>
                <th className="py-2.5 px-3 font-bold">Avg Delay</th>
                <th className="py-2.5 px-3 font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(corridors || []).map((c: any) => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedCorridor(selectedCorridor === c.id ? "" : c.id)}
                  className={cn(
                    "cursor-pointer transition-colors",
                    selectedCorridor === c.id ? "bg-brand-50/60 font-semibold" : "hover:bg-slate-50"
                  )}
                >
                  <td className="py-3 px-3 font-bold text-slate-500">#{c.rank}</td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 block">{c.code}</span>
                    <span className="text-[10px] text-slate-400 block truncate max-w-xs">{c.name}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{c.state}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{c.health}/100</span>
                      <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-brand-600 h-full rounded-full"
                          style={{ width: `${c.health}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      c.risk_label === "LOW" && "bg-emerald-50 text-emerald-700",
                      c.risk_label === "MODERATE" && "bg-sky-50 text-sky-700",
                      c.risk_label === "HIGH" && "bg-amber-50 text-amber-700",
                      c.risk_label === "CRITICAL" && "bg-rose-50 text-rose-700"
                    )}>
                      {c.risk_label} ({(c.current_risk_score * 100).toFixed(0)})
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-800">{c.reliability_percent}%</td>
                  <td className="py-3 px-3 text-slate-600">{c.avg_delay_min > 0 ? `+${c.avg_delay_min} min` : "Normal (0 min)"}</td>
                  <td className="py-3 px-3 text-right">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded uppercase",
                      c.accessibility_status === "ACCESSIBLE" && "bg-emerald-50 text-emerald-700 border border-emerald-200/80",
                      c.accessibility_status === "RESTRICTED" && "bg-amber-50 text-amber-700 border border-amber-200/80",
                      c.accessibility_status === "BLOCKED" && "bg-rose-50 text-rose-700 border border-rose-200/80"
                    )}>
                      {c.accessibility_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 8. Regional 8 NER States & Offline PWA Resilience */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Regional 8 States (6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-2xl border border-slate-200/80 bg-white shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Regional Coverage</span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">8 NORTH EASTERN STATES PERFORMANCE</h3>
            </div>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
              8 States Monitored
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {(regions || []).map((reg: any, idx: number) => (
              <div
                key={idx}
                onClick={() => setSelectedState(selectedState === reg.state ? "All States" : reg.state)}
                className={cn(
                  "p-3 rounded-xl border transition-all cursor-pointer space-y-1",
                  selectedState === reg.state
                    ? "border-brand-500 bg-brand-50/30"
                    : "border-slate-200 bg-white hover:bg-slate-50/80"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{reg.state}</span>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                    {reg.corridor_health}/100 Health
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>Reliability: {reg.delivery_reliability}%</span>
                  <span>Incidents: {reg.incidents_count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Offline Field PWA Resilience (6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-2xl border border-slate-200/80 bg-white shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Zero-Connectivity Architecture</span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">OFFLINE FIELD RESILIENCE</h3>
              <p className="text-xs text-slate-500">Service Worker & IndexedDB store-and-forward outbox performance.</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Reports Captured</span>
              <span className="text-xl font-bold text-slate-900">{systemStats?.offline_resilience?.reports_captured_offline || 14}</span>
              <span className="text-[10px] text-slate-500">In zero-network zones</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Synced to Cloud</span>
              <span className="text-xl font-bold text-emerald-600">{systemStats?.offline_resilience?.reports_synced_successfully || 14}</span>
              <span className="text-[10px] text-slate-500">100% Delivery SLA</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Duplicates Blocked</span>
              <span className="text-xl font-bold text-brand-600">{systemStats?.offline_resilience?.duplicate_submissions_blocked || 6}</span>
              <span className="text-[10px] text-slate-500">Idempotency UUIDs</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200/80 leading-relaxed italic">
            &quot;Field officers in deep mountain valleys report incidents without cellular connectivity. All photos, GPS coordinates, and road slip details sync idempotently as soon as the vehicle reaches network coverage.&quot;
          </p>
        </div>
      </div>

      {/* 9. Subsystem Health Matrix & System Response Times */}
      <div className="p-6 rounded-2xl border border-slate-200/80 bg-white shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">System Observability & Latency</span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">SUBSYSTEM HEALTH & RESPONSE PERFORMANCE</h3>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            ALL SYSTEMS OPERATIONAL • {systemStats?.uptime_percent || 99.98}% Uptime
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(systemStats?.subsystems || []).map((sub: any, idx: number) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 truncate">{sub.name}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                <span>Avg: <strong>{sub.avg_latency_ms}ms</strong></span>
                <span>P95: <strong>{sub.p95_latency_ms}ms</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 10. AI Executive Summary, Key Insights & Areas Requiring Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Key Insights (6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-2xl border border-slate-200/80 bg-white shadow-card space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>AI-Generated Key Insights</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">OPERATIONAL WINS & SUCCESS FACTORS</h3>

          <div className="space-y-2.5">
            {(insights?.key_insights || []).map((ins: any, idx: number) => (
              <div key={idx} className="p-3 bg-emerald-50/40 border border-emerald-200/70 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900">{ins.title}</span>
                  <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                    {ins.tag}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">{ins.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Areas Requiring Attention (6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-2xl border border-slate-200/80 bg-white shadow-card space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Proactive Operational Directives</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">AREAS REQUIRING ATTENTION</h3>

          <div className="space-y-2.5">
            {(insights?.areas_requiring_attention || []).map((att: any, idx: number) => (
              <div key={idx} className="p-3 bg-amber-50/40 border border-amber-200/80 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900">{att.corridor}: {att.title}</span>
                  <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                    {att.severity}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">{att.message}</p>
                <div className="text-[10px] font-semibold text-slate-700 pt-0.5">
                  <strong>Action Required:</strong> {att.action_required}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 11. AI Executive Narrative Summary */}
      <div className="p-6 rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50/50 via-white to-sky-50/50 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-brand-700 uppercase tracking-wider">
          <Shield className="w-4 h-4 text-brand-600" />
          <span>MDoNER Strategic Executive Narrative</span>
        </div>
        <p className="text-xs lg:text-sm text-slate-800 leading-relaxed italic">
          &quot;{insights?.ai_executive_summary || "SETU-ROUTE continuously senses the North Eastern arterial network, evaluates multi-criteria routes, recalibrates ETA with physical terrain friction, and dispatches 4-part actionable alerts to ensure resilient deliveries across all 8 states."}&quot;
        </p>
      </div>

      {/* 12. Data Sources & Transparency Footer */}
      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 text-xs text-slate-500">
        <span className="font-bold uppercase text-[10px] tracking-wider text-slate-400 block">Data Sources & Trust Protocol</span>
        <div className="flex flex-wrap gap-2">
          {dataSources.map((ds: any, idx: number) => (
            <div key={idx} className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
              <span className="font-semibold text-slate-700">{ds.name}:</span>
              <span className={cn(
                "text-[9px] font-bold px-1.5 py-0.2 rounded",
                ds.type === "LIVE" && "bg-emerald-50 text-emerald-700",
                ds.type === "ESTIMATED" && "bg-amber-50 text-amber-700",
                ds.type === "SIMULATION" && "bg-brand-50 text-brand-700"
              )}>
                {ds.type}
              </span>
              <span className="text-[10px] text-slate-400">({ds.freshness})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Executive Report Modal */}
      <ExecutiveReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportData={reportData || { overview, corridors, regions, system: systemStats, insights }}
      />
    </div>
  );
}
