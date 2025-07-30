import { z } from 'zod';
import { ApiClient } from '../base/ApiClient';

/**
 * Schema for token analysis output
 */
const TokenAnalysisSchema = z.object({
  token: z.object({
    symbol: z.string(),
    name: z.string(),
    address: z.string().optional(),
    decimals: z.number().optional(),
  }),
  price: z.object({
    current: z.number(),
    change24h: z.number(),
    change7d: z.number(),
    marketCap: z.number(),
    volume24h: z.number(),
  }),
  technicalAnalysis: z.object({
    trend: z.enum(['bullish', 'bearish', 'neutral']),
    support: z.number(),
    resistance: z.number(),
    rsi: z.number(),
    volatility: z.enum(['low', 'medium', 'high']),
  }),
  fundamentals: z.object({
    totalSupply: z.number().optional(),
    circulatingSupply: z.number().optional(),
    holders: z.number().optional(),
    liquidityScore: z.number(),
  }),
  riskAssessment: z.object({
    riskLevel: z.enum(['low', 'medium', 'high', 'extreme']),
    riskFactors: z.array(z.string()),
    safetyScore: z.number(),
  }),
  recommendation: z.object({
    action: z.enum(['strong_buy', 'buy', 'hold', 'sell', 'strong_sell']),
    confidence: z.number(),
    reasoning: z.string(),
    timeframe: z.enum(['short', 'medium', 'long']),
  }),
  insights: z.array(z.string()),
});

export type TokenAnalysis = z.infer<typeof TokenAnalysisSchema>;

/**
 * Advanced token analysis agent that provides comprehensive DeFi token insights
 * 
 * This agent:
 * 1. Fetches real-time price and market data
 * 2. Performs technical analysis
 * 3. Evaluates fundamental metrics
 * 4. Assesses risk factors
 * 5. Provides actionable recommendations
 */
