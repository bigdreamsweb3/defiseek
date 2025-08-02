// File: neural_ops/agents/bitcrunch/nft/market-insights/analyticsAgent.ts

import { z } from 'zod';
import { ApiClient } from '../../../base/ApiClient';

const NFTMarketAnalyticsSchema = z.object({
  data: z.array(
    z.object({
      block_dates: z.array(z.string()),
      blockchain: z.string(),
      chain_id: z.number(),
      price_ceiling_trend: z.array(z.number()),
      price_floor_trend: z.array(z.number()),
      volume_trend: z.array(z.number()),
      sales_count_trend: z.array(z.number()),
      holders_trend: z.array(z.number()),
      unique_buyers_trend: z.array(z.number()),
      unique_sellers_trend: z.array(z.number()),
      avg_price_trend: z.array(z.number()),
      market_cap_trend: z.array(z.number()),
    })
  ),
  success: z.boolean(),
  message: z.string().optional(),
});

const NFTMarketAnalyticsInputSchema = z.object({
  blockchain: z.string().default('ethereum'),
  time_range: z.string().default('24h'),
});

export type NFTMarketAnalytics = z.infer<typeof NFTMarketAnalyticsSchema>;
export type NFTMarketAnalyticsInput = z.infer<typeof NFTMarketAnalyticsInputSchema>;

const nftMarketAnalyticsAgent = ApiClient.define({
  id: 'nftMarketAnalyticsAgent',
  description: 'Fetches NFT market analytics and trend data from UnleashNFTs bitsCrunch API',
  output: NFTMarketAnalyticsSchema,

  async run(params?: Partial<NFTMarketAnalyticsInput>): Promise<NFTMarketAnalytics> {
    const apiKey = process.env.UNLEASHNFTS_API_KEY;

    const { blockchain, time_range } = NFTMarketAnalyticsInputSchema.parse(params ?? {});
    const normalizedBlockchain = blockchain.toLowerCase().trim();
    const normalizedTimeRange = time_range.toLowerCase().trim();

    console.log(`🔍 Fetching NFT market analytics for ${normalizedBlockchain} (${normalizedTimeRange})...`);

    try {
      // ✅ Construct URL manually instead of using URLSearchParams
      const url = `https://api.unleashnfts.com/api/v2/nft/market-insights/analytics?blockchain=${encodeURIComponent(
        normalizedBlockchain
      )}&time_range=${encodeURIComponent(normalizedTimeRange)}`;

      console.log(`🌐 Full API URL: ${url}`);

      const headers: HeadersInit = {
        accept: 'application/json',
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      };

      const response = await fetch(url, {
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
