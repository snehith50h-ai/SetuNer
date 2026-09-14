"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Truck,
  Plus,
  Phone,
  Navigation,
  Fuel,
  Activity,
  MapPin,
  Clock,
  AlertCircle,
  Search,
  CheckCircle,
  Radio,
  Gauge,
  User,
  ShieldCheck,
  RotateCcw,
  Thermometer,
  LayoutGrid,
  Table as TableIcon,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Vehicle } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LoadingState, CardSkeleton, TableSkeleton } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { formatRelativeTime } from "@/lib/utils";
import { TruckDetailsModal, TruckData } from "@/components/vehicles/TruckDetailsModal";

type SortField = "registration_number" | "driver_name" | "speed_kmh" | "fuel_percent" | "current_status" | "destination_name";

export default function VehiclesPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTruck, setActiveTruck] = useState<TruckData | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Sorting & Pagination
  const [sortField, setSortField] = useState<SortField>("speed_kmh");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = viewMode === "grid" ? 9 : 12;

  const {
    data: vehicles,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<Vehicle[]>({
    queryKey: ["vehicles", selectedStatus],
    queryFn: () => {
      let endpoint = "/vehicles?";
      if (selectedStatus !== "ALL") endpoint += `status=${selectedStatus}&`;
      return apiClient<Vehicle[]>(endpoint);
    },
    refetchInterval: 4000,
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = (vehicles || []).filter((v) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        v.registration_number.toLowerCase().includes(q) ||
        v.driver_name.toLowerCase().includes(q) ||
        v.vehicle_type.toLowerCase().includes(q) ||
        (v.destination_name && v.destination_name.toLowerCase().includes(q))
      );
    });

    result.sort((a, b) => {
      const valA = a[sortField] ?? "";
      const valB = b[sortField] ?? "";
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [vehicles, searchQuery, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, currentPage, pageSize]);

  const totalMoving = (vehicles || []).filter((v) => v.current_status === "MOVING").length;
  const totalDelayed = (vehicles || []).filter((v) => v.current_status === "DELAYED").length;
  const totalEmergency = (vehicles || []).filter((v) => v.is_sos || v.current_status === "EMERGENCY").length;

  const toTruckData = (veh: Vehicle): TruckData => ({
    id: veh.id,
    registration_number: veh.registration_number,
    driver_name: veh.driver_name,
    driver_phone: veh.driver_phone,
    vehicle_type: veh.vehicle_type,
    speed_kmh: veh.speed_kmh,
    fuel_level: veh.fuel_percent,
    current_status: veh.current_status,
    current_lat: veh.current_lat,
    current_lng: veh.current_lng,
    destination: veh.destination_name,
    cargo: `Payload: ${veh.capacity_tons} Tons | Critical Regional Consignment`,
    priority: veh.is_sos ? "CRITICAL" : "HIGH",
    eta: veh.speed_kmh > 0 ? `${Math.max(1, Math.round(90 / veh.speed_kmh))}h 20m` : "At Rest",
    temperature_c: 3.6,
  });

  return (
    <div className="space-y-6">
      {/* Header & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>MDoNER Live Telemetry Stream</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <Truck className="w-6 h-6" />
            </div>
            <span>Active Fleet Convoys & Telemetry</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time GPS surveillance, speed telemetry, emergency SOS alerts & corridor transit tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap justify-end">
          <Link
            href="/vehicles/add"
            id="btn-add-vehicle"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-xs font-semibold shadow-sm shadow-brand-500/20 hover:shadow-md transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Vehicle</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-semibold bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl text-emerald-800 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <Truck className="w-3.5 h-3.5" />
            <span>{totalMoving} Trucks In Transit</span>
          </div>
          {totalEmergency > 0 && (
            <div className="flex items-center gap-2 text-xs font-semibold bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-xl text-rose-800 shadow-sm animate-pulse">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{totalEmergency} SOS Alert</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter Controls & View Toggle */}
      <div className="glass-panel p-4 rounded-2xl shadow-glass flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search truck registration, driver, destination or cargo..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full glass-input rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-medium text-slate-500 shrink-0">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-44 glass-input rounded-xl px-3 py-2 text-xs text-slate-700 font-medium transition-all"
          >
            <option value="ALL">All Trucks ({vehicles?.length || 0})</option>
            <option value="MOVING">Moving ({totalMoving})</option>
            <option value="DELAYED">Delayed ({totalDelayed})</option>
            <option value="STOPPED">Stopped</option>
            <option value="EMERGENCY">Emergency / SOS</option>
          </select>
        </div>

        {/* View Mode Toggle & Refresh */}
        <div className="flex items-center gap-1.5 p-1 bg-white/40 backdrop-blur-md rounded-xl border border-white/60 self-end sm:self-auto">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === "grid"
                ? "bg-white text-brand-600 shadow-glass"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="Card Grid View"
            aria-label="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === "table"
                ? "bg-white text-brand-600 shadow-glass"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="Table List View"
            aria-label="Table View"
          >
            <TableIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => refetch()}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        viewMode === "grid" ? <CardSkeleton count={6} /> : <TableSkeleton rows={6} />
      ) : isError ? (
        <ErrorState
          title="Fleet Telemetry Stream Interrupted"
          message="Unable to acquire live GPS coordinates from vehicle fleet transmitters."
          onRetry={() => refetch()}
          isRetrying={isFetching}
          errorDetails={error}
        />
      ) : filteredAndSorted.length === 0 ? (
        <EmptyState
          title="No Trucks Matching Filter"
          description="No active fleet units match your current search query or filter selection."
        />
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedVehicles.map((veh) => {
              const truckData = toTruckData(veh);

              return (
                <div
                  key={veh.id}
                  onClick={() => setActiveTruck(truckData)}
                  className="p-5 rounded-2xl glass-card glass-card-hover cursor-pointer space-y-4 group transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-900 tracking-tight block">
                          {veh.registration_number}
                        </span>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">{veh.vehicle_type}</p>
                      </div>
                    </div>
                    <StatusBadge status={veh.is_sos ? "EMERGENCY" : veh.current_status} size="sm" />
                  </div>

                  {/* Stats Box */}
                  <div className="grid grid-cols-2 gap-2.5 bg-slate-50/70 p-3 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-medium uppercase tracking-wider">Speed</span>
                      <span className="text-slate-800 font-bold flex items-center gap-1 mt-0.5">
                        <Gauge className="w-3.5 h-3.5 text-slate-400" />
                        {veh.speed_kmh} km/h
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-medium uppercase tracking-wider">Fuel Level</span>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              veh.fuel_percent > 40 ? "bg-emerald-500" : veh.fuel_percent > 20 ? "bg-amber-500" : "bg-rose-500"
                            }`}
                            style={{ width: `${veh.fuel_percent}%` }}
                          />
                        </div>
                        <span className="text-slate-700 font-bold text-[11px]">{veh.fuel_percent.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-medium uppercase tracking-wider">Driver</span>
                      <span className="text-slate-700 font-medium truncate block mt-0.5 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{veh.driver_name}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-medium uppercase tracking-wider">Destination</span>
                      <span className="text-slate-700 font-medium truncate block mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-brand-500 shrink-0" />
                        <span className="truncate">{veh.destination_name || "Regional Depot"}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      GPS updated {formatRelativeTime(veh.last_ping_at)}
                    </span>
                    <span className="text-brand-600 font-semibold group-hover:underline text-[11px] flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      <span>Inspect Telemetry →</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 pt-2 text-xs text-slate-500">
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
      ) : (
        /* Table View */
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-glass">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/60 backdrop-blur-md border-b border-slate-200/60 text-slate-400 uppercase tracking-wider text-[11px] font-semibold select-none">
                <tr>
                  <th
                    onClick={() => handleSort("registration_number")}
                    className="py-3.5 px-5 cursor-pointer hover:text-slate-700"
                  >
                    <div className="flex items-center gap-1">
                      <span>Registration</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-300" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("driver_name")}
                    className="py-3.5 px-5 cursor-pointer hover:text-slate-700"
                  >
                    <div className="flex items-center gap-1">
                      <span>Driver</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-300" />
                    </div>
                  </th>
                  <th className="py-3.5 px-5">Type</th>
                  <th
                    onClick={() => handleSort("speed_kmh")}
                    className="py-3.5 px-5 cursor-pointer hover:text-slate-700"
                  >
                    <div className="flex items-center gap-1">
                      <span>Speed</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-300" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("fuel_percent")}
                    className="py-3.5 px-5 cursor-pointer hover:text-slate-700"
                  >
                    <div className="flex items-center gap-1">
                      <span>Fuel</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-300" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("destination_name")}
                    className="py-3.5 px-5 cursor-pointer hover:text-slate-700"
                  >
                    <div className="flex items-center gap-1">
                      <span>Destination</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-300" />
                    </div>
                  </th>
                  <th className="py-3.5 px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedVehicles.map((veh) => (
                  <tr
                    key={veh.id}
                    onClick={() => setActiveTruck(toTruckData(veh))}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-5 font-mono font-bold text-slate-900 group-hover:text-brand-600">
                      {veh.registration_number}
                    </td>
                    <td className="py-4 px-5 font-medium text-slate-800">
                      {veh.driver_name}
                    </td>
                    <td className="py-4 px-5 text-slate-500">{veh.vehicle_type}</td>
                    <td className="py-4 px-5 font-semibold text-slate-900">
                      {veh.speed_kmh} km/h
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-semibold text-slate-800">{veh.fuel_percent.toFixed(0)}%</span>
                    </td>
                    <td className="py-4 px-5 text-slate-600">
                      {veh.destination_name || "Unassigned"}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <StatusBadge status={veh.is_sos ? "EMERGENCY" : veh.current_status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination for Table */}
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

      {/* Interactive Truck Details Modal */}
      <TruckDetailsModal
        truck={activeTruck}
        onClose={() => setActiveTruck(null)}
      />
    </div>
  );
}
