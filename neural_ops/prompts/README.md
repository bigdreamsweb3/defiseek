# NeuralOps™ Prompts Directory

This directory contains all system prompts and AI instructions used throughout the NeuralOps™ system.

## 📁 Directory Structure

```
prompts/
├── README.md                    # This file
├── index.ts                     # Main export point for all prompts
├── prompts.ts                   # Original system prompts (legacy)
└── ai-agents/                   # AI Agent specific prompts
    └── system-prompts.ts        # All AI agent system prompts
```

## 🧠 AI Agent System Prompts

### `ai-agents/system-prompts.ts`

Contains all system prompts used by different AI agents:

- **`AI_ROUTER_SYSTEM_PROMPT`**: Instructions for the AI Router agent
- **`WALLET_ANALYSIS_PROMPT`**: System prompt for intelligent, adaptive wallet analysis
- **`createWalletAnalysisPrompt`**: Function to generate wallet analysis prompts with dynamic data and suggestions
- **`AI_COORDINATOR_SYSTEM`**: Final response synthesis system prompt (user-focused, no technical details)
- **`createAICoordinatorPrompt`**: Function to generate coordinator prompts with dynamic data

### Usage Example

```typescript
import { 
  AI_ROUTER_SYSTEM_PROMPT, 
  WALLET_ANALYSIS_PROMPT 
} from '@/neural_ops/prompts/ai-agents/system-prompts';

// Use in your AI agent
const result = await generateText({
  model: customModel(model),
  system: AI_ROUTER_SYSTEM_PROMPT,
  prompt: "Your prompt here",
  temperature: 0.1,
});
```

## 🔄 Migration from Hardcoded Prompts

All hardcoded system prompts have been moved to this organized structure:

- **Before**: Prompts were embedded in each agent file
- **After**: Prompts are centralized and reusable
- **Benefits**: Easier maintenance, consistency, reusability

## 📝 Adding New Prompts

1. **Create new prompt constant** in `ai-agents/system-prompts.ts`
2. **Export it** in the `SYSTEM_PROMPTS` object
3. **Import and use** in your agent files
4. **Update this README** with new prompt documentation

## 🎯 Best Practices

- Keep prompts clear and specific
- Use consistent formatting and emojis
- Include JSON schema examples when needed
- Test prompts with different AI models
- Document any special instructions or requirements

## 🏗️ Scalable Agent Architecture

### Agent UI Component Pattern
Each agent should automatically include its UI component data when called:

```typescript
// Individual agents provide their own UI components
export const someAgent = ApiClient.define({
  async run(params): Promise<Data & { uiComponent?: any }> {
    const data = await fetchData(params);
    
    return {
      ...data,
      uiComponent: {
        component: 'SomeTool',
        props: {
          result: { success: true, data: formatForUI(data) },
          toolCallId: `some-tool-${id}`,
          args: { /* args */ }
        }
      }
    };
  }
});

// Coordinating agents collect UI components from sub-agents
export class CoordinatingAgent extends BaseAgentWithUI {
  async execute(query: string): Promise<AgentResponse> {
    // Call sub-agents
    const agent1Result = await agent1.run(params);
    const agent2Result = await agent2.run(params);
    
    // Collect UI components from sub-agents
    const uiComponents = {};
    if (agent1Result.uiComponent) {
      uiComponents.agent1Component = agent1Result.uiComponent as UIComponent;
    }
    if (agent2Result.uiComponent) {
      uiComponents.agent2Component = agent2Result.uiComponent as UIComponent;
    }
    
    // Return response with collected UI components
    const response: AgentResponse = { /* your response */ };
    return this.addUIComponentsToResponse(response, uiComponents);
  }
}
```

### Benefits:
- **🎨 Automatic UI Support**: All agents get UI component capabilities
- **🔧 Standardized Interface**: Consistent response structure across agents
- **📱 Scalable**: Easy to add new agents with UI components
- **🔄 Reusable**: Base class handles all UI component logic

## 🔗 Related Files

- `neural_ops/agents/ai/aiRouterAgent.ts` - Uses AI router prompts
- `neural_ops/agents/ai/walletAnalysisAgent.ts` - Uses wallet analysis prompts and generates UI components
- `neural_ops/agents/base/BaseAgentWithUI.ts` - Base class for agents with UI component support
- `neural_ops/agents/ai/AgentTemplate.ts` - Template for creating new agents with UI support
- `neural_ops/agents/bitcrunch/wallet/walletScoreAgent.ts` - Provides formatted wallet score data
- `neural_ops/agents/bitcrunch/wallet/walletMetricsAgent.ts` - Provides formatted wallet metrics data
- `components/tools-ui/CheckWalletScoreTool.tsx` - UI component for wallet score display
- `components/tools-ui/WalletMetricsTool.tsx` - UI component for wallet metrics display
- `neural_ops/prompts.ts` - Legacy system prompts (maintained for compatibility)
