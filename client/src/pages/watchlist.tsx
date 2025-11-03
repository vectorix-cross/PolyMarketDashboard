import { useMemo } from "react";
import MarketCard from "@/components/MarketCard";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWatchlist } from "@/hooks/use-watchlist";
import { useMarkets } from "@/hooks/use-markets";
import { useLocation } from "wouter";

export default function Watchlist() {
  const [, setLocation] = useLocation();
  const { watchlist, removeFromWatchlist: removeId, clearWatchlist } = useWatchlist();
  const { data: allMarkets, isLoading } = useMarkets({ active: true, closed: false, limit: 200 });
  const { toast } = useToast();

  const watchedMarkets = useMemo(() => {
    if (!allMarkets) return [];
    return allMarkets
      .filter(m => m.condition_id && watchlist.includes(m.condition_id) && m.outcomePrices?.[0])
      .map(m => ({
        id: m.condition_id!,
        title: m.question,
        probability: Math.round(parseFloat(m.outcomePrices![0]) * 100),
        delta24h: undefined,
        category: m.category || 'Other',
        liquidity: typeof m.liquidity === 'string' ? parseFloat(m.liquidity) : m.liquidity || 0
      }));
  }, [allMarkets, watchlist]);

  const removeFromWatchlist = (id: string) => {
    removeId(id);
    toast({
      title: "Removed from watchlist",
      description: "Market has been removed from your watchlist",
    });
  };

  const clearAll = () => {
    clearWatchlist();
    toast({
      title: "Watchlist cleared",
      description: "All markets have been removed from your watchlist",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-neon-violet mx-auto mb-4" />
          <p className="text-muted-foreground">Loading watchlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">My Watchlist</h1>
            <p className="text-sm md:text-base text-foreground/70">
              {watchedMarkets.length} {watchedMarkets.length === 1 ? 'market' : 'markets'} tracked
            </p>
          </div>
          {watchedMarkets.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={clearAll}
              data-testid="button-clear-watchlist"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {watchedMarkets.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-full bg-muted/50 mx-auto mb-4 flex items-center justify-center">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No markets in watchlist</h3>
            <p className="text-muted-foreground mb-6">
              Start tracking markets to monitor their performance
            </p>
            <Button variant="default" onClick={() => setLocation("/markets")} data-testid="button-browse-markets">
              Browse Markets
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {watchedMarkets.map(market => (
              <div key={market.id} className="relative group">
                <MarketCard 
                  {...market} 
                  onClick={() => console.log('View market:', market.id)}
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromWatchlist(market.id);
                  }}
                  data-testid={`button-remove-${market.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
