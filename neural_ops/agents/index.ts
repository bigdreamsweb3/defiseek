/**
 * NeuralOps™ Agent Framework
 * Modular AI agents for DeFiSeek blockchain intelligence
 */

// Base framework
export { ApiClient, BaseAgent, AgentRegistry, type AgentConfig } from './base/ApiClient';

// bitsCrunch Blockchain Intelligence Agents
export { default as supportedChainsAgent } from './bitcrunch/supportedChainsAgent';
export type { Blockchain, SupportedChains } from './bitcrunch/supportedChainsAgent';

// DeFi Analysis Agents
// export { default as tokenAnalysisAgent } from './defi/tokenAnalysisAgent';
// export type { TokenAnalysis } from './defi/tokenAnalysisAgent';

// Utilities
export {
  getSupportedChains,
  isChainSupported,
  findChain,
  getChainSuggestions,
  normalizeChainIdentifier,
  clearChainsCache,
} from './utils/chainUtils';

// Register all agents
import { AgentRegistry } from './base/ApiClient';
import supportedChainsAgent from './bitcrunch/supportedChainsAgent';
// import tokenAnalysisAgent from './defi/tokenAnalysisAgent';

// Auto-register agents when this module is imported (only once)
let isInitialized = false;

if (!isInitialized) {
  AgentRegistry.register(supportedChainsAgent);
  // AgentRegistry.register(tokenAnalysisAgent);
  isInitialized = true;

  if (process.env.NODE_ENV === 'development') {
    console.log('🤖 NeuralOps™ Agent Framework initialized');
    console.log(`📊 Registered agents: ${AgentRegistry.getAll().map(a => a.id).join(', ')}`);
  }
}
