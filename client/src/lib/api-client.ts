import { Market } from "@shared/api-schemas";

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export interface MarketsFilters {
  limit?: number;
  offset?: number;
  next_cursor?: string;
  active?: boolean;
  closed?: boolean;
  archived?: boolean;
  category?: string;
  search?: string;
  end_date_min?: string;
  end_date_max?: string;
  liquidity_min?: number;
  order?: 'ASC' | 'DESC';
  sort_by?: string;
  tag?: string;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    // Normalize endpoint to ensure leading slash
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Build URL - if baseUrl is empty, construct relative to current origin
    let url: URL;
    if (this.baseUrl) {
      url = new URL(normalizedEndpoint, this.baseUrl);
    } else {
      // For server-side or when baseUrl is empty, use relative path
      url = new URL(normalizedEndpoint, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000');
    }
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Markets
  async getMarkets(filters?: MarketsFilters): Promise<Market[]> {
    return this.request<Market[]>('/api/gamma/markets', filters);
  }

  async getMarket(id: string): Promise<Market> {
    return this.request<Market>(`/api/gamma/markets/${id}`);
  }

  // Health check
  async getHealth(): Promise<{ status: string; timestamp: string; cache: { size: number; ttl: number } }> {
    return this.request('/api/health');
  }
}

export const apiClient = new ApiClient();
