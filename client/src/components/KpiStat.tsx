import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import GlassCard from "./GlassCard";

interface KpiStatProps {
  label: string;
  value: string | number;
  gradient?: "violet" | "cyan" | "magenta" | "gold" | "none";
  delta?: number;
  icon?: React.ReactNode;
  animate?: boolean;
}

export default function KpiStat({ label, value, gradient = "violet", delta, icon, animate = true }: KpiStatProps) {
  const [displayValue, setDisplayValue] = useState(animate ? 0 : value);

  useEffect(() => {
    if (!animate || typeof value !== "number") {
      setDisplayValue(value);
      return;
    }

    const duration = 800;
    const steps = 30;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, animate]);

  return (
    <GlassCard gradient={gradient} className="relative overflow-hidden" data-testid={`kpi-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      {icon && (
        <div className="absolute top-4 right-4 opacity-10 text-6xl">
          {icon}
        </div>
      )}
      <div className="relative z-10">
        <div className="text-xs uppercase tracking-wider text-foreground/60 mb-2">{label}</div>
        <div className="text-3xl md:text-4xl lg:text-5xl font-bold font-mono mb-2">
          {displayValue}
        </div>
        {delta !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-sm font-medium",
            delta > 0 ? "text-neon-cyan" : delta < 0 ? "text-neon-magenta" : "text-foreground/60"
          )}>
            {delta > 0 ? "↑" : delta < 0 ? "↓" : "→"}
            <span>{Math.abs(delta)}%</span>
            <span className="text-foreground/50 text-xs">24h</span>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
