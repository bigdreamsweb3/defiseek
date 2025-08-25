import { z } from 'zod';
import { ApiClient } from '../../base/ApiClient';

const WalletTokenSchema = z.object({
  address: z.string(),
  blockchain: z.string(),
  token_address: z.string(),
  token_name: z.string(),
  token_symbol: z.string(),

  chain_id: z.number(),
  decimal: z.number(),
  quantity: z.number(),
});

export type WalletToken = z.infer<typeof WalletTokenSchema>;

export const erc20TokenAgent = ApiClient.define({
  id: 'erc20TokenAgent',
  description:
    "Retrieve a comprehensive overview of a wallet's ERC-20 token holdings, including key metrics such as token details, quantity owned, and blockchain information.",
  output: WalletTokenSchema,

  async run(
    walletAddress: string,
    blockchain: string = 'ethereum'
  ): Promise<WalletToken> {
    const apiKey = process.env.UNLEASHNFTS_API_KEY;

    if (!walletAddress) {
      throw new Error('⚠️ No wallet address provided to erc20TokenAgent.');
    }

    if (!apiKey) {
      throw new Error(
        '⚠️ UNLEASHNFTS_API_KEY not found in environment variables.'
      );
    }

    const url = `https://api.unleashnfts.com/api/v2/wallet/tokens?wallet=${walletAddress}&blockchain=${blockchain}&offset=0&limit=100`;

    const headers: HeadersInit = {
      accept: 'application/json',
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(url, { method: 'GET', headers });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`❌ API error: ${response.status} – ${errText}`);
      }

      const data = await response.json();
      const walletToken = data?.data?.[0];

      if (!walletToken) {
        throw new Error(
          `⚠️ No wallet token data found for address: ${walletAddress}`
        );
      }

      return WalletTokenSchema.parse(walletToken);
    } catch (error) {
      console.error('❌ Error in erc20TokenAgent:', error);
      throw new Error(`erc20TokenAgent failed for address: ${walletAddress}`);
    }
  },
});
