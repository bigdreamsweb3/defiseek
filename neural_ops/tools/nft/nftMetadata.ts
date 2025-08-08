// File: neural_ops/tools/nft/nftMetadata.ts

import { z } from 'zod';
import nftMetadataAgent from '@/neural_ops/agents/bitcrunch/nft/nftMetadataAgent';

interface NFTCollectionMetadataEntry {
  banner_image_url: string | null;
  blockchain: string;
  brand: string;
  category: string;
  chain_id: number;
  close_colours: string;
  collection: string;
  collection_id: number;
  contract_address: string;
  contract_created_date: string;
  contract_type: string;
  description: string;
  discord_url: string | null;
  distinct_nft_count: number;
  end_token_id: string;
  external_url: string | null;
  image_url: string;
  instagram_url: string | null;
  marketplaces: string;
  medium_url: string | null;
  slug_name: string;
  start_token_id: string;
  telegram_url: string | null;
  top_contracts: string[];
}

export const nftMetadataTool = {
  description: `Fetch NFT collection metadata including banner images, descriptions, contract details, and marketplace information for specific collections or all collections on a blockchain.`,

  parameters: z.object({
    blockchain: z
      .string()
      .describe(
        'The blockchain to query (e.g. ethereum, polygon, base, etc). Defaults to ethereum.'
      ),
    contract_address: z
      .string()
      .optional()
      .describe(
        'Optional contract address to get metadata for a specific NFT collection.'
      ),
    time_range: z
      .string()
      .optional()
      .describe(
        'Time range to query. Valid values: all, 24h, 7d, 30d, 90d. Defaults to all.'
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
        'Maximum number of collections to return. Defaults to 30, max 100.'
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
    contract_address,
    time_range = 'all',
    sort_order = 'desc',
    limit = 30,
    offset = 0,
  }: {
    blockchain?: string;
    contract_address?: string;
    time_range?: string;
    sort_order?: string;
    limit?: number;
    offset?: number;
  }) => {
    try {
      const result = await nftMetadataAgent.run(
        blockchain,
        time_range,
        sort_order,
        offset,
        Math.min(limit, 100), // Cap at 100
        contract_address
      );

      if (!result.success || !result.data.length) {
        return {
          success: false,
          blockchain,
          contract_address: contract_address || null,
          errorType: 'data_unavailable',
          message: `Could not retrieve NFT collection metadata for ${blockchain}${contract_address ? ` (contract: ${contract_address})` : ''}.`,
        };
      }

      const collections = result.data.map((entry: NFTCollectionMetadataEntry) => {
        // Parse marketplaces JSON string
        let marketplaceInfo = null;
        try {
          marketplaceInfo = JSON.parse(entry.marketplaces);
        } catch (e) {
          // Keep as string if parsing fails
          marketplaceInfo = entry.marketplaces;
        }

        // Parse close colours array
        let closeColours = [];
        try {
          closeColours = JSON.parse(entry.close_colours);
        } catch (e) {
          closeColours = [];
        }

        return {
          collection: entry.collection,
          description: entry.description,
          category: entry.category,
          blockchain: entry.blockchain,
          contractAddress: entry.contract_address,
          contractType: entry.contract_type,
          collectionId: entry.collection_id,
          
          // Visual assets
          imageUrl: entry.image_url,
          bannerImageUrl: entry.banner_image_url,
          closeColours,
          
          // Collection details
          distinctNftCount: entry.distinct_nft_count,
          startTokenId: entry.start_token_id,
          endTokenId: entry.end_token_id,
          contractCreatedDate: entry.contract_created_date,
          
          // External links
          externalUrl: entry.external_url,
          discordUrl: entry.discord_url,
          instagramUrl: entry.instagram_url,
          mediumUrl: entry.medium_url,
          telegramUrl: entry.telegram_url,
          
          // Marketplace info
          slugName: entry.slug_name,
          marketplaceInfo,
          topContracts: entry.top_contracts,
          
          // Metadata
          brand: entry.brand,
          chainId: entry.chain_id,
        };
      });

      console.log('NFT Collection Metadata:', collections);

      return {
        success: true,
        blockchain,
        contract_address: contract_address || null,
        collections,
        pagination: {
          offset: result.pagination.offset,
          limit: result.pagination.limit,
          totalItems: result.pagination.total_items,
          hasNext: result.pagination.has_next,
        },
        metadata: {
          timeRange: time_range,
          sortOrder: sort_order,
          totalCollections: collections.length,
        },
      };
    } catch (error) {
      console.error('❌ Error in nftMetadataTool:', error);
      return {
        success: false,
        blockchain,
        contract_address: contract_address || null,
        errorType: 'tool_failure',
        message: 'Failed to fetch NFT collection metadata.',
      };
    }
  },
};

export type NFTMetadataOutput = Awaited<
  ReturnType<(typeof nftMetadataTool)['execute']>
>;
