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
      const data = await walletScoreAgent.execute(cleanAddress); // ✅ FIXED VARIABLE NAME

      const riskLevel =
        data.wallet_score >= 80
          ? 'Low'
          : data.wallet_score >= 50
          ? 'Medium'
          : 'High';

      return {
        success: true,
        walletAddress: data.wallet_address,
        walletScore: data.wallet_score,
        riskLevel,
        classification: data.classification,
        classificationType: data.classification_type,
        ageScore: data.wallet_age_score,
        flags: [
          data.illicit && data.illicit !== 'none'
            ? '⚠️ Illicit Activity Detected'
            : null,
          data.classification_type !== 'normal'
            ? `🔍 Type: ${data.classification_type}`
            : null,
        ].filter(Boolean),
        message: `Wallet ${data.wallet_address} has a score of ${data.wallet_score} (${riskLevel} Risk) — classified as ${data.classification_type}.`,
      };
    } catch (error) {
      return {
        success: false,
        walletAddress: address,
        walletScore: null,
        message: `⚠️ I couldn't fetch a verified score for this wallet. Based on behavior I've seen across DeFi, this address may carry risk — especially if newly created or unverified. Proceed cautiously.`,
        flags: ['No score available from safety signals'],
      };
    }
  },
};
