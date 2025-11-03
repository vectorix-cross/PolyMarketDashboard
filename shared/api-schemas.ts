import { z } from "zod";

// Market Outcome Schema
export const marketOutcomeSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  price: z.number().optional(),
});

// Market Schema - matching Polymarket Gamma API
// Note: API returns camelCase (conditionId) but we transform to snake_case for consistency
export const marketSchema = z.object({
  conditionId: z.string().optional(),
  condition_id: z.string().optional(),
  question: z.string(),
  description: z.string().optional(),
  endDateIso: z.string().optional(),
  end_date_iso: z.string().optional(),
  game_start_time: z.string().optional(),
  question_id: z.string().optional(),
  market_slug: z.string().optional(),
  min_incentive_size: z.number().optional(),
  max_incentive_spread: z.number().optional(),
  active: z.boolean().optional(),
  closed: z.boolean().optional(),
  archived: z.boolean().optional(),
  new: z.boolean().optional(),
  featured: z.boolean().optional(),
  submitted_by: z.string().optional(),
  umip_link: z.string().optional(),
  resolution_source: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  outcomes: z.union([z.array(marketOutcomeSchema), z.string()])
    .optional()
    .transform(val => {
      // Transform string outcomes to array by parsing JSON string
      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return val;
    }),
  outcomePrices: z.union([z.array(z.string()), z.string()])
    .optional()
    .transform(val => {
      // Transform string outcomePrices to array by parsing JSON string
      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return val;
    }),
  volume: z.union([z.string(), z.number()]).optional(),
  volume_num: z.number().optional(),
  liquidity: z.union([z.string(), z.number()]).optional(),
  liquidity_num: z.number().optional(),
  end_date: z.string().optional(),
  seconds_delay: z.number().optional(),
  icon: z.string().optional(),
  image: z.string().optional(),
  notifications_enabled: z.boolean().optional(),
  enable_order_book: z.boolean().optional(),
  order_price_minimum_tick_size: z.number().optional(),
  order_minimum_size_short: z.number().optional(),
  accepting_orders: z.boolean().optional(),
  accepting_order_timestamp: z.string().optional(),
  minimum_order_size: z.number().optional(),
  minimum_tick_size: z.number().optional(),
  maker_base_fee: z.number().optional(),
  taker_base_fee: z.number().optional(),
  events: z.array(z.any()).optional(), // Allow events array to pass through for category extraction
});

export const marketsResponseSchema = z.array(marketSchema).transform(markets => 
  markets.map(m => {
    // Extract category from multiple possible sources
    let category = m.category; // Try top-level first (historical markets)
    
    if (!category && (m as any).events?.[0]) {
      // For newer markets, try to infer category from event metadata
      const event = (m as any).events[0];
      category = event.category; // Try event category
      
      // If still no category, try to infer from question/title keywords
      if (!category) {
        const text = (m.question || event.title || '').toLowerCase();
        if (text.match(/trump|biden|president|election|senate|congress|white house|federal|supreme court/i)) {
          category = 'US-current-affairs';
        } else if (text.match(/crypto|bitcoin|ethereum|btc|eth|blockchain|defi|nft/i)) {
          category = 'Crypto';
        } else if (text.match(/nba|nfl|mlb|nhl|soccer|football|sports|championship|game|match/i)) {
          category = 'Sports';
        } else if (text.match(/fed|interest rate|recession|inflation|gdp|stock market|dow|nasdaq|economy/i)) {
          category = 'Business';
        } else if (text.match(/ukraine|russia|china|iran|war|nato|nuclear|military/i)) {
          category = 'Global Politics';
        } else if (text.match(/ai|tech|apple|google|tesla|spacex|tech company/i)) {
          category = 'Tech';
        } else if (text.match(/taylor swift|kardashian|celebrity|movie|music|entertainment/i)) {
          category = 'Pop-Culture';
        } else if (text.match(/covid|vaccine|pandemic|virus|health/i)) {
          category = 'Coronavirus';
        }
      }
    }
    
    return {
      ...m,
      // Map camelCase to snake_case for consistency with frontend
      condition_id: m.conditionId || m.condition_id,
      end_date_iso: (m as any).endDateIso || m.end_date_iso,
      category: category || 'Other'
    };
  })
);

// Type exports
export type Market = z.infer<typeof marketSchema>;
export type MarketOutcome = z.infer<typeof marketOutcomeSchema>;
