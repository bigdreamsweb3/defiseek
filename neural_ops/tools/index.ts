// File: neural_ops/tools/index.ts

import { checkSupportedChains, validateChain } from './chains';
import { checkWalletScore } from './wallets';
import { nftMarketAnalyticsTool } from './nft/marketAnalytics';
import { nftMetadataTool } from './nft/nftMetadata';
import { nftCategoryTool } from './nft/nftCategory';

export const tools = {
  // chain tools
  checkSupportedChains,
  validateChain,

  // wallet tools
  checkWalletScore,

  // NFT tools
  nftMarketAnalyticsTool,
  nftMetadataTool,
  nftCategoryTool,

  // add more tools as needed
};
