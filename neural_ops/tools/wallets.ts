// File: neural_ops/tools/wallets.ts

import { z } from 'zod';
import walletScoreAgent from '../agents/bitcrunch/wallet/walletScoreAgent';
// import walletMetricsAgent from '../agents/bitcrunch/wallet/walletMetricsAgent';

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

// ✅ Tool for wallet score (already implemented)
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
        walletAddress: cleanAddress,
        data: {
          classification: result.classification,
          classificationLevel: result.classification_type,
          walletScore: result.wallet_score,
          riskScores: {
            anomalousPatternScore: result.anomalous_pattern_score,
            associatedTokenScore: result.associated_token_score,
            riskInteractionScore: result.risk_interaction_score,
            walletAgeScore: result.wallet_age_score,
            smartContractInteractionScore:
              result.smart_contract_interaction_score,
            stakingGovernanceScore: result.staking_governance_interaction_score,
            centralizedInteraction: result.centralized_interaction_score,
            volumeScore: result.volume_score,
            frequencyScore: result.frequency_score,
          },
          illicitFlags: result.illicit ?? null,
          blockchainWithIllicit: result.blockchain_with_illicit ?? null,
          blockchainWithoutIllicit: result.blockchain_without_illicit ?? null,
        },
      };
    } catch (error) {
      console.error('❌ Error in checkWalletScore tool:', error);

      return {
        success: false,
        walletAddress: address,
        errorType: 'data_unavailable',
        message: 'Could not retrieve wallet safety score',
      };
    }
  },
};

export type CheckWalletScoreOutput = Awaited<
  ReturnType<(typeof checkWalletScore)['execute']>
>;

// ✅ New tool for wallet metrics
// export const checkWalletMetrics = {
//   description: `Retrieve detailed wallet metrics including balances, inflows/outflows, transactions, token count, and volumes for a given blockchain.`,

//   parameters: z.object({
//     address: z.string().describe('The wallet address you want to analyze.'),
//     blockchain: z
//       .string()
//       .describe('The blockchain to query (e.g. ethereum, polygon, bsc).'),
//   }),

//   execute: async ({
//     address,
//     blockchain,
//   }: {
//     address: string;
//     blockchain: string;
//   }) => {
//     try {
//       const cleanAddress = extractAddress(address);
//       const result = await walletMetricsAgent.execute({
//         blockchain,
//         wallet: cleanAddress,
//       });

//       return {
//         success: true,
//         walletAddress: cleanAddress,
//         blockchain,
//         data: {
//           balances: {
//             eth: result.balance_eth,
//             usd: result.balance_usd,
//           },
//           activity: {
//             firstActive: result.first_active_day,
//             lastActive: result.last_active_day,
//             activeDays: result.wallet_active_days,
//             walletAge: result.wallet_age,
//           },
//           transactions: {
//             total: result.total_txn,
//             inbound: result.in_txn,
//             outbound: result.out_txn,
//           },
//           flows: {
//             inflowAddresses: result.inflow_addresses,
//             inflowEth: result.inflow_amount_eth,
//             inflowUsd: result.inflow_amount_usd,
//             outflowAddresses: result.outflow_addresses,
//             outflowEth: result.outflow_amount_eth,
//             outflowUsd: result.outflow_amount_usd,
//           },
//           volumes: {
//             totalEth: result.volume_eth,
//             totalUsd: result.volume_usd,
//             illicit: result.illicit_volume,
//             mixer: result.mixer_volume,
//             sanction: result.sanction_volume,
//           },
//           tokensHeld: result.token_cnt,
//         },
//       };
//     } catch (error) {
//       console.error('❌ Error in checkWalletMetrics tool:', error);

//       return {
//         success: false,
//         walletAddress: address,
//         blockchain,
//         errorType: 'data_unavailable',
//         message: 'Could not retrieve wallet metrics',
//       };
//     }
//   },
// };

// export type CheckWalletMetricsOutput = Awaited<
//   ReturnType<(typeof checkWalletMetrics)['execute']>
// >;
