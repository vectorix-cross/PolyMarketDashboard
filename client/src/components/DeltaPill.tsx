import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface DeltaPillProps {
  value?: number;
  className?: string;
}

export default function DeltaPill({ value, className }: DeltaPillProps) {
  if (value === undefined || value === null) {
    return (
      <Badge
        variant="secondary"
        className={cn(
          "font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground",
          className
        )}
        data-testid="delta-pill-unavailable"
      >
        N/A
      </Badge>
    );
  }

  const isPositive = value > 0;
  const isNegative = value < 0;

  return (
    <Badge
      variant="secondary"
      className={cn(
        "font-mono text-xs font-bold px-2 py-0.5 rounded-full",
        isPositive && "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30",
        isNegative && "bg-neon-magenta/20 text-neon-magenta border-neon-magenta/30",
        !isPositive && !isNegative && "bg-muted/50 text-muted-foreground",
        className
      )}
      data-testid={`delta-pill-${value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral'}`}
    >
      {isPositive ? "↑" : isNegative ? "↓" : "→"} {Math.abs(value).toFixed(1)}%
    </Badge>
  );
}
