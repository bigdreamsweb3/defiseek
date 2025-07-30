## 🧠 AI SDK Model Routing – Env & Auto Config Guide

### 📦 Supported Model Providers

This project supports multi-model AI routing using the [`@ai-sdk`](https://sdk.vercel.ai/docs) ecosystem.

### ✅ Available Models

| Model Name     | API Identifier   | SDK Source         | Environment Variable |
| -------------- | ---------------- | ------------------ | -------------------- |
| GPT-4o         | `gpt-4o`         | `@ai-sdk/openai`   | `OPENAI_API_KEY`     |
| GPT-4o-mini    | `gpt-4o-mini`    | `@ai-sdk/openai`   | `OPENAI_API_KEY`     |
| Gemini Pro     | `gemini-pro`     | `@ai-sdk/google`   | `GOOGLE_API_KEY`     |
| DeepSeek Chat  | `deepseek-chat`  | `@ai-sdk/deepseek` | `DEEPSEEK_API_KEY`   |
| DeepSeek Coder | `deepseek-coder` | `@ai-sdk/deepseek` | `DEEPSEEK_API_KEY`   |

---

### 🗂️ `.env` Example

```env
# OpenAI
OPENAI_API_KEY=sk-...

# Google Gemini
GOOGLE_API_KEY=your-google-api-key

# DeepSeek
DEEPSEEK_API_KEY=your-deepseek-api-key
```

---

### 🔁 Model Wrapper Logic (`/ai/index.ts`)

```ts
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { deepseek } from '@ai-sdk/deepseek';
import { experimental_wrapLanguageModel as wrapLanguageModel } from 'ai';

import { customMiddleware } from './custom-middleware';

export const customModel = (apiIdentifier: string) => {
  let model;

  if (apiIdentifier.startsWith('gpt-')) {
    model = openai(apiIdentifier);
  } else if (apiIdentifier.startsWith('gemini')) {
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
```

---

### 🛠️ Notes

- All SDKs automatically read your keys from `.env`.
- No need to manually pass API keys in code.
- Restart your server after updating environment variables.
