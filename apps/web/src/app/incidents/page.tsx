"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Plus,
  Filter,
  MapPin,
  Clock,
  User,
  CheckCircle2,
  ExternalLink,
  Camera,
  Search,
  ShieldAlert,
  Flame,
  Check,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RefreshCw,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Incident, IncidentStatus, District, Road } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { LoadingState, TableSkeleton } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { formatDateTime, formatRelativeTime } from "@/lib/utils";
import { useToast } from "@/components/ui/ToastProvider";

type SortField = "incident_code" | "type" | "severity" | "title" | "created_at" | "status";

export default function IncidentsPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);

  // Sorting & Pagination
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Form State & Inline Validation
  const [newIncident, setNewIncident] = useState({
    type: "landslide",
    severity: "HIGH",
    title: "",
    description: "",
    latitude: 25.5788,
    longitude: 91.8933,
    address: "",
    district_id: "",
    road_id: "",
    affected_traffic_direction: "BOTH",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch Incidents
  const {
    data: incidents,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<Incident[]>({
    queryKey: ["incidents", selectedSeverity, selectedStatus],
    queryFn: () => {
      let endpoint = "/incidents?";
      if (selectedSeverity !== "ALL") endpoint += `severity=${selectedSeverity}&`;
      if (selectedStatus !== "ALL") endpoint += `status=${selectedStatus}&`;
      return apiClient<Incident[]>(endpoint);
    },
    refetchInterval: 6000,
  });

  // Fetch Districts and Roads for Create Form
  const { data: districts } = useQuery<District[]>({
    queryKey: ["districts"],
    queryFn: () => apiClient<District[]>("/districts"),
  });

  const { data: roads } = useQuery<Road[]>({
    queryKey: ["roads"],
    queryFn: () => apiClient<Road[]>("/roads"),
  });

  // Create Incident Mutation
  const createMutation = useMutation({
    mutationFn: (data: any) =>
      apiClient<Incident>("/incidents", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      setIsCreateModalOpen(false);
      setFormErrors({});
      setNewIncident({
        type: "landslide",
        severity: "HIGH",
        title: "",
        description: "",
        latitude: 25.5788,
        longitude: 91.8933,
        address: "",
        district_id: "",
        road_id: "",
        affected_traffic_direction: "BOTH",
      });
      addToast({
        title: "Incident Registered",
        description: `Incident ${created.incident_code} logged and dispatched to regional GIS map.`,
        type: "success",
      });
    },
    onError: (err: any) => {
      setFormErrors({ submit: err.message || "Failed to log incident." });
    },
  });

  // Update Incident Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: IncidentStatus }) =>
      apiClient<Incident>(`/incidents/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      setActiveIncident(updated);
      addToast({
        title: "Status Updated",
        description: `Incident status transitioned to ${updated.status}.`,
        type: "success",
      });
    },
  });

  // Client-side Validation (Section 32)
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!newIncident.title.trim()) {
      errors.title = "Incident title is required.";
    }
    if (!newIncident.description.trim()) {
      errors.description = "Operational description is required.";
    }
    if (!newIncident.district_id) {
      errors.district_id = "Please assign an affected district.";
    }

    // Geographic boundary validation: Northeast India
    if (
      isNaN(newIncident.latitude) ||
      newIncident.latitude < 21.0 ||
      newIncident.latitude > 30.5
    ) {
      errors.latitude = "Latitude must be within Northeast India (21.0°N – 30.5°N).";
    }
    if (
      isNaN(newIncident.longitude) ||
      newIncident.longitude < 88.0 ||
      newIncident.longitude > 98.0
    ) {
      errors.longitude = "Longitude must be within Northeast India (88.0°E – 98.0°E).";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    createMutation.mutate(newIncident);
  };

  // Sorting Handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Filtered & Sorted Incidents
  const filteredAndSorted = useMemo(() => {
    let result = (incidents || []).filter((inc) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        inc.title.toLowerCase().includes(q) ||
        inc.incident_code.toLowerCase().includes(q) ||
        inc.type.toLowerCase().includes(q) ||
        (inc.address && inc.address.toLowerCase().includes(q))
      );
    });

    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === "severity") {
        const severityRank: Record<string, number> = {
          CRITICAL: 4,
          HIGH: 3,
          MEDIUM: 2,
          LOW: 1,
        };
        valA = severityRank[a.severity] || 0;
        valB = severityRank[b.severity] || 0;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [incidents, searchQuery, sortField, sortOrder]);

  // Paginated Slice
  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
  const paginatedIncidents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, currentPage, pageSize]);

  const criticalCount = (incidents || []).filter(
    (i) => i.severity === "CRITICAL" && i.status !== "RESOLVED"
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 uppercase tracking-wider mb-1">
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>Hazard & Blockage Management</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <span>Incident Triage & Highway Obstructions</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time verified reports on landslides, road washouts, bridge strains & arterial bottlenecks.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {criticalCount > 0 && (
            <div className="flex items-center gap-2 text-xs font-semibold bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-xl text-rose-800 shadow-sm animate-pulse">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>{criticalCount} Critical Blockages</span>
            </div>
          )}

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Report New Incident</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl shadow-glass grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search code, title, hazard, highway..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full glass-input rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 shrink-0">Severity:</span>
          <select
            value={selectedSeverity}
            onChange={(e) => {
              setSelectedSeverity(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 glass-input rounded-xl px-3 py-2 text-xs text-slate-700 font-medium transition-all"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical (Total Block)</option>
            <option value="HIGH">High (Major Delay)</option>
            <option value="MEDIUM">Medium (Single Lane)</option>
            <option value="LOW">Low (Caution)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 shrink-0">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 glass-input rounded-xl px-3 py-2 text-xs text-slate-700 font-medium transition-all"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="INVESTIGATING">Investigating</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 text-slate-400 text-xs font-medium">
          <span>{filteredAndSorted.length} incidents found</span>
          <button
            onClick={() => refetch()}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-white/40 transition-colors"
            title="Refresh Incidents"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Incidents Table / Content */}
      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : isError ? (
        <ErrorState
          title="Unable to Retrieve Incident Database"
          message="Connection to regional incident ingestion gateway failed. Data may be degraded."
          onRetry={() => refetch()}
          isRetrying={isFetching}
          errorDetails={error}
        />
      ) : filteredAndSorted.length === 0 ? (
        <EmptyState
          title="No Incidents Match Selected Filters"
          description="All monitored Northeast highway corridors in this category are operating without reported obstructions."
        />
      ) : (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-glass">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/60 backdrop-blur-md border-b border-slate-200/60 text-slate-400 uppercase tracking-wider text-[11px] font-semibold select-none">
                <tr>
                  <th
                    onClick={() => handleSort("incident_code")}
                    className="py-3.5 px-5 cursor-pointer hover:text-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Incident Code</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-300" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("type")}
                    className="py-3.5 px-5 cursor-pointer hover:text-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Hazard Type</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-300" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("severity")}
                    className="py-3.5 px-5 cursor-pointer hover:text-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Severity</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-300" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("title")}
                    className="py-3.5 px-5 cursor-pointer hover:text-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Title & Location</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-300" />
                    </div>
                  </th>
                  <th className="py-3.5 px-5">Traffic Impact</th>
                  <th
                    onClick={() => handleSort("created_at")}
                    className="py-3.5 px-5 cursor-pointer hover:text-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Reported</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-300" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("status")}
                    className="py-3.5 px-5 text-right cursor-pointer hover:text-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Triage State</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-300" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60 text-slate-700">
                {paginatedIncidents.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => setActiveIncident(inc)}
                    className="hover:bg-brand-500/5 cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-5 font-mono font-bold text-slate-900 group-hover:text-brand-600">
                      {inc.incident_code}
                    </td>
                    <td className="py-4 px-5 capitalize text-slate-800 font-medium">
                      {inc.type.replace(/_/g, " ")}
                    </td>
                    <td className="py-4 px-5">
                      <StatusBadge status={inc.severity} size="sm" />
                    </td>
                    <td className="py-4 px-5 max-w-xs">
                      <p className="font-semibold text-slate-900 truncate">{inc.title}</p>
                      {inc.address && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{inc.address}</p>
                      )}
                    </td>
                    <td className="py-4 px-5 text-slate-600 font-medium">
                      {inc.affected_traffic_direction.replace(/_/g, " ")}
                    </td>
                    <td className="py-4 px-5 text-slate-400">
                      {formatRelativeTime(inc.created_at)}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <StatusBadge status={inc.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 text-xs text-slate-500">
              <span>
                Page <strong className="text-slate-800">{currentPage}</strong> of{" "}
                <strong className="text-slate-800">{totalPages}</strong>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                        currentPage === pageNum
                          ? "bg-brand-600 text-white shadow-xs"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Incident Detail Modal */}
      {activeIncident && (
        <Modal
          isOpen={!!activeIncident}
          onClose={() => setActiveIncident(null)}
          title={`Incident Detail: ${activeIncident.incident_code}`}
          description={`Reported ${formatDateTime(activeIncident.created_at)}`}
          maxWidth="xl"
        >
          <div className="space-y-5 text-xs text-slate-700">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <StatusBadge status={activeIncident.severity} size="md" />
                <StatusBadge status={activeIncident.status} size="md" />
              </div>
              <span className="text-slate-800 capitalize font-bold bg-slate-100 px-3 py-1 rounded-lg">
                {activeIncident.type.replace(/_/g, " ")}
              </span>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-sm">{activeIncident.title}</h4>
              <p className="mt-1.5 text-slate-600 leading-relaxed">{activeIncident.description}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-600">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Coordinates</span>
                <span className="font-mono font-medium text-slate-800">
                  {activeIncident.latitude.toFixed(4)}°N, {activeIncident.longitude.toFixed(4)}°E
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Traffic Direction</span>
                <span className="font-medium text-slate-800 capitalize">
                  {activeIncident.affected_traffic_direction.replace(/_/g, " ")}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Verification</span>
                <span className="font-medium text-slate-800">
                  {activeIncident.verification_status || "Verified Official"}
                </span>
              </div>
            </div>

            {/* Status Transition Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Authorized Triage Controls</span>
              <div className="flex items-center gap-2">
                {activeIncident.status === "OPEN" && (
                  <button
                    onClick={() =>
                      updateStatusMutation.mutate({
                        id: activeIncident.id,
                        status: "INVESTIGATING",
                      })
                    }
                    disabled={updateStatusMutation.isPending}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold border border-amber-200 transition-colors disabled:opacity-50"
                  >
                    Investigate
                  </button>
                )}
                {activeIncident.status !== "RESOLVED" && (
                  <button
                    onClick={() =>
                      updateStatusMutation.mutate({
                        id: activeIncident.id,
                        status: "RESOLVED",
                      })
                    }
                    disabled={updateStatusMutation.isPending}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark Cleared / Resolved</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Incident Modal with Inline Validation & Anti-duplicate Submissions */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Log New Transportation Incident"
        description="Submit verified field report to update arterial network accessibility."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs text-slate-700">
          {formErrors.submit && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-medium">
              {formErrors.submit}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1.5">Incident Type *</label>
              <select
                value={newIncident.type}
                onChange={(e) => setNewIncident({ ...newIncident, type: e.target.value })}
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
              >
                <option value="landslide">Landslide</option>
                <option value="flood">Flood / Inundation</option>
                <option value="road_damage">Road Subgrade Failure</option>
                <option value="bridge_damage">Bridge Structural Damage</option>
                <option value="rockfall">Rockfall Debris</option>
                <option value="severe_weather">Severe Cloudburst / Fog</option>
                <option value="traffic">Traffic Bottleneck</option>
                <option value="accident">Accident Obstruction</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1.5">Severity *</label>
              <select
                value={newIncident.severity}
                onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value })}
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
              >
                <option value="CRITICAL">Critical (Total Road Blockage)</option>
                <option value="HIGH">High (Major Restriction)</option>
                <option value="MEDIUM">Medium (Single Lane / Slow)</option>
                <option value="LOW">Low (Caution Only)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1.5">Incident Title *</label>
            <input
              type="text"
              placeholder="e.g. Sela Pass Mudslide blocking Km 284"
              value={newIncident.title}
              onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
              className={`w-full bg-slate-50/70 border rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:ring-2 transition-all ${
                formErrors.title
                  ? "border-rose-400 focus:ring-rose-400/20"
                  : "border-slate-200 focus:ring-brand-500/20 focus:border-brand-500"
              }`}
            />
            {formErrors.title && (
              <p className="text-[11px] text-rose-600 mt-1">{formErrors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1.5">Description & Operational Notes *</label>
            <textarea
              rows={3}
              placeholder="Detailed description of blockage, debris volume, road conditions, and emergency response deployed..."
              value={newIncident.description}
              onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
              className={`w-full bg-slate-50/70 border rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:ring-2 transition-all ${
                formErrors.description
                  ? "border-rose-400 focus:ring-rose-400/20"
                  : "border-slate-200 focus:ring-brand-500/20 focus:border-brand-500"
              }`}
            />
            {formErrors.description && (
              <p className="text-[11px] text-rose-600 mt-1">{formErrors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1.5">District *</label>
              <select
                value={newIncident.district_id}
                onChange={(e) => setNewIncident({ ...newIncident, district_id: e.target.value })}
                className={`w-full bg-slate-50/70 border rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 transition-all font-medium ${
                  formErrors.district_id
                    ? "border-rose-400 focus:ring-rose-400/20"
                    : "border-slate-200 focus:ring-brand-500/20 focus:border-brand-500"
                }`}
              >
                <option value="">Select District</option>
                {(districts || []).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.state})
                  </option>
                ))}
              </select>
              {formErrors.district_id && (
                <p className="text-[11px] text-rose-600 mt-1">{formErrors.district_id}</p>
              )}
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1.5">Affected Road Corridor</label>
              <select
                value={newIncident.road_id}
                onChange={(e) => setNewIncident({ ...newIncident, road_id: e.target.value })}
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
              >
                <option value="">Select Corridor (Optional)</option>
                {(roads || []).map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.code} - {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1.5">Latitude (°N)</label>
              <input
                type="number"
                step="any"
                value={newIncident.latitude}
                onChange={(e) => setNewIncident({ ...newIncident, latitude: parseFloat(e.target.value) })}
                className={`w-full bg-slate-50/70 border rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:ring-2 transition-all font-mono ${
                  formErrors.latitude
                    ? "border-rose-400 focus:ring-rose-400/20"
                    : "border-slate-200 focus:ring-brand-500/20 focus:border-brand-500"
                }`}
              />
              {formErrors.latitude && (
                <p className="text-[11px] text-rose-600 mt-1">{formErrors.latitude}</p>
              )}
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1.5">Longitude (°E)</label>
              <input
                type="number"
                step="any"
                value={newIncident.longitude}
                onChange={(e) => setNewIncident({ ...newIncident, longitude: parseFloat(e.target.value) })}
                className={`w-full bg-slate-50/70 border rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:ring-2 transition-all font-mono ${
                  formErrors.longitude
                    ? "border-rose-400 focus:ring-rose-400/20"
                    : "border-slate-200 focus:ring-brand-500/20 focus:border-brand-500"
                }`}
              />
              {formErrors.longitude && (
                <p className="text-[11px] text-rose-600 mt-1">{formErrors.longitude}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1.5">Specific Location / Landmark</label>
            <input
              type="text"
              placeholder="e.g. NH-6 Km 142 near Sonapur Tunnel"
              value={newIncident.address}
              onChange={(e) => setNewIncident({ ...newIncident, address: e.target.value })}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{createMutation.isPending ? "Logging Incident..." : "Submit Incident Report"}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
