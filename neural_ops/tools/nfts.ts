import { z } from 'zod';
import marketAnalyticsAgent from '../agents/bitcrunch/nft/marketAnalyticsAgent';

export const analyzeNFTMarketInsights = {
  description: `Get aggregated values and trend data for various NFT market metrics, offering insights into the market's performance over time.

The response includes:

metrics: An array of metrics tracked, such as volume, number of sales, and holders.

blockdates: An array of dates or time periods corresponding to each metric's data points.

metric values: The aggregated values of each metric over the specified time blocks.

This information enables users to examine key trends and performance indicators in the NFT market, helping them analyze market activity, growth, and fluctuations across different metrics.`,

  parameters: z.object({
    blockchain: z
      .string()
      .describe('The blockchain to analyze (e.g., ethereum, polygon)'),
    time_range: z
      .string()
      .describe('Time range for market insights (e.g., 24h, 7d, 30d)'),
  }),

  execute: async ({
    blockchain,
    time_range,
  }: {
    blockchain: string;
    time_range: string;
  }) => {
    try {
      const nftMarketAnalysis = await marketAnalyticsAgent.run({
        blockchain,
        time_range,
      });

      return {
        success: true,
        data: nftMarketAnalysis,
        message: `Fetched NFT market analytics for ${blockchain} (${time_range})`,
      };
    } catch (error) {
      console.error('❌ Error in analyzeNFTMarketInsights tool:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch NFT market analytics',
      };
    }
  },
};
