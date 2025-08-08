// File: neural_ops/agents/bitcrunch/nft/nftCategoryAgent.ts
import { z } from 'zod';
import { ApiClient } from '../../base/ApiClient';

/**
 * Schema for NFT Collection Categories data structure
 */
const NFTCollectionCategoriesSchema = z.object({
  data: z.array(
    z.object({
      blockchain: z.string(),
      category: z.string(),
      chain_id: z.number(),
      description: z.string(),
      holders: z.number(),
      sales: z.number(),
      transactions: z.number(),
      volume: z.number(),
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
 * Input parameters for the NFT Collection Categories agent
 */
const NFTCollectionCategoriesInputSchema = z.object({
  blockchain: z.string().default('ethereum'),
  time_range: z.string().default('all'),
  sort_by: z.string().default('volume'),
  sort_order: z.string().default('desc'),
  offset: z.number().default(0),
  limit: z.number().default(30),
});

export type NFTCollectionCategories = z.infer<typeof NFTCollectionCategoriesSchema>;
export type NFTCollectionCategoriesInput = z.infer<
  typeof NFTCollectionCategoriesInputSchema
>;

/**
 * NFT Collection Categories Agent
 */
const nftCategoryAgent = ApiClient.define({
  id: 'nftCategoryAgent',
  description:
    'Fetches NFT collection categories with volume, sales, holders, and transaction data from UnleashNFTs API',
  output: NFTCollectionCategoriesSchema,

  async run(
    inputBlockchain: string = 'ethereum',
    inputTimeRange: string = 'all',
    inputSortBy: string = 'volume',
    inputSortOrder: string = 'desc',
    inputOffset: number = 0,
    inputLimit: number = 30
  ): Promise<NFTCollectionCategories> {
    const apiKey = process.env.UNLEASHNFTS_API_KEY;

    // ✅ Ensure API key is defined
    if (!apiKey) {
      throw new Error('❌ Missing UNLEASHNFTS_API_KEY environment variable');
    }

    // Parse input and apply default values
    const { blockchain, time_range, sort_by, sort_order, offset, limit } = 
      NFTCollectionCategoriesInputSchema.parse({
        blockchain: inputBlockchain,
        time_range: inputTimeRange,
        sort_by: inputSortBy,
        sort_order: inputSortOrder,
        offset: inputOffset,
        limit: inputLimit,
      });

    // Normalize inputs
    const normalizedBlockchain = blockchain.toLowerCase().trim();
    const normalizedTimeRange = time_range.toLowerCase().trim();
    const normalizedSortBy = sort_by.toLowerCase().trim();
    const normalizedSortOrder = sort_order.toLowerCase().trim();

    console.log(
      `🔍 Fetching NFT collection categories for ${normalizedBlockchain} (sorted by ${normalizedSortBy})...`
    );

    try {
      // Build query parameters
      const params = new URLSearchParams({
        blockchain: normalizedBlockchain,
        time_range: normalizedTimeRange,
        sort_by: normalizedSortBy,
        sort_order: normalizedSortOrder,
        offset: offset.toString(),
        limit: limit.toString(),
      });

      const endpoint = `https://api.unleashnfts.com/api/v2/nft/collection/categories?${params.toString()}`;

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
        `✅ Successfully fetched ${data.data.length} NFT collection categories for ${normalizedBlockchain}`
      );

      return {
        data: data.data,
        pagination: data.pagination,
        success: true,
        message: `NFT collection categories retrieved for ${normalizedBlockchain} sorted by ${normalizedSortBy}`,
      };
    } catch (error) {
      console.error('❌ Error fetching NFT collection categories:', error);

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

export default nftCategoryAgent;
