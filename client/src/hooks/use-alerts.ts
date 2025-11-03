import { useState, useEffect } from 'react';

const ALERTS_KEY = 'polymarket-radar-alerts';

export interface Alert {
  id: string;
  marketId: string;
  marketName: string;
  condition: "above" | "below";
  threshold: number;
  enabled: boolean;
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>(() => {
    try {
      const stored = localStorage.getItem(ALERTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
  }, [alerts]);

  const addAlert = (alert: Omit<Alert, 'id'>) => {
    const newAlert = {
      ...alert,
      id: Date.now().toString() + Math.random().toString(36).substring(7)
    };
    setAlerts(prev => [...prev, newAlert]);
    return newAlert;
  };

  const toggleAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
    ));
  };

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  return {
    alerts,
    addAlert,
    toggleAlert,
    deleteAlert,
    clearAlerts
  };
}
