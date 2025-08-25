import { customModel } from '../../index';
import { models } from '../../models';
import { generateText } from 'ai';
import walletScoreAgent from '../bitcrunch/wallet/walletScoreAgent';
import walletMetricsAgent from '../bitcrunch/wallet/walletMetricsAgent';
import { erc20TokenAgent } from '../bitcrunch/wallet/erc20TokenAgent';

import {
  AI_ROUTER_SYSTEM_PROMPT,
  createWalletAnalysisPrompt,
  WALLET_ANALYSIS_PROMPT,
} from '../../prompts/ai-agents/system-prompts';

export interface AgentResponse {
  query: string;
  walletAddress?: string;
  walletData?: any;
  analysis?: string;
  timestamp: string;
  confidence?: number;
  modelUsed?: string;
  dataSources?: string[];
  suggestions?: string[];
  error?: string;
  details?: string;
}

// Registry of available agents (the sub-agents that do the actual work)
const AVAILABLE_AGENTS = [
  walletScoreAgent,
  walletMetricsAgent,
  erc20TokenAgent,
];

export class WalletAnalysisAgent {
  protected agentName = 'WalletAnalysisAgent';

  async execute(query: string): Promise<AgentResponse> {
    try {
      console.log(`🔐 WalletAnalysisAgent analyzing: ${query}`);

      const model = models[0]?.apiIdentifier || 'gemini-1.5-flash-latest';
      console.log(`🤖 Using model: ${model}`);

      // Step 1: Extract wallet address
      const addressMatch = query.match(/0x[a-fA-F0-9]{40}/);
      if (!addressMatch) {
        return {
          query,
          error: '⚠️ No valid wallet address found in query',
          details: 'Please provide a valid Ethereum wallet address (0x...)',
          timestamp: new Date().toISOString(),
        };
      }
      const walletAddress = addressMatch[0];
      console.log(`🔍 Analyzing wallet: ${walletAddress}`);

      // Step 2: AI decision on which SUB-AGENTS to run
      const agentDescriptions = AVAILABLE_AGENTS.map(
        (a) => `- ${a.id}: ${a.description}`
      ).join('\n');

      const router = await generateText({
        model: customModel(model),
        system: AI_ROUTER_SYSTEM_PROMPT,
        prompt: `User query: "${query}" 
        
Available SUB-AGENTS for wallet analysis:
${agentDescriptions}

Return ONLY a JSON array of SUB-AGENT IDs that should be run, e.g. ["walletScoreAgent", "walletMetricsAgent"]
DO NOT include "walletAnalysisAgent" as it is the main coordinator agent.`,
        temperature: 0,
      });

      let selectedAgents: string[] = [];
      try {
        // Clean the response - remove markdown formatting if present
        let cleanedResponse = router.text || '[]';

        // Remove markdown code blocks
        cleanedResponse = cleanedResponse
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();

        console.log(`🧠 Raw router response: ${cleanedResponse}`);

        // Handle both array and object responses from the AI router
        const routerResponse = JSON.parse(cleanedResponse);

        // Check if the response is an object with requiredAgents property
        if (routerResponse && typeof routerResponse === 'object') {
          if (Array.isArray(routerResponse.requiredAgents)) {
            selectedAgents = routerResponse.requiredAgents;
          } else if (routerResponse.requiredAgents) {
            selectedAgents = [routerResponse.requiredAgents];
          } else if (Array.isArray(routerResponse)) {
            selectedAgents = routerResponse;
          }
        }
        // Check if it's already an array
        else if (Array.isArray(routerResponse)) {
          selectedAgents = routerResponse;
        }

        // Filter out walletAnalysisAgent if it was mistakenly included
        selectedAgents = selectedAgents.filter(
          (agentId) =>
            agentId !== 'walletAnalysisAgent' &&
            AVAILABLE_AGENTS.some((a) => a.id === agentId)
        );

        // If no valid agents selected, default to all
        if (selectedAgents.length === 0) {
          selectedAgents = AVAILABLE_AGENTS.map((a) => a.id);
        }

        console.log(
          `🧠 Selected SUB-AGENTS: ${JSON.stringify(selectedAgents)}`
        );
      } catch (parseError) {
        console.warn(
          '⚠️ Could not parse agent selection, defaulting to all sub-agents',
          parseError,
          'Raw response:',
          router.text
        );
        selectedAgents = AVAILABLE_AGENTS.map((a) => a.id);
      }

      // Step 3: Run selected SUB-AGENTS
      const walletData: Record<string, any> = {};
      const dataSources: string[] = [];

      for (const agent of AVAILABLE_AGENTS) {
        if (selectedAgents.includes(agent.id)) {
          try {
            console.log(`🚀 Running sub-agent: ${agent.id}`);
            const result = await agent.run(walletAddress);
            walletData[agent.id] = result;
            dataSources.push(agent.description);
            console.log(`✅ Sub-agent ${agent.id} completed successfully`);
          } catch (err) {
            console.error(`❌ Error running sub-agent ${agent.id}:`, err);
          }
        }
      }

      // Step 4: Suggestions
      const suggestions = [
        'Consider diversifying assets',
        'Review transaction history for anomalies',
      ];

      // Step 5: Generate summary analysis
      const analysisGen = await generateText({
        model: customModel(model),
        system: WALLET_ANALYSIS_PROMPT,
        prompt: createWalletAnalysisPrompt(
          query,
          walletAddress,
          walletData,
          suggestions
        ),
        temperature: 0.3,
      });

      const analysis =
        analysisGen.text || '⚠️ Unable to generate wallet analysis';

      // Step 6: Return structured response
      return {
        query,
        walletAddress,
        walletData,
        analysis,
        timestamp: new Date().toISOString(),
        confidence: 90,
        modelUsed: model,
        dataSources,
        suggestions,
      };
    } catch (err) {
      console.error('Wallet Analysis Agent error:', err);
      return {
        query,
        error: '⚠️ Error running wallet analysis',
        details: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// Singleton
const walletAnalysisAgentInstance = new WalletAnalysisAgent();

export async function runWalletAnalysis(query: string) {
  console.log(`Wallet Analysis Agent query: ${query}`);
  return walletAnalysisAgentInstance.execute(query);
}

export default runWalletAnalysis;
