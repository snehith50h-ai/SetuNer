import React from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "md",
  className,
}) => {
  const norm = (status || "").toUpperCase();

  let colorClasses = "bg-white/60 text-slate-700 border-white/80 shadow-xs";
  let dotColor = "bg-slate-400";

  // Semantic mappings
  if (["ACCESSIBLE", "OPERATIONAL", "RESOLVED", "DELIVERED", "VERIFIED", "GREEN", "LOW"].includes(norm)) {
    colorClasses = "bg-emerald-50/70 text-emerald-800 border-emerald-300/60 shadow-[0_0_8px_rgba(16,185,129,0.15)]";
    dotColor = "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]";
  } else if (["RESTRICTED", "WARNING", "INVESTIGATING", "DELAYED", "AT_RISK", "MEDIUM", "YELLOW", "ORANGE", "HIGH"].includes(norm)) {
    colorClasses = "bg-amber-50/70 text-amber-800 border-amber-300/60 shadow-[0_0_8px_rgba(245,158,11,0.15)]";
    dotColor = "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]";
  } else if (["BLOCKED", "CRITICAL", "OPEN", "CANCELLED", "EMERGENCY", "SEVERE", "RED"].includes(norm)) {
    colorClasses = "bg-rose-50/70 text-rose-800 border-rose-300/60 shadow-[0_0_8px_rgba(244,63,94,0.15)]";
    dotColor = "bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]";
  } else if (["MOVING", "IN_TRANSIT", "INFO", "NORMAL"].includes(norm)) {
    colorClasses = "bg-blue-50/70 text-blue-800 border-blue-300/60 shadow-[0_0_8px_rgba(59,130,246,0.15)]";
    dotColor = "bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.5)]";
  }

  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-[10px]",
    md: "px-3 py-1 text-xs",
    lg: "px-4 py-1.5 text-sm font-semibold",
  }[size];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-bold uppercase tracking-wider backdrop-blur-sm transition-colors",
        colorClasses,
        sizeClasses,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotColor)} />
      {status.replace(/_/g, " ")}
    </span>
  );
};

