import { z } from 'zod';

/**
 * Base interface for all NeuralOps™ agents
 */
export interface AgentConfig<TOutput = any> {
  id: string;
  description: string;
  output: z.ZodSchema<TOutput>;
}

/**
 * Base class for all NeuralOps™ agents
 */
export abstract class BaseAgent<TOutput = any> {
  public readonly id: string;
  public readonly description: string;
  public readonly outputSchema: z.ZodSchema<TOutput>;

  constructor(config: AgentConfig<TOutput>) {
    this.id = config.id;
    this.description = config.description;
    this.outputSchema = config.output;
  }

  /**
   * Main execution method that all agents must implement
   */
  abstract run(...args: any[]): Promise<TOutput>;

  /**
   * Validates the output against the schema
   */
  protected validateOutput(output: unknown): TOutput {
    try {
      return this.outputSchema.parse(output);
    } catch (error) {
      console.error(`Agent ${this.id} output validation failed:`, error);
      throw new Error(`Agent ${this.id} produced invalid output`);
    }
  }

  /**
   * Safe execution wrapper with validation
   */
  async execute(...args: any[]): Promise<TOutput> {
    try {
      const result = await this.run(...args);
      return this.validateOutput(result);
    } catch (error) {
      console.error(`Agent ${this.id} execution failed:`, error);
      throw error;
    }
  }
}

/**
 * ApiClient factory for creating agents
 */
export class ApiClient {
  /**
   * Define a new agent with configuration
   */
  static define<TOutput>(config: AgentConfig<TOutput> & {
    run: (...args: any[]) => Promise<TOutput>;
  }): BaseAgent<TOutput> {
    return new (class extends BaseAgent<TOutput> {
      async run(...args: any[]): Promise<TOutput> {
        return config.run(...args);
      }
    })(config);
  }

  /**
   * Create an agent instance from a class
   */
  static create<TOutput>(
    AgentClass: new (config: AgentConfig<TOutput>) => BaseAgent<TOutput>,
    config: AgentConfig<TOutput>
  ): BaseAgent<TOutput> {
    return new AgentClass(config);
  }
}

/**
 * Agent registry for managing all agents
 */
export class AgentRegistry {
  private static agents = new Map<string, BaseAgent>();

  /**
   * Register an agent
   */
  static register<TOutput>(agent: BaseAgent<TOutput>): void {
    this.agents.set(agent.id, agent);
  }

  /**
   * Get an agent by ID
   */
  static get<TOutput>(id: string): BaseAgent<TOutput> | undefined {
    return this.agents.get(id) as BaseAgent<TOutput>;
  }

  /**
   * Get all registered agents
   */
  static getAll(): BaseAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Execute an agent by ID
   */
  static async execute<TOutput>(id: string, ...args: any[]): Promise<TOutput> {
    const agent = this.get<TOutput>(id);
    if (!agent) {
      throw new Error(`Agent with id '${id}' not found`);
    }
    return agent.execute(...args);
  }
}
