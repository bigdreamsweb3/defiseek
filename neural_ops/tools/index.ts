// neural_ops/tools/index.ts

import { checkSupportedChains, validateChain } from './chains';
import { checkWalletScore } from './wallets';
import { analyzeNFTMarketInsights } from './nfts'; // ✅ Import the NFT tool

export const tools = {
  // chain tools
  checkSupportedChains,
  validateChain,

  // wallet tools
  checkWalletScore,

  // NFT tools
  analyzeNFTMarketInsights, // ✅ Add NFT analytics tool here

  // add more tools as needed
};
