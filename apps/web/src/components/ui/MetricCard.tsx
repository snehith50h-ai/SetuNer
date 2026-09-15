import React from "react";
import Link from "next/link";
import { LucideIcon, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  href?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  severity?: "normal" | "warning" | "critical" | "success";
  progress?: number; // 0 - 100 percentage for circular or bar visual
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  href,
  trend,
  severity = "normal",
  progress,
  className,
}) => {
  const CardContent = (
    <motion.div
      whileHover={{ y: -5, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "group relative p-5 rounded-2xl flex flex-col justify-between h-full",
        "glass-card glass-card-hover border-white/80 shadow-glass-sm hover:shadow-glass-hover",
        severity === "critical" && "border-rose-300/70 bg-rose-50/40 hover:bg-rose-50/60 shadow-[0_8px_25px_rgba(244,63,94,0.1)]",
        severity === "warning" && "border-amber-300/70 bg-amber-50/40 hover:bg-amber-50/60 shadow-[0_8px_25px_rgba(245,158,11,0.1)]",
        severity === "success" && "border-emerald-300/70 bg-emerald-50/40 hover:bg-emerald-50/60 shadow-[0_8px_25px_rgba(16,185,129,0.1)]",
        className
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <span className="text-[11px] font-semibold tracking-wide text-slate-500 capitalize">
            {title}
          </span>
          <div
            className={cn(
              "p-2.5 rounded-xl transition-all duration-[250ms] ease-[cubic-bezier(0.34,1.36,0.64,1)] group-hover:scale-110 border backdrop-blur-sm shadow-xs",
              severity === "critical" && "bg-rose-100/80 text-rose-600 border-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.25)]",
              severity === "warning" && "bg-amber-100/80 text-amber-600 border-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)]",
              severity === "success" && "bg-emerald-100/80 text-emerald-600 border-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.25)]",
              severity === "normal" && "bg-brand-50/80 text-brand-600 border-brand-200/70 shadow-[0_0_12px_rgba(59,130,246,0.2)]"
            )}
          >
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-2.5 flex items-baseline gap-2.5">
          <span className="text-3xl lg:text-[2rem] font-semibold tracking-tight text-slate-900 tabular-nums leading-none">
            {value}
          </span>
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[11px] font-bold tracking-wide",
                trend.isPositive
                  ? "text-emerald-600"
                  : "text-rose-600"
              )}
            >
              {trend.isPositive ? "▲" : "▼"} {trend.value}
            </span>
          )}
        </div>

        {subtitle && (
          <p className="mt-1.5 text-xs text-slate-500 font-normal leading-relaxed line-clamp-1">{subtitle}</p>
        )}

        {/* Optional Micro Progress Bar */}
        {progress !== undefined && (
          <div className="mt-3 w-full bg-slate-200/50 backdrop-blur-xs rounded-full h-1.5 overflow-hidden border border-white/40">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                severity === "critical" ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" : severity === "warning" ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" : "bg-brand-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]"
              )}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}
      </div>

      {href && (
        <div className="mt-4 pt-3 border-t border-white/60 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-brand-600 transition-colors">
          <span>View details</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      )}
    </motion.div>
  );

  if (href) {
    return <Link href={href} className="block h-full">{CardContent}</Link>;
  }

  return CardContent;
};

