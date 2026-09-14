"use client";

import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  Layers,
  RefreshCw,
  Plus,
  Minus,
  Maximize2,
  RotateCcw,
  Navigation,
  AlertTriangle,
  Truck,
  Eye,
  X,
  Radio,
  Fuel,
  User,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Send,
  Zap,
  CheckCircle2,
  Activity,
  Compass,
  LocateFixed,
  Snowflake,
  Warehouse,
  Building2,
  Thermometer,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  AlertOctagon,
  Info,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/ToastProvider";
import { MapToolbox } from "./MapToolbox";
import { MapRoutePlannerDrawer } from "./MapRoutePlannerDrawer";
import { MapHazardDropperModal } from "./MapHazardDropperModal";
import { MapFleetTrackerDrawer } from "./MapFleetTrackerDrawer";
import { MapWeatherRadarOverlay } from "./MapWeatherRadarOverlay";
import { TruckDetailsModal, TruckData } from "@/components/vehicles/TruckDetailsModal";
import { API_BASE_URL } from "@/lib/api-client";
import { StorageDetailsModal, StorageUnitData } from "@/components/storage/StorageDetailsModal";
import {
  groupNearbyIncidents,
  generateSpiderfyLayout,
  SpiderfiedNode,
  SpiderfyClusterResult,
} from "./clustering/spiderfyEngine";
import {
  getIncidentVisualConfig,
  createClusterBadgeMarkup,
  IncidentVisualConfig,
} from "./icons/IncidentMapIcons";

export interface CandidateRouteItem {
  id?: string;
  name: string;
  waypoints?: any;
  coordinates?: [number, number][];
  distance_km?: number;
  eta_formatted?: string;
  logistics_risk_score?: number;
  safety_score?: number;
  is_recommended?: boolean;
  is_blocked?: boolean;
  color?: string;
  segments?: any[];
}

interface MapLibreViewProps {
  initialCenter?: [number, number]; // [lng, lat]
  initialZoom?: number;
  highlightRouteGeojson?: any;
  alternateRouteGeojson?: any;
  blockedRouteSegmentsGeojson?: any;
  candidateRoutes?: CandidateRouteItem[];
  activeRouteIndex?: number;
  onSelectRoute?: (index: number) => void;
  onFeatureClick?: (feature: any) => void;
  onSelectCorridor?: (corridorCode: string) => void;
  className?: string;
  showLayerController?: boolean;
  showToolbox?: boolean;
  showFilterToolbar?: boolean;
  showLegend?: boolean;
}

