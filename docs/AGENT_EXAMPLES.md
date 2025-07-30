# 🚀 Agent System Examples

This document provides practical examples of how to use and extend the NeuralOps™ Agent Framework in DeFiSeek.

## 🎯 Testing the New Token Analysis Agent

### 1. **Basic Usage in Chat**

Ask the AI these questions to test the new token analysis agent:

```
"Analyze ETH token for me"
"What's the risk assessment for Bitcoin?"
"Give me a comprehensive analysis of USDC"
"Analyze DOGE and tell me if I should buy or sell"
```

### 2. **Expected Response Format**

The AI will use the `analyzeToken` tool and return structured data like:

```json
{
  "token": {
    "symbol": "ETH",
    "name": "Ethereum"
  },
  "price": {
    "current": 2500.50,
    "change24h": 5.2,
    "change7d": 12.8,
    "marketCap": 300000000000,
    "volume24h": 15000000000
  },
  "technicalAnalysis": {
    "trend": "bullish",
    "support": 2400.00,
    "resistance": 2600.00,
    "rsi": 65,
    "volatility": "medium"
  },
  "riskAssessment": {
    "riskLevel": "low",
    "riskFactors": [],
    "safetyScore": 85
  },
  "recommendation": {
    "action": "buy",
    "confidence": 75,
    "reasoning": "Strong bullish signals with low risk level",
    "timeframe": "medium"
  },
  "insights": [
    "ETH shows strong bullish momentum with low risk profile",
    "High safety score indicates stable fundamentals"
  ]
}
```

## 🛠️ Creating Your Own Agents

### Example 1: Simple Price Alert Agent

```typescript
// models/agents/alerts/priceAlertAgent.ts
import { z } from 'zod';
import { createSimpleAgent } from '../utils/agentHelpers';

const PriceAlertSchema = z.object({
  symbol: z.string(),
  currentPrice: z.number(),
  targetPrice: z.number(),
  alertTriggered: z.boolean(),
  message: z.string(),
});

const priceAlertAgent = createSimpleAgent({
  id: 'priceAlertAgent',
  description: 'Monitors token prices and triggers alerts when targets are reached',
  outputSchema: PriceAlertSchema,
  handler: async (symbol: string, targetPrice: number) => {
    // Fetch current price (mock for example)
    const currentPrice = 100 + Math.random() * 900;
    
    const alertTriggered = currentPrice >= targetPrice;
    
    return {
      symbol,
      currentPrice,
      targetPrice,
      alertTriggered,
      message: alertTriggered 
        ? `🚨 Alert! ${symbol} reached target price of $${targetPrice}`
        : `📊 ${symbol} at $${currentPrice}, target: $${targetPrice}`,
    };
  },
});

export default priceAlertAgent;
```

### Example 2: Portfolio Diversification Agent

