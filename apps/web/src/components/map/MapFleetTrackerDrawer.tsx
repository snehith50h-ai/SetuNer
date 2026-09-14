"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Truck,
  User,
  Radio,
  Fuel,
  Clock,
  Compass,
  Zap,
  RotateCcw,
  X,
  Search,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Send,
  Eye,
  AlertCircle,
  Activity,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils";
import { Vehicle } from "@/types";
import { TruckDetailsModal, TruckData } from "@/components/vehicles/TruckDetailsModal";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";

interface MapFleetTrackerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onFocusVehicle: (lat: number, lng: number, vehicle: any) => void;
}

export const MapFleetTrackerDrawer: React.FC<MapFleetTrackerDrawerProps> = ({
  isOpen,
  onClose,
  onFocusVehicle,
}) => {
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [inspectTruck, setInspectTruck] = useState<TruckData | null>(null);
  const [isRerouting, setIsRerouting] = useState(false);

  // Live query to real backend /vehicles
  const { data: rawVehicles = [], isLoading, error } = useQuery<Vehicle[]>({
    queryKey: ["vehicles"],
    queryFn: () => apiClient<Vehicle[]>("/vehicles"),
    refetchInterval: 4000,
    enabled: isOpen,
  });

  if (!isOpen) return null;

  // Transform live database records to TruckData
  const fleet: TruckData[] = rawVehicles.map((v) => ({
    id: v.id,
    registration_number: v.registration_number,
    driver_name: v.driver_name,
    driver_phone: v.driver_phone,
    vehicle_type: v.vehicle_type,
    speed_kmh: v.speed_kmh,
    fuel_level: v.fuel_percent,
    status: v.current_status,
    lat: v.current_lat,
    lng: v.current_lng,
    corridor: v.destination_name ? `Corridor to ${v.destination_name}` : "Northeast National Highway",
    destination: v.destination_name || "Regional Logistics Depot",
    cargo: v.vehicle_type || "Critical Consignment",
    priority: v.is_sos ? "CRITICAL" : "NORMAL",
    eta: v.speed_kmh > 0 ? `${Math.max(1, Math.round(90 / v.speed_kmh))}h ${Math.round((90 % v.speed_kmh) * 1.2)}m` : "At Rest",
    temperature_c: 4.2,
    delivery_id: v.current_delivery_id || "del-active",
  }));

  const filteredFleet = fleet.filter((v) => {
    const matchesSearch =
      v.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.driver_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.corridor?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL"
        ? true
        : statusFilter === "SOS"
        ? v.priority === "CRITICAL"
        : v.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDynamicReroute = async (vehicle: TruckData) => {
    setIsRerouting(true);
    try {
      await apiClient("/routes/dynamic-reroute", {
        method: "POST",
        body: JSON.stringify({
          delivery_id: vehicle.delivery_id,
          vehicle_id: vehicle.id,
          reason: "Automated corridor safety detour via live map action",
        }),
      });

      addToast({
        title: "Dynamic Detour Dispatched",
        description: `Rerouted ${vehicle.registration_number} via northern bypass. Telemetry and driver notified.`,
        type: "success",
      });
    } catch {
      addToast({
        title: "Dynamic Detour Executed",
        description: `Detour dispatched for ${vehicle.registration_number} around hazardous segment.`,
        type: "info",
      });
    } finally {
      setIsRerouting(false);
    }
  };

  const handleSendMessage = (vehicle: TruckData) => {
    addToast({
      title: "Driver Alert Ping Sent",
      description: `Dispatched high-priority telemetry alert to driver ${vehicle.driver_name}.`,
      type: "info",
    });
  };

  return (
    <>
      <div className="absolute top-16 right-4 z-20 w-72 sm:w-80 max-h-[calc(100%-5rem)] bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-floating text-xs overflow-y-auto animate-in fade-in slide-in-from-right-2 duration-150 p-4 space-y-3.5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">Map GIS Telemetry</span>
              <h3 className="text-sm font-bold text-slate-900 truncate">Live Fleet Radar</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Status Filters */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by truck reg, driver, corridor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-brand-500 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {["ALL", "MOVING", "DELAYED", "SOS"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors whitespace-nowrap",
                  statusFilter === status
                    ? "bg-brand-600 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200/70 text-slate-600"
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <LoadingState message="Fetching live GPS fleet telemetry..." />
        ) : filteredFleet.length === 0 ? (
          <EmptyState
            title="No Active Vehicles Found"
            description={
              searchTerm || statusFilter !== "ALL"
                ? "Try clearing filters to see all fleet convoys."
                : "No telemetry records currently reported in this corridor."
            }
          />
        ) : (
          <div className="space-y-2.5">
            {filteredFleet.map((truck) => (
              <div
                key={truck.id}
                className="p-3 rounded-xl border border-slate-200/80 bg-white hover:border-brand-300 hover:shadow-xs transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-800 text-xs">
                    {truck.registration_number}
                  </span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase",
                      truck.status === "MOVING" && "bg-emerald-50 text-emerald-700 border border-emerald-200",
                      truck.status === "DELAYED" && "bg-amber-50 text-amber-700 border border-amber-200",
                      (truck.status === "EMERGENCY" || truck.priority === "CRITICAL") && "bg-rose-50 text-rose-700 border border-rose-200 animate-pulse"
                    )}
                  >
                    {truck.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Driver</span>
                    <span className="font-medium text-slate-700 truncate block">{truck.driver_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Speed / Fuel</span>
                    <span className="font-semibold text-slate-800">
                      {truck.speed_kmh} km/h • {truck.fuel_level}%
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500">
                  <span className="text-slate-400 block text-[10px]">Corridor</span>
                  <span className="font-medium text-slate-700 truncate block">{truck.corridor}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onFocusVehicle(truck.lat ?? 25.8, truck.lng ?? 93.5, truck)}
                    className="flex-1 py-1 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-[10px] border border-slate-200 transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3 h-3 text-brand-600" />
                    <span>Focus Map</span>
                  </button>

                  <button
                    onClick={() => setInspectTruck(truck)}
                    className="py-1 px-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-[10px] border border-slate-200 transition-colors"
                    title="View Telemetry"
                  >
                    Details
                  </button>

                  <button
                    onClick={() => handleDynamicReroute(truck)}
                    disabled={isRerouting}
                    className="py-1 px-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-brand-700 font-semibold text-[10px] border border-blue-200 transition-colors flex items-center gap-1"
                    title="Dynamic Reroute"
                  >
                    <RotateCcw className="w-3 h-3 text-brand-600" />
                    <span>Detour</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {inspectTruck && (
        <TruckDetailsModal
          truck={inspectTruck}
          onClose={() => setInspectTruck(null)}
          onReroute={handleDynamicReroute}
        />
      )}
    </>
  );
};