const tokenAnalysisAgent = ApiClient.define({
  id: 'tokenAnalysisAgent',
  description: 'Provides comprehensive DeFi token analysis with price, technical, and fundamental insights',
  output: TokenAnalysisSchema,
  
  async run(tokenSymbol: string): Promise<TokenAnalysis> {
    // Input validation
    if (!tokenSymbol || tokenSymbol.trim().length === 0) {
      throw new Error('Token symbol is required');
    }
    
    const symbol = tokenSymbol.toUpperCase().trim();
    console.log(`🔍 Analyzing token: ${symbol}`);
    
    try {
      // Fetch market data (using CoinGecko as example)
      const marketData = await this.fetchMarketData(symbol);
      
      // Perform technical analysis
      const technicalAnalysis = await this.performTechnicalAnalysis(marketData);
      
      // Evaluate fundamentals
      const fundamentals = await this.evaluateFundamentals(symbol, marketData);
      
      // Assess risks
      const riskAssessment = await this.assessRisks(symbol, marketData);
      
      // Generate recommendation
      const recommendation = await this.generateRecommendation(
        marketData,
        technicalAnalysis,
        fundamentals,
        riskAssessment
      );
      
      // Generate insights
      const insights = await this.generateInsights(
        symbol,
        marketData,
        technicalAnalysis,
        riskAssessment
      );
      
      return {
        token: {
          symbol,
          name: marketData.name || symbol,
          address: marketData.contract_address,
          decimals: marketData.decimals,
        },
        price: {
          current: marketData.current_price,
          change24h: marketData.price_change_percentage_24h,
          change7d: marketData.price_change_percentage_7d,
          marketCap: marketData.market_cap,
          volume24h: marketData.total_volume,
        },
        technicalAnalysis,
        fundamentals,
        riskAssessment,
        recommendation,
        insights,
      };
      
    } catch (error) {
      console.error(`❌ Token analysis failed for ${symbol}:`, error);
      
      // Return mock data for development/demo purposes
      if (process.env.NODE_ENV === 'development') {
        console.warn(`⚠️ Using mock data for ${symbol}`);
        return this.generateMockAnalysis(symbol);
      }
      
      throw new Error(`Failed to analyze token ${symbol}: ${error.message}`);
    }
  },
  
  /**
   * Fetch market data from external API
   */
  async fetchMarketData(symbol: string) {
    // In production, you would use a real API like CoinGecko
    const apiKey = process.env.COINGECKO_API_KEY;
    
    if (!apiKey) {
      throw new Error('CoinGecko API key not configured');
    }
    
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${symbol.toLowerCase()}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`,
      {
        headers: {
          'accept': 'application/json',
          'x-cg-demo-api-key': apiKey,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.market_data;
  },
  
  /**
   * Perform technical analysis
   */
  async performTechnicalAnalysis(marketData: any) {
    const currentPrice = marketData.current_price.usd;
    const change24h = marketData.price_change_percentage_24h;
    const high24h = marketData.high_24h.usd;
    const low24h = marketData.low_24h.usd;
    
    // Calculate RSI (simplified)
    const rsi = this.calculateRSI(change24h);
    
    // Determine trend
    const trend = change24h > 5 ? 'bullish' : change24h < -5 ? 'bearish' : 'neutral';
    
    // Calculate support and resistance
    const support = low24h * 0.98;
    const resistance = high24h * 1.02;
    
    // Calculate volatility
    const volatility = this.calculateVolatility(high24h, low24h, currentPrice);
    
    return {
      trend,
      support,
      resistance,
      rsi,
      volatility,
    };
  },
  
  /**
   * Evaluate fundamental metrics
   */
  async evaluateFundamentals(symbol: string, marketData: any) {
    const totalSupply = marketData.total_supply;
    const circulatingSupply = marketData.circulating_supply;
    const volume24h = marketData.total_volume.usd;
    const marketCap = marketData.market_cap.usd;
    
    // Calculate liquidity score (simplified)
    const liquidityScore = Math.min((volume24h / marketCap) * 100, 100);
    
    return {
      totalSupply,
      circulatingSupply,
      holders: undefined, // Would need additional API
      liquidityScore,
    };
  },
  
  /**
   * Assess risk factors
   */
  async assessRisks(symbol: string, marketData: any) {
    const riskFactors: string[] = [];
    let riskScore = 0;
    
    // Check volatility
    const change24h = Math.abs(marketData.price_change_percentage_24h);
    if (change24h > 20) {
      riskFactors.push('High price volatility (>20% in 24h)');
      riskScore += 30;
    } else if (change24h > 10) {
      riskFactors.push('Moderate price volatility');
      riskScore += 15;
    }
    
    // Check market cap
    const marketCap = marketData.market_cap.usd;
    if (marketCap < 10000000) { // < $10M
      riskFactors.push('Low market cap (micro-cap risk)');
      riskScore += 25;
    } else if (marketCap < 100000000) { // < $100M
      riskFactors.push('Small market cap');
      riskScore += 10;
    }
    
    // Check liquidity
    const volume24h = marketData.total_volume.usd;
    if (volume24h < marketCap * 0.01) {
      riskFactors.push('Low trading volume');
      riskScore += 20;
    }
    
    // Determine risk level
    const riskLevel = riskScore > 60 ? 'extreme' : 
                     riskScore > 40 ? 'high' : 
                     riskScore > 20 ? 'medium' : 'low';
    
    const safetyScore = Math.max(0, 100 - riskScore);
    
    return {
      riskLevel,
      riskFactors,
      safetyScore,
    };
  },
  
  /**
   * Generate trading recommendation
   */
  async generateRecommendation(marketData: any, technical: any, fundamentals: any, risk: any) {
    let score = 0;
    
    // Technical factors
    if (technical.trend === 'bullish') score += 20;
    if (technical.trend === 'bearish') score -= 20;
    if (technical.rsi < 30) score += 15; // Oversold
    if (technical.rsi > 70) score -= 15; // Overbought
    
    // Fundamental factors
    if (fundamentals.liquidityScore > 50) score += 10;
    if (fundamentals.liquidityScore < 20) score -= 10;
    
    // Risk factors
    if (risk.riskLevel === 'low') score += 15;
    if (risk.riskLevel === 'high') score -= 15;
    if (risk.riskLevel === 'extreme') score -= 30;
    
    // Determine action
    const action = score > 30 ? 'strong_buy' :
                  score > 10 ? 'buy' :
                  score > -10 ? 'hold' :
                  score > -30 ? 'sell' : 'strong_sell';
    
    const confidence = Math.min(Math.abs(score) / 50 * 100, 100);
    
    const reasoning = this.generateReasoning(score, technical, risk);
    
    return {
      action,
      confidence,
      reasoning,
      timeframe: 'medium' as const,
    };
  },
  
  /**
   * Generate actionable insights
   */
  async generateInsights(symbol: string, marketData: any, technical: any, risk: any) {
    const insights: string[] = [];
    
    if (technical.trend === 'bullish' && risk.riskLevel === 'low') {
      insights.push(`${symbol} shows strong bullish momentum with low risk profile`);
    }
    
    if (technical.volatility === 'high') {
      insights.push(`High volatility detected - consider position sizing carefully`);
    }
    
    if (marketData.price_change_percentage_7d > 50) {
      insights.push(`Significant 7-day gain - potential profit-taking opportunity`);
    }
    
    if (risk.safetyScore > 80) {
      insights.push(`High safety score indicates stable fundamentals`);
    }
    
    return insights;
  },
  
  /**
   * Helper methods
   */
  calculateRSI(change24h: number): number {
    // Simplified RSI calculation
    return Math.max(0, Math.min(100, 50 + change24h));
  },
  
  calculateVolatility(high: number, low: number, current: number): 'low' | 'medium' | 'high' {
    const range = ((high - low) / current) * 100;
    return range > 15 ? 'high' : range > 5 ? 'medium' : 'low';
  },
  
  generateReasoning(score: number, technical: any, risk: any): string {
    if (score > 20) {
      return `Strong bullish signals with ${technical.trend} trend and ${risk.riskLevel} risk level`;
    } else if (score < -20) {
      return `Bearish indicators with ${risk.riskLevel} risk profile suggest caution`;
    } else {
      return `Mixed signals suggest holding current position and monitoring closely`;
    }
  },
  
  /**
   * Generate mock data for development
   */
  generateMockAnalysis(symbol: string): TokenAnalysis {
    const mockPrice = 100 + Math.random() * 900;
    const mockChange = (Math.random() - 0.5) * 20;
    
    return {
      token: {
        symbol,
        name: `Mock ${symbol}`,
      },
      price: {
        current: mockPrice,
        change24h: mockChange,
        change7d: mockChange * 1.5,
        marketCap: mockPrice * 1000000,
        volume24h: mockPrice * 50000,
      },
      technicalAnalysis: {
        trend: mockChange > 5 ? 'bullish' : mockChange < -5 ? 'bearish' : 'neutral',
        support: mockPrice * 0.95,
        resistance: mockPrice * 1.05,
        rsi: 30 + Math.random() * 40,
        volatility: 'medium',
      },
      fundamentals: {
        liquidityScore: 50 + Math.random() * 40,
      },
      riskAssessment: {
        riskLevel: 'medium',
        riskFactors: ['Mock data - not real analysis'],
        safetyScore: 60 + Math.random() * 30,
      },
      recommendation: {
        action: 'hold',
        confidence: 70,
        reasoning: 'Mock analysis for development purposes',
        timeframe: 'medium',
      },
      insights: [
        `Mock analysis for ${symbol}`,
        'This is demonstration data only',
      ],
    };
  },
});

export default tokenAnalysisAgent;
