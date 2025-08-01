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

      // ✅ Success case - return structured data for AI to process
      return {
        success: true,
        walletAddress: cleanAddress,
        data: {
          classification: result.classification,
          classificationLevel: result.classification_type,
          walletScore: result.wallet_score,
          riskScores: {
            anomalousPattern: result.anomalous_pattern_score,
            associatedToken: result.associated_token_score,
            riskInteraction: result.risk_interaction_score,
            walletAge: result.wallet_age_score,
            smartContractInteraction: result.smart_contract_interaction_score,
            stakingGovernance: result.staking_governance_interaction_score,
            centralizedInteraction: result.centralized_interaction_score,
            volume: result.volume_score,
            frequency: result.frequency_score
          },
          blockchain: result.blockchain,
          chainId: result.chain_id,
          illicitFlags: result.illicit
        }
      };
    } catch (error) {
      console.error('❌ Error in checkWalletScore tool:', error);
      
      // ✅ Failure case - return simple error info for AI to interpret
      return {
        success: false,
        walletAddress: address,
        errorType: 'data_unavailable',
        message: 'Could not retrieve wallet safety score',
        // Remove the detailed explanation and flags - let the AI handle this
      };
    }
  },
};

export type CheckWalletScoreOutput = Awaited<ReturnType<typeof checkWalletScore['execute']>>;
