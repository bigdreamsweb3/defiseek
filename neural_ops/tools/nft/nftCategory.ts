// File: neural_ops/tools/nft/nftCategory.ts

import { z } from 'zod';
import nftCategoryAgent from '@/neural_ops/agents/bitcrunch/nft/nftCategoryAgent';

interface NFTCategoryEntry {
  blockchain: string;
  category: string;
  chain_id: number;
  description: string;
  holders: number;
  sales: number;
  transactions: number;
  volume: number;
}

export const nftCategoryTool = {
  description: `Fetch NFT collection categories with detailed metrics including volume, sales, holders, and transaction data across different blockchain networks.`,

  parameters: z.object({
    blockchain: z
      .string()
      .describe(
        'The blockchain to query (e.g. ethereum, polygon, base, etc). Defaults to ethereum.'
      ),
    time_range: z
      .string()
      .optional()
      .describe(
        'Time range to query. Valid values: all, 24h, 7d, 30d, 90d. Defaults to all.'
      ),
    sort_by: z
      .string()
      .optional()
      .describe(
        'Field to sort by. Valid values: volume, sales, transactions, holders. Defaults to volume.'
      ),
    sort_order: z
      .string()
      .optional()
      .describe(
        'Sort order for results. Valid values: asc, desc. Defaults to desc.'
      ),
    limit: z
      .number()
      .optional()
      .describe(
        'Maximum number of categories to return. Defaults to 30, max 100.'
      ),
    offset: z
      .number()
      .optional()
      .describe(
        'Number of results to skip for pagination. Defaults to 0.'
      ),
  }),

  execute: async ({
    blockchain = 'ethereum',
    time_range = 'all',
    sort_by = 'volume',
    sort_order = 'desc',
    limit = 30,
    offset = 0,
  }: {
    blockchain?: string;
    time_range?: string;
    sort_by?: string;
    sort_order?: string;
    limit?: number;
    offset?: number;
  }) => {
    try {
      const result = await nftCategoryAgent.run(
        blockchain,
        time_range,
        sort_by,
        sort_order,
        offset,
        Math.min(limit, 100) // Cap at 100
      );

      if (!result.success || !result.data.length) {
        return {
          success: false,
          blockchain,
          errorType: 'data_unavailable',
          message: `Could not retrieve NFT collection categories for ${blockchain}.`,
        };
      }

      const categories = result.data.map((entry: NFTCategoryEntry) => ({
        category: entry.category,
        description: entry.description,
        blockchain: entry.blockchain,
        chainId: entry.chain_id,
        
        // Metrics
        holders: entry.holders,
        sales: entry.sales,
        transactions: entry.transactions,
        volume: entry.volume,
        
        // Formatted metrics for display
        formattedVolume: entry.volume.toLocaleString(undefined, {
          maximumFractionDigits: 2,
        }),
        formattedSales: entry.sales.toLocaleString(),
        formattedTransactions: entry.transactions.toLocaleString(),
        formattedHolders: entry.holders.toLocaleString(),
        
        // Calculated metrics
        avgVolumePerSale: entry.sales > 0 ? entry.volume / entry.sales : 0,
        avgTransactionsPerHolder: entry.holders > 0 ? entry.transactions / entry.holders : 0,
      }));

      // Calculate totals
      const totals = categories.reduce(
        (acc, cat) => ({
          totalVolume: acc.totalVolume + cat.volume,
          totalSales: acc.totalSales + cat.sales,
          totalTransactions: acc.totalTransactions + cat.transactions,
          totalHolders: acc.totalHolders + cat.holders,
        }),
        { totalVolume: 0, totalSales: 0, totalTransactions: 0, totalHolders: 0 }
      );

      console.log('NFT Collection Categories:', categories);

      return {
        success: true,
        blockchain,
        categories,
        pagination: {
          offset: result.pagination.offset,
          limit: result.pagination.limit,
          totalItems: result.pagination.total_items,
          hasNext: result.pagination.has_next,
        },
        metadata: {
          timeRange: time_range,
          sortBy: sort_by,
          sortOrder: sort_order,
          totalCategories: categories.length,
        },
        summary: {
          totalVolume: totals.totalVolume,
          totalSales: totals.totalSales,
          totalTransactions: totals.totalTransactions,
          totalHolders: totals.totalHolders,
          formattedTotalVolume: totals.totalVolume.toLocaleString(undefined, {
            maximumFractionDigits: 2,
          }),
          formattedTotalSales: totals.totalSales.toLocaleString(),
          formattedTotalTransactions: totals.totalTransactions.toLocaleString(),
          formattedTotalHolders: totals.totalHolders.toLocaleString(),
          topCategory: categories[0]?.category || 'N/A',
          topCategoryVolume: categories[0]?.volume || 0,
        },
      };
    } catch (error) {
      console.error('❌ Error in nftCategoryTool:', error);
      return {
        success: false,
        blockchain,
        errorType: 'tool_failure',
        message: 'Failed to fetch NFT collection categories.',
      };
    }
  },
};

export type NFTCategoryOutput = Awaited<
  ReturnType<(typeof nftCategoryTool)['execute']>
>;
