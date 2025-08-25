// File: neural_ops/agents/bitcrunch/nft/market-insights/metadataAgent.ts
import { z } from 'zod';
import { ApiClient } from '../../../base/ApiClient';

/**
 * Schema for NFT Marketplace Metadata
 */
const MarketplaceMetadataSchema = z.object({
  blockchain: z.string().optional(),
  chain_id: z.number().optional(),
  contract_address: z.string().optional(),
  external_url: z.string().optional(),
  image_url: z.string().optional(),
  marketplaces: z.string(),
});

/**
 * Schema for response
 */
const MarketplaceMetadataResponseSchema = z.object({
  data: z.array(MarketplaceMetadataSchema),
  success: z.boolean(),
  message: z.string().optional(),
});

/**
 * Input parameters for the Metadata Agent
 */
const MarketplaceMetadataInputSchema = z.object({
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  offset: z.number().min(0).default(0),
  limit: z.number().min(1).max(100).default(30),
});

export type MarketplaceMetadata = z.infer<
  typeof MarketplaceMetadataResponseSchema
>;
export type MarketplaceMetadataInput = z.infer<
  typeof MarketplaceMetadataInputSchema
>;

/**
 * Marketplace Metadata Agent
 */
const metadataAgent = ApiClient.define({
  id: 'metadataAgent',
  description:
    'Fetches metadata for all available NFT marketplaces from UnleashNFTs API',
  output: MarketplaceMetadataResponseSchema,

  async run(
    sortOrder: 'asc' | 'desc' = 'desc',
    offset: number = 0,
    limit: number = 30
  ): Promise<MarketplaceMetadata> {
    const apiKey = process.env.UNLEASHNFTS_API_KEY;

    if (!apiKey) {
      throw new Error('❌ Missing UNLEASHNFTS_API_KEY environment variable');
    }

    // Parse and normalize inputs
    const {
      sort_order,
      offset: parsedOffset,
      limit: parsedLimit,
    } = MarketplaceMetadataInputSchema.parse({
      sort_order: sortOrder,
      offset,
      limit,
    });

    console.log(
      `🔍 Fetching marketplace metadata (sort=${sort_order}, offset=${parsedOffset}, limit=${parsedLimit})`
    );

    try {
      const endpoint = `https://api.unleashnfts.com/api/v2/nft/marketplace/metadata?sort_order=${sort_order}&offset=${parsedOffset}&limit=${parsedLimit}`;

      const headers: HeadersInit = {
        accept: 'application/json',
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      };

      const response = await fetch(endpoint, { method: 'GET', headers });

      if (!response.ok) {
        throw new Error(
          `UnleashNFTs API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Invalid response format from UnleashNFTs API');
      }

      console.log(`✅ Successfully fetched ${data.length} marketplace entries`);

      return {
        data,
        success: true,
        message: `Retrieved ${data.length} marketplaces`,
      };
    } catch (error) {
      console.error('❌ Error fetching NFT marketplace metadata:', error);

      return {
        data: [],
        success: false,
        message: `Network error: ${(error instanceof Error && error.message) || 'Unknown error'}`,
      };
    }
  },
});

export default metadataAgent;
