import { convertToCoreMessages, Message, StreamData, streamText } from 'ai';
import { z } from 'zod';

import { customModel } from '@/models';
import { models } from '@/models/models';
import { systemPrompt } from '@/models/prompts';
import { auth } from '@/app/(auth)/auth';
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
} from '@/db/queries';
import {
  generateUUID,
  getMostRecentUserMessageWithAttachments,
  sanitizeResponseMessages,
} from '@/lib/utils';
import {
  getSupportedChains,
  isChainSupported,
  findChain,
  tokenAnalysisAgent,
} from '@/models/agents';

import { generateTitleFromUserMessage } from '../../actions';

const get = async (url: string, opts?: RequestInit) => {
  const res = await fetch(url, opts);
  return await res.json();
};

export const maxDuration = 60;

type AllowedTools =
  | 'assetPrice'
  | 'swapTokens'
  | 'sendTokens'
  | 'portfolioBalance'
  | 'checkSupportedChains'
  | 'validateChain';

const assetPriceTools: AllowedTools[] = [
  'assetPrice',
  'swapTokens',
  'sendTokens',
  'portfolioBalance',
];

const blockchainTools: AllowedTools[] = [
  'checkSupportedChains',
  'validateChain',
];

const allTools: AllowedTools[] = [...assetPriceTools, ...blockchainTools];

interface TokenBalance {
  address: string;
  amount: number;
  symbol?: string;
  name?: string;
  icon?: string;
  price?: number;
  value?: number;
  chainId: string;
}

