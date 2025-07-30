# 🤖 NeuralOps™ Agent Framework Documentation

## Overview

DeFiSeek uses an intelligent agent system called **NeuralOps™** that enables AI to make blockchain decisions through specialized agents. Each agent is a focused AI tool that can analyze blockchain data, validate transactions, assess risks, and provide intelligent recommendations.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    User Question                            │
│              "What's the risk of this wallet?"             │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                 AI Chat System                              │
│           (Gemini/GPT with Tools)                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              NeuralOps™ Agent Registry                     │
│    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│    │ Chains      │ │ Wallet Risk │ │ Price       │        │
│    │ Agent       │ │ Agent       │ │ Agent       │        │
│    └─────────────┘ └─────────────┘ └─────────────┘        │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              Blockchain APIs                                │
│    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│    │ UnleashNFTs │ │ bitsCrunch  │ │ CoinGecko   │        │
│    │ API         │ │ API         │ │ API         │        │
│    └─────────────┘ └─────────────┘ └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Current Agent System

### 1. **Base Framework** (`models/agents/base/ApiClient.ts`)

The foundation provides:
- **BaseAgent**: Abstract class all agents extend
- **AgentConfig**: Type-safe configuration interface
- **AgentRegistry**: Central registry for all agents
- **ApiClient**: Factory for creating agents

### 2. **Existing Agents**

#### **Supported Chains Agent** (`models/agents/bitcrunch/supportedChainsAgent.ts`)
- **Purpose**: Fetches supported blockchains from UnleashNFTs API
- **Input**: None
- **Output**: Array of supported blockchain networks
- **Usage**: Validates if user's blockchain request is supported

#### **Wallet Risk Agent** (`models/agents/bitcrunch/walletRiskAgent.ts`)
- **Purpose**: Analyzes wallet risk using bitsCrunch API
- **Input**: Wallet address (string)
- **Output**: Risk score, level, flags, and recommendations
- **Usage**: Assesses safety of wallet addresses

### 3. **Integration with Chat System**

Agents are integrated into the chat via the `tools` system in `/api/chat/route.ts`:

```typescript
tools: {
  checkSupportedChains: {
    description: 'Get list of supported blockchain networks',
    parameters: z.object({}),
    execute: async () => {
      const chains = await getSupportedChains();
      return chains;
    },
  },
  validateChain: {
    description: 'Check if a blockchain is supported',
    parameters: z.object({
      chainIdentifier: z.string(),
    }),
    execute: async ({ chainIdentifier }) => {
      const isSupported = await isChainSupported(chainIdentifier);
      const chainInfo = await findChain(chainIdentifier);
      return { isSupported, chainInfo };
    },
  },
}
```

## 🚀 How to Create New Agents

### Step 1: Define Your Agent

Create a new file in `models/agents/[category]/[agentName].ts`:

```typescript
import { z } from 'zod';
import { ApiClient } from '../base/ApiClient';

// Define the output schema
const MyAgentOutputSchema = z.object({
  result: z.string(),
  confidence: z.number(),
  recommendations: z.array(z.string()),
});

type MyAgentOutput = z.infer<typeof MyAgentOutputSchema>;

// Create the agent
const myAgent = ApiClient.define({
  id: 'myAgent',
  description: 'Description of what this agent does',
  output: MyAgentOutputSchema,
  
  async run(input: string): Promise<MyAgentOutput> {
    // Your agent logic here
    const result = await callExternalAPI(input);
    
    return {
      result: result.data,
      confidence: result.confidence,
      recommendations: result.suggestions,
    };
  }
});

export default myAgent;
```

### Step 2: Register Your Agent

Add to `models/agents/index.ts`:

```typescript
// Import your agent
import myAgent from './category/myAgent';

// Register it
AgentRegistry.register(myAgent);

// Export utilities if needed
export { myAgent };
```

### Step 3: Create Utility Functions

Add helper functions in `models/agents/utils/`:

```typescript
// models/agents/utils/myAgentUtils.ts
import myAgent from '../category/myAgent';

export async function analyzeWithMyAgent(input: string) {
  try {
    return await myAgent.execute(input);
  } catch (error) {
    console.error('MyAgent failed:', error);
    throw error;
  }
}
```

### Step 4: Integrate with Chat System

Add your agent as a tool in `app/(chat)/api/chat/route.ts`:

```typescript
tools: {
  // ... existing tools
  myAgentTool: {
    description: 'Use my agent to analyze something',
    parameters: z.object({
      input: z.string(),
    }),
    execute: async ({ input }) => {
      try {
        const result = await myAgent.execute(input);
        return result;
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Unknown error',
          message: `❌ Could not analyze ${input}`,
        };
      }
    },
  },
}
```

## 📋 Agent Development Best Practices

