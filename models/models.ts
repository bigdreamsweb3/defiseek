// Define your models here.

export interface Model {
  id: string;
  label: string;
  apiIdentifier: string;
  description: string;
}

export const models: Array<Model> = [
  {
    id: 'gemini-1.5-flash-latest',
    label: 'Gemini 1.5 Flash',
    apiIdentifier: 'gemini-1.5-flash-latest',
    description: 'Google\'s fast GenAI model for multimodal and text-based tasks',
  },
  {
    id: 'gemini-1.5-pro-latest',
    label: 'Gemini 1.5 Pro',
    apiIdentifier: 'gemini-1.5-pro-latest',
    description: 'Google\'s most capable GenAI model for complex reasoning',
  },
  {
    id: 'deepseek-chat',
    label: 'DeepSeek Chat',
    apiIdentifier: 'deepseek-chat',
    description: 'DeepSeek\'s efficient model for conversational AI and analysis',
  },
  {
    id: 'deepseek-coder',
    label: 'DeepSeek Coder',
    apiIdentifier: 'deepseek-coder',
    description: 'DeepSeek\'s specialized model for code analysis and blockchain data',
  },
  {
    id: 'gpt-4o',
    label: 'GPT-4o',
    apiIdentifier: 'gpt-4o',
    description: 'OpenAI\'s multimodal model for complex reasoning and analysis',
  },
  {
    id: 'gpt-4o-mini',
    label: 'GPT-4o Mini',
    apiIdentifier: 'gpt-4o-mini',
    description: 'OpenAI\'s efficient model for fast responses and simple tasks',
  },
] as const;

export const DEFAULT_MODEL_NAME: string = 'gemini-1.5-flash-latest';
