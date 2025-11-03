import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Menu } from "lucide-react";
import { useState } from "react";
import AnimatedMarketIcon from "./AnimatedMarketIcon";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { path: "/", label: "Overview" },
  { path: "/markets", label: "Markets" },
  { path: "/movers", label: "Movers" },
  { path: "/liquidity", label: "Liquidity" },
  { path: "/watchlist", label: "Watchlist", comingSoon: true },
  { path: "/alerts", label: "Alerts", comingSoon: true }
];

export default function Navbar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/">
              <div className="flex items-center gap-3 hover-elevate rounded-md px-2 py-1 cursor-pointer" data-testid="logo-link">
                <AnimatedMarketIcon />
                <div>
                  <div className="font-bold text-sm leading-tight text-foreground">Polymarket</div>
                  <div className="text-[10px] text-muted-foreground leading-tight">Analytics Dashboard</div>
                </div>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map(item => (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "text-sm",
                      location === item.path && "bg-accent text-accent-foreground"
                    )}
                    data-testid={`nav-${item.label.toLowerCase()}`}
                  >
                    <span>{item.label}</span>
                    {item.comingSoon && (
                      <Badge 
                        variant="secondary" 
                        className="ml-1.5 text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20"
                      >
                        Soon
                      </Badge>
                    )}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            <Button variant="ghost" size="icon" data-testid="button-search">
              <Search className="w-4 h-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-2">
              {navItems.map(item => (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={location === item.path ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={`mobile-nav-${item.label.toLowerCase()}`}
                  >
                    <span>{item.label}</span>
                    {item.comingSoon && (
                      <Badge 
                        variant="secondary" 
                        className="ml-2 text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20"
                      >
                        Soon
                      </Badge>
                    )}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
