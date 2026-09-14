import React from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { MatrixLoader } from "./MatrixLoader";

interface LoadingStateProps {
  message?: string;
  className?: string;
  variant?: 'scan' | 'twinkle' | 'orbit' | 'pulse';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading telemetry...",
  className,
  variant = 'scan',
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center",
        className
      )}
    >
      <MatrixLoader variant={variant} className="mb-4" />
      <p className="text-[11px] font-semibold tracking-wider uppercase text-slate-500">{message}</p>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full animate-pulse space-y-2.5">
      <div className="h-10 bg-slate-100 rounded-xl" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-white rounded-xl border border-slate-200/80" />
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-card space-y-3"
        >
          <div className="h-3 w-20 bg-slate-200 rounded" />
          <div className="h-7 w-28 bg-slate-100 rounded" />
          <div className="h-3 w-32 bg-slate-100 rounded" />
        </div>
      ))}
    </div>
  );
};

export const MapSkeleton: React.FC<{ message?: string; className?: string }> = ({
  message = "Loading Vector Map & Road Network...",
  className,
}) => {
  return (
    <div
      className={cn(
        "w-full h-full min-h-[420px] rounded-2xl bg-slate-100 border border-slate-200/80 flex flex-col items-center justify-center text-slate-400 relative overflow-hidden animate-pulse",
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-white/80 shadow-xs flex items-center justify-center mb-3 text-brand-600">
        <MapPin className="w-6 h-6 animate-bounce" />
      </div>
      <span className="text-xs font-semibold text-slate-600">{message}</span>
      <span className="text-[10px] text-slate-400 mt-1">Fetching GIS tiles & road vectors</span>
    </div>
  );
};