const BASEMAP_STYLES = {
  light: {
    version: 8 as const,
    sources: {
      "raster-tiles": {
        type: "raster" as const,
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: "&copy; OpenStreetMap contributors | MDoNER SETU-ROUTE",
      },
    },
    layers: [
      {
        id: "base-raster-layer",
        type: "raster" as const,
        source: "raster-tiles",
        minzoom: 0,
        maxzoom: 19,
        paint: {
          "raster-brightness-max": 0.98,
          "raster-contrast": 0.05,
          "raster-saturation": -0.15,
        },
      },
    ],
  },
  topo: {
    version: 8 as const,
    sources: {
      "raster-tiles": {
        type: "raster" as const,
        tiles: ["https://tile.opentopomap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: "&copy; OpenTopoMap contributors",
      },
    },
    layers: [
      {
        id: "base-raster-layer",
        type: "raster" as const,
        source: "raster-tiles",
        minzoom: 0,
        maxzoom: 17,
      },
    ],
  },
  satellite: {
    version: 8 as const,
    sources: {
      "raster-tiles": {
        type: "raster" as const,
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
        attribution: "&copy; Esri World Imagery",
      },
    },
    layers: [
      {
        id: "base-raster-layer",
        type: "raster" as const,
        source: "raster-tiles",
        minzoom: 0,
        maxzoom: 18,
      },
    ],
  },
};

// Strategic Storage and Cold Storage Depots across Northeast India
export const REGIONAL_STORAGE_UNITS: StorageUnitData[] = [
  {
    id: "st-001",
    name: "Guwahati Central CWC Cold Chain & Agro Mega Hub",
    type: "COLD_STORAGE",
    state: "Assam",
    corridor: "NH-27 / Asian Highway 1 (Guwahati Belt)",
    lat: 26.1445,
    lng: 91.7362,
    total_capacity_mt: 15000,
    occupied_capacity_mt: 11200,
    temperature_c: -22.4,
    humidity_pct: 48,
    power_backup_status: "Triple Redundant DG (100% Uptime)",
    primary_commodities: ["Life-Saving Vaccines", "Blood Plasma", "Insulin", "Horticulture Export"],
    active_docking_bays: 5,
    total_docking_bays: 8,
    manager_name: "Dr. Arup Sharma",
    manager_phone: "+91 98640-11220",
    emergency_buffer_days: 28,
  },
  {
    id: "st-002",
    name: "Shillong Mawiong High-Altitude Pharma Cold Store",
    type: "COLD_STORAGE",
    state: "Meghalaya",
    corridor: "NH-6 (Guwahati - Shillong - Silchar)",
    lat: 25.5788,
    lng: 91.8933,
    total_capacity_mt: 4500,
    occupied_capacity_mt: 3800,
    temperature_c: 2.8,
    humidity_pct: 55,
    power_backup_status: "Dual Solar-Diesel Microgrid",
    primary_commodities: ["Antivenoms", "Pediatric Vaccines", "Diagnostic Kits", "Seed Potatoes"],
    active_docking_bays: 3,
    total_docking_bays: 4,
    manager_name: "Bantei Lyngdoh",
    manager_phone: "+91 94361-88200",
    emergency_buffer_days: 21,
  },
  {
    id: "st-003",
    name: "Silchar Rongpur Regional Food Grain Godown (FCI)",
    type: "DRY_STORAGE",
    state: "Assam",
    corridor: "NH-6 / NH-37 (Barak Valley Terminal)",
    lat: 24.8333,
    lng: 92.7789,
    total_capacity_mt: 30000,
    occupied_capacity_mt: 21500,
    power_backup_status: "Dedicated Grid Substation",
    primary_commodities: ["FCI Fortified Rice", "Wheat", "Pulses & Legumes", "Sugar Reserves"],
    active_docking_bays: 6,
    total_docking_bays: 10,
    manager_name: "Subir Purkayastha",
    manager_phone: "+91 94350-77112",
    emergency_buffer_days: 45,
  },
  {
    id: "st-004",
    name: "Jiribam Border Cold-Chain Transhipment Hub",
    type: "COLD_STORAGE",
    state: "Manipur",
    corridor: "NH-37 (Silchar - Jiribam - Imphal Highway)",
    lat: 24.8020,
    lng: 93.1250,
    total_capacity_mt: 3500,
    occupied_capacity_mt: 2900,
    temperature_c: -18.0,
    humidity_pct: 50,
    power_backup_status: "Heavy DG Automated Relay",
    primary_commodities: ["Cold-Chain Medical Buffers", "Emergency Blood Packs", "Dairy"],
    active_docking_bays: 2,
    total_docking_bays: 4,
    manager_name: "M. Tomba Singh",
    manager_phone: "+91 98622-44199",
    emergency_buffer_days: 14,
  },
  {
    id: "st-005",
    name: "Imphal Lamphelpat Central Medical Cryo Vault",
    type: "CRYO_PHARMA",
    state: "Manipur",
    corridor: "NH-37 / NH-2 (Imphal Valley Hub)",
    lat: 24.8170,
    lng: 93.9368,
    total_capacity_mt: 6000,
    occupied_capacity_mt: 4900,
    temperature_c: -24.5,
    humidity_pct: 42,
    power_backup_status: "Uninterrupted Medical Grade Power",
    primary_commodities: ["Cryogenic Biologics", "Specialized Vaccines", "Trauma Emergency Supplies"],
    active_docking_bays: 4,
    total_docking_bays: 6,
    manager_name: "Dr. N. Ibomcha",
    manager_phone: "+91 98630-99011",
    emergency_buffer_days: 30,
  },
  {
    id: "st-006",
    name: "Dimapur Railhead Multi-Commodity Logistics Depot",
    type: "DRY_STORAGE",
    state: "Nagaland",
    corridor: "NH-29 (Dimapur Transhipment Center)",
    lat: 25.9068,
    lng: 93.7270,
    total_capacity_mt: 40000,
    occupied_capacity_mt: 31000,
    power_backup_status: "Full Facility Grid & DG Relay",
    primary_commodities: ["Strategic Grain Reserves", "Salt Reserves", "Packaged Relief Kits"],
    active_docking_bays: 8,
    total_docking_bays: 12,
    manager_name: "Keviletuo Angami",
    manager_phone: "+91 94360-66770",
    emergency_buffer_days: 60,
  },
  {
    id: "st-007",
    name: "Kohima Phesama High-Altitude Cold Depot",
    type: "COLD_STORAGE",
    state: "Nagaland",
    corridor: "NH-29 (Dimapur - Kohima Highway)",
    lat: 25.6751,
    lng: 94.1086,
    total_capacity_mt: 3000,
    occupied_capacity_mt: 2300,
    temperature_c: 3.2,
    humidity_pct: 60,
    power_backup_status: "Dual DG + Solar Inverter",
    primary_commodities: ["Medical Cold Supplies", "Fresh Produce Buffer", "Vaccines"],
    active_docking_bays: 2,
    total_docking_bays: 4,
    manager_name: "Vitoho Sema",
    manager_phone: "+91 94368-22100",
    emergency_buffer_days: 20,
  },
  {
    id: "st-008",
    name: "Aizawl Durtlang Cold & Essential Supplies Storage",
    type: "COLD_STORAGE",
    state: "Mizoram",
    corridor: "NH-306 (Silchar - Aizawl Pass)",
    lat: 23.7307,
    lng: 92.7173,
    total_capacity_mt: 5500,
    occupied_capacity_mt: 4200,
    temperature_c: -15.0,
    humidity_pct: 52,
    power_backup_status: "Dual Hydro-Grid Relay",
    primary_commodities: ["Emergency Medicines", "Cold Perishables", "FCI Grains"],
    active_docking_bays: 3,
    total_docking_bays: 5,
    manager_name: "C. Lalhmingliana",
    manager_phone: "+91 94361-99881",
    emergency_buffer_days: 35,
  },
  {
    id: "st-009",
    name: "Agartala Bodhjungnagar Agro-Pharma Cold Park",
    type: "COLD_STORAGE",
    state: "Tripura",
    corridor: "NH-8 (Churaibari - Agartala Corridor)",
    lat: 23.8315,
    lng: 91.2868,
    total_capacity_mt: 10000,
    occupied_capacity_mt: 7800,
    temperature_c: -20.0,
    humidity_pct: 45,
    power_backup_status: "Natural Gas Co-Gen + Grid",
    primary_commodities: ["Export Pineapple/Jackfruit", "Medical Vaccines", "Pharma Buffers"],
    active_docking_bays: 5,
    total_docking_bays: 8,
    manager_name: "Swapan Debbarma",
    manager_phone: "+91 94365-11002",
    emergency_buffer_days: 40,
  },
  {
    id: "st-010",
    name: "Tezpur Strategic Riverhead Grain Godown",
    type: "DRY_STORAGE",
    state: "Assam",
    corridor: "NH-15 / NH-27 (Northern Riverhead)",
    lat: 26.6528,
    lng: 92.7926,
    total_capacity_mt: 22000,
    occupied_capacity_mt: 16500,
    power_backup_status: "Dedicated Substation",
    primary_commodities: ["Grain Reserves", "Flood Emergency Rations", "Packaging Material"],
    active_docking_bays: 4,
    total_docking_bays: 6,
    manager_name: "Ranjit Saikia",
    manager_phone: "+91 94351-44550",
    emergency_buffer_days: 50,
  },
  {
    id: "st-011",
    name: "Gangtok STNM Cryogenic Pharma Cold Vault",
    type: "CRYO_PHARMA",
    state: "Sikkim",
    corridor: "NH-10 (Siliguri - Gangtok Teesta Valley)",
    lat: 27.3314,
    lng: 88.6138,
    total_capacity_mt: 2000,
    occupied_capacity_mt: 1600,
    temperature_c: -70.0,
    humidity_pct: 35,
    power_backup_status: "Ultra-Reliable Hospital Microgrid",
    primary_commodities: ["mRNA Cryo-Vaccines", "Biological Reagents", "High-Altitude Medical Plasma"],
    active_docking_bays: 2,
    total_docking_bays: 3,
    manager_name: "Tenzing Lepcha",
    manager_phone: "+91 97332-66551",
    emergency_buffer_days: 25,
  },
  {
    id: "st-012",
    name: "Itanagar Naharlagun Multi-Commodity Depot",
    type: "DRY_STORAGE",
    state: "Arunachal Pradesh",
    corridor: "NH-415 (Papum Pare Supply Line)",
    lat: 27.0844,
    lng: 93.6053,
    total_capacity_mt: 12000,
    occupied_capacity_mt: 8900,
    power_backup_status: "Dual Hydro-Solar DG Relay",
    primary_commodities: ["Essential Food Supplies", "Emergency Shelter Kits", "Fuel Pellets"],
    active_docking_bays: 3,
    total_docking_bays: 5,
    manager_name: "Kaling Moyong",
    manager_phone: "+91 94360-88771",
    emergency_buffer_days: 45,
  },
  {
    id: "st-013",
    name: "Sonapur Emergency Buffer Cold & Dry Depot",
    type: "COLD_STORAGE",
    state: "Meghalaya",
    corridor: "NH-6 (Sonapur Landslide Bypass Zone)",
    lat: 25.1200,
    lng: 92.3500,
    total_capacity_mt: 2500,
    occupied_capacity_mt: 1950,
    temperature_c: 2.0,
    humidity_pct: 54,
    power_backup_status: "Emergency Hill-Site DG Relay",
    primary_commodities: ["Rapid Response Emergency Medical Kits", "Perishable Rations", "Oxygen Supplies"],
    active_docking_bays: 2,
    total_docking_bays: 4,
    manager_name: "Lamphrang Dkhar",
    manager_phone: "+91 98641-77889",
    emergency_buffer_days: 15,
  },
];

// Rich active fleet default convoy data for map interactivity
const DEFAULT_TRUCKS: TruckData[] = [
  {
    id: "v-101",
    registration_number: "AS-01-GC-4481",
    driver_name: "Capt. Biren Roy",
    driver_phone: "+91 98640-28190",
    vehicle_type: "Heavy Truck (16T Multi-Axle)",
    speed_kmh: 54,
    fuel_level: 78,
    status: "MOVING",
    lat: 25.185,
    lng: 92.482,
    corridor: "NH-6 (Shillong - Silchar / Sonapur)",
    destination: "Silchar Rongpur Yard",
    cargo: "Life-Saving Cold-Chain Vaccines & Medical Supplies",
    priority: "CRITICAL",
    eta: "1h 45m",
    temperature_c: 3.4,
    delivery_id: "del-001",
  },
  {
    id: "v-102",
    registration_number: "NL-07-A-9920",
    driver_name: "Temsu Ao",
    driver_phone: "+91 94360-11822",
    vehicle_type: "Medium LCV (7.5T)",
    speed_kmh: 42,
    fuel_level: 64,
    status: "DELAYED",
    lat: 25.75,
    lng: 93.85,
    corridor: "NH-29 (Dimapur - Kohima Highway)",
    destination: "Kohima Supply Center",
    cargo: "Disaster Relief Kits & High-Altitude Ration",
    priority: "HIGH",
    eta: "48 min",
    temperature_c: 18.2,
    delivery_id: "del-002",
  },
  {
    id: "v-103",
    registration_number: "MN-01-B-1122",
    driver_name: "R. K. Singh",
    driver_phone: "+91 98620-77341",
    vehicle_type: "Heavy Freight Transport (24T)",
    speed_kmh: 48,
    fuel_level: 85,
    status: "MOVING",
    lat: 24.8,
    lng: 93.3,
    corridor: "NH-37 (Silchar - Jiribam - Imphal)",
    destination: "Imphal Wholesale Terminal",
    cargo: "FCI Grain & Essential Food Grains",
    priority: "NORMAL",
    eta: "3h 10m",
    temperature_c: 24.0,
    delivery_id: "del-003",
  },
  {
    id: "v-104",
    registration_number: "SK-02-E-3301",
    driver_name: "Sonam Bhutia",
    driver_phone: "+91 97330-88219",
    vehicle_type: "Medical Cold-Chain EV",
    speed_kmh: 32,
    fuel_level: 92,
    status: "MOVING",
    lat: 27.05,
    lng: 88.52,
    corridor: "NH-10 (Siliguri - Gangtok Teesta Valley)",
    destination: "STNM Central Hospital Gangtok",
    cargo: "Specialized Emergency Medical Equipment",
    priority: "CRITICAL",
    eta: "1h 15m",
    temperature_c: 2.8,
    delivery_id: "del-004",
  },
  {
    id: "v-105",
    registration_number: "MZ-01-F-7744",
    driver_name: "Lalrinsanga",
    driver_phone: "+91 94361-44012",
    vehicle_type: "Emergency 4x4 Quick Response",
    speed_kmh: 62,
    fuel_level: 58,
    status: "MOVING",
    lat: 24.0,
    lng: 92.7,
    corridor: "NH-306 (Silchar - Aizawl Pass)",
    destination: "Aizawl FCI Godown",
    cargo: "Emergency Oxygen Cylinders & Medical Kits",
    priority: "CRITICAL",
    eta: "2h 05m",
    temperature_c: 19.5,
    delivery_id: "del-005",
  },
  {
    id: "v-106",
    registration_number: "TR-01-C-8819",
    driver_name: "Debashis Roy",
    driver_phone: "+91 94364-55099",
    vehicle_type: "Heavy Tanker (18KL)",
    speed_kmh: 50,
    fuel_level: 81,
    status: "MOVING",
    lat: 23.83,
    lng: 91.28,
    corridor: "NH-8 (Churaibari - Agartala Corridor)",
    destination: "Agartala Central Fuel Depot",
    cargo: "Aviation Turbine Fuel & Essential Petroleum",
    priority: "HIGH",
    eta: "55 min",
    temperature_c: 28.0,
    delivery_id: "del-006",
  },
  {
    id: "v-107",
    registration_number: "AR-01-K-5502",
    driver_name: "Tashi Tsering",
    driver_phone: "+91 94360-33290",
    vehicle_type: "All-Terrain 6x6 Heavy Hauler",
    speed_kmh: 28,
    fuel_level: 74,
    status: "MOVING",
    lat: 27.58,
    lng: 91.86,
    corridor: "Bhalukpong - Tawang Pass Corridor",
    destination: "Tawang High-Altitude Depot",
    cargo: "Border Infrastructure Structural Materials",
    priority: "NORMAL",
    eta: "4h 20m",
    temperature_c: 8.5,
    delivery_id: "del-007",
  },
];

export interface IncidentMapData {
  id: string;
  incident_code?: string;
  type: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status?: string;
  title: string;
  description?: string;
  road_id?: string;
  affected_road_code?: string;
  district_id?: string;
  lat: number;
  lng: number;
  reporter_name?: string;
  created_at?: string;
  color?: string;
  source_name?: string;
  source_url?: string;
  source_trust_level?: "OFFICIAL" | "VERIFIED_PROVIDER" | "REPUTABLE_NEWS" | "UNVERIFIED" | string;
  source_event_id?: string;
  confidence_score?: number;
  verification_status?: string;
  freshness_state?: "LIVE" | "RECENT" | "STALE" | "EXPIRED" | string;
  is_live_external?: boolean;
  alternative_available?: boolean;
}

const DEFAULT_INCIDENTS: IncidentMapData[] = [
  {
    id: "inc-001",
    incident_code: "INC-2026-081",
    type: "landslide",
    severity: "CRITICAL",
    status: "OPEN",
    title: "Major Debris Landslide at Sonapur Valley",
    description: "450m stretch of NH-6 blocked by rock and soil slide. PWD heavy earthmovers on-site.",
    road_id: "NH-6",
    lat: 25.1850,
    lng: 92.4820,
    created_at: new Date().toISOString(),
  },
  {
    id: "inc-002",
    incident_code: "INC-2026-084",
    type: "flood",
    severity: "HIGH",
    status: "OPEN",
    title: "Flash Inundation near Kaziranga Corridor",
    description: "River overflow submerged southern carriage path by 2.2ft. Heavy commercial vehicles only.",
    road_id: "NH-715",
    lat: 26.5850,
    lng: 93.1700,
    created_at: new Date().toISOString(),
  },
  {
    id: "inc-003",
    incident_code: "INC-2026-092",
    type: "rockfall",
    severity: "CRITICAL",
    status: "OPEN",
    title: "Pagla Pahar Heavy Boulder Slip",
    description: "Multi-ton granite boulder slipped onto northbound lane on NH-29.",
    road_id: "NH-29",
    lat: 25.7500,
    lng: 93.8500,
    created_at: new Date().toISOString(),
  },
  {
    id: "inc-004",
    incident_code: "INC-2026-099",
    type: "bridge_damage",
    severity: "HIGH",
    status: "IN_PROGRESS",
    title: "Culvert Scour & Structural Bridge Assessment",
    description: "Single-lane restricted movement on Jiribam Highway km 42.",
    road_id: "NH-37",
    lat: 24.8100,
    lng: 93.1500,
    created_at: new Date().toISOString(),
  },
];

export const MapLibreView: React.FC<MapLibreViewProps> = ({
  initialCenter = [92.8, 25.8], // Central North East India
  initialZoom = 7.0,
  highlightRouteGeojson,
  alternateRouteGeojson,
  blockedRouteSegmentsGeojson,
  candidateRoutes,
  activeRouteIndex = 0,
  onSelectRoute,
  onFeatureClick,
  onSelectCorridor,
  className,
  showLayerController = true,
  showToolbox = true,
  showFilterToolbar = true,
  showLegend = true,
}) => {
  const { addToast } = useToast();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const truckMarkersRef = useRef<maplibregl.Marker[]>([]);
  const storageMarkersRef = useRef<maplibregl.Marker[]>([]);
  const incidentMarkersRef = useRef<maplibregl.Marker[]>([]);
  const clusterMarkersRef = useRef<maplibregl.Marker[]>([]);
  const spiderfyCollapseMarkerRef = useRef<maplibregl.Marker | null>(null);
  const routeMarkersRef = useRef<maplibregl.Marker[]>([]);
  const roadPopupRef = useRef<maplibregl.Popup | null>(null);
  const routeTooltipPopupRef = useRef<maplibregl.Popup | null>(null);
  const rawIncidentsRef = useRef<IncidentMapData[]>(DEFAULT_INCIDENTS);
  const activeSpiderfyGroupRef = useRef<{ anchorLngLat: [number, number]; items: IncidentMapData[] } | null>(null);
  const reclusterDebounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Tools & Modals state
  const [activeTool, setActiveTool] = useState<"route" | "fleet" | "weather" | "simulator" | null>(null);
  const [isPinHazardMode, setIsPinHazardMode] = useState<boolean>(false);
  const [pinnedCoord, setPinnedCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [basemapStyle, setBasemapStyle] = useState<"light" | "topo" | "satellite">("light");

  // Selection states
  const [selectedRoad, setSelectedRoad] = useState<any>(null);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [selectedTruck, setSelectedTruck] = useState<TruckData | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<StorageUnitData | null>(null);

  // Dynamic route states calculated from in-map route tool
  const [inMapPrimaryRoute, setInMapPrimaryRoute] = useState<any>(null);
  const [inMapAltRoute, setInMapAltRoute] = useState<any>(null);
  const [activeRouteInfo, setActiveRouteInfo] = useState<any>(null);

  // Incident Filtering & Interactivity State
  const [incidentTypeFilter, setIncidentTypeFilter] = useState<string>("ALL");
  const [incidentSeverityFilter, setIncidentSeverityFilter] = useState<string>("ALL");
  const [activeSpiderfyId, setActiveSpiderfyId] = useState<string | null>(null);
  const [hoveredRouteIdx, setHoveredRouteIdx] = useState<number | null>(null);
  const [isLegendOpen, setIsLegendOpen] = useState<boolean>(false);
  const [totalIncidentsCount, setTotalIncidentsCount] = useState<number>(DEFAULT_INCIDENTS.length);
  const [filteredIncidentsCount, setFilteredIncidentsCount] = useState<number>(DEFAULT_INCIDENTS.length);

  const [layersState, setLayersState] = useState({
    roads: true,
    incidents: true,
    vehicles: true,
    districts: true,
    storage: true,
    weather: true,
  });

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isLayersPanelOpen, setIsLayersPanelOpen] = useState(false);

  // Ensure spiderfy leader lines source and layer exist
  const initSpiderfyLinesLayer = (mapInst: maplibregl.Map) => {
    if (!mapInst.getSource("spiderfy-lines-src")) {
      mapInst.addSource("spiderfy-lines-src", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      mapInst.addLayer({
        id: "spiderfy-lines-layer",
        type: "line",
        source: "spiderfy-lines-src",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#475569",
          "line-width": 1.8,
          "line-dasharray": [3, 2],
          "line-opacity": 0.85,
        },
      });
    }
  };

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: BASEMAP_STYLES[basemapStyle],
      center: initialCenter,
      zoom: initialZoom,
      attributionControl: false,
    });

    mapInstance.on("load", () => {
      map.current = mapInstance;
      initSpiderfyLinesLayer(mapInstance);
      setIsMapLoaded(true);
      fetchMapFeatures(mapInstance);
      renderStorageMarkers(mapInstance, REGIONAL_STORAGE_UNITS);
    });

    // Dynamic re-clustering on pan or zoom with debounce
    const handleViewChange = () => {
      if (reclusterDebounceTimer.current) clearTimeout(reclusterDebounceTimer.current);
      reclusterDebounceTimer.current = setTimeout(() => {
        if (map.current) {
          renderIncidentMarkers(map.current);
        }
      }, 100);
    };

    mapInstance.on("zoomend", handleViewChange);
    mapInstance.on("moveend", handleViewChange);

    // Handle Map Clicks
    mapInstance.on("click", (e) => {
      const features = mapInstance.queryRenderedFeatures(e.point, {
        layers: ["roads-line", "incidents-unclustered"],
      });

      if (features.length === 0) {
        if (isPinHazardMode) {
          setPinnedCoord({ lat: e.lngLat.lat, lng: e.lngLat.lng });
          setIsPinHazardMode(false);
        } else {
          setSelectedRoad(null);
          setSelectedIncident(null);
          if (activeSpiderfyGroupRef.current) {
            activeSpiderfyGroupRef.current = null;
            setActiveSpiderfyId(null);
            renderIncidentMarkers(mapInstance);
          }
        }
      }
    });

    // Cleanup
    return () => {
      if (reclusterDebounceTimer.current) clearTimeout(reclusterDebounceTimer.current);
      truckMarkersRef.current.forEach((m) => m.remove());
      truckMarkersRef.current = [];
      storageMarkersRef.current.forEach((m) => m.remove());
      storageMarkersRef.current = [];
      incidentMarkersRef.current.forEach((m) => m.remove());
      incidentMarkersRef.current = [];
      clusterMarkersRef.current.forEach((m) => m.remove());
      clusterMarkersRef.current = [];
      if (spiderfyCollapseMarkerRef.current) {
        spiderfyCollapseMarkerRef.current.remove();
        spiderfyCollapseMarkerRef.current = null;
      }
      routeMarkersRef.current.forEach((m) => m.remove());
      routeMarkersRef.current = [];
      if (roadPopupRef.current) roadPopupRef.current.remove();
      if (routeTooltipPopupRef.current) routeTooltipPopupRef.current.remove();

      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update Basemap style dynamically
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;
    map.current.setStyle(BASEMAP_STYLES[basemapStyle]);
    map.current.once("style.load", () => {
      if (map.current) {
        initSpiderfyLinesLayer(map.current);
        fetchMapFeatures(map.current);
        renderStorageMarkers(map.current, REGIONAL_STORAGE_UNITS);
      }
    });
  }, [basemapStyle]);

  // Clear and Render Custom HTML Storage & Cold Storage Markers
  const renderStorageMarkers = (mapInst: maplibregl.Map, storageList: StorageUnitData[]) => {
    storageMarkersRef.current.forEach((m) => m.remove());
    storageMarkersRef.current = [];

    storageList.forEach((st) => {
      const isCold = st.type === "COLD_STORAGE" || st.type === "CRYO_PHARMA";
      const isCryo = st.type === "CRYO_PHARMA";
      const capK = Math.round(st.total_capacity_mt / 1000);

      const el = document.createElement("div");
      el.className = "storage-marker-wrapper group cursor-pointer relative flex flex-col items-center select-none";
      el.style.zIndex = "18";

      const badgeBg = isCold
        ? "bg-gradient-to-br from-cyan-500 to-blue-600 shadow-cyan-500/30 border-cyan-100"
        : "bg-gradient-to-br from-emerald-600 to-teal-700 shadow-emerald-500/30 border-emerald-100";

      el.innerHTML = `
        <div class="relative flex items-center justify-center w-8 h-8 rounded-xl shadow-floating border-2 border-white transition-all duration-200 transform group-hover:scale-125 group-hover:shadow-lg ${badgeBg}">
          ${
            isCryo
              ? '<span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-300 rounded-full animate-ping opacity-90"></span>'
              : ""
          }
          ${
            isCold
              ? `<svg class="w-4 h-4 text-white drop-shadow-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2v20"/>
                  <path d="m17 5-5 5-5-5"/>
                  <path d="m17 19-5-5-5 5"/>
                  <path d="M2 12h20"/>
                  <path d="m5 7 5 5-5 5"/>
                  <path d="m19 7-5 5 5 5"/>
                </svg>`
              : `<svg class="w-4 h-4 text-white drop-shadow-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>`
          }
        </div>

        <div class="mt-1 px-1.5 py-0.5 bg-white/95 backdrop-blur-sm rounded-md shadow-xs border border-slate-200/90 text-[10px] font-bold text-slate-800 whitespace-nowrap flex items-center gap-1 group-hover:border-brand-400 group-hover:bg-brand-50 transition-colors">
          <span class="${isCold ? "text-cyan-700" : "text-emerald-700"}">${isCold ? "❄️" : "🏢"}</span>
          <span class="max-w-[80px] truncate">${st.name.split(" ")[0]}</span>
          <span class="text-slate-400 font-normal">|</span>
          <span class="${isCold ? "text-cyan-700 font-bold" : "text-emerald-700 font-bold"}">
            ${isCold ? `${st.temperature_c}°C` : `${capK}k MT`}
          </span>
        </div>
      `;

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        setSelectedStorage(st);
        mapInst.flyTo({ center: [st.lng, st.lat], zoom: 10.5, essential: true, duration: 900 });
        addToast({
          title: `${isCold ? "❄️ Cold Storage Depot" : "🏢 Strategic Warehouse"}: ${st.name}`,
          description: `Capacity: ${st.total_capacity_mt.toLocaleString()} MT. ${isCold ? `Temperature: ${st.temperature_c}°C.` : `Stocked along ${st.corridor}.`}`,
          type: "info",
        });
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([st.lng, st.lat])
        .addTo(mapInst);

      storageMarkersRef.current.push(marker);
    });
  };

  // Clear and Render Custom HTML Truck Markers
  const renderTruckMarkers = (mapInst: maplibregl.Map, vehicleDataList: TruckData[]) => {
    truckMarkersRef.current.forEach((m) => m.remove());
    truckMarkersRef.current = [];

    vehicleDataList.forEach((veh) => {
      const lat = veh.lat || veh.current_lat || 25.185;
      const lng = veh.lng || veh.current_lng || 92.482;
      const priority = veh.priority || "NORMAL";
      const isCritical = priority === "CRITICAL";
      const isHigh = priority === "HIGH";
      const speed = veh.speed_kmh ?? 50;
      const truckId = veh.id ? veh.id.toUpperCase() : "TRK";
      const reg = veh.registration_number || truckId;

      const bgClass = isCritical
        ? "bg-rose-600 shadow-rose-500/40"
        : isHigh
        ? "bg-amber-500 shadow-amber-500/40"
        : "bg-blue-600 shadow-blue-500/40";

      const el = document.createElement("div");
      el.className = "truck-marker-wrapper group cursor-pointer relative flex flex-col items-center select-none";
      el.style.zIndex = isCritical ? "25" : "20";

      el.innerHTML = `
        <div class="relative flex items-center justify-center w-8 h-8 rounded-xl shadow-floating border-2 border-white transition-all duration-200 transform group-hover:scale-125 group-hover:shadow-lg ${bgClass}">
          ${
            isCritical
              ? '<span class="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-ping opacity-75"></span><span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-600 rounded-full border border-white"></span>'
              : ""
          }
          <svg class="w-4 h-4 text-white drop-shadow-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
            <path d="M15 18H9"/>
            <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
            <circle cx="17" cy="18" r="2"/>
            <circle cx="7" cy="18" r="2"/>
          </svg>
        </div>

        <div class="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 pointer-events-none scale-90 translate-y-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 transition-all duration-150 z-30 px-2.5 py-1 bg-slate-900/95 backdrop-blur-sm text-white rounded-lg shadow-xl text-[11px] font-bold whitespace-nowrap flex items-center gap-1.5 border border-slate-700/80">
          <span class="text-sky-300">🚚</span>
          <span class="font-mono text-sky-200 font-bold">${veh.id ? `ID: ${veh.id}` : reg}</span>
          ${veh.id && veh.registration_number ? `<span class="text-slate-400 font-normal text-[10px]">(${veh.registration_number})</span>` : ""}
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-slate-700/80"></div>
        </div>
      `;

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        setSelectedTruck(veh);
        mapInst.flyTo({ center: [lng, lat], zoom: 10.5, essential: true, duration: 900 });
        addToast({
          title: `Truck Selected: ${reg}`,
          description: `Corridor: ${veh.corridor || "NH-6"}. Speed: ${speed} km/h. Driver: ${veh.driver_name || "Capt. Biren Roy"}`,
          type: "info",
        });
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(mapInst);

      truckMarkersRef.current.push(marker);
    });
  };

  // Compact 1-line interactive marker element builder using SVG icons & semantic hierarchy
  const createIncidentMarkerElement = (
    inc: IncidentMapData,
    visual: IncidentVisualConfig,
    isSpiderfied: boolean
  ): HTMLDivElement => {
    const el = document.createElement("div");
    el.className = "incident-alert-marker-wrapper group cursor-pointer relative flex flex-col items-center select-none";
    el.style.zIndex = `${visual.zIndex + (isSpiderfied ? 12 : 0)}`;

    const isCritical = inc.severity === "CRITICAL";
    const isHigh = inc.severity === "HIGH";
    const roadDisplay = inc.affected_road_code || inc.road_id || "Highway";
    const freshness = (inc.freshness_state || "LIVE").toUpperCase();
    const freshnessDot = freshness === "LIVE" ? "bg-emerald-400 animate-pulse" : "bg-amber-400";

    el.innerHTML = `
      <div class="relative flex items-center justify-center">
        <!-- Animated Radar Waves for Critical and High Hazards -->
        ${
          isCritical
            ? `<span class="absolute -inset-1 rounded-2xl ${visual.pulseColor} opacity-60 animate-pulse"></span>
               <span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-600 rounded-full border border-white z-20"></span>`
            : isHigh
            ? `<span class="absolute -inset-1 rounded-2xl ${visual.pulseColor} opacity-40 animate-pulse"></span>`
            : ""
        }

        <!-- Vector SVG High-Visibility Icon Badge -->
        <div class="relative flex items-center justify-center rounded-xl shadow-floating border-2 border-white transition-all duration-200 transform group-hover:scale-125 group-hover:shadow-2xl ${visual.bgGradientClass} p-1 text-white" style="width: ${visual.sizePx}px; height: ${visual.sizePx}px;">
          ${visual.iconSvg}
        </div>
      </div>

      <!-- Ground Pointer Triangle (omitted in spiderfied nodes) -->
      ${
        !isSpiderfied
          ? `<div class="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-t-[4.5px] -mt-[1px]" style="border-top-color: ${visual.colorHex};"></div>`
          : ""
      }

      <!-- Compact 1-Line Glassmorphic Hover Preview Tooltip (Zero Clipping) -->
      <div class="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 pointer-events-none scale-90 translate-y-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 transition-all duration-150 z-50 px-2.5 py-1 bg-slate-900/95 backdrop-blur-sm text-white rounded-lg shadow-xl text-[11px] whitespace-nowrap border border-slate-700/80 flex items-center gap-2 max-w-[240px]">
        <span class="w-2 h-2 rounded-full ${freshnessDot}"></span>
        <span class="font-bold text-slate-100 truncate">${inc.title}</span>
        <span class="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${visual.severityBadgeClass}">
          ${inc.severity || "HIGH"}
        </span>
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-slate-700/80"></div>
      </div>
    `;

    return el;
  };

  // Render Optimized High-Visibility Tactical Alert & Hazard Markers with Spiderfy & Clustering
  const renderIncidentMarkers = (mapInst: maplibregl.Map, incidentDataList?: IncidentMapData[]) => {
    if (!mapInst) return;
    
    if (incidentDataList) {
      rawIncidentsRef.current = incidentDataList;
      setTotalIncidentsCount(incidentDataList.length);
    }

    // Clean up previous DOM markers
    incidentMarkersRef.current.forEach((m) => m.remove());
    incidentMarkersRef.current = [];
    clusterMarkersRef.current.forEach((m) => m.remove());
    clusterMarkersRef.current = [];
    if (spiderfyCollapseMarkerRef.current) {
      spiderfyCollapseMarkerRef.current.remove();
      spiderfyCollapseMarkerRef.current = null;
    }

    const currentZoom = mapInst.getZoom();

    // 1. Filter raw incidents by type & severity
    const filtered = rawIncidentsRef.current.filter((inc) => {
      if (!inc.lat || !inc.lng) return false;
      const sev = (inc.severity || "MEDIUM").toUpperCase();
      if (incidentSeverityFilter !== "ALL" && sev !== incidentSeverityFilter) {
        return false;
      }
      if (incidentTypeFilter !== "ALL") {
        const t = (inc.type || "").toLowerCase();
        if (!t.includes(incidentTypeFilter.toLowerCase())) return false;
      }
      return true;
    });

    setFilteredIncidentsCount(filtered.length);

    // 2. Active Spiderfy layout if a cluster is currently expanded
    const activeSpiderfy = activeSpiderfyGroupRef.current;
    if (activeSpiderfy) {
      const spiderfyPoints = activeSpiderfy.items.map((inc) => ({
        id: inc.id,
        lng: inc.lng,
        lat: inc.lat,
        data: inc,
      }));

      const spiderResult = generateSpiderfyLayout(mapInst, spiderfyPoints, 65);
      if (spiderResult) {
        // Update SVG/GeoJSON leader lines
        const lineFeatures = spiderResult.nodes.map((node) => ({
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [node.anchorLngLat, node.displayLngLat],
          },
          properties: {},
        }));

        const src = (mapInst as any).style ? mapInst.getSource("spiderfy-lines-src") as maplibregl.GeoJSONSource : null;
        if (src) {
          src.setData({
            type: "FeatureCollection",
            features: lineFeatures as any,
          });
        }

        // Render spiderfied individual markers
        spiderResult.nodes.forEach((node) => {
          const inc = node.point.data;
          const visual = getIncidentVisualConfig(inc.type, inc.severity, true);
          const el = createIncidentMarkerElement(inc, visual, true);

          el.addEventListener("click", (e) => {
            e.stopPropagation();
            setSelectedIncident(inc);
            setSelectedRoad(null);
            setSelectedTruck(null);
            setSelectedStorage(null);
            mapInst.flyTo({ center: [inc.lng, inc.lat], zoom: Math.max(currentZoom, 12), essential: true, duration: 600 });
            if (onFeatureClick) onFeatureClick(inc);
            addToast({
              title: `🚨 ${inc.severity || "CRITICAL"} Alert: ${inc.title}`,
              description: `Corridor: ${inc.road_id || "Highway"}. Status: ${inc.status || "OPEN"}. Opening triage drawer.`,
              type: inc.severity === "CRITICAL" ? "error" : "warning",
            });
          });

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat(node.displayLngLat)
            .addTo(mapInst);
          incidentMarkersRef.current.push(marker);
        });

        // Center collapse anchor badge
        const collapseEl = document.createElement("div");
        collapseEl.className = "cursor-pointer group flex items-center justify-center select-none";
        collapseEl.innerHTML = `
          <div class="relative w-7 h-7 rounded-full bg-slate-900/90 hover:bg-rose-600 border-2 border-white shadow-floating text-white flex items-center justify-center text-xs font-bold transition-transform hover:scale-125" title="Collapse expanded incidents">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
            <div class="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap font-medium">
              Collapse Group
            </div>
          </div>
        `;
        collapseEl.addEventListener("click", (e) => {
          e.stopPropagation();
          activeSpiderfyGroupRef.current = null;
          setActiveSpiderfyId(null);
          renderIncidentMarkers(mapInst);
        });

        const collapseMarker = new maplibregl.Marker({ element: collapseEl })
          .setLngLat(spiderResult.anchorLngLat)
          .addTo(mapInst);
        spiderfyCollapseMarkerRef.current = collapseMarker;
      }
    } else {
        const src = (mapInst as any).style ? mapInst.getSource("spiderfy-lines-src") as maplibregl.GeoJSONSource : null;
      if (src) {
        src.setData({ type: "FeatureCollection", features: [] });
      }
    }

    // 3. Proximity Clustering for non-spiderfied incidents
    const nonSpiderfied = activeSpiderfy
      ? filtered.filter((inc) => !activeSpiderfy.items.some((si) => si.id === inc.id))
      : filtered;

    const clusters = groupNearbyIncidents(mapInst, nonSpiderfied, 45);

    clusters.forEach((cluster) => {
      if (cluster.isCluster) {
        // Render Cluster Badge
        const clusterEl = document.createElement("div");
        clusterEl.innerHTML = createClusterBadgeMarkup(cluster.items.length, cluster.maxSeverity);

        // Tooltip showing brief count on hover
        const previewEl = document.createElement("div");
        previewEl.className = "absolute -top-11 left-1/2 -translate-x-1/2 opacity-0 pointer-events-none scale-95 translate-y-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 transition-all duration-150 z-50 px-2.5 py-1 bg-slate-900/95 backdrop-blur-sm text-white rounded-lg shadow-xl text-[10px] whitespace-nowrap border border-slate-700/80 flex items-center gap-1.5";
        previewEl.innerHTML = `
          <span class="font-bold text-amber-300">${cluster.items.length} Incidents</span>
          <span class="text-slate-400">•</span>
          <span class="text-slate-200">Click to ${currentZoom < 13.5 ? "zoom in" : "expand"}</span>
        `;
        clusterEl.firstElementChild?.appendChild(previewEl);

        clusterEl.addEventListener("click", (e) => {
          e.stopPropagation();
          if (currentZoom < 13.5) {
            mapInst.flyTo({
              center: cluster.centerLngLat,
              zoom: Math.min(currentZoom + 2.5, 14.5),
              essential: true,
              duration: 700,
            });
          } else {
            // Trigger radial spiderfy expansion
            activeSpiderfyGroupRef.current = {
              anchorLngLat: cluster.centerLngLat,
              items: cluster.items,
            };
            setActiveSpiderfyId(`cluster-${cluster.centerLngLat.join(",")}`);
            renderIncidentMarkers(mapInst);
          }
        });

        const clusterMarker = new maplibregl.Marker({ element: clusterEl })
          .setLngLat(cluster.centerLngLat)
          .addTo(mapInst);
        clusterMarkersRef.current.push(clusterMarker);
      } else {
        // Single Incident Marker
        const inc = cluster.items[0];
        const visual = getIncidentVisualConfig(inc.type, inc.severity, false);
        const el = createIncidentMarkerElement(inc, visual, false);

        el.addEventListener("click", (e) => {
          e.stopPropagation();
          setSelectedIncident(inc);
          setSelectedRoad(null);
          setSelectedTruck(null);
          setSelectedStorage(null);
          mapInst.flyTo({ center: [inc.lng, inc.lat], zoom: Math.max(currentZoom, 11.5), essential: true, duration: 800 });
          if (onFeatureClick) onFeatureClick(inc);
          addToast({
            title: `🚨 ${inc.severity || "CRITICAL"} Alert: ${inc.title}`,
            description: `Corridor: ${inc.road_id || "Highway"}. Status: ${inc.status || "OPEN"}. Opening triage & detour controller.`,
            type: inc.severity === "CRITICAL" ? "error" : "warning",
          });
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([inc.lng, inc.lat])
          .addTo(mapInst);
        incidentMarkersRef.current.push(marker);
      }
    });
  };

  // Fetch GeoJSON features from API and add to map
  const fetchMapFeatures = async (mapInst: maplibregl.Map) => {
    try {
      const bounds = mapInst.getBounds();
      const bboxStr = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;

      const res = await fetch(`${API_BASE_URL}/map/features?bbox=${bboxStr}`);

      let vehicleDataList: TruckData[] = DEFAULT_TRUCKS;
      let incidentDataList: IncidentMapData[] = DEFAULT_INCIDENTS;

      if (res.ok) {
        const data = await res.json();
        const roadFeatures = data.features?.filter((f: any) => f.properties.layer === "roads") || [];
        const incidentFeatures = data.features?.filter((f: any) => f.properties.layer === "incidents") || [];
        const districtFeatures = data.features?.filter((f: any) => f.properties.layer === "districts") || [];
        const vehicleFeatures = data.features?.filter((f: any) => f.properties.layer === "vehicles") || [];

        if (vehicleFeatures && vehicleFeatures.length > 0) {
          vehicleDataList = vehicleFeatures.map((vf: any) => ({
            id: vf.properties.id || vf.id,
            registration_number: vf.properties.registration_number || vf.properties.title || "AS-01-GC-4481",
            driver_name: vf.properties.driver_name || "Capt. Biren Roy",
            vehicle_type: vf.properties.vehicle_type || "Heavy Truck (16T)",
            speed_kmh: vf.properties.speed_kmh || 54,
            fuel_level: vf.properties.fuel_level || 78,
            status: vf.properties.status || "MOVING",
            lat: vf.geometry.coordinates[1],
            lng: vf.geometry.coordinates[0],
            corridor: vf.properties.corridor || "NH-6 Corridor",
            destination: vf.properties.destination || "Silchar Rongpur Yard",
            cargo: vf.properties.cargo || "Cold-Chain Vaccines & Essential Medical Supplies",
            priority: vf.properties.priority || "CRITICAL",
            eta: vf.properties.eta || "1h 45m",
            temperature_c: 3.4,
          }));
        }

        if (incidentFeatures && incidentFeatures.length > 0) {
          incidentDataList = incidentFeatures.map((inf: any) => ({
            id: inf.properties.id || inf.id,
            incident_code: inf.properties.incident_code || inf.id,
            type: inf.properties.type || "landslide",
            severity: inf.properties.severity || "CRITICAL",
            status: inf.properties.status || "OPEN",
            title: inf.properties.title || "Corridor Disruption",
            description: inf.properties.description || "",
            road_id: inf.properties.affected_road_code || inf.properties.road_id || "Corridor",
            affected_road_code: inf.properties.affected_road_code,
            district_id: inf.properties.district_id,
            lat: inf.geometry.coordinates[1],
            lng: inf.geometry.coordinates[0],
            reporter_name: inf.properties.reporter_name,
            created_at: inf.properties.created_at,
            color: inf.properties.color,
            source_name: inf.properties.source_name,
            source_url: inf.properties.source_url,
            source_trust_level: inf.properties.source_trust_level,
            source_event_id: inf.properties.source_event_id,
            confidence_score: inf.properties.confidence_score,
            verification_status: inf.properties.verification_status,
            freshness_state: inf.properties.freshness_state,
            is_live_external: inf.properties.is_live_external,
            alternative_available: inf.properties.alternative_available,
          }));
        }

        // 1. District Boundaries
        if (!mapInst.getSource("districts-src")) {
          mapInst.addSource("districts-src", {
            type: "geojson",
            data: { type: "FeatureCollection", features: districtFeatures },
          });

          mapInst.addLayer({
            id: "districts-fill",
            type: "fill",
            source: "districts-src",
            paint: {
              "fill-color": "#0284c7",
              "fill-opacity": 0.04,
            },
          });

          mapInst.addLayer({
            id: "districts-line",
            type: "line",
            source: "districts-src",
            paint: {
              "line-color": "#0284c7",
              "line-width": 1.2,
              "line-dasharray": [3, 2],
              "line-opacity": 0.4,
            },
          });
        } else {
          (mapInst.getSource("districts-src") as maplibregl.GeoJSONSource).setData({
            type: "FeatureCollection",
            features: districtFeatures,
          });
        }

        // 2. Roads Source & Layer
        if (!mapInst.getSource("roads-src")) {
          mapInst.addSource("roads-src", {
            type: "geojson",
            data: { type: "FeatureCollection", features: roadFeatures },
          });

          mapInst.addLayer({
            id: "roads-casing",
            type: "line",
            source: "roads-src",
            paint: {
              "line-color": "#ffffff",
              "line-width": 6.5,
              "line-opacity": 0.85,
            },
          });

          mapInst.addLayer({
            id: "roads-line",
            type: "line",
            source: "roads-src",
            paint: {
              "line-color": ["get", "color"],
              "line-width": 4.0,
            },
          });

          if (!mapInst.getLayer("roads-labels")) {
            mapInst.addLayer({
              id: "roads-labels",
              type: "symbol",
              source: "roads-src",
              layout: {
                "symbol-placement": "line",
                "text-field": ["get", "code"],
                "text-size": 11,
                "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
                "text-letter-spacing": 0.06,
                "text-max-angle": 30,
                "symbol-spacing": 350,
              },
              paint: {
                "text-color": "#0f172a",
                "text-halo-color": "#ffffff",
                "text-halo-width": 2.5,
              },
            });
          }

          if (!roadPopupRef.current) {
            roadPopupRef.current = new maplibregl.Popup({
              closeButton: false,
              closeOnClick: false,
              offset: 12,
              className: "road-hover-popup",
            });
          }

          mapInst.on("mouseenter", "roads-line", (e) => {
            mapInst.getCanvas().style.cursor = isPinHazardMode ? "crosshair" : "pointer";
            mapInst.setPaintProperty("roads-line", "line-width", 6.5);

            if (e.features && e.features[0] && !isPinHazardMode && roadPopupRef.current) {
              const props = e.features[0].properties;
              const statusColor =
                props.accessibility_status === "ACCESSIBLE"
                  ? "#10b981"
                  : props.accessibility_status === "RESTRICTED"
                  ? "#f59e0b"
                  : "#ef4444";

              roadPopupRef.current
                .setLngLat(e.lngLat)
                .setHTML(`
                  <div class="px-2.5 py-1.5 bg-slate-900/95 backdrop-blur-sm text-white rounded-lg shadow-xl text-xs border border-slate-700/80 select-none">
                    <div class="font-bold flex items-center gap-1.5 text-sky-300">
                      <span>🛣️</span>
                      <span class="font-mono text-white text-xs">${props.code || "Highway"}</span>
                      <span class="text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider" style="background:${statusColor}22; color:${statusColor}; border: 1px solid ${statusColor}55;">
                        ${props.accessibility_status || "ACCESSIBLE"}
                      </span>
                    </div>
                    <div class="text-[11px] font-medium text-slate-200 mt-0.5 max-w-[240px] truncate">${props.name || ""}</div>
                    <div class="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5">
                      <span>${props.state || "NER"}</span>
                      <span>•</span>
                      <span>${props.total_length_km ? `${props.total_length_km} km` : ""}</span>
                      <span>•</span>
                      <span>Avg ${props.average_speed_kmh || 50} km/h</span>
                    </div>
                  </div>
                `)
                .addTo(mapInst);
            }
          });

          mapInst.on("mouseleave", "roads-line", () => {
            mapInst.getCanvas().style.cursor = isPinHazardMode ? "crosshair" : "";
            mapInst.setPaintProperty("roads-line", "line-width", 4.0);
            if (roadPopupRef.current) {
              roadPopupRef.current.remove();
            }
          });

          mapInst.on("click", "roads-line", (e) => {
            if (isPinHazardMode) {
              setPinnedCoord({ lat: e.lngLat.lat, lng: e.lngLat.lng });
              setIsPinHazardMode(false);
              return;
            }

            if (e.features && e.features[0]) {
              const props = e.features[0].properties;
              setSelectedRoad(props);
              setSelectedIncident(null);
              if (onFeatureClick) onFeatureClick(props);
              if (onSelectCorridor && props.code) onSelectCorridor(props.code);
            }
          });
        } else {
          (mapInst.getSource("roads-src") as maplibregl.GeoJSONSource).setData({
            type: "FeatureCollection",
            features: roadFeatures,
          });
        }
      }

      // Render custom high-visibility HTML Truck & Alert markers
      renderTruckMarkers(mapInst, vehicleDataList);
      renderIncidentMarkers(mapInst, incidentDataList);
    } catch (e) {
      console.error("Map feature fetch error:", e);
      renderTruckMarkers(mapInst, DEFAULT_TRUCKS);
      renderIncidentMarkers(mapInst, DEFAULT_INCIDENTS);
    }
  };

  // Deterministic Candidate Route Visual Palette & Casing Offsets
  const CANDIDATE_PALETTE = [
    { color: "#2563eb", name: "Recommended Corridor", offset: 0 },
    { color: "#8b5cf6", name: "Detour Corridor 1", offset: 3.5 },
    { color: "#f59e0b", name: "Detour Corridor 2", offset: -3.5 },
    { color: "#10b981", name: "Detour Corridor 3", offset: 7 },
    { color: "#06b6d4", name: "Detour Corridor 4", offset: -7 },
  ];

  // Render Candidate & Alternative Routes with deterministic colors, casing, and line-offsets
  const activePrimary = highlightRouteGeojson || inMapPrimaryRoute;
  const activeAlt = alternateRouteGeojson || inMapAltRoute;

  useEffect(() => {
    if (!map.current || !isMapLoaded) return;
    const m = map.current;

    // Clean up previous route markers
    routeMarkersRef.current.forEach((marker) => marker.remove());
    routeMarkersRef.current = [];

    // Construct normalized list of routes to display
    interface NormalizedRoute {
      idx: number;
      name: string;
      geojson: any;
      coordinates: [number, number][];
      isActive: boolean;
      color: string;
      offset: number;
      distance_km?: number;
      eta_formatted?: string;
      risk_score?: number;
    }

    const routesToDisplay: NormalizedRoute[] = [];

    if (candidateRoutes && candidateRoutes.length > 0) {
      candidateRoutes.forEach((cr, i) => {
        const rawGeo = cr.waypoints || (cr.coordinates ? { type: "LineString", coordinates: cr.coordinates } : cr);
        const coords = rawGeo?.coordinates || (Array.isArray(rawGeo) ? rawGeo : []);
        if (coords.length >= 2) {
          const pal = CANDIDATE_PALETTE[i % CANDIDATE_PALETTE.length];
          routesToDisplay.push({
            idx: i,
            name: cr.name || `Route Candidate ${i + 1}`,
            geojson: rawGeo.type ? rawGeo : { type: "LineString", coordinates: coords },
            coordinates: coords,
            isActive: i === activeRouteIndex,
            color: cr.color || pal.color,
            offset: pal.offset,
            distance_km: cr.distance_km,
            eta_formatted: cr.eta_formatted,
            risk_score: cr.logistics_risk_score,
          });
        }
      });
    } else {
      // Fallback to activePrimary and activeAlt
      if (activePrimary && activePrimary.coordinates && activePrimary.coordinates.length >= 2) {
        routesToDisplay.push({
          idx: 0,
          name: activeRouteInfo?.route_name || "Recommended Highway Corridor",
          geojson: activePrimary,
          coordinates: activePrimary.coordinates,
          isActive: true,
          color: CANDIDATE_PALETTE[0].color,
          offset: 0,
          distance_km: activeRouteInfo?.distance_km,
          eta_formatted: activeRouteInfo?.estimated_duration_minutes
            ? `${Math.floor(activeRouteInfo.estimated_duration_minutes / 60)}h ${activeRouteInfo.estimated_duration_minutes % 60}m`
            : undefined,
          risk_score: activeRouteInfo?.risk_score,
        });
      }
      if (activeAlt && activeAlt.coordinates && activeAlt.coordinates.length >= 2) {
        routesToDisplay.push({
          idx: 1,
          name: "Alternate Valley Detour",
          geojson: activeAlt,
          coordinates: activeAlt.coordinates,
          isActive: false,
          color: CANDIDATE_PALETTE[1].color,
          offset: CANDIDATE_PALETTE[1].offset,
        });
      }
    }

    // Clean up any stale route layers above routesToDisplay count (up to 10)
    for (let i = routesToDisplay.length; i < 10; i++) {
      if (m.getLayer(`route-line-${i}`)) m.removeLayer(`route-line-${i}`);
      if (m.getLayer(`route-casing-${i}`)) m.removeLayer(`route-casing-${i}`);
      if (m.getSource(`route-src-${i}`)) m.removeSource(`route-src-${i}`);
    }

    // Clean legacy source IDs if any
    if (m.getLayer("primary-route-line")) m.removeLayer("primary-route-line");
    if (m.getLayer("primary-route-glow")) m.removeLayer("primary-route-glow");
    if (m.getSource("primary-route-src")) m.removeSource("primary-route-src");
    if (m.getLayer("alt-route-line")) m.removeLayer("alt-route-line");
    if (m.getSource("alt-route-src")) m.removeSource("alt-route-src");

    // Render each candidate route
    routesToDisplay.forEach((r) => {
      const srcId = `route-src-${r.idx}`;
      const casingId = `route-casing-${r.idx}`;
      const lineId = `route-line-${r.idx}`;

      const existingSource = m.getSource(srcId) as maplibregl.GeoJSONSource;
      if (!existingSource) {
        m.addSource(srcId, {
          type: "geojson",
          data: r.geojson,
        });

        // Layer 1: Layered Outer Casing (9px) - White on light map, dark on satellite/topo
        m.addLayer({
          id: casingId,
          type: "line",
          source: srcId,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": basemapStyle === "satellite" ? "#0f172a" : "#ffffff",
            "line-width": r.isActive ? 10.0 : 7.5,
            "line-offset": r.offset,
            "line-opacity": r.isActive ? 0.95 : 0.65,
          },
        });

        // Layer 2: Core Colored Route Line (5.5px inner line) with line-offset for shared corridors
        m.addLayer({
          id: lineId,
          type: "line",
          source: srcId,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": r.color,
            "line-width": r.isActive ? 5.5 : 3.8,
            "line-offset": r.offset,
            "line-opacity": r.isActive ? 1.0 : 0.75,
          },
        });

        // Interactive route selection and hover effects
        m.on("mouseenter", lineId, (e) => {
          m.getCanvas().style.cursor = "pointer";
          setHoveredRouteIdx(r.idx);
          m.setPaintProperty(lineId, "line-width", 7.0);

          if (!routeTooltipPopupRef.current) {
            routeTooltipPopupRef.current = new maplibregl.Popup({
              closeButton: false,
              closeOnClick: false,
              offset: 12,
              className: "route-hover-popup",
            });
          }

          routeTooltipPopupRef.current
            .setLngLat(e.lngLat)
            .setHTML(`
              <div class="px-3 py-2 bg-slate-900/95 backdrop-blur-sm text-white rounded-xl shadow-xl text-xs border border-slate-700/80 select-none">
                <div class="font-bold flex items-center gap-1.5" style="color: ${r.color}">
                  <span class="w-2.5 h-2.5 rounded-full" style="background: ${r.color}"></span>
                  <span class="text-white text-xs">${r.name}</span>
                  ${r.isActive ? '<span class="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">ACTIVE</span>' : ""}
                </div>
                ${
                  r.distance_km || r.eta_formatted || r.risk_score !== undefined
                    ? `<div class="text-[10px] text-slate-300 mt-1 flex items-center gap-2">
                        ${r.distance_km ? `<span>📏 ${r.distance_km} km</span>` : ""}
                        ${r.eta_formatted ? `<span>⏱️ ${r.eta_formatted}</span>` : ""}
                        ${r.risk_score !== undefined ? `<span class="${r.risk_score >= 50 ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}">Risk: ${r.risk_score}/100</span>` : ""}
                      </div>`
                    : ""
                }
                <div class="text-[9px] text-slate-400 mt-1">Click to select corridor</div>
              </div>
            `)
            .addTo(m);
        });

        m.on("mouseleave", lineId, () => {
          m.getCanvas().style.cursor = isPinHazardMode ? "crosshair" : "";
          setHoveredRouteIdx(null);
          m.setPaintProperty(lineId, "line-width", r.isActive ? 5.5 : 3.8);
          if (routeTooltipPopupRef.current) routeTooltipPopupRef.current.remove();
        });

        m.on("click", lineId, (e) => {
          e.originalEvent?.stopPropagation?.();
          if (onSelectRoute) {
            onSelectRoute(r.idx);
            addToast({
              title: `Route Selected: ${r.name}`,
              description: `Switched active corridor to ${r.name}.`,
              type: "info",
            });
          }
        });
      } else {
        existingSource.setData(r.geojson);
        m.setPaintProperty(casingId, "line-width", r.isActive ? 10.0 : 7.5);
        m.setPaintProperty(casingId, "line-offset", r.offset);
        m.setPaintProperty(casingId, "line-opacity", r.isActive ? 0.95 : 0.65);
        m.setPaintProperty(casingId, "line-color", basemapStyle === "satellite" ? "#0f172a" : "#ffffff");
        m.setPaintProperty(lineId, "line-width", r.isActive ? 5.5 : 3.8);
        m.setPaintProperty(lineId, "line-offset", r.offset);
        m.setPaintProperty(lineId, "line-opacity", r.isActive ? 1.0 : 0.75);
        m.setPaintProperty(lineId, "line-color", r.color);
      }
    });

    // Add Start (Origin) and End (Destination) Markers on Active Route
    const activeRoute = routesToDisplay.find((r) => r.isActive) || routesToDisplay[0];
    if (activeRoute && activeRoute.coordinates && activeRoute.coordinates.length >= 2) {
      const coords = activeRoute.coordinates;
      const startCoord = coords[0];
      const endCoord = coords[coords.length - 1];

      const startEl = document.createElement("div");
      startEl.className = "flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-xl border-2 border-white ring-2 ring-emerald-600/30 z-20 pointer-events-none select-none";
      startEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span><span>ORIGIN</span>`;
      const startMarker = new maplibregl.Marker({ element: startEl, anchor: "bottom" })
        .setLngLat(startCoord)
        .addTo(m);
      routeMarkersRef.current.push(startMarker);

      const endEl = document.createElement("div");
      endEl.className = "flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-bold shadow-xl border-2 border-white ring-2 ring-rose-600/30 z-20 pointer-events-none select-none";
      endEl.innerHTML = `<span>DESTINATION</span>`;
      const endMarker = new maplibregl.Marker({ element: endEl, anchor: "bottom" })
        .setLngLat(endCoord)
        .addTo(m);
      routeMarkersRef.current.push(endMarker);

      // Fit map bounds encompassing all candidate routes
      try {
        const bounds = new maplibregl.LngLatBounds();
        routesToDisplay.forEach((r) => {
          r.coordinates.forEach((coord) => {
            if (Array.isArray(coord) && coord.length >= 2 && !isNaN(coord[0]) && !isNaN(coord[1])) {
              bounds.extend(coord);
            }
          });
        });
        if (!bounds.isEmpty()) {
          m.fitBounds(bounds, { padding: 75, maxZoom: 13, duration: 1000 });
        }
      } catch (err) {
        console.warn("Could not fit route bounds:", err);
      }
    }

    // Blocked Road Segments Layer (Striking Red Alert Highlight)
    if (blockedRouteSegmentsGeojson && (blockedRouteSegmentsGeojson.coordinates?.length || blockedRouteSegmentsGeojson.features?.length)) {
      if (!m.getSource("blocked-segments-src")) {
        m.addSource("blocked-segments-src", {
          type: "geojson",
          data: blockedRouteSegmentsGeojson,
        });
        m.addLayer({
          id: "blocked-segments-glow",
          type: "line",
          source: "blocked-segments-src",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#ef4444",
            "line-width": 11,
            "line-opacity": 0.45,
          },
        });
        m.addLayer({
          id: "blocked-segments-line",
          type: "line",
          source: "blocked-segments-src",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#dc2626",
            "line-width": 5.5,
            "line-dasharray": [2, 1.2],
          },
        });
      } else {
        (m.getSource("blocked-segments-src") as maplibregl.GeoJSONSource).setData(blockedRouteSegmentsGeojson);
      }
    } else {
      if (m.getSource("blocked-segments-src")) {
        if (m.getLayer("blocked-segments-line")) m.removeLayer("blocked-segments-line");
        if (m.getLayer("blocked-segments-glow")) m.removeLayer("blocked-segments-glow");
        m.removeSource("blocked-segments-src");
      }
    }
  }, [
    candidateRoutes,
    activeRouteIndex,
    activePrimary,
    activeAlt,
    blockedRouteSegmentsGeojson,
    isMapLoaded,
    basemapStyle,
  ]);

  // Handle in-map route calculation output
  const handleInMapRoutesCalculated = (routes: any[]) => {
    if (routes && routes.length > 0) {
      const primary = routes[0];
      setActiveRouteInfo(primary);
      setInMapPrimaryRoute(primary.waypoints);

      if (routes.length > 1) {
        setInMapAltRoute(routes[1].waypoints);
      } else {
        setInMapAltRoute(null);
      }
    }
  };

  const handleClearInMapRoutes = () => {
    setInMapPrimaryRoute(null);
    setInMapAltRoute(null);
    setActiveRouteInfo(null);
    routeMarkersRef.current.forEach((m) => m.remove());
    routeMarkersRef.current = [];
  };

  // Toggle Layer Visibility
  const toggleLayerVisibility = (layerKey: keyof typeof layersState) => {
    if (!map.current) return;
    const nextVal = !layersState[layerKey];
    setLayersState((prev) => ({ ...prev, [layerKey]: nextVal }));

    const visibility = nextVal ? "visible" : "none";
    const layerMap: Record<string, string[]> = {
      roads: ["roads-casing", "roads-line", "roads-labels"],
      incidents: ["incidents-clusters", "incidents-cluster-count", "incidents-unclustered"],
      districts: ["districts-fill", "districts-line"],
    };

    const targetLayers = layerMap[layerKey] || [];
    targetLayers.forEach((lId) => {
      if (map.current?.getLayer(lId)) {
        map.current.setLayoutProperty(lId, "visibility", visibility);
      }
    });

    // Toggle HTML Truck Markers
    if (layerKey === "vehicles") {
      truckMarkersRef.current.forEach((m) => {
        m.getElement().style.display = nextVal ? "flex" : "none";
      });
    }

    // Toggle HTML Storage Markers
    if (layerKey === "storage") {
      storageMarkersRef.current.forEach((m) => {
        m.getElement().style.display = nextVal ? "flex" : "none";
      });
    }

    // Toggle HTML Incident & Alert Markers
    if (layerKey === "incidents") {
      incidentMarkersRef.current.forEach((m) => {
        m.getElement().style.display = nextVal ? "flex" : "none";
      });
    }
  };

  // Flying Actions
  const handleZoomIn = () => map.current?.zoomIn();
  const handleZoomOut = () => map.current?.zoomOut();
  const handleResetView = () => {
    map.current?.flyTo({ center: initialCenter, zoom: initialZoom, essential: true });
    addToast({ title: "Map View Reset", description: "Centered on North-Eastern Region.", type: "info" });
  };
  const handleLocateMe = () => {
    map.current?.flyTo({ center: [91.7362, 26.1445], zoom: 10, essential: true });
    addToast({ title: "Guwahati Regional HQ", description: "Central NER Command Logistics Hub.", type: "info" });
  };
  const handleFlyToState = (center: [number, number], zoom: number) => {
    map.current?.flyTo({ center, zoom, essential: true, duration: 1200 });
  };
  const handleFocusVehicle = (lat: number, lng: number, vehicle: any) => {
    map.current?.flyTo({ center: [lng, lat], zoom: 11, essential: true, duration: 1200 });
    setSelectedTruck(vehicle);
    setSelectedRoad(null);
    setSelectedIncident(null);
  };
  const handleFocusStation = (lat: number, lng: number, name: string) => {
    map.current?.flyTo({ center: [lng, lat], zoom: 10.5, essential: true, duration: 1200 });
  };

  return (
    <div
      className={cn(
        "relative w-full h-full min-h-[440px] overflow-hidden rounded-2xl border border-slate-200/90 shadow-sm bg-slate-50",
        isPinHazardMode && "cursor-crosshair",
        className
      )}
    >
      <div ref={mapContainer} className="w-full h-full" />

      {/* Pin Hazard Mode Top Warning Banner */}
      {isPinHazardMode && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-rose-600 text-white px-4 py-1.5 rounded-full shadow-floating font-semibold text-xs flex items-center gap-2 animate-bounce">
          <AlertTriangle className="w-4 h-4 text-amber-300" />
          <span>Click anywhere on the map to pin road hazard or landslide</span>
          <button
            onClick={() => setIsPinHazardMode(false)}
            className="ml-2 bg-rose-700 hover:bg-rose-800 p-0.5 rounded-full"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Modern Map Actions Command Bar (Top-Center) */}
      {showToolbox && (
        <MapToolbox
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          isPinHazardMode={isPinHazardMode}
          setIsPinHazardMode={setIsPinHazardMode}
          basemapStyle={basemapStyle}
          setBasemapStyle={setBasemapStyle}
          onFlyToState={handleFlyToState}
        />
      )}

      {/* Floating Modern Map Navigation Controls (Bottom-Right) */}
      <div className="absolute bottom-8 right-4 z-10 flex flex-col gap-1.5 bg-white/95 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-200/90 shadow-floating">
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-xl text-slate-700 hover:text-brand-600 hover:bg-slate-100 transition-colors"
          title="Zoom in"
          aria-label="Zoom in"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-xl text-slate-700 hover:text-brand-600 hover:bg-slate-100 transition-colors"
          title="Zoom out"
          aria-label="Zoom out"
        >
          <Minus className="w-4 h-4" />
        </button>
        <div className="h-px bg-slate-100 my-0.5" />
        <button
          onClick={handleLocateMe}
          className="p-2 rounded-xl text-slate-700 hover:text-brand-600 hover:bg-slate-100 transition-colors"
          title="Guwahati Central HQ"
          aria-label="Guwahati Central HQ"
        >
          <Navigation className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          className="p-2 rounded-xl text-slate-700 hover:text-brand-600 hover:bg-slate-100 transition-colors group"
          title="Recenter Map View (North East Region)"
          aria-label="Recenter Map View"
        >
          <LocateFixed className="w-4 h-4 text-slate-700 group-hover:text-brand-600 transition-colors" />
        </button>
      </div>

      {/* Floating Tactical Incident Filter Toolbar (Top-Left) */}
      {showFilterToolbar && (
        <div className="absolute top-4 left-4 z-10 hidden md:flex items-center gap-2 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-2xl border border-slate-200/90 shadow-floating text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 pr-2 border-r border-slate-200">
            <Filter className="w-3.5 h-3.5 text-brand-600" />
            <span className="text-[11px]">Incidents</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
              {filteredIncidentsCount}/{totalIncidentsCount}
            </span>
          </div>

          {/* Severity Filter Buttons */}
          <div className="flex items-center gap-1">
            {[
              { id: "ALL", label: "All" },
              { id: "CRITICAL", label: "Critical", dot: "bg-rose-500" },
              { id: "HIGH", label: "High", dot: "bg-orange-500" },
              { id: "MEDIUM", label: "Mod", dot: "bg-amber-400" },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setIncidentSeverityFilter(s.id);
                  if (map.current) {
                    setTimeout(() => {
                      if (map.current) renderIncidentMarkers(map.current);
                    }, 20);
                  }
                }}
                className={cn(
                  "px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1",
                  incidentSeverityFilter === s.id
                    ? "bg-brand-600 text-white shadow-xs"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80"
                )}
              >
                {s.dot && <span className={cn("w-1.5 h-1.5 rounded-full", s.dot)}></span>}
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          {/* Type Filter Select */}
          <div className="flex items-center gap-1 pl-1 border-l border-slate-200">
            <select
              value={incidentTypeFilter}
              onChange={(e) => {
                setIncidentTypeFilter(e.target.value);
                if (map.current) {
                  setTimeout(() => {
                    if (map.current) renderIncidentMarkers(map.current);
                  }, 20);
                }
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 text-[10px] font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Hazard Types</option>
              <option value="landslide">🏔️ Landslide / Slip</option>
              <option value="flood">🌊 Flash Flood</option>
              <option value="closure">🛑 Road Blockage</option>
              <option value="accident">💥 Traffic Accident</option>
              <option value="bridge">🚧 Bridge / Culvert</option>
              <option value="traffic">🚦 Heavy Congestion</option>
            </select>
          </div>

          {/* Reset Filters Shortcut if active */}
          {(incidentSeverityFilter !== "ALL" || incidentTypeFilter !== "ALL") && (
            <button
              onClick={() => {
                setIncidentSeverityFilter("ALL");
                setIncidentTypeFilter("ALL");
                if (map.current) {
                  setTimeout(() => {
                    if (map.current) renderIncidentMarkers(map.current);
                  }, 20);
                }
              }}
              className="text-[10px] font-bold text-rose-600 hover:text-rose-700 underline ml-1"
            >
              Reset
            </button>
          )}
        </div>
      )}

      {/* Floating GIS Layers Controller Toggle (Top-Right) */}
      {showLayerController && (
        <div className="absolute top-4 right-4 z-10 rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-sm shadow-floating text-xs text-slate-700 transition-all max-w-[210px] overflow-hidden">
          <div className="p-2.5 flex items-center justify-between font-semibold text-slate-900 bg-white">
            <span className="flex items-center gap-1.5 text-xs">
              <Layers className="w-3.5 h-3.5 text-brand-600" />
              GIS Layers
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  if (map.current) {
                    fetchMapFeatures(map.current);
                    renderStorageMarkers(map.current, REGIONAL_STORAGE_UNITS);
                  }
                }}
                title="Refresh features"
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
              <button
                onClick={() => setIsLayersPanelOpen(!isLayersPanelOpen)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ChevronRight className={cn("w-3 h-3 transition-transform", isLayersPanelOpen && "rotate-90")} />
              </button>
            </div>
          </div>

          {isLayersPanelOpen && (
            <div className="p-2.5 space-y-1.5 bg-white/90 border-t border-slate-100">
              <label className="flex items-center justify-between p-1 rounded-lg hover:bg-slate-50 cursor-pointer text-slate-700 text-[11px]">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-1 bg-emerald-500 rounded-full" />
                  Road Corridors
                </span>
                <input
                  type="checkbox"
                  checked={layersState.roads}
                  onChange={() => toggleLayerVisibility("roads")}
                  className="rounded text-brand-600 focus:ring-0 border-slate-300 w-3.5 h-3.5"
                />
              </label>

              <label className="flex items-center justify-between p-1 rounded-lg hover:bg-slate-50 cursor-pointer text-slate-700 text-[11px]">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Road Hazards
                </span>
                <input
                  type="checkbox"
                  checked={layersState.incidents}
                  onChange={() => toggleLayerVisibility("incidents")}
                  className="rounded text-brand-600 focus:ring-0 border-slate-300 w-3.5 h-3.5"
                />
              </label>

              <label className="flex items-center justify-between p-1 rounded-lg hover:bg-slate-50 cursor-pointer text-slate-700 text-[11px]">
                <span className="flex items-center gap-1.5 font-medium">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  Fleet Convoys
                </span>
                <input
                  type="checkbox"
                  checked={layersState.vehicles}
                  onChange={() => toggleLayerVisibility("vehicles")}
                  className="rounded text-brand-600 focus:ring-0 border-slate-300 w-3.5 h-3.5"
                />
              </label>

              <label className="flex items-center justify-between p-1 rounded-lg hover:bg-slate-50 cursor-pointer text-slate-700 text-[11px]">
                <span className="flex items-center gap-1.5 font-medium">
                  <Snowflake className="w-3.5 h-3.5 text-cyan-600" />
                  Storage & Cold Hubs
                </span>
                <input
                  type="checkbox"
                  checked={layersState.storage}
                  onChange={() => toggleLayerVisibility("storage")}
                  className="rounded text-brand-600 focus:ring-0 border-slate-300 w-3.5 h-3.5"
                />
              </label>

              <label className="flex items-center justify-between p-1 rounded-lg hover:bg-slate-50 cursor-pointer text-slate-700 text-[11px]">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-1 bg-sky-400 rounded-full" />
                  Districts
                </span>
                <input
                  type="checkbox"
                  checked={layersState.districts}
                  onChange={() => toggleLayerVisibility("districts")}
                  className="rounded text-brand-600 focus:ring-0 border-slate-300 w-3.5 h-3.5"
                />
              </label>
            </div>
          )}
        </div>
      )}

      {/* Interactive Tool Drawers */}
      <MapRoutePlannerDrawer
        isOpen={activeTool === "route"}
        onClose={() => setActiveTool(null)}
        onRoutesCalculated={handleInMapRoutesCalculated}
        onClearRoutes={handleClearInMapRoutes}
        activeRoute={activeRouteInfo}
      />

      <MapFleetTrackerDrawer
        isOpen={activeTool === "fleet"}
        onClose={() => setActiveTool(null)}
        onFocusVehicle={handleFocusVehicle}
      />

      <MapWeatherRadarOverlay
        isOpen={activeTool === "weather"}
        onClose={() => setActiveTool(null)}
        onFocusStation={handleFocusStation}
      />

      {/* In-Map Hazard Dropper Modal */}
      <MapHazardDropperModal
        coord={pinnedCoord}
        onClose={() => setPinnedCoord(null)}
        onIncidentCreated={() => {
          if (map.current) fetchMapFeatures(map.current);
        }}
      />

      {/* Interactive Full Truck Details Modal */}
      <TruckDetailsModal
        truck={selectedTruck}
        onClose={() => setSelectedTruck(null)}
      />

      {/* Interactive Storage & Cold Storage Details Modal */}
      <StorageDetailsModal
        storage={selectedStorage}
        onClose={() => setSelectedStorage(null)}
        onSelectAsRouteNode={(st, isOrigin) => {
          setActiveTool("route");
        }}
      />

      {/* Floating Active Route HUD (Bottom Center) */}
      {activeRouteInfo && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-brand-200 shadow-floating flex items-center gap-4 text-xs animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <Navigation className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 block">{activeRouteInfo.route_name}</span>
              <span className="text-[10px] text-slate-500">
                {activeRouteInfo.distance_km} km • {Math.floor(activeRouteInfo.estimated_duration_minutes / 60)}h{" "}
                {activeRouteInfo.estimated_duration_minutes % 60}m • Risk {activeRouteInfo.risk_score}/100
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                addToast({
                  title: "Consignment Dispatched",
                  description: `Dispatched along ${activeRouteInfo.route_name}. Real-time GPS tracked.`,
                  type: "success",
                });
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Send className="w-3 h-3" />
              <span>Dispatch</span>
            </button>
            <button
              onClick={handleClearInMapRoutes}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              title="Clear route"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Interactive Road Corridor Drawer (Bottom-Left) */}
      {selectedRoad && (
        <div className="absolute bottom-4 left-4 z-20 p-4 rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-sm shadow-floating text-xs max-w-sm w-full animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Highway Corridor</span>
                <h4 className="text-sm font-bold text-slate-900">
                  {selectedRoad.name || selectedRoad.code || "National Highway"}
                </h4>
              </div>
            </div>
            <button
              onClick={() => setSelectedRoad(null)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 space-y-2 text-slate-600">
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400">Corridor Code:</span>
              <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                {selectedRoad.code || "NH-6"}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400">Current Risk Index:</span>
              <span className="font-bold text-amber-600">
                {selectedRoad.current_risk_score ? `${selectedRoad.current_risk_score} / 100` : "Moderate Risk"}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400">Average Speed:</span>
              <span className="font-semibold text-slate-800">
                {selectedRoad.average_speed_kmh || 55} km/h
              </span>
            </div>

            <div className="pt-2 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setActiveTool("route");
                  setSelectedRoad(null);
                  addToast({
                    title: "Route Planner Opened",
                    description: `Selected ${selectedRoad.code} for routing inspection.`,
                    type: "info",
                  });
                }}
                className="py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold text-center transition-colors shadow-xs"
              >
                Plan Route Here
              </button>
              <button
                onClick={() => {
                  if (onSelectCorridor && selectedRoad.code) {
                    onSelectCorridor(selectedRoad.code);
                  }
                  addToast({
                    title: `Corridor Selected: ${selectedRoad.code}`,
                    description: "Updated corridor intelligence inspection sidebar.",
                    type: "info",
                  });
                }}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold text-center transition-colors"
              >
                Inspect Health
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Incident Detail Drawer */}
      {selectedIncident && (
        <div className="absolute bottom-4 right-4 z-20 p-4 rounded-2xl border border-rose-200 bg-white/95 backdrop-blur-sm shadow-floating text-xs max-w-md w-full animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] uppercase font-bold text-rose-600 font-mono">
                    {selectedIncident.incident_code || "HAZARD"}
                  </span>
                  {selectedIncident.freshness_state && (
                    <span className="px-1.5 py-0.2 text-[9px] rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      {selectedIncident.freshness_state}
                    </span>
                  )}
                  <span className="px-1.5 py-0.2 text-[9px] rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    {selectedIncident.severity || "HIGH"}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5 leading-snug">
                  {selectedIncident.title || selectedIncident.name || "Corridor Disruption"}
                </h4>
              </div>
            </div>
            <button
              onClick={() => setSelectedIncident(null)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 space-y-2 text-slate-600">
            {/* Trust and Source Attribution Card */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 font-medium">Source Attribution:</span>
                <div className="flex items-center gap-1 font-semibold text-slate-800">
                  {selectedIncident.source_url ? (
                    <a
                      href={selectedIncident.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1"
                    >
                      <span>{selectedIncident.source_name || "Official Feed"}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span>{selectedIncident.source_name || "Official Feeds"}</span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 font-medium">Trust Classification:</span>
                <span className="font-bold text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  {selectedIncident.source_trust_level || "LEVEL 1 - OFFICIAL"}
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 font-medium">Corroboration Confidence:</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: `${Math.round((selectedIncident.confidence_score ?? 0.85) * 100)}%` }}
                    />
                  </div>
                  <span className="font-bold text-slate-800 font-mono text-[10px]">
                    {Math.round((selectedIncident.confidence_score ?? 0.85) * 100)}%
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 font-medium">Corridor Affected:</span>
                <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {selectedIncident.affected_road_code || selectedIncident.road_id || "Highway Network"}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed py-1 bg-white p-2 rounded-xl border border-slate-100">
              {selectedIncident.description || "Active hazard requiring caution or route bypass."}
            </p>

            <div className="pt-2 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setActiveTool("route");
                  setSelectedIncident(null);
                  addToast({
                    title: "Bypass Calculator Activated",
                    description: "Planning alternative road route avoiding affected corridor.",
                    type: "info",
                  });
                }}
                className="py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold text-center transition-colors shadow-xs"
              >
                Plan Bypass Route
              </button>
              {selectedIncident.source_url ? (
                <a
                  href={selectedIncident.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1"
                >
                  <span>Verify Feed</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <button
                  onClick={() => {
                    addToast({
                      title: "Alert Broadcasted",
                      description: "Incident details sent to regional emergency dispatch.",
                      type: "success",
                    });
                  }}
                  className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold text-center transition-colors"
                >
                  Broadcast Alert
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Map Symbology Legend (Bottom-Left) */}
      {showLegend && (
        <div className="absolute bottom-6 left-6 z-10 max-w-[240px] bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200/90 shadow-floating text-xs overflow-hidden transition-all">
          <div
            onClick={() => setIsLegendOpen(!isLegendOpen)}
            className="px-3 py-2 flex items-center justify-between font-bold text-slate-800 cursor-pointer hover:bg-slate-50 select-none"
          >
            <span className="flex items-center gap-1.5 text-[11px]">
              <Layers className="w-3.5 h-3.5 text-brand-600" />
              <span>Map Symbology</span>
            </span>
            <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform duration-200", !isLegendOpen && "-rotate-90")} />
          </div>

          {isLegendOpen && (
            <div className="p-2.5 pt-1 space-y-2 text-[10px] border-t border-slate-100 text-slate-600">
              {/* Routes */}
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] block mb-1">
                  Route Corridors
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-1 rounded-full bg-[#2563eb]"></span>
                    <span className="truncate">Recommended</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-1 rounded-full bg-[#8b5cf6]"></span>
                    <span className="truncate">Detour 1</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-1 rounded-full bg-[#f59e0b]"></span>
                    <span className="truncate">Detour 2</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-1 rounded-full bg-[#dc2626] border border-dashed border-red-300"></span>
                    <span className="truncate">Blocked</span>
                  </div>
                </div>
              </div>

              {/* Incidents */}
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] block mb-1">
                  Alert Severity
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                    <span>Critical</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    <span>High Risk</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span>Moderate</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500 text-white font-mono font-bold text-[7px] flex items-center justify-center">
                      3+
                    </span>
                    <span>Cluster (Radial)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Small Floating Recenter Button on Map */}
      <button
        onClick={handleResetView}
        className="absolute bottom-6 right-6 z-10 flex items-center gap-1.5 px-3 py-2 bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200/90 shadow-floating text-slate-700 hover:text-brand-600 hover:bg-white hover:border-brand-300 font-semibold text-xs transition-all hover:scale-105 active:scale-95 group"
        title="Recenter Map View to North Eastern Region"
        aria-label="Recenter Map View"
      >
        <LocateFixed className="w-4 h-4 text-brand-600 group-hover:scale-110 transition-transform" />
        <span>Recenter</span>
      </button>
    </div>
  );
};