### 1. **Error Handling**
```typescript
async run(input: string): Promise<Output> {
  try {
    const result = await externalAPI(input);
    return this.validateOutput(result);
  } catch (error) {
    console.error(`Agent ${this.id} failed:`, error);
    throw new Error(`Failed to process: ${error.message}`);
  }
}
```

### 2. **Input Validation**
```typescript
async run(input: string): Promise<Output> {
  if (!input || input.trim().length === 0) {
    throw new Error('Input cannot be empty');
  }
  
  // Validate input format
  if (!isValidAddress(input)) {
    throw new Error('Invalid wallet address format');
  }
  
  // Continue with processing...
}
```

### 3. **Caching Strategy**
```typescript
let cache: Map<string, { data: Output; timestamp: number }> = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async run(input: string): Promise<Output> {
  const cacheKey = `${this.id}:${input}`;
  const cached = cache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }
  
  const result = await processInput(input);
  cache.set(cacheKey, { data: result, timestamp: Date.now() });
  
  return result;
}
```

### 4. **Mock Data for Development**
```typescript
async run(input: string): Promise<Output> {
  const apiKey = process.env.MY_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ API key not found, using mock data');
    return generateMockData(input);
  }
  
  // Real API call
  return await callRealAPI(input, apiKey);
}
```

## 🎯 Example: Creating a Price Analysis Agent

Let's create a complete example of a new agent that analyzes token prices:

```typescript
// models/agents/defi/priceAnalysisAgent.ts
import { z } from 'zod';
import { ApiClient } from '../base/ApiClient';

const PriceAnalysisSchema = z.object({
  token: z.string(),
  currentPrice: z.number(),
  priceChange24h: z.number(),
  marketCap: z.number(),
  volume24h: z.number(),
  analysis: z.object({
    trend: z.enum(['bullish', 'bearish', 'neutral']),
    support: z.number(),
    resistance: z.number(),
    recommendation: z.enum(['buy', 'sell', 'hold']),
  }),
  risks: z.array(z.string()),
});

type PriceAnalysis = z.infer<typeof PriceAnalysisSchema>;

const priceAnalysisAgent = ApiClient.define({
  id: 'priceAnalysisAgent',
  description: 'Analyzes token price trends and provides trading recommendations',
  output: PriceAnalysisSchema,
  
  async run(tokenSymbol: string): Promise<PriceAnalysis> {
    // Validate input
    if (!tokenSymbol || tokenSymbol.trim().length === 0) {
      throw new Error('Token symbol is required');
    }
    
    const symbol = tokenSymbol.toUpperCase().trim();
    
    // Call CoinGecko API (example)
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch price data for ${symbol}`);
    }
    
    const data = await response.json();
    
    // Process and analyze the data
    const priceData = data[symbol.toLowerCase()];
    const trend = determineTrend(priceData.usd_24h_change);
    const recommendation = generateRecommendation(priceData);
    
    return {
      token: symbol,
      currentPrice: priceData.usd,
      priceChange24h: priceData.usd_24h_change,
      marketCap: priceData.usd_market_cap,
      volume24h: priceData.usd_24h_vol,
      analysis: {
        trend,
        support: calculateSupport(priceData),
        resistance: calculateResistance(priceData),
        recommendation,
      },
      risks: assessRisks(priceData),
    };
  }
});

// Helper functions
function determineTrend(change24h: number): 'bullish' | 'bearish' | 'neutral' {
  if (change24h > 5) return 'bullish';
  if (change24h < -5) return 'bearish';
  return 'neutral';
}

function generateRecommendation(data: any): 'buy' | 'sell' | 'hold' {
  // Your recommendation logic here
  return 'hold';
}

function calculateSupport(data: any): number {
  // Technical analysis logic
  return data.usd * 0.95;
}

function calculateResistance(data: any): number {
  // Technical analysis logic
  return data.usd * 1.05;
}

function assessRisks(data: any): string[] {
  const risks: string[] = [];
  
  if (data.usd_24h_change < -10) {
    risks.push('High volatility detected');
  }
  
  if (data.usd_24h_vol < 1000000) {
    risks.push('Low liquidity');
  }
  
  return risks;
}

