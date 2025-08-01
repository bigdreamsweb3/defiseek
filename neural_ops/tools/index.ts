// File: neural_ops/tools/index.ts

import { checkSupportedChains, validateChain } from './chains';
import { checkWalletScore } from './wallets';
import { nftMarketAnalyticsTool } from './nft/marketAnalytics'; // 👈 import the new tool

export const tools = {
  // chain tools
  checkSupportedChains,
  validateChain,

  // wallet tools
  checkWalletScore,

  // NFT tools
  nftMarketAnalyticsTool, // 👈 export it here

  // add more tools as needed
};
