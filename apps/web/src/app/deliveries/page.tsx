"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Package,
  Plus,
  Filter,
  AlertTriangle,
  Clock,
  Truck,
  MapPin,
  Calendar,
  Search,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Delivery } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { LoadingState, TableSkeleton } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { formatDateTime, formatRelativeTime } from "@/lib/utils";
import { TruckDetailsModal, TruckData } from "@/components/vehicles/TruckDetailsModal";
import { useToast } from "@/components/ui/ToastProvider";

type SortField = "consignment_code" | "title" | "cargo_category" | "priority" | "destination_name" | "status";

export default function DeliveriesPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeDelivery, setActiveDelivery] = useState<Delivery | null>(null);
  const [activeTruck, setActiveTruck] = useState<TruckData | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Sorting & Pagination
  const [sortField, setSortField] = useState<SortField>("consignment_code");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // New Delivery Form State & Validation
  const [newDelivery, setNewDelivery] = useState({
    title: "",
    cargo_category: "Medical Supplies",
    cargo_description: "",
    weight_tons: 5.0,
    priority: "HIGH",
    origin_name: "Guwahati Central Depot",
    origin_lat: 26.1445,
    origin_lng: 91.7362,
    destination_name: "Imphal Hospital Depot",
    destination_lat: 24.8170,
    destination_lng: 93.9368,
    planned_departure: new Date().toISOString(),
    expected_delivery: new Date(Date.now() + 86400000).toISOString(),
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const {
    data: deliveries,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<Delivery[]>({
    queryKey: ["deliveries", selectedPriority, selectedStatus],
    queryFn: () => {
      let endpoint = "/deliveries?";
      if (selectedPriority !== "ALL") endpoint += `priority=${selectedPriority}&`;
      if (selectedStatus !== "ALL") endpoint += `status=${selectedStatus}&`;
      return apiClient<Delivery[]>(endpoint);
    },
    refetchInterval: 6000,
  });

  const { data: deliveryEvents } = useQuery<any[]>({
    queryKey: ["delivery-events", activeDelivery?.id],
    queryFn: () => apiClient<any[]>(`/deliveries/${activeDelivery?.id}/events`),
    enabled: !!activeDelivery,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      apiClient<Delivery>("/deliveries", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      setIsCreateModalOpen(false);
      setFormErrors({});
      setNewDelivery({
        title: "",
        cargo_category: "Medical Supplies",
        cargo_description: "",
        weight_tons: 5.0,
        priority: "HIGH",
        origin_name: "Guwahati Central Depot",
        origin_lat: 26.1445,
        origin_lng: 91.7362,
        destination_name: "Imphal Hospital Depot",
        destination_lat: 24.8170,
        destination_lng: 93.9368,
        planned_departure: new Date().toISOString(),
        expected_delivery: new Date(Date.now() + 86400000).toISOString(),
      });
      addToast({
        title: "Consignment Created",
        description: `Manifest ${created.consignment_code} registered with automated telemetry tracking.`,
        type: "success",
      });
    },
    onError: (err: any) => {
      setFormErrors({ submit: err.message || "Failed to create consignment manifest." });
    },
  });

  const validateDeliveryForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!newDelivery.title.trim()) {
      errors.title = "Consignment title is required.";
    }
    if (!newDelivery.origin_name.trim()) {
      errors.origin_name = "Origin depot is required.";
    }
    if (!newDelivery.destination_name.trim()) {
      errors.destination_name = "Destination terminal is required.";
    }
    if (isNaN(newDelivery.weight_tons) || newDelivery.weight_tons <= 0) {
      errors.weight_tons = "Payload weight must be greater than 0.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDeliveryForm()) return;
    createMutation.mutate(newDelivery);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = (deliveries || []).filter((d) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        d.consignment_code.toLowerCase().includes(q) ||
        d.title.toLowerCase().includes(q) ||
        d.cargo_category.toLowerCase().includes(q) ||
        d.destination_name.toLowerCase().includes(q)
      );
    });

    result.sort((a, b) => {
      let valA: any = a[sortField] ?? "";
      let valB: any = b[sortField] ?? "";

      if (sortField === "priority") {
        const priorityRank: Record<string, number> = {
          CRITICAL: 3,
          HIGH: 2,
          NORMAL: 1,
        };
        valA = priorityRank[a.priority] || 0;
        valB = priorityRank[b.priority] || 0;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [deliveries, searchQuery, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
  const paginatedDeliveries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
            <Package className="w-3.5 h-3.5 text-emerald-500" />
            <span>Essential Commodities & Freight Registry</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <Truck className="w-6 h-6" />
            </div>
            <span>Consignments & Cargo Manifests</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track priority food grains, medical cold-chain, and high-altitude emergency supply missions.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all hover:scale-[1.02] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Consignment Manifest</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel p-4 rounded-2xl shadow-glass flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search consignment code, title, cargo or destination..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full glass-input rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-medium text-slate-500 shrink-0">Priority:</span>
            <select
              value={selectedPriority}
              onChange={(e) => {
                setSelectedPriority(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-36 glass-input rounded-xl px-3 py-2 text-xs text-slate-700 font-medium"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="NORMAL">Normal</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-medium text-slate-500 shrink-0">State:</span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-36 glass-input rounded-xl px-3 py-2 text-xs text-slate-700 font-medium"
            >
              <option value="ALL">All States</option>
              <option value="PENDING">Pending</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="DELIVERED">Delivered</option>
              <option value="DELAYED">Delayed</option>
            </select>
          </div>

          <button
            onClick={() => refetch()}
            className="p-2 rounded-xl border border-white/60 bg-white/50 text-slate-500 hover:text-slate-800 hover:bg-white/80 transition-colors"
            title="Refresh Deliveries"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Deliveries Table */}
      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : isError ? (
        <ErrorState
          title="Consignment Data Unavailable"
          message="Unable to load active delivery manifests from logistics server."
          onRetry={() => refetch()}
          isRetrying={isFetching}
          errorDetails={error}
        />
      ) : filteredAndSorted.length === 0 ? (
        <EmptyState
          title="No Deliveries Found"
          description="No active supply consignments match the selected filters."
        />
      ) : (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-glass">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/60 backdrop-blur-md border-b border-slate-200/60 text-slate-400 uppercase tracking-wider text-[11px] font-semibold select-none">
                <tr>
                  <th
                    onClick={() => handleSort("consignment_code")}
                    className="py-3.5 px-5 cursor-pointer hover:text-slate-700"
                  >
                    <div className="flex items-center gap-1">
                      <span>Consignment</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-300" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("title")}
                    className="py-3.5 px-5 cursor-pointer hover:text-slate-700"
                  >
                    <div className="flex items-center gap-1">
                      <span>Cargo Details</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-300" />
                    </div>
                  </th>
                  <th className="py-3.5 px-5">Weight</th>
                  <th
                    onClick={() => handleSort("priority")}
                    className="py-3.5 px-5 cursor-pointer hover:text-slate-700"
                  >
                    <div className="flex items-center gap-1">
                      <span>Priority</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-300" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("destination_name")}
                    className="py-3.5 px-5 cursor-pointer hover:text-slate-700"
                  >
                    <div className="flex items-center gap-1">
                      <span>Origin → Destination</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-300" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("status")}
                    className="py-3.5 px-5 text-right cursor-pointer hover:text-slate-700"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Delivery State</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-300" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedDeliveries.map((deliv) => (
                  <tr
                    key={deliv.id}
                    onClick={() => setActiveDelivery(deliv)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-5 font-mono font-bold text-slate-900 group-hover:text-brand-600">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-brand-600" />
                        <span>{deliv.consignment_code}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 max-w-xs">
                      <span className="font-semibold text-slate-900 block truncate">{deliv.title}</span>
                      <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                        {deliv.cargo_category}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-semibold text-slate-800">
                      {deliv.weight_tons} Tons
                    </td>
                    <td className="py-4 px-5">
                      <StatusBadge status={deliv.priority} size="sm" />
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                        <span className="truncate max-w-[120px]">{deliv.origin_name}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[120px] font-semibold text-slate-900">
                          {deliv.destination_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <StatusBadge status={deliv.status} size="sm" />
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
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx + 1}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold ${
                      currentPage === idx + 1
                        ? "bg-brand-600 text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delivery Inspection Modal */}
      {activeDelivery && (
        <Modal
          isOpen={!!activeDelivery}
          onClose={() => setActiveDelivery(null)}
          title={`Manifest: ${activeDelivery.consignment_code}`}
          description={activeDelivery.title}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-xs text-slate-700">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <StatusBadge status={activeDelivery.priority} size="md" />
                <StatusBadge status={activeDelivery.status} size="md" />
              </div>
              <span className="font-semibold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg">
                Weight: {activeDelivery.weight_tons} Tons
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Origin Depot</span>
                <span className="font-semibold text-slate-900 text-sm mt-0.5 block">{activeDelivery.origin_name}</span>
                <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
                  {activeDelivery.origin_lat.toFixed(4)}°N, {activeDelivery.origin_lng.toFixed(4)}°E
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Destination Terminal</span>
                <span className="font-semibold text-slate-900 text-sm mt-0.5 block">{activeDelivery.destination_name}</span>
                <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
                  {activeDelivery.destination_lat.toFixed(4)}°N, {activeDelivery.destination_lng.toFixed(4)}°E
                </span>
              </div>
            </div>

            {/* Delivery Events Timeline */}
            <div>
              <h4 className="font-bold text-slate-800 mb-2">Consignment Chain-of-Custody Events</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(deliveryEvents || []).map((evt: any) => (
                  <div key={evt.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800 block text-xs">{evt.title}</span>
                      <p className="text-slate-500 text-[11px] mt-0.5">{evt.description}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{formatDateTime(evt.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* New Consignment Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Essential Consignment Manifest"
        description="Register a new freight dispatch for dynamic routing and telemetry monitoring"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          {formErrors.submit && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-medium">
              {formErrors.submit}
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Consignment Title *</label>
            <input
              type="text"
              value={newDelivery.title}
              onChange={(e) => setNewDelivery({ ...newDelivery, title: e.target.value })}
              placeholder="e.g. Life-Saving Medical Vaccines Batch #84"
              className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs focus:ring-2 transition-all ${
                formErrors.title ? "border-rose-400 focus:ring-rose-400/20" : "border-slate-200 focus:ring-brand-500/20"
              }`}
            />
            {formErrors.title && <p className="text-[11px] text-rose-600 mt-1">{formErrors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={newDelivery.cargo_category}
                onChange={(e) => setNewDelivery({ ...newDelivery, cargo_category: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              >
                <option value="Medical Supplies">Medical Supplies</option>
                <option value="Food Grains">Food Grains / FCI</option>
                <option value="Fuel / Petroleum">Fuel / Petroleum</option>
                <option value="Disaster Relief">Disaster Relief</option>
                <option value="General Freight">General Freight</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={newDelivery.priority}
                onChange={(e) => setNewDelivery({ ...newDelivery, priority: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              >
                <option value="CRITICAL">Critical (Life-Saving)</option>
                <option value="HIGH">High (Essential)</option>
                <option value="NORMAL">Normal</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Origin Depot *</label>
              <input
                type="text"
                value={newDelivery.origin_name}
                onChange={(e) => setNewDelivery({ ...newDelivery, origin_name: e.target.value })}
                className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs ${
                  formErrors.origin_name ? "border-rose-400" : "border-slate-200"
                }`}
              />
              {formErrors.origin_name && <p className="text-[11px] text-rose-600 mt-1">{formErrors.origin_name}</p>}
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Destination Terminal *</label>
              <input
                type="text"
                value={newDelivery.destination_name}
                onChange={(e) => setNewDelivery({ ...newDelivery, destination_name: e.target.value })}
                className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs ${
                  formErrors.destination_name ? "border-rose-400" : "border-slate-200"
                }`}
              />
              {formErrors.destination_name && <p className="text-[11px] text-rose-600 mt-1">{formErrors.destination_name}</p>}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Payload Weight (Metric Tons) *</label>
            <input
              type="number"
              step="0.1"
              value={newDelivery.weight_tons}
              onChange={(e) => setNewDelivery({ ...newDelivery, weight_tons: parseFloat(e.target.value) || 0 })}
              className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs ${
                formErrors.weight_tons ? "border-rose-400" : "border-slate-200"
              }`}
            />
            {formErrors.weight_tons && <p className="text-[11px] text-rose-600 mt-1">{formErrors.weight_tons}</p>}
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
              <span>{createMutation.isPending ? "Registering..." : "Register Manifest"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Reusable Truck Details Modal */}
      <TruckDetailsModal
        truck={activeTruck}
        onClose={() => setActiveTruck(null)}
      />
    </div>
  );
}
