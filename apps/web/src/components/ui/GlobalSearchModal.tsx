"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Route,
  Truck,
  Package,
  AlertTriangle,
  MapPin,
  ArrowRight,
  Clock,
  Command,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useLanguageStore } from "@/lib/i18n";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface SearchResults {
  roads: Array<{ id: string; title: string; subtitle: string; href: string; status: string }>;
  vehicles: Array<{ id: string; title: string; subtitle: string; href: string; status: string }>;
  deliveries: Array<{ id: string; title: string; subtitle: string; href: string; status: string }>;
  incidents: Array<{ id: string; title: string; subtitle: string; href: string; status: string }>;
  districts: Array<{ id: string; title: string; subtitle: string; href: string; status: string }>;
}

export const GlobalSearchModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const { t } = useLanguageStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults(null);
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Execute search with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await apiClient<SearchResults>(`/dashboard/search?q=${encodeURIComponent(query)}`);
        setResults(data);
      } catch (err) {
        console.error("Global search error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  if (!isOpen) return null;

  const hasResults =
    results &&
    (results.roads.length > 0 ||
      results.vehicles.length > 0 ||
      results.deliveries.length > 0 ||
      results.incidents.length > 0 ||
      results.districts.length > 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 p-4 text-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl glass-modal border border-white/80 rounded-3xl shadow-glass-lg overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-white/60 gap-3 bg-white/40 backdrop-blur-md">
          <Search className="w-4 h-4 text-brand-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search arterial corridors, vehicles, consignments, incidents, or districts..."
            className="flex-1 bg-transparent border-0 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 text-sm font-medium"
          />
          {query && (
            <button onClick={() => setQuery("")} className="p-1 rounded-md text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 rounded-xl bg-white/80 hover:bg-white text-slate-500 hover:text-slate-700 text-xs font-bold border border-white/80 shadow-xs"
          >
            Esc
          </button>
        </div>

        {/* Search Results Area */}
        <div className="overflow-y-auto p-4 space-y-4">
          {isLoading && (
            <div className="py-8 text-center text-slate-400">
              <span className="text-xs font-medium">Searching North-Eastern logistics network...</span>
            </div>
          )}

          {!isLoading && query && !hasResults && (
            <div className="py-10 text-center text-slate-400 space-y-1">
              <p className="font-semibold text-slate-700 text-sm">No records matching &quot;{query}&quot;</p>
              <p className="text-xs text-slate-400">Try searching by Highway Code (NH-6), Registration, or City</p>
            </div>
          )}

          {!isLoading && !query && (
            <div className="py-6 text-center text-slate-500 space-y-2.5">
              <p className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Quick Navigation</p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  onClick={() => handleSelect("/map?road=NH-6")}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
                >
                  NH-6 Shillong-Silchar
                </button>
                <button
                  onClick={() => handleSelect("/map?road=NH-29")}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
                >
                  NH-29 Dimapur-Kohima
                </button>
                <button
                  onClick={() => handleSelect("/routes")}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
                >
                  Route Optimizer
                </button>
                <button
                  onClick={() => handleSelect("/reports")}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
                >
                  Field Logging PWA
                </button>
              </div>
            </div>
          )}

          {/* Group 1: Strategic Roads */}
          {results && results.roads.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Route className="w-3.5 h-3.5 text-brand-600" />
                Strategic Road Corridors ({results.roads.length})
              </div>
              <div className="space-y-1">
                {results.roads.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => handleSelect(r.href)}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 block text-xs">{r.title}</span>
                      <span className="text-[11px] text-slate-500">{r.subtitle}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Group 2: Fleet Vehicles */}
          {results && results.vehicles.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-brand-600" />
                Fleet Vehicles ({results.vehicles.length})
              </div>
              <div className="space-y-1">
                {results.vehicles.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => handleSelect(v.href)}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 block text-xs">{v.title}</span>
                      <span className="text-[11px] text-slate-500">{v.subtitle}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Group 3: Consignments & Deliveries */}
          {results && results.deliveries.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-emerald-600" />
                Essential Deliveries ({results.deliveries.length})
              </div>
              <div className="space-y-1">
                {results.deliveries.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => handleSelect(d.href)}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 block text-xs">{d.title}</span>
                      <span className="text-[11px] text-slate-500">{d.subtitle}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Group 4: Incidents */}
          {results && results.incidents.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Active Incidents ({results.incidents.length})
              </div>
              <div className="space-y-1">
                {results.incidents.map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => handleSelect(inc.href)}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 block text-xs">{inc.title}</span>
                      <span className="text-[11px] text-slate-500">{inc.subtitle}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
