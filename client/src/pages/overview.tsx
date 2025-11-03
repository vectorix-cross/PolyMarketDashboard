import KpiStat from "@/components/KpiStat";
import GlassCard from "@/components/GlassCard";
import Sparkline from "@/components/Sparkline";
import DonutChart from "@/components/DonutChart";
import MarketCard from "@/components/MarketCard";
import { Activity, DollarSign, TrendingUp, BarChart3, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useMarkets } from "@/hooks/use-markets";
import { useMemo } from "react";
import { queryClient } from "@/lib/queryClient";

export default function Overview() {
  const [, setLocation] = useLocation();
  // Fetch truly active markets (not closed or archived)
  const { data: markets, isLoading, isError, error } = useMarkets({ closed: false, archived: false, limit: 500 });

  // Calculate KPIs and analytics from real data
  const analytics = useMemo(() => {
    if (!markets || markets.length === 0) {
      return {
        activeMarkets: 0,
        totalVolume: 0,
        topMarketProb: 0,
        avgLiquidity: 0,
        categoryData: [],
        topMovers: [],
        trendData: [],
        avgProbability: 50,
        highConfidenceMarkets: 0,
        mostActiveCategory: 'N/A',
        closingSoon: [],
        highActivity: [],
        hasData: false
      };
    }

    // Filter to only markets with complete data (has valid outcome prices > 0)
    // Note: We already query for closed=false, so all markets should be active
    const completeMarkets = markets.filter(m => 
      m.outcomePrices?.[0] !== undefined && 
      m.outcomePrices?.[0] !== null &&
      m.outcomePrices[0] !== "" &&
      parseFloat(m.outcomePrices[0]) >= 0 && // Allow any probability including extreme ones
      parseFloat(m.outcomePrices[0]) <= 1
    );

    // If no complete markets, return empty analytics
    if (completeMarkets.length === 0) {
      return {
        activeMarkets: 0,
        totalVolume: 0,
        topMarketProb: 0,
        avgLiquidity: 0,
        categoryData: [],
        topMovers: [],
        trendData: [],
        avgProbability: 50,
        highConfidenceMarkets: 0,
        mostActiveCategory: 'N/A',
        closingSoon: [],
        highActivity: [],
        hasData: false
      };
    }

    // Active markets count (only those with complete data)
    const activeMarkets = completeMarkets.length;

    // Total volume (sum of all complete market volumes)
    const totalVolume = completeMarkets.reduce((sum, m) => {
      const volume = typeof m.volume === 'string' ? parseFloat(m.volume) : m.volume || 0;
      return sum + volume;
    }, 0);

    // Average liquidity (only for complete markets)
    const totalLiquidity = completeMarkets.reduce((sum, m) => {
      const liquidity = typeof m.liquidity === 'string' ? parseFloat(m.liquidity) : m.liquidity || 0;
      return sum + liquidity;
    }, 0);
    const avgLiquidity = activeMarkets > 0 ? totalLiquidity / activeMarkets : 0;

    // Find market with highest probability from complete markets
    const topMarket = completeMarkets.length > 0 
      ? completeMarkets.reduce((max, m) => {
          const prob = parseFloat(m.outcomePrices![0]) * 100;
          const maxProb = parseFloat(max.outcomePrices![0]) * 100;
          return prob > maxProb ? m : max;
        }, completeMarkets[0])
      : null;
    
    // Get the highest probability
    const topMarketProb = topMarket?.outcomePrices?.[0] ? parseFloat(topMarket.outcomePrices[0]) * 100 : 0;

    // Category distribution (only from complete markets)
    const categories = completeMarkets.reduce((acc, m) => {
      const cat = m.category || 'Other';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Show top 8 categories instead of 4 to include Crypto and other important categories
    const allCategoryEntries = Object.entries(categories).sort((a, b) => b[1] - a[1]);
    const categoryColors = [
      'hsl(262 90% 68%)',  // Violet - for top category
      'hsl(189 94% 63%)',  // Cyan
      'hsl(320 85% 68%)',  // Magenta
      'hsl(45 93% 68%)',   // Gold
      'hsl(142 76% 60%)',  // Green - for Crypto if present
      'hsl(20 90% 65%)',   // Orange
      'hsl(280 85% 65%)',  // Purple
      'hsl(200 80% 60%)'   // Blue
    ];
    
    const categoryData = allCategoryEntries
      .slice(0, 8)
      .map(([name, value], idx) => ({
        name,
        value,
        color: categoryColors[idx]
      }));

    // Top 3 markets by volume (from complete markets with valid IDs)
    const topMovers = [...completeMarkets]
      .filter(m => m.condition_id) // Only include markets with valid IDs
      .sort((a, b) => {
        const volA = typeof a.volume === 'string' ? parseFloat(a.volume) : a.volume || 0;
        const volB = typeof b.volume === 'string' ? parseFloat(b.volume) : b.volume || 0;
        return volB - volA;
      })
      .slice(0, 3)
      .map(m => {
        const liquidity = typeof m.liquidity === 'string' ? parseFloat(m.liquidity) : m.liquidity || 0;
        const probability = Math.round(parseFloat(m.outcomePrices![0]) * 100);
        // Note: delta24h undefined - Polymarket API doesn't provide historical price changes
        // in the /markets endpoint. This would require a separate historical data endpoint.
        return {
          id: m.condition_id!,
          title: m.question,
          probability,
          delta24h: undefined, // Historical data not available from current endpoint
          category: m.category || 'Other',
          liquidity
        };
      });

    // Trend data - use volume-weighted probabilities from market categories
    // Group complete markets by category and calculate average probability for each
    const categoryProbs = completeMarkets.reduce((acc, m) => {
      const cat = m.category || 'Other';
      const prob = parseFloat(m.outcomePrices![0]) * 100;
      const volume = typeof m.volume === 'string' ? parseFloat(m.volume) : m.volume || 0;
      
      if (!acc[cat]) {
        acc[cat] = { totalProb: 0, totalVolume: 0, count: 0 };
      }
      acc[cat].totalProb += prob * volume; // Volume-weighted probability
      acc[cat].totalVolume += volume;
      acc[cat].count += 1;
      return acc;
    }, {} as Record<string, { totalProb: number; totalVolume: number; count: number }>);

    // Create trend data showing volume-weighted average probabilities
    // Each point represents a different category's current weighted probability
    const trendData = Object.values(categoryProbs)
      .filter(cat => cat.totalVolume > 0)
      .map(cat => cat.totalProb / cat.totalVolume);

    // Calculate overall market sentiment metrics
    const avgProbability = completeMarkets.length > 0
      ? completeMarkets.reduce((sum, m) => sum + parseFloat(m.outcomePrices![0]) * 100, 0) / completeMarkets.length
      : 50;
    
    const highConfidenceMarkets = completeMarkets.filter(m => {
      const prob = parseFloat(m.outcomePrices![0]) * 100;
      return prob > 70 || prob < 30;
    }).length;

    const mostActiveCategory = Object.entries(categoryProbs)
      .sort((a, b) => b[1].totalVolume - a[1].totalVolume)[0]?.[0] || 'N/A';

    // Get markets closing soon (within 30 days for better coverage)
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const closingSoon = completeMarkets
      .filter(m => {
        if (!m.end_date_iso) return false;
        const endDate = new Date(m.end_date_iso);
        return endDate > now && endDate <= thirtyDaysFromNow;
      })
      .sort((a, b) => {
        const dateA = new Date(a.end_date_iso!).getTime();
        const dateB = new Date(b.end_date_iso!).getTime();
        return dateA - dateB;
      })
      .slice(0, 5)
      .map(m => ({
        id: m.condition_id!,
        title: m.question,
        probability: Math.round(parseFloat(m.outcomePrices![0]) * 100),
        category: m.category || 'Other',
        endDate: m.end_date_iso!
      }));

    // Get high activity markets (top 5 by volume, excluding top movers already shown)
    const topMoverIds = new Set(topMovers.map(tm => tm.id));
    const highActivity = [...completeMarkets]
      .filter(m => m.condition_id && !topMoverIds.has(m.condition_id))
      .sort((a, b) => {
        const volA = typeof a.volume === 'string' ? parseFloat(a.volume) : a.volume || 0;
        const volB = typeof b.volume === 'string' ? parseFloat(b.volume) : b.volume || 0;
        return volB - volA;
      })
      .slice(0, 5)
      .map(m => ({
        id: m.condition_id!,
        title: m.question,
        probability: Math.round(parseFloat(m.outcomePrices![0]) * 100),
        category: m.category || 'Other',
        volume: typeof m.volume === 'string' ? parseFloat(m.volume) : m.volume || 0
      }));

    return {
      activeMarkets,
      totalVolume,
      topMarketProb,
      avgLiquidity,
      categoryData,
      topMovers,
      trendData,
      avgProbability,
      highConfidenceMarkets,
      mostActiveCategory,
      closingSoon,
      highActivity,
      hasData: true
    };
  }, [markets]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-neon-violet mx-auto mb-4" />
          <p className="text-muted-foreground">Loading market data...</p>
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
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Unable to fetch market data from Polymarket API'}
          </p>
          <button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/markets'] })} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover-elevate"
            data-testid="button-retry"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show empty state if no complete market data is available
  if (!analytics.hasData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-bold mb-2">No Market Data Available</h2>
              <p className="text-muted-foreground">
                There are currently no active markets with complete pricing data.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KpiStat 
            label="Active Markets" 
            value={analytics.activeMarkets} 
            gradient="violet"
            icon={<Activity />}
          />
          <KpiStat 
            label="24h Volume" 
            value={`$${(analytics.totalVolume / 1_000_000).toFixed(1)}M`}
            gradient="cyan"
            icon={<DollarSign />}
            animate={false}
          />
          <KpiStat 
            label="Top Market Probability" 
            value={`${Math.round(analytics.topMarketProb)}%`}
            gradient="magenta"
            icon={<TrendingUp />}
            animate={false}
          />
          <KpiStat 
            label="Avg Liquidity" 
            value={`$${(analytics.avgLiquidity / 1000).toFixed(0)}K`}
            gradient="gold"
            icon={<BarChart3 />}
            animate={false}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <GlassCard gradient="cyan">
              <h2 className="text-lg font-semibold mb-2 text-foreground">Global Market Sentiment</h2>
              <p className="text-sm text-foreground/70 mb-4">Real-time market health and trading metrics</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-background/30 border border-border/40">
                  <div className="text-sm text-muted-foreground mb-1">Avg Probability</div>
                  <div className="text-2xl font-bold text-neon-cyan">{analytics.avgProbability.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {analytics.avgProbability > 55 ? '↑ Bullish' : analytics.avgProbability < 45 ? '↓ Bearish' : '→ Neutral'}
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-background/30 border border-border/40">
                  <div className="text-sm text-muted-foreground mb-1">High Confidence</div>
                  <div className="text-2xl font-bold text-neon-magenta">{analytics.highConfidenceMarkets}</div>
                  <div className="text-xs text-muted-foreground mt-1">markets &gt;70% or &lt;30%</div>
                </div>
                
                <div className="p-4 rounded-lg bg-background/30 border border-border/40 col-span-2 md:col-span-1">
                  <div className="text-sm text-muted-foreground mb-1">Top Category</div>
                  <div className="text-xl font-bold text-neon-gold truncate">{analytics.mostActiveCategory}</div>
                  <div className="text-xs text-muted-foreground mt-1">by trading volume</div>
                </div>
              </div>
              
              {analytics.trendData.length > 0 && (
                <div className="p-4 rounded-lg bg-gradient-to-br from-neon-cyan/10 to-neon-violet/10 border border-neon-cyan/30">
                  <div className="text-sm text-muted-foreground mb-2">Market Probability Distribution</div>
                  <Sparkline 
                    data={analytics.trendData} 
                    color="url(#sparklineGradient)" 
                    height={60} 
                  />
                  <svg width="0" height="0">
                    <defs>
                      <linearGradient id="sparklineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsl(189 94% 63%)" />
                        <stop offset="50%" stopColor="hsl(262 90% 68%)" />
                        <stop offset="100%" stopColor="hsl(320 85% 68%)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="text-xs text-muted-foreground mt-2">
                    Category-weighted probability trends across all active markets
                  </div>
                </div>
              )}
            </GlassCard>
          </div>
          <GlassCard gradient="violet">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Markets by Category</h2>
            {analytics.categoryData.length > 0 ? (
              <DonutChart data={analytics.categoryData} />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No category data available
              </div>
            )}
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <GlassCard gradient="magenta">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Closing Soon</h2>
            <p className="text-sm text-foreground/70 mb-4">Markets ending within the next 30 days</p>
            {analytics.closingSoon.length > 0 ? (
              <div className="space-y-3">
                {analytics.closingSoon.map(market => (
                  <div 
                    key={market.id} 
                    className="p-3 rounded-lg bg-background/30 border border-border/40 cursor-pointer hover-elevate transition-all"
                    onClick={() => setLocation(`/markets/${market.id}`)}
                    data-testid={`closing-soon-${market.id}`}
                  >
                    <div className="flex justify-between items-start gap-3 mb-2">
                      <h3 className="font-medium text-sm line-clamp-2 flex-1">{market.title}</h3>
                      <div className="text-lg font-bold text-neon-magenta whitespace-nowrap">{market.probability}%</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs px-2 py-1 rounded bg-background/50 text-muted-foreground">{market.category}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(market.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No markets closing soon
              </div>
            )}
          </GlassCard>

          <GlassCard gradient="gold">
            <h2 className="text-lg font-semibold mb-4 text-foreground">High Activity</h2>
            <p className="text-sm text-foreground/70 mb-4">Markets with highest trading volume</p>
            {analytics.highActivity.length > 0 ? (
              <div className="space-y-3">
                {analytics.highActivity.map(market => (
                  <div 
                    key={market.id} 
                    className="p-3 rounded-lg bg-background/30 border border-border/40 cursor-pointer hover-elevate transition-all"
                    onClick={() => setLocation(`/markets/${market.id}`)}
                    data-testid={`high-activity-${market.id}`}
                  >
                    <div className="flex justify-between items-start gap-3 mb-2">
                      <h3 className="font-medium text-sm line-clamp-2 flex-1">{market.title}</h3>
                      <div className="text-lg font-bold text-neon-gold whitespace-nowrap">{market.probability}%</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs px-2 py-1 rounded bg-background/50 text-muted-foreground">{market.category}</span>
                      <span className="text-xs text-neon-gold font-medium">
                        ${(market.volume / 1000).toFixed(1)}K
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No high activity markets
              </div>
            )}
          </GlassCard>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Top Markets by Volume</h2>
            <button 
              onClick={() => setLocation("/markets")}
              className="text-sm text-neon-violet hover:text-neon-cyan transition-colors"
              data-testid="link-view-all-movers"
            >
              View All →
            </button>
          </div>
          {analytics.topMovers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analytics.topMovers.map(market => (
                <MarketCard 
                  key={market.id} 
                  {...market} 
                  onClick={() => setLocation(`/markets/${market.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No markets available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
