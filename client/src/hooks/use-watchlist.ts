import { useState, useEffect } from 'react';

const WATCHLIST_KEY = 'polymarket-radar-watchlist';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(WATCHLIST_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  const addToWatchlist = (marketId: string) => {
    setWatchlist(prev => prev.includes(marketId) ? prev : [...prev, marketId]);
  };

  const removeFromWatchlist = (marketId: string) => {
    setWatchlist(prev => prev.filter(id => id !== marketId));
  };

  const clearWatchlist = () => {
    setWatchlist([]);
  };

  const isWatched = (marketId: string) => watchlist.includes(marketId);

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    clearWatchlist,
    isWatched
  };
}
