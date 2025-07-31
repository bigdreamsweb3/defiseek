// File: neural_ops/tools/wallets.ts

import { z } from 'zod';
import walletScoreAgent from '../agents/bitcrunch/wallet/walletScoreAgent';

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
      const walletScore = await walletScoreAgent.execute(address);

      return {
        success: true,
        walletScore,
        message: `Found wallet score for ${address}`,
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
