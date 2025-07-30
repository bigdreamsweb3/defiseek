import { z } from 'zod';
import { ApiClient } from '../base/ApiClient';

/**
 * Schema for blockchain data from UnleashNFTs API
 */
const BlockchainSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

/**
 * Response schema for the supported chains
 */
const SupportedChainsSchema = z.array(BlockchainSchema);

export type Blockchain = z.infer<typeof BlockchainSchema>;
export type SupportedChains = z.infer<typeof SupportedChainsSchema>;

/**
 * bitsCrunch blockchain intelligence agent that fetches supported blockchains
 * 
 * This agent:
 * 1. Fetches a list of supported blockchains from UnleashNFTs API
 * 2. Returns them in a structured format for validation and use
 * 3. Can be used to check if a user's request is supported
 * 4. No fallback data - fails properly if API is unavailable
 */
const supportedChainsAgent = ApiClient.define({
  id: 'supportedChainsAgent',
  description: 'Fetches and returns supported blockchains from UnleashNFTs bitsCrunch API',
  output: SupportedChainsSchema,
  
  async run(): Promise<SupportedChains> {
    // Get API key from environment
    const apiKey = process.env.UNLEASH_API_KEY || 'b5ae8831a61c4a3b83dc6e4b3dc106f2';
    
    console.log('🔗 Fetching supported chains from UnleashNFTs bitsCrunch API...');
    
    const response = await fetch(
      'https://api.unleashnfts.com/api/v2/blockchains?offset=0&limit=30',
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'x-api-key': apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`UnleashNFTs API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract the blockchain data from the response
    const blockchains = data?.data || [];
    
    if (!Array.isArray(blockchains)) {
      throw new Error('Invalid response format from UnleashNFTs API');
    }
    
    console.log(`✅ Found ${blockchains.length} supported chains`);
    
    // Transform the data to match our schema
    const supportedChains: SupportedChains = blockchains.map((chain: any) => ({
      id: String(chain.id || chain.blockchain_id || ''),
      name: chain.name || chain.blockchain_name || 'Unknown',
      slug: chain.slug || chain.blockchain_slug || chain.name?.toLowerCase() || '',
    }));

    return supportedChains;
  }
});

export default supportedChainsAgent;
