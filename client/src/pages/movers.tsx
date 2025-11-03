import { useMemo } from "react";
import GlassCard from "@/components/GlassCard";
import DeltaPill from "@/components/DeltaPill";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useMarkets } from "@/hooks/use-markets";

export default function Movers() {
  const { data: markets, isLoading, isError, error } = useMarkets({ active: true, limit: 200 });

  // Sort by volume (proxy for "hottest" markets since we don't have historical deltas)
  const topVolume = useMemo(() => {
    if (!markets) return [];
    return markets
      .filter(m => m.active && m.outcomePrices?.[0] && parseFloat(m.outcomePrices[0]) > 0)
      .map(m => ({
        id: m.condition_id,
        title: m.question,
        probability: Math.round(parseFloat(m.outcomePrices![0]) * 100),
        category: m.category || 'Other',
        volume: typeof m.volume === 'string' ? parseFloat(m.volume) : m.volume || 0
      }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 10);
  }, [markets]);

  const gainers = topVolume.slice(0, 5);
  const losers = topVolume.slice(5, 10);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-neon-violet mx-auto mb-4" />
          <p className="text-muted-foreground">Loading markets...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/20 mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Failed to Load Markets</h2>
          <p className="text-muted-foreground">{error instanceof Error ? error.message : 'Unable to fetch market data'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">Top Markets by Volume</h1>
          <p className="text-sm md:text-base text-foreground/70">Most actively traded prediction markets</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-6 text-neon-cyan">Top 1-5 by Volume</h2>
            <div className="space-y-4">
              {gainers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No markets available</p>
              ) : (
                gainers.map((market, index) => (
                  <GlassCard key={market.id} gradient="cyan" data-testid={`gainer-${market.id}`}>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neon-cyan/20 text-neon-cyan flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-medium mb-2">{market.title}</h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="secondary" className="text-xs">{market.category}</Badge>
                              <span className="text-xs text-muted-foreground font-mono">
                                ${(market.volume / 1000).toFixed(0)}K volume
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold font-mono">{market.probability}%</div>
                            <DeltaPill value={undefined} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                ))
              )}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6 text-neon-magenta">Top 6-10 by Volume</h2>
            <div className="space-y-4">
              {losers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No markets available</p>
              ) : (
                losers.map((market, index) => (
                  <GlassCard key={market.id} gradient="magenta" data-testid={`loser-${market.id}`}>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neon-magenta/20 text-neon-magenta flex items-center justify-center font-bold">
                        {index + 6}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-medium mb-2">{market.title}</h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="secondary" className="text-xs">{market.category}</Badge>
                              <span className="text-xs text-muted-foreground font-mono">
                                ${(market.volume / 1000).toFixed(0)}K volume
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold font-mono">{market.probability}%</div>
                            <DeltaPill value={undefined} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
