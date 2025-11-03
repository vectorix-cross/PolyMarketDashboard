import { useParams, useLocation } from "wouter";
import { useMarket } from "@/hooks/use-markets";
import { useWatchlist } from "@/hooks/use-watchlist";
import { useToast } from "@/hooks/use-toast";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Star } from "lucide-react";

export default function MarketDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { data: market, isLoading, isError, error } = useMarket(id!);
  const { isWatched, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const { toast } = useToast();

  const watched = market ? isWatched(market.condition_id) : false;

  const toggleWatchlist = () => {
    if (!market) return;
    if (watched) {
      removeFromWatchlist(market.condition_id);
      toast({
        title: "Removed from watchlist",
        description: "Market has been removed from your watchlist",
      });
    } else {
      addToWatchlist(market.condition_id);
      toast({
        title: "Added to watchlist",
        description: "Market has been added to your watchlist",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-neon-violet mx-auto mb-4" />
          <p className="text-muted-foreground">Loading market...</p>
        </div>
      </div>
    );
  }

  if (isError || !market) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/20 mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Market Not Found</h2>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Unable to fetch market data'}
          </p>
          <Button onClick={() => setLocation("/markets")} data-testid="button-back-to-markets">
            Back to Markets
          </Button>
        </div>
      </div>
    );
  }

  const probability = market.outcomePrices?.[0] ? Math.round(parseFloat(market.outcomePrices[0]) * 100) : null;
  const liquidity = typeof market.liquidity === 'string' ? parseFloat(market.liquidity) : market.liquidity || 0;
  const volume = typeof market.volume === 'string' ? parseFloat(market.volume) : market.volume || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/markets")}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Markets
        </Button>

        <GlassCard gradient="cyan" className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">{market.question}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                {market.category && (
                  <Badge variant="secondary" data-testid="badge-category">
                    {market.category}
                  </Badge>
                )}
                {market.active && !market.closed && (
                  <Badge variant="default" data-testid="badge-status">Active</Badge>
                )}
                {market.closed && (
                  <Badge variant="secondary" data-testid="badge-status">Closed</Badge>
                )}
              </div>
            </div>
            <Button
              variant={watched ? "default" : "secondary"}
              onClick={toggleWatchlist}
              data-testid="button-watchlist"
            >
              <Star className={`w-4 h-4 mr-2 ${watched ? 'fill-current' : ''}`} />
              {watched ? 'Watching' : 'Watch'}
            </Button>
          </div>

          {probability !== null && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-lg bg-background/30">
                <div className="text-4xl md:text-5xl font-bold font-mono text-neon-cyan mb-2">
                  {probability}%
                </div>
                <div className="text-sm text-muted-foreground">Current Probability</div>
              </div>
              <div className="text-center p-6 rounded-lg bg-background/30">
                <div className="text-2xl md:text-3xl font-bold font-mono text-neon-violet mb-2">
                  ${(liquidity / 1000).toFixed(1)}K
                </div>
                <div className="text-sm text-muted-foreground">Liquidity</div>
              </div>
              <div className="text-center p-6 rounded-lg bg-background/30">
                <div className="text-2xl md:text-3xl font-bold font-mono text-neon-magenta mb-2">
                  ${(volume / 1000).toFixed(1)}K
                </div>
                <div className="text-sm text-muted-foreground">24h Volume</div>
              </div>
            </div>
          )}
        </GlassCard>

        <GlassCard gradient="violet" className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Outcomes</h2>
          {market.outcomes && market.outcomePrices && market.outcomes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {market.outcomes.map((outcome, index) => {
                const outcomeProb = market.outcomePrices?.[index] 
                  ? Math.round(parseFloat(market.outcomePrices[index]) * 100) 
                  : 0;
                const outcomeName = typeof outcome === 'string' ? outcome : (outcome.name || `Outcome ${index + 1}`);
                return (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-background/30 border border-border hover-elevate"
                    data-testid={`outcome-${index}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{outcomeName}</span>
                      <Badge variant="secondary" className="font-mono">
                        {outcomeProb}%
                      </Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-neon-cyan to-neon-violet h-2 rounded-full transition-all"
                        style={{ width: `${outcomeProb}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground">No outcome data available</p>
          )}
        </GlassCard>

        <GlassCard gradient="gold">
          <h2 className="text-xl font-semibold mb-4">Market Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Market ID</span>
              <span className="font-mono text-sm">{market.condition_id}</span>
            </div>
            {market.question_id && (
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Question ID</span>
                <span className="font-mono text-sm">{market.question_id}</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Status</span>
              <span>{market.closed ? 'Closed' : market.active ? 'Active' : 'Inactive'}</span>
            </div>
            {market.enable_order_book !== undefined && (
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Order Book</span>
                <span>{market.enable_order_book ? 'Enabled' : 'Disabled'}</span>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
