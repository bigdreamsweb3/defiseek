// // File: neural_ops/tools/index.ts

import { aiRouterTool } from './aiRouterTool';
import { checkSupportedChains } from './chains';

export const tools = {
  ...aiRouterTool, // 👈 spread so the tool registers as "aiRouter"
  checkSupportedChains,
};

// import { checkSupportedChains, validateChain } from './chains';
// import { checkWalletScore } from './wallets';
// import { nftMarketAnalyticsTool } from './nft/marketAnalytics';
// import { nftMetadataTool } from './nft/nftMetadata';
// import { nftCategoryTool } from './nft/nftCategory';
// import { marketMetadataTool } from './nft/marketMetadata';
// import { aiRouterTool } from './aiRouterTool';

// export const tools = {
//   // AI Router tool
//   ...aiRouterTool, // 👈 spread so the tool registers as "aiRouter"

//   // // chain tools
//   checkSupportedChains,
//   // validateChain,

//   // // wallet tools
//   // checkWalletScore,
//   // // checkWalletMetrics,

//   // // NFT tools
//   // nftMarketAnalyticsTool,
//   // marketMetadataTool,
//   // nftMetadataTool,
//   // nftCategoryTool,

//   // add more tools as needed
// };
