// file: neural_ops/utils/tokenCount.ts

import { encode } from 'gpt-tokenizer';
import { Message } from 'ai';

/**
 * Estimate the number of tokens in a prompt and a list of messages.
 * This is useful for understanding how many tokens will be used in a request.
 *
 * @param prompt - The prompt text.
 * @param messages - An array of messages to estimate tokens for.
 * @returns The estimated number of tokens.
 */

export function estimatePromptTokens(
  prompt: string,
  messages: Message[]
): number {
  const messageContent = messages
    .map((msg) =>
      typeof msg.content === 'string'
        ? msg.content
        : Array.isArray(msg.content)
          ? (msg.content as { type: string; text: string }[])
              .map((p) => (p.type === 'text' ? p.text : ''))
              .join(' ')
          : JSON.stringify(msg.content) || ''
    )
    .join('\n');

  const allText = `${prompt}\n${messageContent}`;
  return encode(allText).length;
}

export function estimateResponseTokens(response: string): number {
  return encode(response).length;
}
