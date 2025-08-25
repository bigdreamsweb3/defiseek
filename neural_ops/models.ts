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
    description: "Google's fast GenAI model for multimodal and text-based tasks",
  },
  // {
  //   id: 'deepseek-chat',
  //   label: 'DeepSeek Chat',
  //   apiIdentifier: 'deepseek-chat',
  //   description: "DeepSeek's efficient model for conversational AI and analysis",
  // },
  // {
  //   id: 'deepseek-coder',
  //   label: 'DeepSeek Coder',
  //   apiIdentifier: 'deepseek-coder',
  //   description: "DeepSeek's specialized model for code analysis and blockchain data",
  // },
  // {
  //   id: 'gpt-4o-mini',
  //   label: 'GPT-4o Mini',
  //   apiIdentifier: 'gpt-4o-mini',
  //   description: "OpenAI's efficient model for fast responses and simple tasks",
  // },
  // // ✅ New Groq models
  // {
  //   id: 'llama-3.1-70b-versatile',
  //   label: 'Groq LLaMA 3.1 70B',
  //   apiIdentifier: 'llama-3.1-70b-versatile',
  //   description: "Groq's large reasoning model (free, super fast, OpenAI-compatible API)",
  // },
  // {
  //   id: 'llama-3.1-8b-instant',
  //   label: 'Groq LLaMA 3.1 8B',
  //   apiIdentifier: 'llama-3.1-8b-instant',
  //   description: "Groq's smaller but extremely fast reasoning model (free)",
  // },
  // {
  //   id: 'mixtral-8x7b-32768',
  //   label: 'Groq Mixtral 8x7B',
  //   apiIdentifier: 'mixtral-8x7b-32768',
  //   description: "Groq's sparse Mixture-of-Experts model with 32k context (free)",
  // },
] as const;

export const DEFAULT_MODEL_NAME: string = 'gemini-1.5-flash-latest';

// Fallback model order when primary model fails
export const FALLBACK_MODELS: string[] = [
  // 'llama-3.1-70b-versatile', // ✅ use Groq first since it's free
  // 'llama-3.1-8b-instant',
  // 'mixtral-8x7b-32768',
  // 'deepseek-chat',
  // 'deepseek-coder',
  // 'gpt-4o-mini',
  'gemini-1.5-flash-latest'
];
