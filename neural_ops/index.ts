// //  ./ai/index.ts
// import { openai } from '@ai-sdk/openai';
// import { experimental_wrapLanguageModel as wrapLanguageModel } from 'ai';

// import { customMiddleware } from './custom-middleware';

// export const customModel = (apiIdentifier: string) => {
//   return wrapLanguageModel({
//     model: openai(apiIdentifier),
//     middleware: customMiddleware,
//   });
// };

import { openai } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { deepseek } from '@ai-sdk/deepseek';
import { experimental_wrapLanguageModel as wrapLanguageModel } from 'ai';

import { customMiddleware } from './custom-middleware';

export const customModel = (apiIdentifier: string) => {
  let model;

  if (apiIdentifier.startsWith('gpt-')) {
    model = openai(apiIdentifier);
  } else if (apiIdentifier.startsWith('gemini')) {
    const google = createGoogleGenerativeAI();
    model = google(apiIdentifier);
  } else if (apiIdentifier.startsWith('deepseek')) {
    model = deepseek(apiIdentifier);
  } else {
    throw new Error(`Unsupported model: ${apiIdentifier}`);
  }

  return wrapLanguageModel({
    model,
    middleware: customMiddleware,
  });
};
