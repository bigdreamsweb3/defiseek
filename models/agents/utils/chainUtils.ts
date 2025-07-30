import supportedChainsAgent, { type SupportedChains, type Blockchain } from '../bitcrunch/supportedChainsAgent';

/**
 * Cache for supported chains to avoid repeated API calls
 */
let chainsCache: SupportedChains | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get supported chains with caching
 */
export async function getSupportedChains(): Promise<SupportedChains> {
  const now = Date.now();
  
  // Return cached data if it's still fresh
  if (chainsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return chainsCache;
  }
  
  // Fetch fresh data
  try {
    chainsCache = await supportedChainsAgent.execute();
    cacheTimestamp = now;
    return chainsCache;
  } catch (error) {
    console.error('Failed to fetch supported chains:', error);
    
    // Return cached data if available, even if stale
    if (chainsCache) {
      console.log('Using stale cache data for supported chains');
      return chainsCache;
    }
    
    throw error;
  }
}

/**
 * Check if a chain is supported by slug or name
 * @param chainIdentifier - Chain slug (e.g., 'eth', 'polygon') or name (e.g., 'Ethereum')
 * @returns Promise<boolean> - Whether the chain is supported
 */
export async function isChainSupported(chainIdentifier: string): Promise<boolean> {
  try {
    const supportedChains = await getSupportedChains();
    const normalizedIdentifier = chainIdentifier.toLowerCase().trim();
    
    return supportedChains.some(chain => 
      chain.slug.toLowerCase() === normalizedIdentifier ||
      chain.name.toLowerCase() === normalizedIdentifier ||
      chain.id === chainIdentifier
    );
  } catch (error) {
    console.error('Error checking chain support:', error);
    return false;
  }
}

/**
 * Find a blockchain by slug, name, or ID
 * @param chainIdentifier - Chain slug, name, or ID
 * @returns Promise<Blockchain | null> - The blockchain object or null if not found
 */
export async function findChain(chainIdentifier: string): Promise<Blockchain | null> {
  try {
    const supportedChains = await getSupportedChains();
    const normalizedIdentifier = chainIdentifier.toLowerCase().trim();
    
    return supportedChains.find(chain => 
      chain.slug.toLowerCase() === normalizedIdentifier ||
      chain.name.toLowerCase() === normalizedIdentifier ||
      chain.id === chainIdentifier
    ) || null;
  } catch (error) {
    console.error('Error finding chain:', error);
    return null;
  }
}

/**
 * Get chain suggestions based on partial input
 * @param partialInput - Partial chain name or slug
 * @returns Promise<Blockchain[]> - Array of matching chains
 */
export async function getChainSuggestions(partialInput: string): Promise<Blockchain[]> {
  try {
    const supportedChains = await getSupportedChains();
    const normalizedInput = partialInput.toLowerCase().trim();
    
    if (!normalizedInput) return supportedChains.slice(0, 5); // Return first 5 if no input
    
    return supportedChains.filter(chain =>
      chain.name.toLowerCase().includes(normalizedInput) ||
      chain.slug.toLowerCase().includes(normalizedInput)
    );
  } catch (error) {
    console.error('Error getting chain suggestions:', error);
    return [];
  }
}

/**
 * Validate and normalize a chain identifier
 * @param chainIdentifier - Chain slug, name, or ID
 * @returns Promise<string | null> - Normalized chain slug or null if not supported
 */
export async function normalizeChainIdentifier(chainIdentifier: string): Promise<string | null> {
  const chain = await findChain(chainIdentifier);
  return chain ? chain.slug : null;
}

/**
 * Clear the chains cache (useful for testing or forced refresh)
 */
export function clearChainsCache(): void {
  chainsCache = null;
  cacheTimestamp = 0;
}
