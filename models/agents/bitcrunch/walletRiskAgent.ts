import { z } from 'zod';
import { ApiClient } from '../base/ApiClient';

/**
 * Schema for wallet risk analysis response
 */
const WalletRiskSchema = z.object({
  address: z.string(),
  riskScore: z.number().min(0).max(100),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  flags: z.array(z.string()),
  analysis: z.object({
    transactionCount: z.number(),
    totalValue: z.number(),
    suspiciousActivity: z.boolean(),
    knownScamAssociation: z.boolean(),
    lastActivity: z.string(),
  }),
  recommendations: z.array(z.string()),
});

export type WalletRisk = z.infer<typeof WalletRiskSchema>;

/**
 * Agent that analyzes wallet risk using bitsCrunch API
 * 
 * This agent:
 * 1. Takes a wallet address as input
 * 2. Calls bitsCrunch API for risk analysis
 * 3. Returns structured risk assessment with recommendations
 */
const walletRiskAgent = ApiClient.define({
  id: 'walletRiskAgent',
  description: 'Analyzes wallet risk and safety using bitsCrunch blockchain intelligence',
  output: WalletRiskSchema,
  
  async run(address: string): Promise<WalletRisk> {
    // Get API key from environment
    const apiKey = process.env.BITSCRUNCH_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ bitsCrunch API key not found, using mock data');
      return generateMockWalletRisk(address);
    }
    
    try {
      console.log(`🔍 Analyzing wallet risk for: ${address}`);
      
      // Note: Replace with actual bitsCrunch API endpoint when available
      const response = await fetch(
        `https://api.bitscrunch.com/v1/wallet/risk/${address}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`bitsCrunch API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform bitsCrunch response to our schema
      const walletRisk: WalletRisk = {
        address: address,
        riskScore: data.risk_score || 0,
        riskLevel: determineRiskLevel(data.risk_score || 0),
        flags: data.flags || [],
        analysis: {
          transactionCount: data.transaction_count || 0,
          totalValue: data.total_value || 0,
          suspiciousActivity: data.suspicious_activity || false,
          knownScamAssociation: data.known_scam_association || false,
          lastActivity: data.last_activity || new Date().toISOString(),
        },
        recommendations: generateRecommendations(data.risk_score || 0, data.flags || []),
      };

      console.log(`✅ Wallet risk analysis complete. Risk level: ${walletRisk.riskLevel}`);
      return walletRisk;
      
    } catch (error) {
      console.error('❌ Error analyzing wallet risk:', error);
      
      // Return mock data as fallback
      console.log('🔄 Using mock data for wallet risk analysis');
      return generateMockWalletRisk(address);
    }
  }
});

/**
 * Determine risk level based on risk score
 */
function determineRiskLevel(riskScore: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (riskScore >= 80) return 'CRITICAL';
  if (riskScore >= 60) return 'HIGH';
  if (riskScore >= 30) return 'MEDIUM';
  return 'LOW';
}

/**
 * Generate recommendations based on risk score and flags
 */
function generateRecommendations(riskScore: number, flags: string[]): string[] {
  const recommendations: string[] = [];
  
  if (riskScore >= 80) {
    recommendations.push('🚨 AVOID: This wallet shows critical risk indicators');
    recommendations.push('🛡️ Do not send funds to this address');
    recommendations.push('📞 Report suspicious activity if you\'ve interacted with this wallet');
  } else if (riskScore >= 60) {
    recommendations.push('⚠️ HIGH RISK: Exercise extreme caution');
    recommendations.push('🔍 Verify the legitimacy of any transactions');
    recommendations.push('💰 Consider using small test amounts first');
  } else if (riskScore >= 30) {
    recommendations.push('⚡ MEDIUM RISK: Proceed with caution');
    recommendations.push('🔍 Double-check transaction details');
    recommendations.push('📊 Monitor for unusual activity');
  } else {
    recommendations.push('✅ LOW RISK: Appears to be a normal wallet');
    recommendations.push('🔍 Still verify transaction details');
    recommendations.push('📊 Stay vigilant for any changes');
  }
  
  if (flags.includes('known_scam')) {
    recommendations.push('🚫 This address is associated with known scams');
  }
  
  if (flags.includes('high_volume')) {
    recommendations.push('📈 High transaction volume detected');
  }
  
  return recommendations;
}

/**
 * Generate mock wallet risk data for testing/fallback
 */
function generateMockWalletRisk(address: string): WalletRisk {
  // Generate deterministic mock data based on address
  const hash = address.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const riskScore = Math.abs(hash) % 100;
  const riskLevel = determineRiskLevel(riskScore);
  
  const mockFlags: string[] = [];
  if (riskScore > 70) mockFlags.push('high_risk_pattern');
  if (riskScore > 50) mockFlags.push('unusual_activity');
  if (address.toLowerCase().includes('dead')) mockFlags.push('known_scam');
  
  return {
    address,
    riskScore,
    riskLevel,
    flags: mockFlags,
    analysis: {
      transactionCount: Math.abs(hash) % 1000,
      totalValue: (Math.abs(hash) % 10000) / 100,
      suspiciousActivity: riskScore > 60,
      knownScamAssociation: mockFlags.includes('known_scam'),
      lastActivity: new Date(Date.now() - Math.abs(hash) % 86400000).toISOString(),
    },
    recommendations: generateRecommendations(riskScore, mockFlags),
  };
}

export default walletRiskAgent;
