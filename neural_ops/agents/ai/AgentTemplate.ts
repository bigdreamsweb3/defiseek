// Template for creating new agents with UI component support
// Copy this template and modify for your specific agent

import { BaseAgentWithUI, AgentResponse, UIComponent } from '../base/BaseAgentWithUI';
import { customModel } from '../../index';
import { models } from '../../models';
import { generateText } from 'ai';

export class ExampleAgent extends BaseAgentWithUI {
  protected agentName = 'ExampleAgent';
  
  async execute(query: string): Promise<AgentResponse> {
    try {
      console.log(`🔍 ${this.agentName} analyzing: ${query}`);
      
      // Step 1: Your agent logic here
      const model = models[0]?.apiIdentifier || 'gemini-1.5-flash-latest';
      
      // Step 2: Process the query and get data
      const data = await this.processQuery(query);
      
      // Step 3: Generate AI analysis
      const analysis = await generateText({
        model: customModel(model),
        system: 'Your system prompt here',
        prompt: `Query: "${query}"\nData: ${JSON.stringify(data, null, 2)}`,
        temperature: 0.3,
      });
      
      // Step 4: Collect UI components from individual agents
      const uiComponents: { [key: string]: UIComponent | { [key: string]: UIComponent } } = {};
      
      // Example: Collect UI components from sub-agents
      // Each agent should provide its own UI component data
      if (data.someAgent && data.someAgent.uiComponent) {
        uiComponents.someComponent = data.someAgent.uiComponent as UIComponent;
      }
      
      // Step 5: Create response
      const response: AgentResponse = {
        query,
        analysis: analysis.text || 'Unable to generate analysis',
        timestamp: new Date().toISOString(),
        confidence: 85,
        modelUsed: model,
        dataSources: ['Your data sources'],
        suggestions: ['Suggestion 1', 'Suggestion 2'],
      };
      
      // Step 6: Add UI components if any are available
      if (Object.keys(uiComponents).length > 0) {
        return this.addUIComponentsToResponse(response, uiComponents);
      }
      
      return response;
      
    } catch (err) {
      console.error(`${this.agentName} error:`, err);
      return {
        error: `⚠️ Error running ${this.agentName}`,
        details: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }
  
  private async processQuery(query: string): Promise<any> {
    // Your data processing logic here
    return {
      someRelevantData: { example: 'data' },
      // ... other data
    };
  }
}

// Create singleton instance
const exampleAgentInstance = new ExampleAgent();

// Export the main function
export async function runExampleAgent(query: string) {
  return exampleAgentInstance.execute(query);
}

// Export default
export default runExampleAgent;
