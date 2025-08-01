import { z } from 'zod';
import { ApiClient } from '../../base/ApiClient';

// Schema for the single object inside data array:
const MarketAnalyticsItemSchema = z.object({
  block_dates: z.array(z.string()),
  blockchain: z.string(),
  chain_id: z.number(),

  // Trend arrays (example subset):
  price_ceiling_trend: z.array(z.number()).optional(),
  sales_trend: z.array(z.number()).optional(),
  transactions_trend: z.array(z.number()).optional(),
  transfers_trend: z.array(z.number()).optional(),
  volume_trend: z.array(z.number()).optional(),

  // Aggregated values:
  sales: z.number().optional(),
  sales_change: z.number().optional(),
  transactions: z.number().optional(),
  transactions_change: z.number().optional(),
  transfers: z.number().optional(),
  transfers_change: z.number().optional(),
  volume: z.number().optional(),
  volume_change: z.number().optional(),

  updated_at: z.string().optional(),
});

// Top-level response schema:
const MarketAnalyticsResponseSchema = z.object({
  data: z.array(MarketAnalyticsItemSchema),
  pagination: z
    .object({
      has_next: z.boolean(),
      limit: z.number(),
      offset: z.number(),
      total_items: z.number(),
    })
    .optional(),
});

export type MarketAnalyticsResponse = z.infer<
  typeof MarketAnalyticsResponseSchema
>;
export type MarketAnalyticsItem = z.infer<typeof MarketAnalyticsItemSchema>;

export const marketAnalyticsAgent = ApiClient.define({
  id: 'marketAnalyticsAgent',
  description:
    'Fetches NFT market analytics data from UnleashNFTs bitsCrunch API',
  output: MarketAnalyticsResponseSchema,

  async run(input: {
    blockchain?: string;
    time_range?: string;
  }): Promise<MarketAnalyticsResponse> {
    const apiKey = process.env.UNLEASHNFTS_API_KEY;

    const blockchain = input.blockchain ?? 'ethereum';
    const time_range = input.time_range ?? '24h';

    const params = new URLSearchParams({
      blockchain,
      time_range,
    });

    try {
      const url = `https://api.unleashnfts.com/api/v2/nft/market-insights/analytics?${params.toString()}`;

      const headers: HeadersInit = {
        accept: 'application/json',
        ...(apiKey ? { 'x-api-key': apiKey } : {}),
      };

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`API Error (${response.status}): ${body}`);
      }

      const data = await response.json();

      // Validate entire response shape
      const parsed = MarketAnalyticsResponseSchema.parse(data);

      if (parsed.data.length === 0) {
        throw new Error('API returned empty data array');
      }

      return parsed;
    } catch (err) {
      console.error('❌ Error fetching market analytics:', err);
      throw new Error('Failed to fetch NFT market analytics.');
    }
  },
});

export default marketAnalyticsAgent;
