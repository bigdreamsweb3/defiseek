// File: neural_ops/tools/nft/marketMetadata.ts

import metadataAgent from '@/neural_ops/agents/bitcrunch/nft/marketplace/metadataAgent';
import { z } from 'zod';

interface MarketplaceEntry {
  blockchain?: string;
  chain_id?: number;
  contract_address?: string;
  external_url?: string;
  image_url?: string;
  marketplaces: string;
}

export const marketMetadataTool = {
  description: `Fetch metadata for available NFT marketplaces such as names, supported blockchains, logos, and external links.`,

  parameters: z.object({
    sort_order: z
      .enum(['asc', 'desc'])
      .default('desc')
      .describe('Sorting order of the marketplaces.'),
    offset: z.number().min(0).default(0).describe('Pagination offset.'),
    limit: z
      .number()
      .min(1)
      .max(100)
      .default(30)
      .describe('Number of marketplaces to return.'),
  }),

  execute: async ({
    sort_order = 'desc',
    offset = 0,
    limit = 30,
  }: {
    sort_order?: 'asc' | 'desc';
    offset?: number;
    limit?: number;
  }) => {
    try {
      const result = await metadataAgent.run(sort_order, offset, limit);

      if (!result.success || !result.data.length) {
        return {
          success: false,
          errorType: 'data_unavailable',
          message: `Could not retrieve NFT marketplace metadata.`,
          marketplaces: [],
        };
      }

      const entries = result.data as MarketplaceEntry[];

      console.log('Marketplace Metadata:', entries);

      return {
        success: true,
        count: entries.length,
        marketplaces: entries.map((entry) => ({
          name: entry.marketplaces,
          blockchain: entry.blockchain ?? null,
          chainId: entry.chain_id ?? null,
          contract: entry.contract_address ?? null,
          website: entry.external_url ?? null,
          logo: entry.image_url ?? null,
        })),
      };
    } catch (error) {
      console.error('❌ Error in marketMetadataTool:', error);
      return {
        success: false,
        errorType: 'tool_failure',
        message: 'Failed to fetch NFT marketplace metadata.',
        marketplaces: [],
      };
    }
  },
};

export type MarketMetadataOutput = Awaited<
  ReturnType<(typeof marketMetadataTool)['execute']>
>;