```typescript
// models/agents/portfolio/diversificationAgent.ts
import { z } from 'zod';
import { ApiClient } from '../base/ApiClient';

const DiversificationSchema = z.object({
  portfolioValue: z.number(),
  assets: z.array(z.object({
    symbol: z.string(),
    allocation: z.number(),
    recommendedAllocation: z.number(),
  })),
  diversificationScore: z.number(),
  recommendations: z.array(z.string()),
  riskLevel: z.enum(['conservative', 'moderate', 'aggressive']),
});

const diversificationAgent = ApiClient.define({
  id: 'diversificationAgent',
  description: 'Analyzes portfolio diversification and provides rebalancing recommendations',
  output: DiversificationSchema,
  
  async run(portfolio: Array<{ symbol: string; value: number }>) {
    const totalValue = portfolio.reduce((sum, asset) => sum + asset.value, 0);
    
    const assets = portfolio.map(asset => {
      const allocation = (asset.value / totalValue) * 100;
      const recommendedAllocation = this.getRecommendedAllocation(asset.symbol);
      
      return {
        symbol: asset.symbol,
        allocation,
        recommendedAllocation,
      };
    });
    
    const diversificationScore = this.calculateDiversificationScore(assets);
    const recommendations = this.generateRecommendations(assets);
    const riskLevel = this.assessRiskLevel(assets);
    
    return {
      portfolioValue: totalValue,
      assets,
      diversificationScore,
      recommendations,
      riskLevel,
    };
  },
  
  private getRecommendedAllocation(symbol: string): number {
    // Simplified allocation recommendations
    const allocations: Record<string, number> = {
      'BTC': 40,
      'ETH': 30,
      'USDC': 20,
      'USDT': 10,
    };
    return allocations[symbol] || 5;
  },
  
  private calculateDiversificationScore(assets: any[]): number {
    // Calculate how well diversified the portfolio is (0-100)
    const maxAllocation = Math.max(...assets.map(a => a.allocation));
    return Math.max(0, 100 - maxAllocation);
  },
  
  private generateRecommendations(assets: any[]): string[] {
    const recommendations: string[] = [];
    
    assets.forEach(asset => {
      const diff = asset.allocation - asset.recommendedAllocation;
      if (Math.abs(diff) > 5) {
        if (diff > 0) {
          recommendations.push(`Consider reducing ${asset.symbol} allocation by ${diff.toFixed(1)}%`);
        } else {
          recommendations.push(`Consider increasing ${asset.symbol} allocation by ${Math.abs(diff).toFixed(1)}%`);
        }
      }
    });
    
    return recommendations;
  },
  
  private assessRiskLevel(assets: any[]): 'conservative' | 'moderate' | 'aggressive' {
    const stablecoinAllocation = assets
      .filter(a => ['USDC', 'USDT', 'DAI'].includes(a.symbol))
      .reduce((sum, a) => sum + a.allocation, 0);
    
    if (stablecoinAllocation > 50) return 'conservative';
    if (stablecoinAllocation > 20) return 'moderate';
    return 'aggressive';
  },
});

export default diversificationAgent;
```

### Example 3: Gas Fee Optimization Agent

```typescript
// models/agents/ethereum/gasFeeAgent.ts
import { z } from 'zod';
import { createSimpleAgent } from '../utils/agentHelpers';

const GasFeeSchema = z.object({
  network: z.string(),
  currentGasPrice: z.number(),
  recommendations: z.object({
    slow: z.object({ gwei: z.number(), estimatedTime: z.string() }),
    standard: z.object({ gwei: z.number(), estimatedTime: z.string() }),
    fast: z.object({ gwei: z.number(), estimatedTime: z.string() }),
  }),
  optimalTime: z.string(),
  costEstimate: z.object({
    transfer: z.number(),
    swap: z.number(),
    nftMint: z.number(),
  }),
});

const gasFeeAgent = createSimpleAgent({
  id: 'gasFeeAgent',
  description: 'Analyzes current gas fees and provides optimization recommendations',
  outputSchema: GasFeeSchema,
  handler: async (network: string = 'ethereum') => {
    // Mock gas fee data (in production, fetch from gas tracker APIs)
    const baseGas = 20 + Math.random() * 80; // 20-100 gwei
    
    return {
      network,
      currentGasPrice: baseGas,
      recommendations: {
        slow: { gwei: baseGas * 0.8, estimatedTime: '10-15 minutes' },
        standard: { gwei: baseGas, estimatedTime: '3-5 minutes' },
        fast: { gwei: baseGas * 1.5, estimatedTime: '< 2 minutes' },
      },
      optimalTime: baseGas > 50 ? 'Wait for lower fees' : 'Good time to transact',
      costEstimate: {
        transfer: baseGas * 21000 / 1e9, // ETH
        swap: baseGas * 150000 / 1e9,    // ETH
        nftMint: baseGas * 200000 / 1e9, // ETH
      },
    };
  },
});

export default gasFeeAgent;
```

## 🔧 Integration Examples

### 1. **Register Multiple Agents**

```typescript
// models/agents/index.ts
import priceAlertAgent from './alerts/priceAlertAgent';
import diversificationAgent from './portfolio/diversificationAgent';
import gasFeeAgent from './ethereum/gasFeeAgent';

// Register all new agents
AgentRegistry.register(priceAlertAgent);
AgentRegistry.register(diversificationAgent);
AgentRegistry.register(gasFeeAgent);
```

