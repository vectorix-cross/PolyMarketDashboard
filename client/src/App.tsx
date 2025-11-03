import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import RefreshIndicator from "@/components/RefreshIndicator";
import Overview from "@/pages/overview";
import Markets from "@/pages/markets";
import MarketDetail from "@/pages/market-detail";
import Movers from "@/pages/movers";
import Liquidity from "@/pages/liquidity";
import Watchlist from "@/pages/watchlist";
import Alerts from "@/pages/alerts";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Overview} />
      <Route path="/markets" component={Markets} />
      <Route path="/markets/:id" component={MarketDetail} />
      <Route path="/movers" component={Movers} />
      <Route path="/liquidity" component={Liquidity} />
      <Route path="/watchlist" component={Watchlist} />
      <Route path="/alerts" component={Alerts} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Apply dark mode class to html element
  if (typeof document !== 'undefined') {
    document.documentElement.classList.add('dark');
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Navbar />
          <Router />
          <footer className="border-t border-border mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center text-xs text-muted-foreground">
                <p className="text-left">
                  Built with ❤️ by{" "}
                  <a 
                    href="https://x.com/xtestnet" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-semibold"
                  >
                    xtestnet
                  </a>
                </p>
                <div className="flex justify-center">
                  <RefreshIndicator />
                </div>
                <p className="text-right">
                  Powered by{" "}
                  <a 
                    href="https://polymarket.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-semibold"
                  >
                    Polymarket
                  </a>
                </p>
              </div>
            </div>
          </footer>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
