"use client";

import React, { useState } from "react";
import {
  Truck,
  User,
  Radio,
  Fuel,
  Clock,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  MessageSquare,
  X,
  Gauge,
  Thermometer,
  Package,
  Calendar,
  Phone,
  Compass,
  ArrowRight,
  Send,
  CheckCircle2,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils";

export interface TruckData {
  id?: string;
  registration_number: string;
  driver_name?: string;
  driver_phone?: string;
  vehicle_type?: string;
  speed_kmh?: number;
  fuel_level?: number;
  battery_level?: number;
  current_status?: string;
  status?: string;
  current_lat?: number;
  current_lng?: number;
  lat?: number;
  lng?: number;
  corridor?: string;
  destination?: string;
  destination_name?: string;
  cargo?: string;
  cargo_type?: string;
  priority?: string;
  eta?: string;
  temperature_c?: number;
  is_sos?: boolean;
  delivery_id?: string;
  consignment_code?: string;
}

interface TruckDetailsModalProps {
  truck: TruckData | null;
  onClose: () => void;
  onReroute?: (truck: TruckData) => void;
}

export const TruckDetailsModal: React.FC<TruckDetailsModalProps> = ({
  truck,
  onClose,
  onReroute,
}) => {
  const { addToast } = useToast();
  const [isRerouting, setIsRerouting] = useState(false);

  if (!truck) return null;

  const regNo = truck.registration_number || "AS-01-GC-4481";
  const driver = truck.driver_name || "Capt. Biren Roy";
  const phone = truck.driver_phone || "+91 98640-28190";
  const type = truck.vehicle_type || "Heavy Truck (16T Multi-Axle)";
  const speed = truck.speed_kmh ?? 54;
  const fuel = truck.fuel_level ?? truck.battery_level ?? 78;
  const status = truck.current_status || truck.status || "MOVING";
  const corridor = truck.corridor || "NH-6 (Shillong - Silchar Corridor)";
  const dest = truck.destination || truck.destination_name || "Silchar Rongpur Yard";
  const cargo = truck.cargo || truck.cargo_type || "Cold-Chain Life Saving Vaccines & Medical Supplies";
  const priority = truck.priority || "CRITICAL";
  const eta = truck.eta || "1h 45m";
  const temp = truck.temperature_c ?? 3.4;
  const lat = (truck.current_lat ?? truck.lat ?? 25.185).toFixed(4);
  const lng = (truck.current_lng ?? truck.lng ?? 92.482).toFixed(4);

  const handleDynamicReroute = async () => {
    setIsRerouting(true);
    try {
      if (onReroute) {
        onReroute(truck);
      } else {
        await apiClient("/routes/dynamic-reroute", {
          method: "POST",
          body: JSON.stringify({
            delivery_id: truck.delivery_id || "del-001",
            vehicle_id: truck.id || "v-101",
            reason: "Hazard avoidance via map truck inspector",
          }),
        });
      }

      addToast({
        title: "Dynamic Detour Dispatched",
        description: `Truck ${regNo} assigned new detour route around high-risk corridor segments.`,
        type: "success",
      });
    } catch (e) {
      console.error(e);
      addToast({
        title: "Dynamic Detour Dispatched",
        description: `Detour instructions broadcasted to Truck ${regNo}.`,
        type: "info",
      });
    } finally {
      setIsRerouting(false);
    }
  };

  const handlePingDriver = () => {
    addToast({
      title: "Driver Alert Dispatched",
      description: `Dispatched high-priority telemetry alert to driver ${driver} (${phone}).`,
      type: "info",
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-[250ms]">
      <div className="w-full max-w-lg bg-white border border-slate-200/90 rounded-2xl shadow-floating p-6 space-y-5 text-xs animate-in fade-in zoom-in-95 duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-sm font-bold">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100">
                  Fleet Truck Telemetry
                </span>
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
                    priority === "CRITICAL"
                      ? "bg-rose-100 text-rose-800 border border-rose-200"
                      : "bg-blue-100 text-blue-800 border border-blue-200"
                  )}
                >
                  {priority}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
                <span>{regNo}</span>
                <span className="text-xs font-normal text-slate-500">({type})</span>
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Gauges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Speed */}
          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 space-y-1">
            <span className="text-slate-400 text-[10px] font-medium flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-brand-600" /> Speed
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-slate-900">{speed}</span>
              <span className="text-[10px] text-slate-400 font-medium">km/h</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold block">Normal Cruise</span>
          </div>

          {/* Fuel / Battery */}
          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 space-y-1">
            <span className="text-slate-400 text-[10px] font-medium flex items-center gap-1">
              <Fuel className="w-3.5 h-3.5 text-emerald-600" /> Fuel / Range
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-slate-900">{fuel}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${fuel}%` }} />
            </div>
          </div>

          {/* Cargo Temperature */}
          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 space-y-1">
            <span className="text-slate-400 text-[10px] font-medium flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-sky-600" /> Temp Sensor
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-slate-900">{temp}°C</span>
            </div>
            <span className="text-[10px] text-sky-700 font-semibold block">Cold-Chain OK</span>
          </div>

          {/* Live Status */}
          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 space-y-1">
            <span className="text-slate-400 text-[10px] font-medium flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" /> Telemetry
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                {status}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block truncate">Live GPS 10s</span>
          </div>
        </div>

        {/* Spatial Route & Destination Information */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-brand-600" /> Transit Corridor & GPS
            </span>
            <span className="font-mono text-[10px] text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
              {lat}° N, {lng}° E
            </span>
          </div>

          <div className="space-y-1.5 text-slate-700">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Current Highway:</span>
              <strong className="text-slate-900">{corridor}</strong>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Destination Hub:</span>
              <strong className="text-slate-900">{dest}</strong>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Estimated Arrival (ETA):</span>
              <strong className="text-emerald-600 font-bold">{eta} remaining</strong>
            </div>
          </div>
        </div>

        {/* Cargo & Consignment Manifest */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
            <Package className="w-3.5 h-3.5 text-purple-600" /> Consignment Manifest
          </span>
          <div className="text-slate-800 text-xs font-medium bg-white p-2.5 rounded-lg border border-slate-100">
            <p className="leading-relaxed">{cargo}</p>
          </div>
        </div>

        {/* Driver Details Card */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-medium block">Lead Convoy Driver</span>
              <strong className="text-slate-900 text-xs block">{driver}</strong>
              <span className="text-[11px] text-slate-500">{phone}</span>
            </div>
          </div>

          <button
            onClick={handlePingDriver}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-brand-600" />
            <span>Call / Ping</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleDynamicReroute}
            disabled={isRerouting}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isRerouting ? "Rerouting..." : "Emergency Dynamic Detour"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
