import { useState, useMemo } from "react";
import GlassCard from "@/components/GlassCard";
import DeltaPill from "@/components/DeltaPill";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useMarkets } from "@/hooks/use-markets";

export default function Markets() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Fetch truly active markets (not closed or archived)
  const { data: markets, isLoading, isError, error } = useMarkets({ closed: false, archived: false, limit: 500 });

  // Extract unique categories from real data
  const categories = useMemo(() => {
    if (!markets) return ["All"];
    const cats = new Set(markets.map(m => m.category).filter((c): c is string => Boolean(c)));
    return ["All", ...Array.from(cats).sort()];
  }, [markets]);

  // Filter and transform markets data
  const filteredMarkets = useMemo(() => {
    if (!markets) return [];
    
    return markets
      .filter(m => 
        m.outcomePrices?.[0] !== undefined && 
        m.outcomePrices?.[0] !== null &&
        m.outcomePrices[0] !== "" &&
        parseFloat(m.outcomePrices[0]) >= 0 && // Allow any probability including extreme ones
        parseFloat(m.outcomePrices[0]) <= 1
      )
      .map(m => ({
        id: m.condition_id,
        title: m.question,
        probability: Math.round(parseFloat(m.outcomePrices![0]) * 100),
        delta24h: undefined, // Historical data not available
        category: m.category || 'Other',
        liquidity: typeof m.liquidity === 'string' ? parseFloat(m.liquidity) : m.liquidity || 0,
        volume24h: typeof m.volume === 'string' ? parseFloat(m.volume) : m.volume || 0
      }))
      .filter(market => {
        const matchesSearch = market.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || market.category === selectedCategory;
        return matchesSearch && matchesCategory;
      });
  }, [markets, searchQuery, selectedCategory]);

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
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Unable to fetch market data'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">Markets Explorer</h1>
          <p className="text-sm md:text-base text-foreground/70">Browse and filter all active prediction markets</p>
        </div>

        <GlassCard gradient="violet" className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/60 pointer-events-none z-10" />
              <Input
                placeholder="Search markets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border"
                data-testid="input-search-markets"
              />
            </div>
            <Button variant="secondary" data-testid="button-filters">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          <div className="flex gap-2 mt-4 flex-wrap">
            {categories.map(cat => (
              <Badge
                key={cat}
                variant={selectedCategory === cat ? "default" : "secondary"}
                className="cursor-pointer hover-elevate"
                onClick={() => setSelectedCategory(cat)}
                data-testid={`filter-category-${cat.toLowerCase()}`}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </GlassCard>

        <div className="space-y-4">
          {filteredMarkets.map(market => (
            <GlassCard 
              key={market.id} 
              gradient="cyan" 
              className="cursor-pointer hover:scale-[1.01] transition-transform"
              onClick={() => setLocation(`/markets/${market.id}`)}
              data-testid={`market-row-${market.id}`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-lg font-medium mb-2">{market.title}</h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="secondary" data-testid={`market-category-${market.category.toLowerCase()}`}>
                      {market.category}
                    </Badge>
                    <span className="text-xs md:text-sm text-foreground/60 font-mono">
                      Liquidity: ${(market.liquidity / 1000).toFixed(0)}K
                    </span>
                    <span className="text-xs md:text-sm text-foreground/60 font-mono">
                      24h Vol: ${(market.volume24h / 1000).toFixed(0)}K
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="text-right">
                    <div className="text-2xl md:text-3xl font-bold font-mono">{market.probability}%</div>
                    <div className="text-xs text-foreground/60">Probability</div>
                  </div>
                  <DeltaPill value={market.delta24h} />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {filteredMarkets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No markets found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
