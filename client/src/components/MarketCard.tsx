import { cn } from "@/lib/utils";
import GlassCard from "./GlassCard";
import DeltaPill from "./DeltaPill";
import { Badge } from "@/components/ui/badge";

interface MarketCardProps {
  id: string;
  title: string;
  probability: number;
  delta24h?: number;
  category: string;
  liquidity: number;
  onClick?: () => void;
}

export default function MarketCard({ id, title, probability, delta24h, category, liquidity, onClick }: MarketCardProps) {
  return (
    <GlassCard 
      gradient="violet" 
      className="transition-all duration-300 hover:scale-[1.02]" 
      onClick={onClick}
      data-testid={`market-card-${id}`}
    >
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-sm md:text-base font-medium line-clamp-2 mb-2">{title}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs" data-testid={`category-${category.toLowerCase()}`}>
              {category}
            </Badge>
            <span className="text-xs text-foreground/60 font-mono">
              ${(liquidity / 1000).toFixed(0)}K
            </span>
          </div>
        </div>
        
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl md:text-3xl font-bold font-mono">{probability}%</div>
            <div className="text-xs text-foreground/60">Probability</div>
          </div>
          <DeltaPill value={delta24h} />
        </div>
      </div>
    </GlassCard>
  );
}
