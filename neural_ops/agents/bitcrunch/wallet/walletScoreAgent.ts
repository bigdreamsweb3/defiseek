// File: neural_ops/agents/bitcrunch/wallet/walletScoreAgent.ts

import { z } from 'zod';
import { ApiClient } from '../../base/ApiClient';
// import unleashnfts from '../../../../.api/apis/unleashnfts';

// ✅ Full schema based on actual response structure
const WalletScoreSchema = z.object({
  wallet_address: z.string(),
  blockchain: z.string(),
  chain_id: z.number(),
  classification: z.string(),
  classification_type: z.string(),
  anomalous_pattern_score: z.number(),
  associated_token_score: z.number(),
  risk_interaction_score: z.number(),
  wallet_age_score: z.number(),
  smart_contract_interaction_score: z.number(),
  staking_governance_interaction_score: z.number(),
  centralized_interaction_score: z.number(),
  wallet_score: z.number(),
  volume_score: z.number(),
  frequency_score: z.number(),
  illicit: z.string(), // ⚠️ Change this to `z.array(z.unknown())` if it’s an array
});

export type WalletScore = z.infer<typeof WalletScoreSchema>;

export const walletScoreAgent = ApiClient.define({
  id: 'walletScoreAgent',
  description: 'Fetches wallet score data from UnleashNFTs bitsCrunch API',
  output: WalletScoreSchema,

  async run(address: string): Promise<WalletScore> {
    const apiKey =
      process.env.UNLEASH_API_KEY ?? 'b5ae8831a61c4a3b83dc6e4b3dc106f2';

    if (!address) {
      throw new Error('⚠️ No wallet address provided to walletScoreAgent.');
    }
    console.log(`✅ Received wallet address: ${address}`);

    console.log(`🔍 Fetching wallet score for address: ${address}...`);

    // 🛡️ Authorize API client
    // unleashnfts.auth(apiKey);

    try {
      //   const response = await unleashnfts.getWalletScore({
      //     wallet_address: [address],
      //     time_range: 'all',
      //     offset: 0,
      //     limit: 30,
      //   });

      const url = `https://api.unleashnfts.com/api/v2/wallet/score?wallet_address=${address}&time_range=all&offset=0&limit=30`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'x-api-key': apiKey,
        },
      });

      const data = await response.json();
      const walletScore = data?.data?.[0];
      if (!walletScore) {
        throw new Error(`No wallet score found for ${address}`);
      }

      return WalletScoreSchema.parse(walletScore);
    } catch (error) {
      console.error('❌ Error fetching wallet score:', error);
      throw new Error(`Failed to fetch wallet score for ${address}`);
    }
  },
});

export default walletScoreAgent;
