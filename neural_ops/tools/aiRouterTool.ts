// File: neural_ops/tools/aiRouterTool.ts

// Import the AI Router agent directly to avoid circular dependencies
import { runAIRouter } from '../agents/ai/aiRouterAgent';

export const aiRouterTool = {
  aiRouter: {
    // 👈 tool name key, must match what you list in activeTools
    description:
      'Routes complex blockchain/DeFi queries to specialized modular agents',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: "The user's blockchain query" },
      },
      required: ['query'],
    },
    execute: async ({ query }: { query: string }) => {
      try {
        const result = await runAIRouter(query);
        return {
          success: true,
          comprehensiveResponse: result.comprehensiveResponse,
          routingDecision: result.routingDecision,
          agentsExecuted: result.totalAgentsExecuted,
          executionOrder: result.executionOrder,
          uiComponents: result.uiComponents ?? null,
        };
      } catch (err: any) {
        console.error('Error in AI Router tool:', err);
        return { success: false, error: err.message || 'AI Router failed' };
      }
    },
  },
};

// Export the tool with a specific name
export const aiRouterToolExport = {
  aiRouterTool: aiRouterTool,
};