### 2. **Add Tools to Chat System**

```typescript
// app/(chat)/api/chat/route.ts
tools: {
  // ... existing tools
  
  checkGasFees: {
    description: 'Get current gas fees and optimization recommendations',
    parameters: z.object({
      network: z.string().optional().default('ethereum'),
    }),
    execute: async ({ network }) => {
      return await gasFeeAgent.execute(network);
    },
  },
  
  analyzePortfolio: {
    description: 'Analyze portfolio diversification and get rebalancing recommendations',
    parameters: z.object({
      portfolio: z.array(z.object({
        symbol: z.string(),
        value: z.number(),
      })),
    }),
    execute: async ({ portfolio }) => {
      return await diversificationAgent.execute(portfolio);
    },
  },
  
  setPriceAlert: {
    description: 'Set up price alerts for tokens',
    parameters: z.object({
      symbol: z.string(),
      targetPrice: z.number(),
    }),
    execute: async ({ symbol, targetPrice }) => {
      return await priceAlertAgent.execute(symbol, targetPrice);
    },
  },
}
```

### 3. **Batch Agent Execution**

```typescript
import { executeAgentsBatch } from '@/models/agents/utils/agentHelpers';

// Execute multiple agents for comprehensive analysis
const comprehensiveAnalysis = await executeAgentsBatch([
  { agentId: 'tokenAnalysisAgent', args: ['ETH'] },
  { agentId: 'gasFeeAgent', args: ['ethereum'] },
  { agentId: 'supportedChainsAgent', args: [] },
]);

console.log('Comprehensive analysis results:', comprehensiveAnalysis);
```

## 📊 Monitoring and Analytics

### 1. **Performance Monitoring**

```typescript
import { AgentPerformanceMonitor } from '@/models/agents/utils/agentHelpers';

// Get performance metrics for an agent
const metrics = AgentPerformanceMonitor.getMetrics('tokenAnalysisAgent');
console.log('Agent performance:', metrics);

// Get all agent metrics
const allMetrics = AgentPerformanceMonitor.getAllMetrics();
```

### 2. **Health Checks**

```typescript
import { AgentRegistryHelpers } from '@/models/agents/utils/agentHelpers';

// Check if agent exists
const hasAgent = AgentRegistryHelpers.hasAgent('tokenAnalysisAgent');

// Get all agents with metadata
const agentList = AgentRegistryHelpers.getAgentList();
```

## 🎯 Testing Your Agents

### 1. **Unit Testing**

```typescript
// tests/agents/tokenAnalysisAgent.test.ts
import tokenAnalysisAgent from '@/models/agents/defi/tokenAnalysisAgent';

describe('Token Analysis Agent', () => {
  it('should analyze ETH successfully', async () => {
    const result = await tokenAnalysisAgent.execute('ETH');
    
    expect(result.token.symbol).toBe('ETH');
    expect(result.price.current).toBeGreaterThan(0);
    expect(result.recommendation.action).toMatch(/buy|sell|hold/);
  });
  
  it('should handle invalid tokens gracefully', async () => {
    await expect(tokenAnalysisAgent.execute('INVALID')).rejects.toThrow();
  });
});
```

### 2. **Integration Testing**

```typescript
// Test agent integration with chat system
const testQuestions = [
  'Analyze ETH token',
  'What are the current gas fees?',
  'Check my portfolio diversification',
];

for (const question of testQuestions) {
  // Send to chat API and verify agent execution
  const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      messages: [{ role: 'user', content: question }],
      id: 'test-chat',
      modelId: 'gemini-1.5-flash-latest',
    }),
  });
  
  // Verify response contains agent data
  expect(response.ok).toBe(true);
}
```

This comprehensive example system demonstrates how to create, integrate, and test new agents in the DeFiSeek platform. Each agent is focused, reusable, and provides specific blockchain intelligence capabilities.
