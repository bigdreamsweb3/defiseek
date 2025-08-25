import { z } from 'zod';
import { ApiClient } from '../../base/ApiClient';

const WalletScoreSchema = z.object({
  wallet_address: z.string(),
  classification: z.string(),
  classification_type: z.string(),

  anomalous_pattern_score: z.number(),
  associated_token_score: z.number(),
  risk_interaction_score: z.number(),
  wallet_age_score: z.number(),
  smart_contract_interaction_score: z.number(),
  staking_governance_interaction_score: z.number(),
  centralized_interaction_score: z.number(),
  wallet_score: z.number(),
  volume_score: z.number(),
  frequency_score: z.number(),

  illicit: z.union([z.string(), z.array(z.unknown())]).optional(),
  blockchain_with_illicit: z.string().optional(),
  blockchain_without_illicit: z.string().optional(),
});

export type WalletScore = z.infer<typeof WalletScoreSchema>;

export const walletScoreAgent = ApiClient.define({
  id: 'walletScoreAgent',
  description: 'Fetches wallet score data from UnleashNFTs bitsCrunch API',
  output: WalletScoreSchema,

  async run(address: string): Promise<WalletScore & { uiComponent?: any }> {
    const apiKey = process.env.UNLEASHNFTS_API_KEY;

    if (!address) {
      throw new Error('⚠️ No wallet address provided to walletScoreAgent.');
    }

    if (!apiKey) {
      throw new Error('⚠️ UNLEASHNFTS_API_KEY not found in environment variables.');
    }

    const url = `https://api.unleashnfts.com/api/v2/wallet/score?wallet_address=${address}&time_range=all&offset=0&limit=100`;

    const headers: HeadersInit = {
      accept: 'application/json',
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    };

    console.log(`🌐 Fetching wallet score from: ${url}`);
    console.log(`🔑 Using API key: ${apiKey.slice(0, 6)}...`);

    try {
      const response = await fetch(url, { method: 'GET', headers });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`❌ API error: ${response.status} – ${errText}`);
      }

      const data = await response.json();
      const walletScore = data?.data?.[0];

      if (!walletScore) {
        throw new Error(`⚠️ No wallet score found for address: ${address}`);
      }

      console.log('🧾 Raw wallet score response:', walletScore);

      const parsedScore = WalletScoreSchema.parse(walletScore);
      
      // Automatically include UI component data
      const uiComponent = {
        component: 'CheckWalletScoreTool',
        props: {
          result: {
            success: true,
            data: formatWalletScoreForUI(parsedScore)
          },
          toolCallId: `wallet-score-${address}`,
          args: { address }
        }
      };
      
      console.log('🎨 WalletScoreAgent returning UI component:', uiComponent);
      
      return {
        ...parsedScore,
        uiComponent
      };
    } catch (error) {
      console.error('❌ Error in walletScoreAgent:', error);
      throw new Error(`walletScoreAgent failed for address: ${address}`);
    }
  },
});

// Helper function to format wallet score for UI display
export function formatWalletScoreForUI(walletScore: WalletScore) {
  const { 
    classification, 
    wallet_score, 
    risk_interaction_score, 
    anomalous_pattern_score, 
    smart_contract_interaction_score,
    wallet_age_score,
    volume_score,
    frequency_score,
    centralized_interaction_score,
    staking_governance_interaction_score,
    associated_token_score,
    illicit,
    blockchain_with_illicit,
    blockchain_without_illicit
  } = walletScore;
  
  // Get color classes for UI components
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-500';
    if (score >= 40) return 'text-yellow-500';
    if (score >= 20) return 'text-blue-500';
    return 'text-green-600';
  };

  const getClassificationColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-500';
    if (score >= 40) return 'text-yellow-500';
    if (score >= 20) return 'text-blue-500';
    return 'text-green-600';
  };

  return {
    // Main score display
    walletScore: wallet_score,
    classification: classification,
    classificationColor: getClassificationColor(wallet_score),
    
    // Risk scores for UI grid
    riskScores: {
      walletAgeScore: wallet_age_score,
      riskInteractionScore: risk_interaction_score,
      frequencyScore: frequency_score,
      centralizedInteraction: centralized_interaction_score,
      smartContractInteractionScore: smart_contract_interaction_score,
      volumeScore: volume_score
    },
    
    // Additional data for UI
    blockchainWithoutIllicit: blockchain_without_illicit,
    illicitFlags: illicit,
    
    // Success status for UI
    success: true,
    
    // Raw data for internal use
    rawData: walletScore
  };
}

// Helper function to format wallet score for chat display
export function formatWalletScoreForChat(walletScore: WalletScore) {
  const { classification, wallet_score, risk_interaction_score, anomalous_pattern_score, smart_contract_interaction_score } = walletScore;
  
  // Convert technical scores to user-friendly descriptions
  const getRiskLevel = (score: number) => {
    if (score >= 80) return 'Very High Risk';
    if (score >= 60) return 'High Risk';
    if (score >= 40) return 'Medium Risk';
    if (score >= 20) return 'Low Risk';
    return 'Very Low Risk';
  };

  const getInteractionRisk = (score: number) => {
    if (score >= 80) return '🚨 Extremely High Risk';
    if (score >= 60) return '⚠️ High Risk';
    if (score >= 40) return '🔶 Medium Risk';
    if (score >= 20) return '🟡 Low Risk';
    return '🟢 Very Low Risk';
  };

  const getAnomalyLevel = (score: number) => {
    if (score >= 80) return '🚨 Highly Suspicious';
    if (score >= 60) return '⚠️ Suspicious';
    if (score >= 40) return '🔶 Some Concerns';
    if (score >= 20) return '🟡 Minor Concerns';
    return '🟢 Normal Behavior';
  };

  return {
    // User-friendly summary
    summary: {
      overallScore: wallet_score,
      classification: classification,
      riskLevel: getRiskLevel(wallet_score),
      confidence: 'High' // Based on comprehensive data
    },
    
    // Key risk factors in plain language
    riskFactors: {
      interactionRisk: getInteractionRisk(risk_interaction_score),
      anomalyLevel: getAnomalyLevel(anomalous_pattern_score),
      smartContractRisk: smart_contract_interaction_score < 10 ? '🟢 Low Risk' : '🔶 Moderate Risk'
    },
    
    // Actionable insights
    insights: {
      primary: risk_interaction_score > 50 ? 
        'This wallet has interacted with high-risk entities. Further investigation recommended.' :
        'This wallet shows normal risk patterns for DeFi usage.',
      secondary: anomalous_pattern_score > 50 ?
        'Unusual transaction patterns detected. Monitor for suspicious activity.' :
        'Transaction patterns appear normal and consistent.',
      recommendation: wallet_score < 40 ? 
        'Consider this wallet safe for interactions.' :
        wallet_score < 60 ? 
        'Exercise caution and verify before significant transactions.' :
        'High risk - avoid interactions until further investigation.'
    },
    
    // Raw data (for internal use only)
    rawData: walletScore
  };
}

export default walletScoreAgent;
