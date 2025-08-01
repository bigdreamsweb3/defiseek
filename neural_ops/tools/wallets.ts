// File: neural_ops/tools/wallets.ts

import { z } from 'zod';
import walletScoreAgent from '../agents/bitcrunch/wallet/walletScoreAgent';

const extractAddress = (input: string): string => {
  const matches = input.match(/0x[a-fA-F0-9]{40}/g);
  if (!matches || matches.length === 0) {
    throw new Error('No valid wallet address found.');
  }
  if (matches.length > 1) {
    console.warn('⚠️ Multiple wallet addresses found. Using the first one.');
  }
  return matches[0];
};

export const checkWalletScore = {
  description: `Retrieve a comprehensive overview of a wallet's activity and risk assessment, including key metrics such as interaction patterns,
classification, and risk scores.

The response provides wallet address, blockchain details, chain ID, and classification type, ensuring clarity on the wallet's status within the network.
For each wallet address, the response includes anomalous pattern score, associated token score, risk interaction score, and wallet age score, enabling insight into the wallet's behavior and reliability.
It also lists interaction scores related to smart contracts, staking, governance, and centralized platforms, providing a complete evaluation of the wallet's overall activity and potential risks.`,

  parameters: z.object({
    address: z.string().describe('The wallet address you want to analyze.'),
  }),

  execute: async ({ address }: { address: string }) => {
    try {
      const cleanAddress = extractAddress(address); // 👈 Ensure it's only one address
      const result = await walletScoreAgent.execute(cleanAddress);
      return {
        success: true,
        result,
        message: `Wallet score found for ${cleanAddress}`,
      };
    } catch (error) {
      console.error('❌ Error in checkWalletScore tool:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch wallet score',
      };
    }
  },
};
