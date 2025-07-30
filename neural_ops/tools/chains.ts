// neural_ops/tools.ts
import { z } from 'zod';
import { getSupportedChains, isChainSupported, findChain } from '../agents';

export const checkSupportedChains = {
  description:
    'Get a list of all supported blockchain networks. ONLY use this when users specifically ask "which blockchains do you support?" or similar questions.',
  parameters: z.object({}),
  execute: async () => {
    try {
      const chains = await getSupportedChains();
      return {
        success: true,
        supportedChains: chains,
        count: chains.length,
        message: `Found ${chains.length} supported blockchain networks`,
      };
    } catch (error) {
      console.error('❌ Error in checkSupportedChains tool:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch supported chains',
        supportedChains: [],
      };
    }
  },
};

export const validateChain = {
  description:
    'Check if a specific blockchain network is supported for analysis.',
  parameters: z.object({
    chainIdentifier: z
      .string()
      .describe('Chain name or slug, e.g., "polygon", "arbitrum"'),
  }),
  execute: async ({ chainIdentifier }: { chainIdentifier: string }) => {
    try {
      const isSupported = await isChainSupported(chainIdentifier);
      const chainInfo = await findChain(chainIdentifier);

      return {
        chainIdentifier,
        isSupported,
        chainInfo,
        message: isSupported
          ? `✅ ${chainInfo?.name || chainIdentifier} is supported`
          : `❌ ${chainIdentifier} is not supported`,
      };
    } catch (error) {
      console.error(`❌ Error validating chain ${chainIdentifier}:`, error);
      return {
        chainIdentifier,
        isSupported: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to validate chain',
        message: `❌ Could not validate ${chainIdentifier}`,
      };
    }
  },
};

// Export all tools as object
// export const tools = {
//   checkSupportedChains,
//   validateChain,
// };
