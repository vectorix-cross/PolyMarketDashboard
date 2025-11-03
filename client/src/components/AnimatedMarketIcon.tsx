import { useMarkets } from "@/hooks/use-markets";
import { useMemo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function AnimatedMarketIcon() {
  const { data: markets } = useMarkets({ active: true, closed: false, limit: 50 });

  // Calculate market metrics
  const marketMetrics = useMemo(() => {
    if (!markets || markets.length === 0) {
      return {
        trendDirection: 'neutral',
        avgProbability: 50,
        highConfidence: 0,
        status: 'Neutral'
      };
    }

    const completeMarkets = markets.filter(m => 
      m.active && 
      !m.closed && 
      m.outcomePrices?.[0] &&
      m.condition_id
    );

    if (completeMarkets.length === 0) {
      return {
        trendDirection: 'neutral',
        avgProbability: 50,
        highConfidence: 0,
        status: 'Neutral'
      };
    }

    // Calculate weighted average probability (markets trending toward "Yes" = uptrend)
    const totalWeightedProb = completeMarkets.reduce((sum, m) => {
      const prob = parseFloat(m.outcomePrices![0]) || 0;
      const volume = typeof m.volume === 'string' ? parseFloat(m.volume) : m.volume || 0;
      return sum + (prob * volume);
    }, 0);

    const totalVolume = completeMarkets.reduce((sum, m) => {
      const volume = typeof m.volume === 'string' ? parseFloat(m.volume) : m.volume || 0;
      return sum + volume;
    }, 0);

    // If no volume data, use simple average
    const avgProbability = totalVolume > 0 
      ? totalWeightedProb / totalVolume
      : completeMarkets.reduce((sum, m) => sum + (parseFloat(m.outcomePrices![0]) || 0), 0) / completeMarkets.length;

    // Count high confidence markets (>70% or <30%)
    const highConfidence = completeMarkets.filter(m => {
      const prob = parseFloat(m.outcomePrices![0]) * 100;
      return prob > 70 || prob < 30;
    }).length;

    // Determine trend direction and status
    let trendDirection: 'up' | 'down' | 'neutral';
    let status: string;

    if (avgProbability > 0.55) {
      trendDirection = 'up';
      status = 'Bullish';
    } else if (avgProbability < 0.45) {
      trendDirection = 'down';
      status = 'Bearish';
    } else {
      trendDirection = 'neutral';
      status = 'Neutral';
    }

    return {
      trendDirection,
      avgProbability: avgProbability * 100,
      highConfidence,
      status
    };
  }, [markets]);

  const { trendDirection, avgProbability, highConfidence, status } = marketMetrics;

  // Determine background gradient based on trend
  const backgroundClass = trendDirection === 'up'
    ? 'bg-gradient-to-br from-emerald-500 to-green-600' // Green for bullish
    : trendDirection === 'down'
    ? 'bg-gradient-to-br from-red-500 to-rose-600' // Red for bearish
    : 'bg-gradient-to-br from-violet-500 to-cyan-500'; // Purple-cyan for neutral

  // Determine arrow for status
  const statusArrow = trendDirection === 'up' ? '↑' : trendDirection === 'down' ? '↓' : '→';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`w-8 h-8 rounded-md flex items-center justify-center transition-all duration-700 ease-in-out ${backgroundClass}`}
            style={{
              transform: trendDirection === 'down' ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
          >
            <svg 
              className="w-5 h-5 text-white transition-all duration-700" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              {trendDirection === 'neutral' ? (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 12h14" 
                />
              ) : (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" 
                />
              )}
            </svg>
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-card/95 backdrop-blur-sm border border-card-border">
          <div className="text-sm space-y-1">
            <p className="font-semibold text-foreground">
              Markets: <span className="text-primary">{status} {statusArrow}</span>
            </p>
            <p className="text-muted-foreground">
              Avg Probability: <span className="font-medium text-foreground">{avgProbability.toFixed(1)}%</span>
            </p>
            <p className="text-muted-foreground">
              High Confidence: <span className="font-medium text-foreground">{highConfidence} markets</span>
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
