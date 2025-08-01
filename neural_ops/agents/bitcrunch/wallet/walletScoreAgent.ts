import { z } from 'zod';
import { ApiClient } from '../../base/ApiClient';

const WalletScoreSchema = z.object({
  wallet_address: z.string(),
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

  illicit: z.union([z.string(), z.array(z.unknown())]).optional(),
  blockchain_with_illicit: z.string().optional(),
  blockchain_without_illicit: z.string().optional(),
});

export type WalletScore = z.infer<typeof WalletScoreSchema>;

export const walletScoreAgent = ApiClient.define({
  id: 'walletScoreAgent',
  description: 'Fetches wallet score data from UnleashNFTs bitsCrunch API',
  output: WalletScoreSchema,

  async run(address: string): Promise<WalletScore> {
    const apiKey = process.env.UNLEASHNFTS_API_KEY;

    if (!address) {
      throw new Error('⚠️ No wallet address provided to walletScoreAgent.');
    }

    if (!apiKey) {
      throw new Error('⚠️ UNLEASHNFTS_API_KEY not found in environment variables.');
    }

    const url = `https://api.unleashnfts.com/api/v2/wallet/score?wallet_address=${address}&time_range=all&offset=0&limit=100`;

    const headers: HeadersInit = {
      accept: 'application/json',
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    };

    console.log(`🌐 Fetching wallet score from: ${url}`);
    console.log(`🔑 Using API key: ${apiKey.slice(0, 6)}...`);

    try {
      const response = await fetch(url, { method: 'GET', headers });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`❌ API error: ${response.status} – ${errText}`);
      }

      const data = await response.json();
      const walletScore = data?.data?.[0];

      if (!walletScore) {
        throw new Error(`⚠️ No wallet score found for address: ${address}`);
      }

      console.log('🧾 Raw wallet score response:', walletScore);

      return WalletScoreSchema.parse(walletScore);
    } catch (error) {
      console.error('❌ Error in walletScoreAgent:', error);
      throw new Error(`walletScoreAgent failed for address: ${address}`);
    }
  },
});

export default walletScoreAgent;
