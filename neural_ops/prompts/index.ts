// Prompts Index
// Central export point for all system prompts

export * from './ai-agents/system-prompts';
export * from './prompts'; // Original prompts.ts file

// Re-export the main system prompt for backward compatibility
export { systemPrompt } from './prompts';
