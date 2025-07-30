import { z } from 'zod';
import { ApiClient, AgentRegistry } from '../base/ApiClient';

/**
 * Helper utilities for creating and managing agents
 */

/**
 * Quick agent creator for simple use cases
 */
export function createSimpleAgent<TOutput>(config: {
  id: string;
  description: string;
  outputSchema: z.ZodSchema<TOutput>;
  handler: (...args: any[]) => Promise<TOutput>;
}) {
  return ApiClient.define({
    id: config.id,
    description: config.description,
    output: config.outputSchema,
    run: config.handler,
  });
}

/**
 * Agent execution with error handling and logging
 */
export async function executeAgentSafely<TOutput>(
  agentId: string,
  ...args: any[]
): Promise<{ success: boolean; data?: TOutput; error?: string }> {
  try {
    console.log(`🤖 Executing agent: ${agentId}`);
    const startTime = Date.now();
    
    const result = await AgentRegistry.execute<TOutput>(agentId, ...args);
    
    const executionTime = Date.now() - startTime;
    console.log(`✅ Agent ${agentId} completed in ${executionTime}ms`);
    
    return { success: true, data: result };
  } catch (error) {
    console.error(`❌ Agent ${agentId} failed:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Batch execute multiple agents in parallel
 */
export async function executeAgentsBatch(
  requests: Array<{ agentId: string; args: any[] }>
): Promise<Array<{ agentId: string; success: boolean; data?: any; error?: string }>> {
  const promises = requests.map(async (request) => {
    const result = await executeAgentSafely(request.agentId, ...request.args);
    return {
      agentId: request.agentId,
      ...result,
    };
  });
  
  return Promise.all(promises);
}

/**
 * Agent performance monitoring
 */
export class AgentPerformanceMonitor {
  private static metrics = new Map<string, AgentMetrics>();
  
  static recordExecution(agentId: string, executionTime: number, success: boolean) {
    const existing = this.metrics.get(agentId) || {
      totalExecutions: 0,
      successfulExecutions: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      successRate: 0,
    };
    
    existing.totalExecutions++;
    existing.totalExecutionTime += executionTime;
    existing.averageExecutionTime = existing.totalExecutionTime / existing.totalExecutions;
    
    if (success) {
      existing.successfulExecutions++;
    }
    
    existing.successRate = existing.successfulExecutions / existing.totalExecutions;
    
    this.metrics.set(agentId, existing);
  }
  
  static getMetrics(agentId: string): AgentMetrics | undefined {
    return this.metrics.get(agentId);
  }
  
  static getAllMetrics(): Map<string, AgentMetrics> {
    return new Map(this.metrics);
  }
}

interface AgentMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  totalExecutionTime: number;
  averageExecutionTime: number;
  successRate: number;
}

/**
 * Agent registry helpers
 */
export class AgentRegistryHelpers {
  /**
   * Get all agents with their metadata
   */
  static getAgentList() {
    return AgentRegistry.getAll().map(agent => ({
      id: agent.id,
      description: agent.description,
      metrics: AgentPerformanceMonitor.getMetrics(agent.id),
    }));
  }
  
  /**
   * Check if an agent exists
   */
  static hasAgent(agentId: string): boolean {
    return AgentRegistry.get(agentId) !== undefined;
  }
  
  /**
   * Get agent by ID with type safety
   */
  static getAgent<TOutput>(agentId: string) {
    return AgentRegistry.get<TOutput>(agentId);
  }
}

/**
 * Common validation schemas for agents
 */
export const CommonSchemas = {
  // Basic response with success/error
  BasicResponse: z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.any().optional(),
    error: z.string().optional(),
  }),
  
  // Price data
  PriceData: z.object({
    symbol: z.string(),
    price: z.number(),
    change24h: z.number(),
    volume: z.number(),
    marketCap: z.number(),
  }),
  
  // Address validation
  AddressValidation: z.object({
    address: z.string(),
    isValid: z.boolean(),
    format: z.enum(['ethereum', 'bitcoin', 'solana', 'unknown']),
    checksumValid: z.boolean().optional(),
  }),
  
  // Risk assessment
  RiskAssessment: z.object({
    riskLevel: z.enum(['low', 'medium', 'high', 'extreme']),
    riskScore: z.number().min(0).max(100),
    factors: z.array(z.string()),
    recommendation: z.string(),
  }),
};

/**
 * Agent template generators
 */
export class AgentTemplates {
  /**
   * Create a price fetching agent
   */
  static createPriceAgent(config: {
    id: string;
    description: string;
    apiEndpoint: string;
    apiKey?: string;
  }) {
    return createSimpleAgent({
      id: config.id,
      description: config.description,
      outputSchema: CommonSchemas.PriceData,
      handler: async (symbol: string) => {
        const response = await fetch(
          `${config.apiEndpoint}?symbol=${symbol}`,
          config.apiKey ? {
            headers: { 'Authorization': `Bearer ${config.apiKey}` }
          } : undefined
        );
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        return {
          symbol,
          price: data.price,
          change24h: data.change24h,
          volume: data.volume,
          marketCap: data.marketCap,
        };
      },
    });
  }
  
  /**
   * Create an address validation agent
   */
  static createAddressValidatorAgent(config: {
    id: string;
    description: string;
  }) {
    return createSimpleAgent({
      id: config.id,
      description: config.description,
      outputSchema: CommonSchemas.AddressValidation,
      handler: async (address: string) => {
        // Basic validation logic
        const isEthereumAddress = /^0x[a-fA-F0-9]{40}$/.test(address);
        const isBitcoinAddress = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address);
        const isSolanaAddress = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
        
        let format: 'ethereum' | 'bitcoin' | 'solana' | 'unknown' = 'unknown';
        let isValid = false;
        
        if (isEthereumAddress) {
          format = 'ethereum';
          isValid = true;
        } else if (isBitcoinAddress) {
          format = 'bitcoin';
          isValid = true;
        } else if (isSolanaAddress) {
          format = 'solana';
          isValid = true;
        }
        
        return {
          address,
          isValid,
          format,
          checksumValid: format === 'ethereum' ? this.validateEthereumChecksum(address) : undefined,
        };
      },
    });
  }
  
  private static validateEthereumChecksum(address: string): boolean {
    // Simplified checksum validation
    return address === address.toLowerCase() || address === address.toUpperCase();
  }
}

/**
 * Example: Creating a simple agent
 */
export function createExampleAgent() {
  return createSimpleAgent({
    id: 'exampleAgent',
    description: 'Example agent that demonstrates the framework',
    outputSchema: z.object({
      message: z.string(),
      timestamp: z.string(),
      success: z.boolean(),
    }),
    handler: async (input: string) => {
      // Simulate some processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return {
        message: `Processed: ${input}`,
        timestamp: new Date().toISOString(),
        success: true,
      };
    },
  });
}

/**
 * Export commonly used types
 */
export type { AgentMetrics };
export { AgentPerformanceMonitor, AgentRegistryHelpers };