export default priceAnalysisAgent;
```

## 🧠 Advanced Agent Patterns

### 1. **Multi-Step Agents**
Agents that perform complex analysis in multiple steps:

```typescript
const complexAnalysisAgent = ApiClient.define({
  id: 'complexAnalysisAgent',
  description: 'Performs multi-step blockchain analysis',
  output: ComplexAnalysisSchema,

  async run(address: string): Promise<ComplexAnalysis> {
    // Step 1: Basic validation
    const validation = await this.validateAddress(address);

    // Step 2: Risk assessment
    const riskData = await this.assessRisk(address);

    // Step 3: Transaction analysis
    const txAnalysis = await this.analyzeTxHistory(address);

    // Step 4: Cross-reference with known patterns
    const patterns = await this.checkPatterns(address);

    // Step 5: Generate comprehensive report
    return this.generateReport({
      validation,
      riskData,
      txAnalysis,
      patterns,
    });
  },

  private async validateAddress(address: string) {
    // Implementation
  },

  private async assessRisk(address: string) {
    // Implementation
  },

  // ... other private methods
});
```

### 2. **Agent Composition**
Combining multiple agents for comprehensive analysis:

```typescript
const portfolioAnalysisAgent = ApiClient.define({
  id: 'portfolioAnalysisAgent',
  description: 'Analyzes entire portfolio using multiple agents',
  output: PortfolioAnalysisSchema,

  async run(walletAddress: string): Promise<PortfolioAnalysis> {
    // Use multiple agents in parallel
    const [
      riskAssessment,
      priceAnalysis,
      chainValidation,
    ] = await Promise.all([
      AgentRegistry.execute('walletRiskAgent', walletAddress),
      AgentRegistry.execute('priceAnalysisAgent', 'ETH'),
      AgentRegistry.execute('supportedChainsAgent'),
    ]);

    // Combine results
    return {
      wallet: walletAddress,
      riskScore: riskAssessment.riskScore,
      totalValue: priceAnalysis.currentPrice,
      supportedChains: chainValidation.length,
      recommendation: this.generatePortfolioRecommendation({
        riskAssessment,
        priceAnalysis,
      }),
    };
  }
});
```

## 🎓 Training and Improving Agents

### 1. **Data Collection Strategy**

```typescript
// models/agents/training/dataCollector.ts
export class AgentDataCollector {
  private static interactions: Map<string, AgentInteraction[]> = new Map();

  static logInteraction(agentId: string, interaction: AgentInteraction) {
    const existing = this.interactions.get(agentId) || [];
    existing.push({
      ...interaction,
      timestamp: new Date(),
    });
    this.interactions.set(agentId, existing);
  }

  static getTrainingData(agentId: string): AgentInteraction[] {
    return this.interactions.get(agentId) || [];
  }

  static exportTrainingData(agentId: string): string {
    const data = this.getTrainingData(agentId);
    return JSON.stringify(data, null, 2);
  }
}

interface AgentInteraction {
  input: any;
  output: any;
  success: boolean;
  executionTime: number;
  userFeedback?: 'positive' | 'negative';
  timestamp: Date;
}
```

### 2. **Performance Monitoring**

```typescript
// Enhanced agent with monitoring
const monitoredAgent = ApiClient.define({
  id: 'monitoredAgent',
  description: 'Agent with built-in performance monitoring',
  output: OutputSchema,

  async run(input: string): Promise<Output> {
    const startTime = Date.now();
    let success = false;
    let result: Output;

    try {
      result = await this.processInput(input);
      success = true;

      // Log successful interaction
      AgentDataCollector.logInteraction(this.id, {
        input,
        output: result,
        success,
        executionTime: Date.now() - startTime,
      });

      return result;
    } catch (error) {
      // Log failed interaction
      AgentDataCollector.logInteraction(this.id, {
        input,
        output: null,
        success: false,
        executionTime: Date.now() - startTime,
      });

      throw error;
    }
  }
});
```

### 3. **A/B Testing Framework**

```typescript
// models/agents/testing/abTesting.ts
export class AgentABTesting {
  private static experiments: Map<string, ABExperiment> = new Map();

  static createExperiment(
    agentId: string,
    variantA: BaseAgent,
    variantB: BaseAgent,
    trafficSplit: number = 0.5
  ) {
    this.experiments.set(agentId, {
      variantA,
      variantB,
      trafficSplit,
      results: { a: [], b: [] },
    });
  }

  static async executeWithTesting(
    agentId: string,
    input: any
  ): Promise<any> {
    const experiment = this.experiments.get(agentId);

    if (!experiment) {
      // No experiment, use default agent
      return AgentRegistry.execute(agentId, input);
    }

    // Determine which variant to use
    const useVariantA = Math.random() < experiment.trafficSplit;
    const variant = useVariantA ? experiment.variantA : experiment.variantB;

    const startTime = Date.now();
    const result = await variant.execute(input);
    const executionTime = Date.now() - startTime;

    // Log result for analysis
    const resultKey = useVariantA ? 'a' : 'b';
    experiment.results[resultKey].push({
      input,
      output: result,
      executionTime,
      timestamp: new Date(),
    });

    return result;
  }
}
```

## 🔄 Continuous Learning System

### 1. **Feedback Integration**

```typescript
// Add to your chat system
export async function recordAgentFeedback(
  agentId: string,
  interactionId: string,
  feedback: 'positive' | 'negative',
  details?: string
) {
  // Store feedback in database
  await db.insert(agentFeedback).values({
    agentId,
    interactionId,
    feedback,
    details,
    timestamp: new Date(),
  });

  // Update agent performance metrics
  await updateAgentMetrics(agentId, feedback);
}
```

### 2. **Auto-Improvement System**

```typescript
// models/agents/improvement/autoImprover.ts
export class AgentAutoImprover {
  static async analyzePerformance(agentId: string) {
    const interactions = AgentDataCollector.getTrainingData(agentId);

    const metrics = {
      successRate: this.calculateSuccessRate(interactions),
      avgExecutionTime: this.calculateAvgExecutionTime(interactions),
      userSatisfaction: this.calculateUserSatisfaction(interactions),
    };

    // Identify improvement opportunities
    const improvements = this.identifyImprovements(metrics);

    return {
      metrics,
      improvements,
      recommendations: this.generateRecommendations(improvements),
    };
  }