export async function POST(request: Request) {
  console.log('🚀 API POST request received');
  const {
    id,
    messages,
    modelId,
  }: { id: string; messages: Array<Message>; modelId: string } =
    await request.json();

  console.log('Received messages:', JSON.stringify(messages, null, 2));
  console.log('Received ID:', id);

  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  console.log('Received modelId:', modelId);
  const model = models.find((m) => m.id === modelId);

  if (!model) {
    console.error(`Model with id ${modelId} not found.`);
    return new Response('Model not found', { status: 404 });
  }

  const coreMessages = convertToCoreMessages(messages);
  const userMessage = getMostRecentUserMessageWithAttachments(coreMessages);

  if (!userMessage) {
    return new Response('No user message found', { status: 400 });
  }

  // Validate that the user message has content
  if (
    !userMessage.content ||
    (typeof userMessage.content === 'string' &&
      userMessage.content.trim() === '') ||
    (Array.isArray(userMessage.content) && userMessage.content.length === 0)
  ) {
    return new Response('User message has no content', { status: 400 });
  }

  // Replace the last user message with the processed one (with attachments)
  const lastUserMessageIndex = coreMessages
    .map((m) => m.role)
    .lastIndexOf('user');
  if (lastUserMessageIndex !== -1) {
    coreMessages[lastUserMessageIndex] = userMessage;
  }

  // Filter out messages with empty content to prevent Gemini API errors
  const validMessages = coreMessages.filter((message) => {
    // Always keep user messages
    if (message.role === 'user') {
      if (!message.content) return false;
      if (typeof message.content === 'string') {
        return message.content.trim().length > 0;
      }
      if (Array.isArray(message.content)) {
        return (
          message.content.length > 0 &&
          message.content.some(
            (part) =>
              (part.type === 'text' && part.text.trim().length > 0) ||
              part.type === 'image'
          )
        );
      }
      return true;
    }

    // For assistant messages, skip those with empty content (they usually have only tool invocations)
    if (message.role === 'assistant') {
      if (!message.content) return false;
      if (typeof message.content === 'string') {
        return message.content.trim().length > 0;
      }
      if (Array.isArray(message.content)) {
        // For array content, ensure there's at least one meaningful part
        const hasValidContent = message.content.some((part) => {
          if (part.type === 'text') {
            return part.text && part.text.trim().length > 0;
          }
          if (part.type === 'tool-call') {
            return true; // Tool calls are valid content
          }
          return false; // Other types are not considered valid for Gemini
        });
        return hasValidContent;
      }
      return true;
    }

    // For tool messages, ensure they have content
    if (message.role === 'tool') {
      if (!message.content) return false;
      if (Array.isArray(message.content)) {
        return message.content.length > 0;
      }
      return true;
    }

    return false;
  });

  if (validMessages.length === 0) {
    // Create a fallback message to prevent empty request
    const fallbackMessages = [
      {
        role: 'user' as const,
        content: 'Hello, I need help with blockchain analysis.',
      },
    ];
    validMessages.push(...fallbackMessages);
  }

  let chat = await getChatById({ id });
  let chatId = id; // Use the existing ID from the frontend
  console.log(`Chat found: ${!!chat}, using chatId: ${chatId}`);

  if (!chat) {
    console.log(`Creating new chat with ID: ${chatId}`);
    // Don't generate a new UUID - use the existing ID from the frontend
    // This ensures the user stays in the same chat they started
    let title = 'New Chat';

    if (userMessage && userMessage.role === 'user') {
      try {
        title = await generateTitleFromUserMessage({
          message: userMessage,
          userId: session.user.id
        });
        console.log(`Generated title: "${title}" for chatId: ${chatId}`);
      } catch (error) {
        console.warn('Failed to generate title, using fallback:', error instanceof Error ? error.message : String(error));
        // Use a simple fallback title based on the user's message
        const userContent = userMessage.content;
        if (typeof userContent === 'string' && userContent.length > 0) {
          title = userContent.slice(0, 50) + (userContent.length > 50 ? '...' : '');
        }
        console.log(`Using fallback title: "${title}" for chatId: ${chatId}`);
      }
    }

    // Save chat and wait for it to complete before proceeding
    await saveChat({ id: chatId, userId: session.user.id, title });
    console.log(`New chat saved with ID: ${chatId}`);
  }

  // Save the user message
  await saveMessages({
    messages: [
      {
        ...userMessage,
        id: generateUUID(),
        createdAt: new Date(),
        chatId: chatId,
      },
    ],
  });

  const streamingData = new StreamData();

  // Send the chatId to frontend after chat and messages are saved
  console.log(`Sending chatId to frontend: ${chatId}`);
  streamingData.appendMessageAnnotation({
    chatId: chatId,
  });

  try {
    console.log(
      `🔍 Processing ${validMessages.length} valid messages for AI (filtered from ${coreMessages.length} total)`
    );

    // Debug: Show what messages were filtered out
    const filteredOut = coreMessages.filter((m) => !validMessages.includes(m));
    if (filteredOut.length > 0) {
      console.log(
        `🚫 Filtered out ${filteredOut.length} messages:`,
        filteredOut.map((m) => ({
          role: m.role,
          content:
            typeof m.content === 'string'
              ? `"${m.content}"`
              : `complex content (${Array.isArray(m.content) ? m.content.length : 'unknown'} parts)`,
          isEmpty:
            !m.content ||
            (typeof m.content === 'string' && m.content.trim() === '') ||
            (Array.isArray(m.content) && m.content.length === 0),
          reason: !m.content
            ? 'no content'
            : typeof m.content === 'string' && m.content.trim() === ''
              ? 'empty string'
              : Array.isArray(m.content) && m.content.length === 0
                ? 'empty array'
                : Array.isArray(m.content) &&
                    !m.content.some(
                      (p) =>
                        p.type === 'text' && p.text && p.text.trim().length > 0
                    )
                  ? 'no valid text parts'
                  : 'unknown',
        }))
      );
    }

    console.log(
      '✅ Valid messages being sent to AI:',
      JSON.stringify(
        validMessages.map((m) => ({
          role: m.role,
          content:
            typeof m.content === 'string'
              ? m.content.substring(0, 50) +
                (m.content.length > 50 ? '...' : '')
              : `complex content (${Array.isArray(m.content) ? m.content.length : 'unknown'} parts)`,
          contentType: typeof m.content,
          hasContent:
            !!m.content &&
            (typeof m.content === 'string'
              ? m.content.trim().length > 0
              : Array.isArray(m.content)
                ? m.content.length > 0
                : true),
          contentDetails: Array.isArray(m.content)
            ? m.content.map((p) => ({
                type: p.type,
                hasText:
                  p.type === 'text'
                    ? !!p.text && p.text.trim().length > 0
                    : true,
                textContent:
                  p.type === 'text'
                    ? `"${(p.text || '').substring(0, 50)}${(p.text || '').length > 50 ? '...' : ''}"`
                    : undefined,
                textLength:
                  p.type === 'text' ? (p.text || '').length : undefined,
              }))
            : undefined,
        })),
        null,
        2
      )
    );

    const result = await streamText({
      model: customModel(model.apiIdentifier),
      system: systemPrompt,
      messages: validMessages,
      maxSteps: 1,
      experimental_activeTools: allTools,
      tools: {
        assetPrice: {
          description:
            'Get current price of a given asset using its 3 or 4 letter ticker',
          parameters: z.object({
            asset: z.string(),
          }),
          execute: async ({ asset }) => {
            // Dummy data for asset price
            return 123.45;
          },
        },
        swapTokens: {
          description: 'Swap tokens using Uniswap',
          parameters: z.object({
            from: z.string(),
            to: z.string(),
            amount: z.string(),
          }),
          execute: async ({ from, to, amount }) => {
            // Dummy data for swap
            return { success: true, from, to, amount };
          },
        },
        sendTokens: {
          description: 'Send tokens to another address or ENS username',
          parameters: z.object({
            from: z.string(),
            to: z.string(),
            amount: z.string(),
          }),
          execute: async ({ from, to, amount }) => {
            // Dummy data for send tokens
            return { success: true, from, to, amount };
          },
        },
        portfolioBalance: {
          description:
            'Get the portfolio/token balances of a given address or ENS username',
          parameters: z.object({
            address: z.string(),
          }),
          execute: async ({ address }) => {
            // Dummy data for portfolio balance
            return {
              address: address,
              values: [
                {
                  address: '0xDECAFBAD',
                  amount: 10.5,
                  symbol: 'ETH',
                  name: 'Ethereum',
                  icon: 'https://token.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png',
                  price: 3000,
                  value: 31500,
                  chainId: '1',
                },
                {
                  address: '0x...',
                  amount: 5000,
                  symbol: 'USDC',
                  name: 'USD Coin',
                  icon: 'https://token.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png',
                  price: 1,
                  value: 5000,
                  chainId: '1',
                },
              ],
            };
          },
        },
        checkSupportedChains: {
          description:
            'Get a list of all supported blockchain networks for analysis',
          parameters: z.object({}),
          execute: async () => {
            try {
              const chains = await getSupportedChains();
              return {
                success: true,
                supportedChains: chains,
                count: chains.length,
                message: `Found ${chains.length} supported blockchain networks`,
              };
            } catch (error) {
              console.error('❌ Error in checkSupportedChains tool:', error);
              return {
                success: false,
                error:
                  error instanceof Error
                    ? error.message
                    : 'Failed to fetch supported chains',
                supportedChains: [],
              };
            }
          },
        },
        validateChain: {
          description:
            'Check if a specific blockchain network is supported for analysis',
          parameters: z.object({
            chainIdentifier: z
              .string()
              .describe(
                'Chain name, slug, or ID (e.g., "ethereum", "eth", "polygon")'
              ),
          }),
          execute: async ({ chainIdentifier }) => {
            try {
              const isSupported = await isChainSupported(chainIdentifier);
              const chainInfo = await findChain(chainIdentifier);

              return {
                chainIdentifier,
                isSupported,
                chainInfo,
                message: isSupported
                  ? `✅ ${chainInfo?.name || chainIdentifier} is supported`
                  : `❌ ${chainIdentifier} is not supported`,
              };
            } catch (error) {
              console.error(
                `❌ Error validating chain ${chainIdentifier}:`,
                error
              );
              return {
                chainIdentifier,
                isSupported: false,
                error:
                  error instanceof Error
                    ? error.message
                    : 'Failed to validate chain',
                message: `❌ Could not validate ${chainIdentifier}`,
              };
            }
          },
        },
        analyzeToken: {
          description: 'Perform comprehensive DeFi token analysis including price, technical analysis, fundamentals, and risk assessment',
          parameters: z.object({
            tokenSymbol: z.string().describe('Token symbol (e.g., ETH, BTC, USDC)'),
          }),
          execute: async ({ tokenSymbol }) => {
            try {
              console.log(`🔍 Analyzing token: ${tokenSymbol}`);
              const analysis = await tokenAnalysisAgent.execute(tokenSymbol);
              console.log(`✅ Token analysis completed for ${tokenSymbol}`);
              return analysis;
            } catch (error) {
              console.error(`❌ Token analysis failed for ${tokenSymbol}:`, error);
              return {
                error: error instanceof Error ? error.message : 'Unknown error',
                message: `❌ Could not analyze token ${tokenSymbol}`,
                suggestion: 'Please check the token symbol and try again',
              };
            }
          },
        },
      },
      onFinish: async ({ responseMessages }) => {
        try {
          if (session.user && session.user.id) {
            try {
              const responseMessagesWithoutIncompleteToolCalls =
                sanitizeResponseMessages(responseMessages);

              if (responseMessagesWithoutIncompleteToolCalls.length > 0) {
                await saveMessages({
                  messages: responseMessagesWithoutIncompleteToolCalls.map(
                    (message) => {
                      const messageId = generateUUID();

                      if (message.role === 'assistant') {
                        streamingData.appendMessageAnnotation({
                          messageIdFromServer: messageId,
                        });
                      }

                      return {
                        id: messageId,
                        chatId: chatId,
                        role: message.role,
                        content: message.content,
                        createdAt: new Date(),
                      };
                    }
                  ),
                });
              }
            } catch (error) {
              console.error('Failed to save chat:', error);
            }
          }
        } finally {
          // Always close the stream, even if saving fails
          streamingData.close();
        }
      },
      experimental_telemetry: {
        isEnabled: true,
        functionId: 'stream-text',
      },
    });

    console.log('✅ Returning stream response');
    return result.toDataStreamResponse({
      data: streamingData,
    });
  } catch (error) {
    console.error('❌ Error in streamText execution:', error);

    // Ensure stream is closed even on error
    try {
      streamingData.close();
    } catch (closeError) {
      console.error('❌ Error closing stream:', closeError);
    }

    return new Response(
      JSON.stringify({
        error: 'An error occurred while processing your request',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}
