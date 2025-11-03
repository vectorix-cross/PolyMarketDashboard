import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  gradient?: "violet" | "cyan" | "magenta" | "gold" | "none";
  onClick?: () => void;
}

export default function GlassCard({ children, className, gradient = "none", onClick }: GlassCardProps) {
  const gradientStyles = {
    violet: "before:absolute before:inset-0 before:rounded-lg before:p-[1px] before:bg-gradient-to-br before:from-neon-violet/40 before:to-transparent before:-z-10",
    cyan: "before:absolute before:inset-0 before:rounded-lg before:p-[1px] before:bg-gradient-to-br before:from-neon-cyan/40 before:to-transparent before:-z-10",
    magenta: "before:absolute before:inset-0 before:rounded-lg before:p-[1px] before:bg-gradient-to-br before:from-neon-magenta/40 before:to-transparent before:-z-10",
    gold: "before:absolute before:inset-0 before:rounded-lg before:p-[1px] before:bg-gradient-to-br before:from-neon-gold/40 before:to-transparent before:-z-10",
    none: ""
  };

  return (
    <div
      className={cn(
        "relative bg-card/70 backdrop-blur-xl border border-card-border rounded-lg p-6",
        "transition-all duration-300",
        gradient !== "none" && gradientStyles[gradient],
        onClick && "cursor-pointer hover-elevate",
        className
      )}
      onClick={onClick}
      data-testid="glass-card"
    >
      {children}
    </div>
  );
}
