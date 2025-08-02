// File: neural_ops/tools/nft/marketAnalytics.ts

import { z } from 'zod';
import nftMarketAnalyticsAgent from '@/neural_ops/agents/bitcrunch/nft/market-insights/analyticsAgent';

export const nftMarketAnalyticsTool = {
  description: `Fetch recent NFT market trends like volume, floor price, buyers/sellers, and sales count on a specific blockchain.`,

  parameters: z.object({
    blockchain: z
      .string()
      .describe(
        'The blockchain to analyze (e.g. polygon, ethereum, base, etc).'
      ),
    time_range: z
      .string()
      .optional()
      .describe(
        'Time range to query trends for. Valid values: 24h, 7d, 30d, 90d, or custom ranges. Defaults to 24h.'
      ),
  }),

  execute: async ({
    blockchain,
    time_range = '24h',
  }: {
    blockchain: string;
    time_range?: string;
  }) => {
    try {
      const result = await nftMarketAnalyticsAgent.run(blockchain, time_range);

      if (!result.success || !result.data.length) {
        return {
          success: false,
          blockchain,
          errorType: 'data_unavailable',
          message: `Could not retrieve NFT market insights for ${blockchain}.`,
        };
      }

      const entry = result.data[0];

      return {
        success: true,
        blockchain: entry.blockchain,
        insights: {
          timeRange: time_range,
          priceFloor: entry.price_floor_trend?.at(-1) ?? null,
          priceCeiling: entry.price_ceiling_trend?.at(-1) ?? null,
          volume: entry.volume_trend?.at(-1) ?? entry.volume ?? null,
          avgPrice: entry.avg_price_trend?.at(-1) ?? null,
          marketCap: entry.market_cap_trend?.at(-1) ?? null,
          sales: entry.sales_count_trend?.at(-1) ?? entry.sales ?? null,
          buyers: entry.unique_buyers_trend?.at(-1) ?? null,
          sellers: entry.unique_sellers_trend?.at(-1) ?? null,
          holders: entry.holders_trend?.at(-1) ?? null,
        },
      };
    } catch (error) {
      console.error('❌ Error in nftMarketAnalyticsTool:', error);
      return {
        success: false,
        blockchain,
        errorType: 'tool_failure',
        message: 'Failed to analyze NFT market trend data.',
      };
    }
  },
};

export type NFTMarketAnalyticsOutput = Awaited<
  ReturnType<(typeof nftMarketAnalyticsTool)['execute']>
>;
