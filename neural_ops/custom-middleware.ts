// File: ./neural_ops/custom-middleware.ts

import { Experimental_LanguageModelV1Middleware } from 'ai';

export const customMiddleware: Experimental_LanguageModelV1Middleware = {};


import OpenAI from "openai";
import { FALLBACK_MODELS } from "./models";

export function customModel(modelId: string) {
  // Groq models
  if (
    modelId === "llama-3.1-70b-versatile" ||
    modelId === "llama-3.1-8b-instant" ||
    modelId === "mixtral-8x7b-32768"
  ) {
    return new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1", // 👈 Groq endpoint
    });
  }

  // OpenAI models
  if (modelId.startsWith("gpt-")) {
    return new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: "https://api.openai.com/v1",
    });
  }

  // DeepSeek models
  if (modelId.startsWith("deepseek-")) {
    return new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com/v1",
    });
  }

  // Gemini models (if using Google provider integration)
  if (modelId.startsWith("gemini-")) {
    return new OpenAI({
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: "https://generativelanguage.googleapis.com/v1beta",
    });
  }

  // Default fallback
  console.warn(`⚠️ Unknown modelId "${modelId}", falling back`);
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://api.openai.com/v1",
  });
}
