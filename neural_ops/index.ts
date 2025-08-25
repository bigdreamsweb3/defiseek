// File: neural_ops/index.ts
import { openai } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { deepseek } from '@ai-sdk/deepseek';
import { experimental_wrapLanguageModel as wrapLanguageModel } from 'ai';

import { customMiddleware } from './custom-middleware';

export const customModel = (apiIdentifier: string) => {
  try {
    console.log(`🔧 Initializing model: ${apiIdentifier}`);

    if (!apiIdentifier) {
      throw new Error('No model identifier provided');
    }

    // Check for required environment variables
    const requiredEnvVars: Record<string, string> = {};

    if (apiIdentifier.startsWith('gpt-')) {
      requiredEnvVars.OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
    } else if (apiIdentifier.startsWith('gemini')) {
      requiredEnvVars.GOOGLE_GENERATIVE_AI_API_KEY =
        process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
    } else if (apiIdentifier.startsWith('deepseek')) {
      requiredEnvVars.DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
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

    // Initialize the appropriate model based on the identifier
    try {
      if (apiIdentifier.startsWith('gpt-')) {
        console.log(`🤖 Initializing OpenAI model: ${apiIdentifier}`);
        // For @ai-sdk/openai 1.0.0-canary.3, the API key is automatically picked up from process.env.OPENAI_API_KEY
        // and the model ID must be one of the supported model IDs
        const modelId = apiIdentifier === 'gpt-3.5-turbo' || apiIdentifier === 'gpt-4' 
          ? apiIdentifier as 'gpt-3.5-turbo' | 'gpt-4'
          : 'gpt-3.5-turbo';
        model = openai(modelId);
      } else if (apiIdentifier.startsWith('gemini')) {
        console.log(`🤖 Initializing Google model: ${apiIdentifier}`);
        const google = createGoogleGenerativeAI({
          apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        });
        model = google(apiIdentifier);
      } else if (apiIdentifier.startsWith('deepseek')) {
        console.log(`🤖 Initializing DeepSeek model: ${apiIdentifier}`);
        model = deepseek(apiIdentifier);
      } else {
        console.warn(`⚠️ Unsupported model: ${apiIdentifier}`);
        throw new Error(`Unsupported model identifier: ${apiIdentifier}`);
      }

      if (!model) {
        throw new Error(`Failed to initialize model: ${apiIdentifier}`);
      }

      console.log(`✅ Model initialized: ${apiIdentifier}`);
      console.log(`🔍 Model structure:`, {
        modelId: model.modelId || 'unknown',
        provider: model.provider || 'unknown',
        specificationVersion: model.specificationVersion || 'unknown',
      });

      // Check if middleware exists and is valid
      let wrappedModel;
      if (customMiddleware && (customMiddleware.wrapGenerate || customMiddleware.wrapStream)) {
        console.log(`🔧 Applying custom middleware`);
        wrappedModel = wrapLanguageModel({
          model,
          middleware: customMiddleware,
        });
      } else {
        console.log(`⚠️ No valid middleware found, using model directly`);
        wrappedModel = model;
      }

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
      throw modelError; // Re-throw to trigger fallback in route
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

// Export all organized prompts
export * from './prompts';
