# NeuralOps™ AI Decision-Making System

## Overview

The NeuralOps™ AI Decision-Making System is an intelligent routing framework that analyzes user queries and automatically determines which specialized agents should be called to provide comprehensive responses.

## Architecture

```
User Query → AI Router → Specialized Agents → Comprehensive Response
     ↓           ↓           ↓                    ↓
"Is staking   AI analyzes   Risk Detection    Integrated
 in XYZ       query and     Agent              analysis with
 safe?"       routes to     +                  recommendations
              appropriate   Wallet Analysis    and safety
              agents        Agent              scores
```

## Components

### 1. AI Router Agent (`aiRouterAgent.ts`)

The "AI Brain" that:

- Analyzes incoming queries using AI models
- Determines query type and required analysis
- Routes queries to appropriate specialized agents
- Coordinates multiple agent responses
- Synthesizes results into comprehensive answers

**Query Types Detected:**

- `risk_analysis`: Safety, security, risk assessment
- `market_analysis`: Price trends, market data
- `wallet_analysis`: Wallet investigation, transactions
- `protocol_analysis`: DeFi protocol information
- `nft_analysis`: NFT market data, rarity
- `general_info`: General blockchain questions

### 2. Risk Detection Agent (`riskDetectionAgent.ts`)

Specialized agent for:

- Staking safety analysis
- Protocol risk assessment
- **Wallet security evaluation** 🆕
- Token risk analysis
- Smart contract auditing

**Features:**

- AI-powered query interpretation
- Multi-dimensional risk scoring
- Actionable recommendations
- Safety scores (0-100)
- Risk levels (LOW/MEDIUM/HIGH/CRITICAL)
- **Wallet analysis integration** with bitsCrunch API
- **Multi-blockchain support** (Ethereum, Polygon)

## How It Works

### Example: "Is staking in XYZ safe?"

1. **Query Analysis**: AI Router analyzes the query

   ```json
   {
     "queryType": "risk_analysis",
     "requiredAgents": ["riskDetectionAgent", "protocolAnalysisAgent"],
     "priority": "high",
     "confidence": 95,
     "reasoning": "Query directly asks about staking safety"
   }
   ```

2. **Agent Execution**: Specialized agents run

   - **Risk Detection Agent**: Analyzes staking protocol, checks smart contract security, evaluates liquidity risks, generates safety score
   - **Protocol Analysis Agent**: Provides protocol-specific information, TVL data, audit status, team reputation

3. **Response Synthesis**: AI Router combines results
   - Integrates all agent findings
   - Provides comprehensive analysis
   - Offers actionable recommendations
   - Delivers structured risk assessment with safety scores

### Example: "Is wallet 0x604271D00E99EB218b29AA24714d05cec83984a6 safe?" 🆕

1. **Query Analysis**: AI Router analyzes the query

   ```json
   {
     "queryType": "risk_analysis",
     "requiredAgents": ["riskDetectionAgent"],
     "priority": "high",
     "confidence": 90,
     "reasoning": "Query asks about wallet safety"
   }
   ```

2. **Agent Execution**: Risk Detection Agent runs

   - **Wallet Score Analysis**: Retrieves comprehensive wallet score from bitsCrunch API
   - **Risk Pattern Detection**: Analyzes anomalous patterns, illicit interactions, smart contract usage
   - **Multi-blockchain Analysis**: Checks wallet activity across Ethereum and Polygon
   - **Transaction History**: Evaluates inflow/outflow patterns, volume analysis

3. **Response Synthesis**: AI Router provides comprehensive wallet safety assessment
   - Wallet classification and risk scores
   - Anomalous pattern detection
   - Transaction behavior analysis
   - Clear safety recommendations

## Integration with Chat System

The system intelligently routes ALL queries through the AI router:

- **Universal Routing**: Every query goes through AI analysis for optimal handling
- **Smart Agent Selection**: AI determines which specialized agents (if any) are needed
- **Fallback**: Regular model processing if AI routing fails
- **Seamless**: Users don't need to specify which analysis they want

## Available Models

The system uses your configured models:

- Gemini 1.5 Flash (default)
- DeepSeek Chat
- DeepSeek Coder
- GPT-4o Mini

## Future Agents

Framework ready for:

- `walletAnalysisAgent`: Wallet investigation
- `marketAnalysisAgent`: Market trends and analysis
- `protocolAnalysisAgent`: DeFi protocol insights
- `nftAnalysisAgent`: NFT market analysis

## Usage

```typescript
import { runAIRouter, runRiskDetection } from '@/neural_ops/agents';

// Use AI Router for intelligent query handling
const result = await runAIRouter('Is staking in XYZ safe?');

// Or use specific agents directly
const riskAnalysis = await runRiskDetection('Analyze this protocol');
```

## Benefits

1. **Intelligent Routing**: Automatically determines best analysis approach
2. **Comprehensive Coverage**: Multiple specialized perspectives on each query
3. **Scalable**: Easy to add new specialized agents
4. **User-Friendly**: No need to specify analysis type
5. **Fallback Safe**: Gracefully handles failures and errors

## Example Output

```markdown
🚨 RISK ASSESSMENT:

- Risk Level: MEDIUM
- Safety Score: 75/100
- Confidence: 85%

📊 RISK FACTORS:

- Smart Contract Security: HIGH - No recent audits found
- Liquidity Risk: MEDIUM - $1.2M TVL, moderate depth
- Protocol Reputation: LOW - Established team, good track record

💡 RECOMMENDATIONS:

- Research the protocol thoroughly before staking
- Start with small amounts to test the system
- Monitor for any security incidents

📝 SUMMARY:
Staking in XYZ presents MEDIUM risk with a safety score of 75/100.
Key concerns include smart contract security and liquidity.
Consider starting small and monitoring closely.
```