  private static identifyImprovements(metrics: AgentMetrics) {
    const improvements: string[] = [];

    if (metrics.successRate < 0.9) {
      improvements.push('Improve error handling');
    }

    if (metrics.avgExecutionTime > 5000) {
      improvements.push('Optimize performance');
    }

    if (metrics.userSatisfaction < 0.8) {
      improvements.push('Enhance output quality');
    }

    return improvements;
  }
}
```

## 🚀 Production Deployment Best Practices

### 1. **Environment Configuration**

```typescript
// models/agents/config/environment.ts
export const AgentConfig = {
  development: {
    enableMockData: true,
    logLevel: 'debug',
    cacheEnabled: false,
    rateLimiting: false,
  },
  production: {
    enableMockData: false,
    logLevel: 'error',
    cacheEnabled: true,
    rateLimiting: true,
    maxRequestsPerMinute: 100,
  },
};

export function getAgentConfig() {
  return AgentConfig[process.env.NODE_ENV as keyof typeof AgentConfig] || AgentConfig.development;
}
```

### 2. **Rate Limiting**

```typescript
// models/agents/middleware/rateLimiter.ts
export class AgentRateLimiter {
  private static requests: Map<string, number[]> = new Map();

  static async checkLimit(agentId: string, userId: string): Promise<boolean> {
    const key = `${agentId}:${userId}`;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 10;

    const userRequests = this.requests.get(key) || [];

    // Remove old requests outside the window
    const recentRequests = userRequests.filter(
      timestamp => now - timestamp < windowMs
    );

    if (recentRequests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(key, recentRequests);

    return true;
  }
}
```

### 3. **Health Monitoring**

```typescript
// models/agents/monitoring/healthCheck.ts
export class AgentHealthMonitor {
  static async checkAllAgents(): Promise<HealthReport> {
    const agents = AgentRegistry.getAll();
    const results: AgentHealth[] = [];

    for (const agent of agents) {
      try {
        const startTime = Date.now();
        await agent.execute('health-check');
        const responseTime = Date.now() - startTime;

        results.push({
          agentId: agent.id,
          status: 'healthy',
          responseTime,
          lastCheck: new Date(),
        });
      } catch (error) {
        results.push({
          agentId: agent.id,
          status: 'unhealthy',
          error: error.message,
          lastCheck: new Date(),
        });
      }
    }

    return {
      overall: results.every(r => r.status === 'healthy') ? 'healthy' : 'degraded',
      agents: results,
      timestamp: new Date(),
    };
  }
}
```

## 📊 Analytics and Insights

### 1. **Usage Analytics**

```typescript
// Track agent usage patterns
export class AgentAnalytics {
  static async getUsageStats(timeframe: 'day' | 'week' | 'month') {
    const interactions = await this.getInteractions(timeframe);

    return {
      totalRequests: interactions.length,
      uniqueUsers: new Set(interactions.map(i => i.userId)).size,
      mostUsedAgents: this.getMostUsedAgents(interactions),
      averageResponseTime: this.getAverageResponseTime(interactions),
      successRate: this.getSuccessRate(interactions),
      errorPatterns: this.analyzeErrorPatterns(interactions),
    };
  }
}
```

### 2. **Business Intelligence**

```typescript
// Generate insights for business decisions
export class AgentBusinessIntelligence {
  static async generateInsights() {
    const analytics = await AgentAnalytics.getUsageStats('month');

    return {
      userEngagement: this.analyzeUserEngagement(analytics),
      agentPerformance: this.rankAgentPerformance(analytics),
      growthOpportunities: this.identifyGrowthOpportunities(analytics),
      resourceOptimization: this.suggestResourceOptimization(analytics),
    };
  }
}
```

This comprehensive documentation covers the complete agent system architecture, development patterns, training strategies, and production best practices. The system is designed to be scalable, maintainable, and continuously improving through data-driven insights.
