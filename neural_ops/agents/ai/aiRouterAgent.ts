// File: neural_ops/agents/ai/aiRouterAgent.ts
// Updated with available agents mapping

import { customModel } from '../../index';
import { models } from '../../models';
import { generateText } from 'ai';
import { runWalletAnalysis } from './walletAnalysisAgent';
import {
  AI_ROUTER_SYSTEM_PROMPT,
  createAICoordinatorPrompt,
  AI_COORDINATOR_SYSTEM,
} from '../../prompts/ai-agents/system-prompts';

// Define available agents
const AVAILABLE_AGENTS = {
  walletAnalysisAgent: runWalletAnalysis,
  // Add more agents here as you implement them
  // 'marketAnalysisAgent': runMarketAnalysis,
  // 'protocolAnalysisAgent': runProtocolAnalysis,
} as const;

export async function runAIRouter(query: string) {
  try {
    console.log(`🧠 AI Router analyzing query: ${query}`);

    const model = models[0]?.apiIdentifier || 'gemini-1.5-flash-latest';
    console.log(`🤖 AI Router using model: ${model}`);

    // Step 1: AI analyzes the query to determine the best routing strategy
    const routingAnalysis = await generateText({
      model: customModel(model),
      system: AI_ROUTER_SYSTEM_PROMPT,
      prompt: `Available agents: ${Object.keys(AVAILABLE_AGENTS).join(', ')}
      
Analyze this query and determine the best routing strategy: "${query}"

Remember: Only use agents from the available list above.`,
      temperature: 0.1,
    });

    const routing = routingAnalysis.text || '{}';
    console.log(`🧠 AI Routing Decision: ${routing}`);

    // Step 2: Parse the routing decision
    let routingDecision;
    try {
      let cleanRouting = routing;
      if (routing.includes('```json')) {
        cleanRouting = routing
          .replace(/```json\n?/g, '')
          .replace(/```/g, '')
          .trim();
      }
      routingDecision = JSON.parse(cleanRouting);
    } catch (parseError) {
      console.warn('Failed to parse AI routing decision, using fallback');
      routingDecision = {
        queryType: 'wallet_analysis',
        requiredAgents: ['walletAnalysisAgent'], // Default to available agent for wallet queries
        priority: 'medium',
        confidence: 70,
        reasoning:
          'Fallback routing due to parsing error - using wallet analysis for wallet-related query',
      };
    }

    // Step 2.5: Filter out unavailable agents
    const validAgents =
      routingDecision.requiredAgents?.filter(
        (agentId: string) => agentId in AVAILABLE_AGENTS
      ) || [];

    if (routingDecision.requiredAgents?.length > validAgents.length) {
      const invalidAgents = routingDecision.requiredAgents.filter(
        (agentId: string) => !(agentId in AVAILABLE_AGENTS)
      );
      console.warn(
        `⚠️ Filtered out unavailable agents: ${invalidAgents.join(', ')}`
      );
    }

    // Update routing decision with valid agents only
    routingDecision.requiredAgents = validAgents;
    console.log(`🎯 Final Routing Decision:`, routingDecision);

    // Step 3: Execute the available agents
    const agentResults: any = {};
    const executionOrder: string[] = [];

    for (const agentId of validAgents) {
      try {
        console.log(`🚀 Executing agent: ${agentId}`);

        if (agentId in AVAILABLE_AGENTS) {
          const agentFunction =
            AVAILABLE_AGENTS[agentId as keyof typeof AVAILABLE_AGENTS];
          agentResults[agentId] = await agentFunction(query);
          executionOrder.push(agentId);
        } else {
          console.warn(`⚠️ Agent ${agentId} not found in available agents`);
          agentResults[agentId] = {
            status: 'unavailable',
            message: `Agent ${agentId} is not yet implemented`,
            timestamp: new Date().toISOString(),
          };
        }
      } catch (error) {
        console.error(`❌ Error executing agent ${agentId}:`, error);
        agentResults[agentId] = {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        };
      }
    }

    // Step 4: Generate comprehensive response
    const summaryResponse = await generateText({
      model: customModel(model),
      system: AI_COORDINATOR_SYSTEM,
      prompt: createAICoordinatorPrompt(
        query,
        routingDecision,
        agentResults,
        executionOrder
      ),
      temperature: 0.3,
    });

    // Step 5: Return results optimized for streaming
    return {
      success: true,
      originalQuery: query,
      routingDecision,
      agentResults,
      executionOrder,
      comprehensiveResponse: summaryResponse.text,
      timestamp: new Date().toISOString(),
      modelUsed: model,
      totalAgentsExecuted: executionOrder.length,
    };
  } catch (err) {
    console.error('❌ AI Router error:', err);
    return {
      success: false,
      error: 'AI routing system error',
      details: err instanceof Error ? err.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      fallbackResponse: `I'm having trouble analyzing your query right now. Please try rephrasing or ask a simpler question.`,
    };
  }
}

export default runAIRouter;
