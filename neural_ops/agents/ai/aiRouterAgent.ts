// Updated AI Router Agent with better streaming integration
// File: neural_ops/agents/ai/aiRouterAgent.ts

import { customModel } from '../../index';
import { models } from '../../models';
import { generateText } from 'ai';
import { runWalletAnalysis } from './walletAnalysisAgent';
import {
  AI_ROUTER_SYSTEM_PROMPT,
  createAICoordinatorPrompt,
  AI_COORDINATOR_SYSTEM,
} from '../../prompts/ai-agents/system-prompts';

export async function runAIRouter(query: string) {
  try {
    console.log(`🧠 AI Router analyzing query: ${query}`);

    const model = models[0]?.apiIdentifier || 'gemini-1.5-flash-latest';
    console.log(`🤖 AI Router using model: ${model}`);

    // Step 1: AI analyzes the query to determine the best routing strategy
    const routingAnalysis = await generateText({
      model: customModel(model),
      system: AI_ROUTER_SYSTEM_PROMPT,
      prompt: `Analyze this query and determine the best routing strategy: "${query}"`,
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
        queryType: 'general_info',
        requiredAgents: [],
        priority: 'medium',
        confidence: 70,
        reasoning: 'Fallback routing due to parsing error',
      };
    }

    console.log(`🎯 Routing Decision:`, routingDecision);

    // Step 3: Execute the required agents
    const agentResults: any = {};
    const executionOrder: string[] = [];

    for (const agentId of routingDecision.requiredAgents) {
      try {
        console.log(`🚀 Executing agent: ${agentId}`);

        switch (agentId) {
          case 'walletAnalysisAgent':
            agentResults.walletAnalysis = await runWalletAnalysis(query);
            executionOrder.push('walletAnalysisAgent');
            break;

          // Add other agents here...
          default:
            console.warn(`Unknown agent: ${agentId}`);
            agentResults[agentId] = {
              status: 'unknown_agent',
              message: `Agent ${agentId} not recognized`,
              timestamp: new Date().toISOString(),
            };
        }
      } catch (error) {
        console.error(`Error executing agent ${agentId}:`, error);
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
      prompt: createAICoordinatorPrompt(query, routingDecision, agentResults, executionOrder),
      temperature: 0.3,
    });

    // Step 5: Collect UI components
    const uiComponents: any = {};
    for (const [agentName, result] of Object.entries(agentResults)) {
      if (result && typeof result === 'object' && 'uiComponents' in result && result.uiComponents) {
        uiComponents[agentName] = result.uiComponents;
      }
    }

    // Step 6: Return results optimized for streaming
    return {
      success: true,
      originalQuery: query,
      routingDecision,
      agentResults,
      executionOrder,
      comprehensiveResponse: summaryResponse.text,
      uiComponents: Object.keys(uiComponents).length > 0 ? uiComponents : undefined,
      timestamp: new Date().toISOString(),
      modelUsed: model,
      totalAgentsExecuted: executionOrder.length,
    };
  } catch (err) {
    console.error('AI Router error:', err);
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