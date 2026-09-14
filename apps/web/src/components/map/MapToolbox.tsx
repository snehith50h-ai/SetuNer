"use client";

import React, { useState } from "react";
import {
  Navigation,
  AlertTriangle,
  Truck,
  Zap,
  CloudRain,
  Map as MapIcon,
  Compass,
  ChevronDown,
  Layers,
  Crosshair,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const NER_STATES = [
  { name: "NER All", center: [92.8, 25.8] as [number, number], zoom: 6.8 },
  { name: "Assam", center: [92.8, 26.2] as [number, number], zoom: 7.5 },
  { name: "Meghalaya", center: [91.8, 25.5] as [number, number], zoom: 8.5 },
  { name: "Nagaland", center: [94.1, 26.0] as [number, number], zoom: 8.5 },
  { name: "Manipur", center: [93.9, 24.8] as [number, number], zoom: 8.5 },
  { name: "Mizoram", center: [92.8, 23.5] as [number, number], zoom: 8.2 },
  { name: "Tripura", center: [91.6, 23.8] as [number, number], zoom: 8.8 },
  { name: "Arunachal", center: [94.5, 28.0] as [number, number], zoom: 7.2 },
  { name: "Sikkim", center: [88.5, 27.5] as [number, number], zoom: 9.0 },
];

interface MapToolboxProps {
  activeTool: "route" | "fleet" | "weather" | "simulator" | null;
  setActiveTool: (tool: "route" | "fleet" | "weather" | "simulator" | null) => void;
  isPinHazardMode: boolean;
  setIsPinHazardMode: (mode: boolean) => void;
  basemapStyle: "light" | "topo" | "satellite";
  setBasemapStyle: (style: "light" | "topo" | "satellite") => void;
  onFlyToState: (center: [number, number], zoom: number) => void;
}

export const MapToolbox: React.FC<MapToolboxProps> = ({
  activeTool,
  setActiveTool,
  isPinHazardMode,
  setIsPinHazardMode,
  basemapStyle,
  setBasemapStyle,
  onFlyToState,
}) => {
  const [isBasemapOpen, setIsBasemapOpen] = useState(false);
  const [isStatesOpen, setIsStatesOpen] = useState(false);
  const [selectedStateName, setSelectedStateName] = useState("NER All");

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center gap-1.5 bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-full border border-slate-200/90 shadow-floating text-xs">
      {/* 1. Route Planner Button */}
      <button
        onClick={() => {
          setIsPinHazardMode(false);
          setActiveTool(activeTool === "route" ? null : "route");
        }}
        title="Route Planner"
        className={cn(
          "p-2 rounded-full font-semibold flex items-center justify-center transition-all shadow-2xs",
          activeTool === "route"
            ? "bg-brand-600 text-white shadow-xs scale-[1.02]"
            : "bg-slate-50 hover:bg-slate-100 text-slate-700"
        )}
      >
        <Navigation className="w-4 h-4" />
      </button>

      {/* 2. Pin Hazard / Instant Report Button */}
      <button
        onClick={() => {
          const next = !isPinHazardMode;
          setIsPinHazardMode(next);
          if (next) setActiveTool(null);
        }}
        title="Pin Hazard"
        className={cn(
          "p-2 rounded-full font-semibold flex items-center justify-center transition-all shadow-2xs",
          isPinHazardMode
            ? "bg-rose-600 text-white ring-2 ring-rose-300 animate-pulse"
            : "bg-slate-50 hover:bg-slate-100 text-slate-700"
        )}
      >
        <Crosshair className="w-4 h-4 text-rose-500" />
      </button>

      {/* 3. Fleet Radar Button */}
      <button
        onClick={() => {
          setIsPinHazardMode(false);
          setActiveTool(activeTool === "fleet" ? null : "fleet");
        }}
        title="Fleet Radar"
        className={cn(
          "p-2 rounded-full font-semibold flex items-center justify-center transition-all shadow-2xs",
          activeTool === "fleet"
            ? "bg-blue-600 text-white shadow-xs scale-[1.02]"
            : "bg-slate-50 hover:bg-slate-100 text-slate-700"
        )}
      >
        <Truck className="w-4 h-4 text-blue-500" />
      </button>

      {/* 4. Weather & Flood Overlay Button */}
      <button
        onClick={() => {
          setIsPinHazardMode(false);
          setActiveTool(activeTool === "weather" ? null : "weather");
        }}
        title="Weather Radar"
        className={cn(
          "p-2 rounded-full font-semibold flex items-center justify-center transition-all shadow-2xs",
          activeTool === "weather"
            ? "bg-sky-600 text-white shadow-xs scale-[1.02]"
            : "bg-slate-50 hover:bg-slate-100 text-slate-700"
        )}
      >
        <CloudRain className="w-4 h-4 text-sky-500" />
      </button>

      {/* 5. Simulator Stress-Test Button */}
      <button
        onClick={() => {
          setIsPinHazardMode(false);
          setActiveTool(activeTool === "simulator" ? null : "simulator");
        }}
        title="Stress Simulator"
        className={cn(
          "p-2 rounded-full font-semibold flex items-center justify-center transition-all shadow-2xs",
          activeTool === "simulator"
            ? "bg-amber-600 text-white shadow-xs scale-[1.02]"
            : "bg-slate-50 hover:bg-slate-100 text-slate-700"
        )}
      >
        <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
      </button>

      <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

      {/* 6. State Quick Focus Dropdown / Pills */}
      <div className="relative">
        <button
          onClick={() => {
            setIsStatesOpen(!isStatesOpen);
            setIsBasemapOpen(false);
          }}
          className="px-2.5 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium flex items-center gap-1 border border-slate-200/80 transition-colors ml-1"
        >
          <Compass className="w-3.5 h-3.5 text-brand-600" />
          <span className="hidden sm:inline">{selectedStateName}</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {isStatesOpen && (
          <div className="absolute top-full left-0 mt-1.5 w-44 bg-white rounded-xl border border-slate-200 shadow-floating p-1.5 space-y-1 z-30 animate-in fade-in zoom-in-95 duration-100">
            {NER_STATES.map((s) => (
              <button
                key={s.name}
                onClick={() => {
                  setSelectedStateName(s.name);
                  onFlyToState(s.center, s.zoom);
                  setIsStatesOpen(false);
                }}
                className={cn(
                  "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between",
                  selectedStateName === s.name
                    ? "bg-brand-50 text-brand-700 font-bold"
                    : "hover:bg-slate-50 text-slate-700"
                )}
              >
                <span>{s.name}</span>
                {selectedStateName === s.name && <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 7. Basemap Switcher */}
      <div className="relative">
        <button
          onClick={() => {
            setIsBasemapOpen(!isBasemapOpen);
            setIsStatesOpen(false);
          }}
          title="Change Basemap"
          className="p-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold flex items-center gap-1 border border-slate-200/80 transition-colors"
        >
          <MapIcon className="w-4 h-4 text-slate-500" />
        </button>

        {isBasemapOpen && (
          <div className="absolute top-full right-0 mt-1.5 w-40 bg-white rounded-xl border border-slate-200 shadow-floating p-1.5 space-y-1 z-30 animate-in fade-in zoom-in-95 duration-100">
            <button
              onClick={() => {
                setBasemapStyle("light");
                setIsBasemapOpen(false);
              }}
              className={cn(
                "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                basemapStyle === "light"
                  ? "bg-brand-50 text-brand-700 font-bold"
                  : "hover:bg-slate-50 text-slate-700"
              )}
            >
              🗺️ Clean Light
            </button>
            <button
              onClick={() => {
                setBasemapStyle("topo");
                setIsBasemapOpen(false);
              }}
              className={cn(
                "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                basemapStyle === "topo"
                  ? "bg-brand-50 text-brand-700 font-bold"
                  : "hover:bg-slate-50 text-slate-700"
              )}
            >
              ⛰️ Topo Terrain
            </button>
            <button
              onClick={() => {
                setBasemapStyle("satellite");
                setIsBasemapOpen(false);
              }}
              className={cn(
                "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                basemapStyle === "satellite"
                  ? "bg-brand-50 text-brand-700 font-bold"
                  : "hover:bg-slate-50 text-slate-700"
              )}
            >
              🛰️ Satellite Aerial
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
