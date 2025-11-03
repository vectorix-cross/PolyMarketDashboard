import { useQuery } from '@tanstack/react-query';
import { apiClient, type MarketsFilters } from '@/lib/api-client';

export function useMarkets(filters?: MarketsFilters) {
  return useQuery({
    queryKey: ['/api/gamma/markets', filters],
    queryFn: () => apiClient.getMarkets(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 1000, // Refetch every 10 seconds for real-time updates
  });
}

export function useMarket(id: string | undefined) {
  return useQuery({
    queryKey: ['/api/gamma/markets', id],
    queryFn: () => {
      if (!id) throw new Error('Market ID is required');
      return apiClient.getMarket(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 1000, // Refetch every 10 seconds for real-time updates
  });
}
