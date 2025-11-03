import { useState, useEffect } from "react";
import { useIsFetching } from "@tanstack/react-query";
import { RotateCw } from "lucide-react";

const REFRESH_INTERVAL = 10; // Must match the refetchInterval in useMarkets hook

export default function RefreshIndicator() {
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(REFRESH_INTERVAL);
  // Match all markets queries (with filters) using partial key matching
  const isFetching = useIsFetching({ 
    queryKey: ['/api/gamma/markets'],
    exact: false 
  });

  useEffect(() => {
    // Reset timer when a fetch starts
    if (isFetching) {
      setSecondsUntilRefresh(REFRESH_INTERVAL);
    }
  }, [isFetching]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsUntilRefresh((prev) => {
        if (prev <= 1) {
          return REFRESH_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground" data-testid="refresh-indicator">
      <RotateCw 
        className={`w-3 h-3 transition-transform ${isFetching ? 'animate-spin' : ''}`} 
      />
      <span>
        {isFetching ? (
          <span className="text-primary font-semibold">Updating...</span>
        ) : (
          <>
            Next update in <span className="font-mono text-primary">{secondsUntilRefresh}s</span>
          </>
        )}
      </span>
    </div>
  );
}
