import { useMemo } from "react";
import GlassCard from "@/components/GlassCard";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useMarkets } from "@/hooks/use-markets";

export default function Liquidity() {
  const { data: markets, isLoading, isError, error } = useMarkets({ active: true, limit: 200 });

  const liquidityData = useMemo(() => {
    if (!markets) return [];
    return markets
      .filter(m => m.active && m.outcomePrices?.[0] && parseFloat(m.outcomePrices[0]) > 0)
      .map(m => ({
        id: m.condition_id,
        name: m.question.length > 40 ? m.question.slice(0, 40) + '...' : m.question,
        liquidity: typeof m.liquidity === 'string' ? parseFloat(m.liquidity) : m.liquidity || 0,
        volume: typeof m.volume === 'string' ? parseFloat(m.volume) : m.volume || 0,
        probability: Math.round(parseFloat(m.outcomePrices![0]) * 100),
        category: m.category || 'Other'
      }))
      .filter(m => m.liquidity > 0 && m.volume > 0)
      .slice(0, 50);
  }, [markets]);

  const topLiquidityMarkets = useMemo(() => {
    return [...liquidityData]
      .sort((a, b) => b.liquidity - a.liquidity)
      .slice(0, 5);
  }, [liquidityData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-neon-violet mx-auto mb-4" />
          <p className="text-muted-foreground">Loading liquidity data...</p>
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
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">Liquidity Analysis</h1>
          <p className="text-sm md:text-base text-foreground/70">Visualize market depth and trading volume</p>
        </div>

        <GlassCard gradient="gold" className="mb-8">
          <h2 className="text-lg md:text-xl font-semibold mb-6 text-foreground">Liquidity vs Volume (Bubble size = Liquidity)</h2>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <defs>
                <linearGradient id="bubbleGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(189 94% 63%)" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="hsl(262 90% 68%)" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="bubbleGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(262 90% 68%)" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="hsl(320 85% 68%)" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="bubbleGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(320 85% 68%)" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="hsl(45 93% 68%)" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="bubbleGradient4" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(45 93% 68%)" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="hsl(142 76% 60%)" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                type="number" 
                dataKey="volume" 
                name="24h Volume ($K)" 
                label={{ value: '24h Volume ($K)', position: 'bottom', fill: 'hsl(var(--muted-foreground))' }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                type="number" 
                dataKey="probability" 
                name="Probability (%)" 
                label={{ value: 'Probability (%)', angle: -90, position: 'left', fill: 'hsl(var(--muted-foreground))' }}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-card/95 backdrop-blur-sm border border-card-border rounded-lg p-3">
                        <p className="font-semibold mb-1">{data.name}</p>
                        <p className="text-sm text-muted-foreground">Liquidity: ${data.liquidity.toLocaleString()}K</p>
                        <p className="text-sm text-muted-foreground">Volume: ${data.volume.toLocaleString()}K</p>
                        <p className="text-sm text-muted-foreground">Probability: {data.probability}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter name="Markets" data={liquidityData}>
                {liquidityData.map((entry, index) => {
                  const gradients = ['url(#bubbleGradient1)', 'url(#bubbleGradient2)', 'url(#bubbleGradient3)', 'url(#bubbleGradient4)'];
                  // Map probability to gradient: 0-24%→0, 25-49%→1, 50-74%→2, 75-100%→3
                  const gradientIndex = Math.min(3, Math.floor(entry.probability / 25));
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={gradients[gradientIndex]}
                      r={Math.min(20, Math.max(5, Math.sqrt(entry.liquidity / 1000) * 3))}
                    />
                  );
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </GlassCard>

        <div>
          <h2 className="text-2xl font-bold mb-6">Top Markets by Liquidity</h2>
          <div className="space-y-4">
            {topLiquidityMarkets.map((market, index) => (
              <GlassCard key={market.id} gradient="violet" data-testid={`liquidity-rank-${index + 1}`}>
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-neon-gold/20 text-neon-gold flex items-center justify-center font-bold text-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{market.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{market.category}</Badge>
                      <span className="text-sm text-muted-foreground font-mono">
                        {market.probability}% probability
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold font-mono text-neon-gold">
                      ${market.liquidity}K
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ${market.volume}K 24h vol
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
