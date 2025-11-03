import type { Express } from "express";
import { createServer, type Server } from "http";
import { apiLimiter } from "./lib/rate-limit";
import { cache, getCacheKey, getCached, setCached, getCacheTTL } from "./lib/cache";
import { marketsResponseSchema, marketSchema } from "@shared/api-schemas";

const GAMMA_API = process.env.GAMMA_API || 'https://gamma-api.polymarket.com';
const CLOB_API = process.env.CLOB_API || 'https://clob.polymarket.com';

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      cache: {
        size: cache.size,
        ttl: getCacheTTL()
      }
    });
  });

  // Gamma Markets API - Get all markets
  app.get('/api/gamma/markets', apiLimiter, async (req, res) => {
    try {
      const cacheKey = getCacheKey('/markets', req.query);
      const cached = getCached(cacheKey);
      
      if (cached) {
        res.set('X-Cache', 'HIT');
        res.set('Cache-Control', `public, max-age=${getCacheTTL()}`);
        return res.json(cached);
      }

      const url = new URL('/markets', GAMMA_API);
      Object.entries(req.query).forEach(([key, value]) => {
        if (value) url.searchParams.set(key, String(value));
      });

      const response = await fetch(url.toString(), {
        headers: { 'User-Agent': 'PolymarketRadarPro/1.0' }
      });

      if (!response.ok) {
        return res.status(response.status).json({ 
          error: 'Upstream API error',
          status: response.status 
        });
      }

      const data = await response.json();
      
      // Validate and transform with Zod
      const parsed = marketsResponseSchema.safeParse(data);
      if (!parsed.success) {
        console.warn('Schema validation warning:', parsed.error.issues);
        // Continue anyway but use raw data
        setCached(cacheKey, data);
        res.set('X-Cache', 'MISS');
        res.set('Cache-Control', `public, max-age=${getCacheTTL()}`);
        return res.json(data);
      }

      // Use the transformed data from Zod
      const transformedData = parsed.data;
      setCached(cacheKey, transformedData);
      res.set('X-Cache', 'MISS');
      res.set('Cache-Control', `public, max-age=${getCacheTTL()}`);
      res.json(transformedData);
    } catch (error) {
      console.error('Error fetching markets:', error);
      res.status(500).json({ error: 'Failed to fetch markets' });
    }
  });

  // Gamma Markets API - Get single market by condition ID
  // Note: Polymarket API doesn't support direct market lookup by condition_id,
  // so we query the markets list and filter for the specific market
  app.get('/api/gamma/markets/:id', apiLimiter, async (req, res) => {
    try {
      const { id } = req.params;
      const cacheKey = getCacheKey(`/markets/${id}`, {});
      const cached = getCached(cacheKey);
      
      if (cached) {
        res.set('X-Cache', 'HIT');
        res.set('Cache-Control', `public, max-age=${getCacheTTL()}`);
        return res.json(cached);
      }

      // Query the markets list endpoint with filters to find this specific market
      // Use closed=false and archived=false to get active markets
      const url = `${GAMMA_API}/markets?closed=false&archived=false&limit=500`;
      const response = await fetch(url, {
        headers: { 'User-Agent': 'PolymarketRadarPro/1.0' }
      });

      if (!response.ok) {
        return res.status(response.status).json({ 
          error: 'Failed to fetch markets',
          status: response.status 
        });
      }

      const data = await response.json();
      
      // Validate and transform the array
      const parsed = marketsResponseSchema.safeParse(data);
      if (!parsed.success) {
        console.warn('Schema validation warning:', parsed.error.issues);
        // Try to find the market in raw data
        const market = Array.isArray(data) 
          ? data.find((m: any) => m.conditionId === id || m.condition_id === id)
          : null;
        
        if (!market) {
          return res.status(404).json({ error: 'Market not found' });
        }
        
        setCached(cacheKey, market);
        res.set('X-Cache', 'MISS');
        res.set('Cache-Control', `public, max-age=${getCacheTTL()}`);
        return res.json(market);
      }

      // Find the market with matching condition_id in transformed data
      const market = parsed.data.find((m: any) => m.condition_id === id);
      
      if (!market) {
        return res.status(404).json({ error: 'Market not found' });
      }

      setCached(cacheKey, market);
      res.set('X-Cache', 'MISS');
      res.set('Cache-Control', `public, max-age=${getCacheTTL()}`);
      res.json(market);
    } catch (error) {
      console.error('Error fetching market:', error);
      res.status(500).json({ error: 'Failed to fetch market' });
    }
  });

  // Generic Gamma API proxy for any other endpoints
  app.get('/api/gamma/*', apiLimiter, async (req, res) => {
    try {
      const path = req.params[0];
      const cacheKey = getCacheKey(`/gamma/${path}`, req.query);
      const cached = getCached(cacheKey);
      
      if (cached) {
        res.set('X-Cache', 'HIT');
        res.set('Cache-Control', `public, max-age=${getCacheTTL()}`);
        return res.json(cached);
      }

      const url = new URL(`/${path}`, GAMMA_API);
      Object.entries(req.query).forEach(([key, value]) => {
        if (value) url.searchParams.set(key, String(value));
      });

      const response = await fetch(url.toString(), {
        headers: { 'User-Agent': 'PolymarketRadarPro/1.0' }
      });

      if (!response.ok) {
        return res.status(response.status).json({ 
          error: 'Upstream API error',
          status: response.status 
        });
      }

      const data = await response.json();
      setCached(cacheKey, data);
      res.set('X-Cache', 'MISS');
      res.set('Cache-Control', `public, max-age=${getCacheTTL()}`);
      res.json(data);
    } catch (error) {
      console.error('Error proxying gamma request:', error);
      res.status(500).json({ error: 'Failed to proxy request' });
    }
  });

  // CLOB API - Get trades
  app.get('/api/clob/trades', apiLimiter, async (req, res) => {
    try {
      const cacheKey = getCacheKey('/trades', req.query);
      const cached = getCached(cacheKey);
      
      if (cached) {
        res.set('X-Cache', 'HIT');
        res.set('Cache-Control', `public, max-age=${getCacheTTL()}`);
        return res.json(cached);
      }

      const url = new URL('/trades', CLOB_API);
      Object.entries(req.query).forEach(([key, value]) => {
        if (value) url.searchParams.set(key, String(value));
      });

      const response = await fetch(url.toString(), {
        headers: { 'User-Agent': 'PolymarketRadarPro/1.0' }
      });

      if (!response.ok) {
        return res.status(response.status).json({ 
          error: 'Upstream API error',
          status: response.status 
        });
      }

      const data = await response.json();
      setCached(cacheKey, data);
      res.set('X-Cache', 'MISS');
      res.set('Cache-Control', `public, max-age=${getCacheTTL()}`);
      res.json(data);
    } catch (error) {
      console.error('Error fetching trades:', error);
      res.status(500).json({ error: 'Failed to fetch trades' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
