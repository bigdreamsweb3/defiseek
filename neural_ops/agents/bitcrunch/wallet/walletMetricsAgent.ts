// agents/walletMetricsAgent.ts
import { z } from 'zod';
import { ApiClient } from '../../base/ApiClient';

const WalletMetricsSchema = z.object({
  balance_eth: z.number().nullable(),
  balance_usd: z.number().nullable(),
  first_active_day: z.string().nullable(),
  gas: z.number().nullable(),
  gas_fee: z.number().nullable(),
  gas_price: z.number().nullable(),
  illicit_volume: z.number().nullable(),
  in_txn: z.number().nullable(),
  inflow_addresses: z.number().nullable(),
  inflow_amount_eth: z.number().nullable(),
  inflow_amount_usd: z.number().nullable(),
  last_active_day: z.string().nullable(),
  mixer_volume: z.number().nullable(),
  out_txn: z.number().nullable(),
  outflow_addresses: z.number().nullable(),
  outflow_amount_eth: z.number().nullable(),
  outflow_amount_usd: z.number().nullable(),
  sanction_volume: z.number().nullable(),
  token_cnt: z.number().nullable(),
  total_txn: z.number().nullable(),
  volume_eth: z.number().nullable(),
  volume_usd: z.number().nullable(),
  wallet: z.string(),
  wallet_active_days: z.number().nullable(),
  wallet_age: z.number().nullable(),
});

export type WalletMetrics = z.infer<typeof WalletMetricsSchema>;

export const walletMetricsAgent = ApiClient.define({
  id: 'walletMetricsAgent',
  description:
    'Fetches wallet metrics (balance, inflow/outflow, txs, volumes) from UnleashNFTs bitsCrunch API',
  output: WalletMetricsSchema,

  async run(walletAddress: string): Promise<WalletMetrics> {
    const apiKey = process.env.UNLEASHNFTS_API_KEY;

    if (!walletAddress) {
      throw new Error('⚠️ No wallet address provided to walletMetricsAgent.');
    }

    // Default to ethereum if no blockchain specified
    const blockchain = 'ethereum';

    if (!apiKey) {
      throw new Error(
        '⚠️ UNLEASHNFTS_API_KEY not found in environment variables.'
      );
    }

    const url = `https://api.unleashnfts.com/api/v2/wallet/metrics?blockchain=${blockchain}&wallet=${walletAddress}&time_range=all&offset=0&limit=30`;

    const headers: HeadersInit = {
      accept: 'application/json',
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    };

    console.log(`🌐 Fetching wallet metrics from: ${url}`);
    console.log(`🔑 Using API key: ${apiKey.slice(0, 6)}...`);

    try {
      const response = await fetch(url, { method: 'GET', headers });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`❌ API error: ${response.status} – ${errText}`);
      }

      const data = await response.json();
      const walletMetrics = data?.data?.[0];

      if (!walletMetrics) {
        throw new Error(
          `⚠️ No wallet metrics found for address: ${walletAddress}`
        );
      }

      console.log('🧾 Raw wallet metrics response:', walletMetrics);

      return WalletMetricsSchema.parse(walletMetrics);
    } catch (error) {
      console.error('❌ Error in walletMetricsAgent:', error);
      throw new Error(
        `walletMetricsAgent failed for address: ${walletAddress}`
      );
    }
  },
});

export default walletMetricsAgent;
