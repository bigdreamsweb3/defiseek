/**
 * Test file for the NeuralOps™ AI Decision-Making System
 * Run with: npx tsx neural_ops/agents/test-ai-system.ts
 */

import { runAIRouter, runRiskDetection } from './index';

async function testAISystem() {
  console.log('🧠 Testing NeuralOps™ AI Decision-Making System\n');

  const testQueries = [
    "Is staking in Lido safe?",
    "What's the risk level of this wallet: 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "Should I invest in this DeFi protocol?",
    "What are the risks of yield farming?",
    "Is this NFT collection worth buying?",
    "Hello, how are you today?",
    "What is blockchain?",
    "Tell me about DeFi",
    "How do smart contracts work?"
  ];

  for (const query of testQueries) {
    console.log(`\n🔍 Testing Query: "${query}"`);
    console.log('─'.repeat(50));

    try {
      // Test AI Router
      console.log('🧠 AI Router Analysis:');
      const routerResult = await runAIRouter(query);
      
      if (routerResult.error) {
        console.log(`❌ AI Router Error: ${routerResult.error}`);
      } else {
        console.log(`✅ Query Type: ${routerResult.routingDecision.queryType}`);
        console.log(`✅ Priority: ${routerResult.routingDecision.priority}`);
        console.log(`✅ Confidence: ${routerResult.routingDecision.confidence}%`);
        console.log(`✅ Agents Executed: ${routerResult.totalAgentsExecuted}`);
        console.log(`✅ Execution Order: ${routerResult.executionOrder.join(' → ')}`);
        
        console.log('\n📊 Comprehensive Response:');
        console.log(routerResult.comprehensiveResponse);
      }

    } catch (error) {
      console.error(`❌ Test failed for query "${query}":`, error);
    }

    console.log('\n' + '─'.repeat(50));
  }

  // Test individual risk detection agent
  console.log('\n🔒 Testing Risk Detection Agent Directly:');
  console.log('─'.repeat(50));
  
  try {
    const riskResult = await runRiskDetection("Is staking in Uniswap safe?");
    
    if (riskResult.error) {
      console.log(`❌ Risk Detection Error: ${riskResult.error}`);
    } else {
      console.log(`✅ Analysis Type: ${riskResult.analysisType}`);
      console.log(`✅ Entities: ${riskResult.entities.join(', ')}`);
      console.log(`✅ Confidence: ${riskResult.confidence}%`);
      console.log(`✅ Model Used: ${riskResult.modelUsed}`);
      
      console.log('\n📊 Risk Analysis:');
      console.log(riskResult.riskAnalysis);
    }
  } catch (error) {
    console.error('❌ Risk Detection test failed:', error);
  }

  console.log('\n🎯 AI System Test Complete!');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testAISystem().catch(console.error);
}

export { testAISystem };
