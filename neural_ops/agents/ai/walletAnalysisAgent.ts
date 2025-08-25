import { customModel } from '../../index';
import { models } from '../../models';
import { generateText } from 'ai';
import walletScoreAgent, { formatWalletScoreForChat, formatWalletScoreForUI } from '../bitcrunch/wallet/walletScoreAgent';

import { createWalletAnalysisPrompt, WALLET_ANALYSIS_PROMPT } from '../../prompts/ai-agents/system-prompts';
import { BaseAgentWithUI, AgentResponse, UIComponent } from '../base/BaseAgentWithUI';

// Wallet Analysis Agent - Specialized agent for comprehensive wallet investigation
export class WalletAnalysisAgent extends BaseAgentWithUI {
  protected agentName = 'WalletAnalysisAgent';
  
  async execute(query: string): Promise<AgentResponse> {
  try {
    console.log(`🔐 WalletAnalysisAgent analyzing: ${query}`);

    // Use the first available model from your models list
    const model = models[0]?.apiIdentifier || 'gemini-1.5-flash-latest';
    console.log(`🤖 Using model: ${model}`);

    // Step 1: Extract wallet address from query
    const addressMatch = query.match(/0x[a-fA-F0-9]{40}/);
    if (!addressMatch) {
      return {
        error: '⚠️ No valid wallet address found in query',
        details: 'Please provide a valid Ethereum wallet address (0x...)',
        timestamp: new Date().toISOString(),
      };
    }

    const walletAddress = addressMatch[0];
    console.log(`🔍 Analyzing wallet: ${walletAddress}`);

    // Step 2: Analyze query to determine what data is needed
    const queryLower = query.toLowerCase();
    
    // Smart query analysis - understand what user actually wants
    const queryIntent = {
      needsScore: queryLower.includes('score') || queryLower.includes('risk') || queryLower.includes('safety') || queryLower.includes('classification') || queryLower.includes('explain') || queryLower.includes('what') || queryLower.includes('how'),
      needsHistory: queryLower.includes('history') || queryLower.includes('pattern') || queryLower.includes('behavior'),
      needsComparison: queryLower.includes('compare') || queryLower.includes('vs') || queryLower.includes('versus'),
      needsPrediction: queryLower.includes('future') || queryLower.includes('trend') || queryLower.includes('prediction')
    };
    
    console.log(`🎯 Query Intent Analysis:`, queryIntent);
    
    const walletData: any = {};
    const suggestions: string[] = [];

    // Always fetch wallet score for any wallet analysis (it's the core data)
    try {
      console.log(`📊 Fetching wallet score...`);
      const rawWalletScore = await walletScoreAgent.execute(walletAddress);
      const formattedScore = formatWalletScoreForChat(rawWalletScore);
      walletData.score = formattedScore;
      walletData.rawScore = rawWalletScore; // Keep raw data for internal use
      
      // UI component is automatically included by the agent
      console.log('🔍 Debug - Wallet Score Response:');
      console.log('  - Has uiComponent property:', 'uiComponent' in rawWalletScore);
      console.log('  - uiComponent value:', (rawWalletScore as any).uiComponent);
      
      if ('uiComponent' in rawWalletScore && (rawWalletScore as any).uiComponent) {
        console.log('✅ Setting wallet score UI component');
        walletData.uiScore = (rawWalletScore as any).uiComponent;
      } else {
        console.log('❌ No UI component in wallet score response');
      }
    } catch (scoreError) {
      console.warn('Wallet score fetch failed:', scoreError);
      const errorMessage = scoreError instanceof Error ? scoreError.message : 'Unknown error';
      
      // Check if it's an API availability issue
      if (errorMessage.includes('502') || errorMessage.includes('Bad Gateway')) {
        walletData.score = { 
          error: 'API temporarily unavailable',
          details: 'The wallet analysis service is currently experiencing issues. Please try again later.',
          retry: true
        };
        suggestions.push('The wallet analysis service is temporarily unavailable. Please try again in a few minutes.');
      } else {
        walletData.score = { 
          error: 'Score unavailable',
          details: 'Unable to fetch wallet score at this time.',
          retry: true
        };
        suggestions.push('Try asking for "wallet risk score" to get detailed safety analysis');
      }
    }

    // Add suggestions based on what we could analyze
    if (queryIntent.needsHistory) {
      suggestions.push('Ask "What are the transaction patterns for this wallet?" for behavior analysis');
    }
    if (queryIntent.needsComparison) {
      suggestions.push('Ask "Compare this wallet with similar wallets" for benchmarking');
    }
    if (queryIntent.needsPrediction) {
      suggestions.push('Ask "What are the risk trends for this wallet?" for predictive analysis');
    }

    // Step 3: Generate comprehensive wallet analysis using AI
    const walletAnalysis = await generateText({
      model: customModel(model),
      system: WALLET_ANALYSIS_PROMPT,   
      prompt: createWalletAnalysisPrompt(query, walletAddress, walletData, suggestions),
      temperature: 0.3,
    });

    const analysis = walletAnalysis.text || '⚠️ Unable to generate wallet analysis';

    // Step 4: Determine if UI components should be included
    // Always include UI components for comprehensive wallet analysis
    const shouldIncludeUI = true;

    // Step 6: Collect UI components from individual agents
    const uiComponents: { [key: string]: UIComponent | { [key: string]: UIComponent } } = {};
    
    // Debug: Log what UI components we have
    console.log('🔍 Debug - UI Components Collection:');
    console.log('  - walletData.uiScore:', !!walletData.uiScore);
    
    // Add wallet score component if available (provided by walletScoreAgent)
    if (walletData.uiScore) {
      console.log('✅ Adding wallet score UI component');
      uiComponents.walletScore = walletData.uiScore as UIComponent;
    } else {
      console.log('❌ No wallet score UI component available');
    }
    
    console.log('🔍 Final UI components collected:', Object.keys(uiComponents));

    // Step 7: Return structured response with UI components
    const response: AgentResponse = {
      query,
      walletAddress,
      walletData,
      analysis,
      timestamp: new Date().toISOString(),
      confidence: 90, // High confidence due to direct API integration
      modelUsed: model,
      dataSources: ['bitsCrunch Wallet Score'],
      suggestions,
    };

    // Add UI components if any are available
    if (Object.keys(uiComponents).length > 0) {
      console.log('🎨 Adding UI components to response using BaseAgentWithUI method');
      const responseWithUI = this.addUIComponentsToResponse(response, uiComponents);
      console.log('🎨 Final response with UI components:', {
        hasUIComponents: !!responseWithUI.uiComponents,
        uiComponentKeys: responseWithUI.uiComponents ? Object.keys(responseWithUI.uiComponents) : []
      });
      return responseWithUI;
    }

    console.log('❌ No UI components to add to response');
    return response;

  } catch (err) {
    console.error('Wallet Analysis Agent error:', err);
    return {
      error: '⚠️ Error running wallet analysis',
      details: err instanceof Error ? err.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}
}

// Create singleton instance
const walletAnalysisAgentInstance = new WalletAnalysisAgent();

// Export the main function for backward compatibility
export async function runWalletAnalysis(query: string) {
  return walletAnalysisAgentInstance.execute(query);
}

// Export default for backward compatibility
export default runWalletAnalysis;
