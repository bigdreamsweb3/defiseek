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
  description: `Retrieve a comprehensive overview of a wallet's activity and risk assessment, including metrics like interaction patterns, classification, and risk scores.`,

  parameters: z.object({
    address: z.string().describe('The wallet address you want to analyze.'),
  }),

  execute: async ({ address }: { address: string }) => {
    try {
      const cleanAddress = extractAddress(address);
      const result = await walletScoreAgent.execute(cleanAddress);

      return {
        success: true,
        result,
        message: `Wallet score retrieved for ${cleanAddress}`,
      };
    } catch (error) {
      console.error('❌ Error in checkWalletScore tool:', error);
      return {
        success: false,
        walletAddress: address,
        error: `Failed to fetch wallet score for ${address}`,
        explanation: `I couldn't retrieve a verified score for this wallet. This does **not** mean the wallet is malicious — but it may be new, inactive, or private. I recommend checking its history manually on public explorers like Etherscan, BaseScan, or DeBank.`,
        flags: ['No score data available from safety systems'],
      };
    }
  },
};

// ✅ Add this after the export
export type CheckWalletScoreOutput = Awaited<ReturnType<typeof checkWalletScore['execute']>>;
  
