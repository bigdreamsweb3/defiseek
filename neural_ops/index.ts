// File: neural_ops/index.ts
import { openai } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { deepseek } from '@ai-sdk/deepseek';
import { groq } from '@ai-sdk/groq'; // 👈 NEW
import { experimental_wrapLanguageModel as wrapLanguageModel } from 'ai';

import { customMiddleware } from './custom-middleware';

export const customModel = (apiIdentifier: string) => {
  try {
    console.log(`🔧 Initializing model: ${apiIdentifier}`);

    if (!apiIdentifier) {
      throw new Error('No model identifier provided');
    }

    // Check required env vars
    const requiredEnvVars: Record<string, string> = {};

    if (apiIdentifier.startsWith('gpt-')) {
      requiredEnvVars.OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
    } else if (apiIdentifier.startsWith('gemini')) {
      requiredEnvVars.GOOGLE_GENERATIVE_AI_API_KEY =
        process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
    } else if (apiIdentifier.startsWith('deepseek')) {
      requiredEnvVars.DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
    } else if (
      apiIdentifier.startsWith('llama-') ||
      apiIdentifier.startsWith('mixtral-')
    ) {
      requiredEnvVars.GROQ_API_KEY = process.env.GROQ_API_KEY || '';
    }

    // Validate API keys
    for (const [envVar, value] of Object.entries(requiredEnvVars)) {
      if (!value) {
        console.error(`❌ Missing required environment variable: ${envVar}`);
        throw new Error(`Missing API key: ${envVar}`);
      }
      console.log(`✅ Found API key for: ${envVar.replace(/_API_KEY$/, '')}`);
    }

    let model;

    // Initialize models
    try {
      if (apiIdentifier.startsWith('gpt-')) {
        console.log(`🤖 Initializing OpenAI model: ${apiIdentifier}`);
        model = openai(apiIdentifier);
      } else if (apiIdentifier.startsWith('gemini')) {
        console.log(`🤖 Initializing Google model: ${apiIdentifier}`);
        const google = createGoogleGenerativeAI({
          apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        });
        model = google(apiIdentifier);
      } else if (apiIdentifier.startsWith('deepseek')) {
        console.log(`🤖 Initializing DeepSeek model: ${apiIdentifier}`);
        model = deepseek(apiIdentifier);
      } else if (
        apiIdentifier.startsWith('llama-') ||
        apiIdentifier.startsWith('mixtral-')
      ) {
        console.log(`🤖 Initializing Groq model: ${apiIdentifier}`);
        model = groq(apiIdentifier);
      } else {
        console.warn(`⚠️ Unsupported model: ${apiIdentifier}`);
        throw new Error(`Unsupported model identifier: ${apiIdentifier}`);
      }

      if (!model) {
        throw new Error(`Failed to initialize model: ${apiIdentifier}`);
      }

      console.log(`✅ Model initialized: ${apiIdentifier}`);

      // Middleware wrap
      const wrappedModel =
        customMiddleware &&
        (customMiddleware.wrapGenerate || customMiddleware.wrapStream)
          ? wrapLanguageModel({ model, middleware: customMiddleware })
          : model;

      if (!wrappedModel) {
        throw new Error(`Failed to wrap model: ${apiIdentifier}`);
      }

      console.log(`✅ Model ready for use: ${apiIdentifier}`);
      return wrappedModel;
    } catch (modelError) {
      console.error(
        `❌ Error initializing model ${apiIdentifier}:`,
        modelError
      );
      throw modelError;
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error(
      `💥 Critical error in customModel for ${apiIdentifier}:`,
      error
    );
    throw new Error(
      `Failed to initialize model ${apiIdentifier}: ${errorMessage}`
    );
  }
};

export * from './prompts';
