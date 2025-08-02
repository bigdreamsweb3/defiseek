// File: neural_ops/agents/bitcrunch/nft/market-insights/analyticsAgent.ts
import { z } from 'zod';
import { ApiClient } from '../../../base/ApiClient';

/**
 * Schema for NFT Market Analytics data structure
 */
const NFTMarketAnalyticsSchema = z.object({
  data: z.array(
    z.object({
      block_dates: z.array(z.string()),
      blockchain: z.string(),
      chain_id: z.number(),

      price_ceiling_trend: z.array(z.number()),
      price_floor_trend: z.array(z.number()),
      volume_trend: z.array(z.number()),
      sales_trend: z.array(z.number()).optional(),
      transactions_trend: z.array(z.number()).optional(),
      transfers_trend: z.array(z.number()).optional(),
      avg_price_trend: z.array(z.number()).optional(),

      unique_buyers_trend: z.array(z.number()).optional(),
      unique_sellers_trend: z.array(z.number()).optional(),
      sales_count_trend: z.array(z.number()).optional(),
      holders_trend: z.array(z.number()).optional(),
      market_cap_trend: z.array(z.number()).optional(),

      // Flat summary fields (optional for now)
      volume: z.number().optional(),
      sales: z.number().optional(),
      transactions: z.number().optional(),
      transfers: z.number().optional(),
      updated_at: z.string().optional(),
    })
  ),
  success: z.boolean(),
  message: z.string().optional(),
});


/**
 * Input parameters for the NFT Market Analytics agent
 */
const NFTMarketAnalyticsInputSchema = z.object({
  blockchain: z.string().default('ethereum'),
  time_range: z.string().default('24h'),
});

export type NFTMarketAnalytics = z.infer<typeof NFTMarketAnalyticsSchema>;
export type NFTMarketAnalyticsInput = z.infer<typeof NFTMarketAnalyticsInputSchema>;

/**
 * NFT Market Analytics Report Agent
 */
const nftMarketAnalyticsAgent = ApiClient.define({
  id: 'nftMarketAnalyticsAgent',
  description: 'Fetches NFT market analytics and trend data from UnleashNFTs bitsCrunch API',
  output: NFTMarketAnalyticsSchema,

  async run(params?: Partial<NFTMarketAnalyticsInput>): Promise<NFTMarketAnalytics> {
    const apiKey = process.env.UNLEASHNFTS_API_KEY;

    // ✅ Ensure API key is defined
    if (!apiKey) {
      throw new Error('❌ Missing UNLEASHNFTS_API_KEY environment variable');
    }

    // Parse input and apply default values
    const { blockchain, time_range } = NFTMarketAnalyticsInputSchema.parse(params ?? {});

    // Normalize inputs
    const normalizedBlockchain = blockchain.toLowerCase().trim();
    const normalizedTimeRange = time_range.toLowerCase().trim();

    console.log(`🔍 Fetching NFT market analytics for ${normalizedBlockchain} (${normalizedTimeRange})...`);

    try {
      const endpoint = `https://api.unleashnfts.com/api/v2/nft/market-insights/analytics?blockchain=${normalizedBlockchain}&time_range=${normalizedTimeRange}`;

      const headers: HeadersInit = {
        accept: 'application/json',
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      };

      const response = await fetch(endpoint, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`UnleashNFTs API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data || !Array.isArray(data.data)) {
        throw new Error('Invalid response format from UnleashNFTs API');
      }

      console.log(`✅ Successfully fetched NFT market analytics for ${normalizedBlockchain}`);

      return {
        data: data.data,
        success: true,
        message: `NFT market analytics retrieved for ${normalizedBlockchain} over ${normalizedTimeRange}`,
      };
    } catch (error) {
      console.error('❌ Error fetching NFT market analytics:', error);
      return {
        data: [],
        success: false,
        message: `Failed to fetch NFT market analytics: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      };
    }
  },
});

export default nftMarketAnalyticsAgent;
        
