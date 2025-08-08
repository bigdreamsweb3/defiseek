// File: neural_ops/agents/bitcrunch/nft/nftMetadataAgent.ts
import { z } from 'zod';
import { ApiClient } from '../../base/ApiClient';

/**
 * Schema for NFT Collection Metadata data structure
 */
const NFTCollectionMetadataSchema = z.object({
  data: z.array(
    z.object({
      banner_image_url: z.string().nullable(),
      blockchain: z.string(),
      brand: z.string(),
      category: z.string(),
      chain_id: z.number(),
      close_colours: z.string(),
      collection: z.string(),
      collection_id: z.number(),
      contract_address: z.string(),
      contract_created_date: z.string(),
      contract_type: z.string(),
      description: z.string(),
      discord_url: z.string().nullable(),
      distinct_nft_count: z.number(),
      end_token_id: z.string(),
      external_url: z.string().nullable(),
      image_url: z.string(),
      instagram_url: z.string().nullable(),
      marketplaces: z.string(),
      medium_url: z.string().nullable(),
      slug_name: z.string(),
      start_token_id: z.string(),
      telegram_url: z.string().nullable(),
      top_contracts: z.array(z.string()),
    })
  ),
  pagination: z.object({
    has_next: z.boolean(),
    limit: z.number(),
    offset: z.number(),
    total_items: z.number(),
  }),
  success: z.boolean(),
  message: z.string().optional(),
});

/**
 * Input parameters for the NFT Collection Metadata agent
 */
const NFTCollectionMetadataInputSchema = z.object({
  blockchain: z.string().default('ethereum'),
  time_range: z.string().default('all'),
  sort_order: z.string().default('desc'),
  offset: z.number().default(0),
  limit: z.number().default(30),
  contract_address: z.string().optional(),
});

export type NFTCollectionMetadata = z.infer<typeof NFTCollectionMetadataSchema>;
export type NFTCollectionMetadataInput = z.infer<
  typeof NFTCollectionMetadataInputSchema
>;

/**
 * NFT Collection Metadata Agent
 */
const nftMetadataAgent = ApiClient.define({
  id: 'nftMetadataAgent',
  description:
    'Fetches NFT collection metadata including banner, description, contract details, and marketplace information from UnleashNFTs API',
  output: NFTCollectionMetadataSchema,

  async run(
    inputBlockchain: string = 'ethereum',
    inputTimeRange: string = 'all',
    inputSortOrder: string = 'desc',
    inputOffset: number = 0,
    inputLimit: number = 30,
    inputContractAddress?: string
  ): Promise<NFTCollectionMetadata> {
    const apiKey = process.env.UNLEASHNFTS_API_KEY;

    // ✅ Ensure API key is defined
    if (!apiKey) {
      throw new Error('❌ Missing UNLEASHNFTS_API_KEY environment variable');
    }

    // Parse input and apply default values
    const { blockchain, time_range, sort_order, offset, limit, contract_address } = 
      NFTCollectionMetadataInputSchema.parse({
        blockchain: inputBlockchain,
        time_range: inputTimeRange,
        sort_order: inputSortOrder,
        offset: inputOffset,
        limit: inputLimit,
        contract_address: inputContractAddress,
      });

    // Normalize inputs
    const normalizedBlockchain = blockchain.toLowerCase().trim();
    const normalizedTimeRange = time_range.toLowerCase().trim();
    const normalizedSortOrder = sort_order.toLowerCase().trim();

    console.log(
      `🔍 Fetching NFT collection metadata for ${normalizedBlockchain}${contract_address ? ` (contract: ${contract_address})` : ''}...`
    );

    try {
      // Build query parameters
      const params = new URLSearchParams({
        blockchain: normalizedBlockchain,
        time_range: normalizedTimeRange,
        sort_order: normalizedSortOrder,
        offset: offset.toString(),
        limit: limit.toString(),
      });

      if (contract_address) {
        params.append('contract_address', contract_address);
      }

      const endpoint = `https://api.unleashnfts.com/api/v2/nft/collection/metadata?${params.toString()}`;

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
        throw new Error(
          `UnleashNFTs API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!data || !Array.isArray(data.data)) {
        throw new Error('Invalid response format from UnleashNFTs API');
      }

      console.log(
        `✅ Successfully fetched ${data.data.length} NFT collection metadata entries for ${normalizedBlockchain}`
      );

      return {
        data: data.data,
        pagination: data.pagination,
        success: true,
        message: `NFT collection metadata retrieved for ${normalizedBlockchain}${contract_address ? ` (contract: ${contract_address})` : ''}`,
      };
    } catch (error) {
      console.error('❌ Error fetching NFT collection metadata:', error);

      return {
        data: [],
        pagination: {
          has_next: false,
          limit: limit,
          offset: offset,
          total_items: 0,
        },
        success: false,
        message: `Network error: ${(error instanceof Error && error.message) || 'Unknown error'}`,
      };
    }
  },
});

export default nftMetadataAgent;
