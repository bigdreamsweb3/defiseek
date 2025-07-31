// neural_ops/tools/index.ts
import { checkSupportedChains, validateChain } from './chains';
import { checkWalletScore } from './wallets';
// import other tool files here...

export const tools = {
  checkSupportedChains,
  validateChain,

  // wallet tools
  checkWalletScore,

  // add more tools as needed
};
