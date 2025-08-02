// File: neural_ops/tools/nft/marketAnalytics.ts

import { z } from 'zod';
import nftMarketAnalyticsAgent from '@/neural_ops/agents/bitcrunch/nft/market-insights/analyticsAgent';

interface NFTMarketEntry {
  block_dates: string[];
  blockchain: string;
  chain_id: number;

  price_ceiling_trend: number[];
  price_floor_trend: number[];
  volume_trend: number[];

  sales_trend?: number[];
  transactions_trend?: number[];
  transfers_trend?: number[];

  sales: number;
  transactions: number;
  transfers: number;
  volume: number;

  sales_change?: number;
  transactions_change?: number;
  transfers_change?: number;
  volume_change?: number;

  updated_at?: string;
}

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

      const entry = result.data[0] as NFTMarketEntry;

      console.log('Market Insights:', entry);

      return {
        success: true,
        blockchain: entry.blockchain,
        insights: {
          timeRange: time_range,

          // 🧠 Trends and chart data
          blockDates: entry.block_dates,
          priceCeilingTrend: entry.price_ceiling_trend,
          salesTrend: entry.sales_trend,
          transactionsTrend: entry.transactions_trend,
          transfersTrend: entry.transfers_trend,
          volumeTrend: entry.volume_trend,

          // 📈 Latest values
          sales: entry.sales_trend?.at(-1) ?? entry.sales ?? null,
          transactions:
            entry.transactions_trend?.at(-1) ?? entry.transactions ?? null,
          transfers: entry.transfers_trend?.at(-1) ?? entry.transfers ?? null,
          volume: entry.volume_trend?.at(-1) ?? entry.volume ?? null,
          priceCeiling: entry.price_ceiling_trend?.at(-1) ?? null,

          // 🔁 Raw totals
          totalSales: entry.sales ?? null,
          totalTransactions: entry.transactions ?? null,
          totalTransfers: entry.transfers ?? null,
          totalVolume: entry.volume ?? null,

          // 📊 % Changes
          salesChange: entry.sales_change ?? null,
          transactionsChange: entry.transactions_change ?? null,
          transfersChange: entry.transfers_change ?? null,
          volumeChange: entry.volume_change ?? null,

          // 🕒 Last update
          updatedAt: entry.updated_at,
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
