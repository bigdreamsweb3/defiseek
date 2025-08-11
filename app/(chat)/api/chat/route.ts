// file: app/(chat)/api/chat/route.ts
// Solution: Filter the stream response to hide tool calls while keeping full streaming

import { convertToCoreMessages, Message, StreamData, streamText } from 'ai';

import { customModel } from '@/neural_ops';
import { models, FALLBACK_MODELS } from '@/neural_ops/models';
import { systemPrompt } from '@/neural_ops/prompts';
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

import { generateTitleFromUserMessage } from '../../actions';
import { estimatePromptTokens } from '@/neural_ops/utils/tokenCount';
import { tools } from '@/neural_ops/tools';

export const maxDuration = 60;

type AllowedTools =
  | 'checkSupportedChains'
  | 'validateChain'
  | 'checkWalletScore'
  | 'nftMarketAnalyticsTool'
  | 'nftMetadataTool'
  | 'nftCategoryTool';

const allTools: AllowedTools[] = [
  'checkSupportedChains',
  'validateChain',
  'checkWalletScore',
  'nftMarketAnalyticsTool',
  'nftMetadataTool',
  'nftCategoryTool',
];

export async function POST(request: Request) {
  console.log('🚀 API POST request received');
  const {
    id,
    messages,
    modelId,
  }: { id: string; messages: Array<Message>; modelId: string } =
    await request.json();

  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

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

  // Filter out messages with empty content
  const validMessages = coreMessages.filter((message) => {
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

    if (message.role === 'assistant') {
      if (!message.content) return false;
      if (typeof message.content === 'string') {
        return message.content.trim().length > 0;
      }
      if (Array.isArray(message.content)) {
        const hasValidContent = message.content.some((part) => {
          if (part.type === 'text') {
            return part.text && part.text.trim().length > 0;
          }
          if (part.type === 'tool-call') {
            return true;
          }
          return false;
        });
        return hasValidContent;
      }
      return true;
    }

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
    const fallbackMessages = [
      {
        role: 'user' as const,
        content: 'Hello, I need help with blockchain analysis.',
      },
    ];
    validMessages.push(...fallbackMessages);
  }

  let chat = await getChatById({ id });
  let chatId = id;

  if (!chat) {
    let title = 'New Chat';

    if (userMessage && userMessage.role === 'user') {
      try {
        title = await generateTitleFromUserMessage({
          message: userMessage,
          userId: session.user.id,
        });
      } catch (error) {
        console.warn('Failed to generate title, using fallback:', error);
        const userContent = userMessage.content;
        if (typeof userContent === 'string' && userContent.length > 0) {
          title =
            userContent.slice(0, 50) + (userContent.length > 50 ? '...' : '');
        }
      }
    }

    await saveChat({ id: chatId, userId: session.user.id, title });
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
  streamingData.appendMessageAnnotation({
    chatId: chatId,
  });

  try {
    const tokenCount = estimatePromptTokens(systemPrompt, messages);
    console.log(`🔢 Total token count: ${tokenCount}`);

    if (!model || !model.apiIdentifier) {
      return new Response('Invalid model', { status: 400 });
    }

    // Try primary model first, then fallback models
    const modelsToTry = [model.apiIdentifier, ...FALLBACK_MODELS.filter(m => m !== model.apiIdentifier)];
    let lastError: Error | null = null;
    let result: any = null;

    for (const modelId of modelsToTry) {
      try {
        console.log(`🤖 Attempting to use model: ${modelId}`);
        
        result = await streamText({
          model: customModel(modelId),
          system: systemPrompt,
          messages: validMessages,
          maxSteps: 2,
          experimental_activeTools: allTools,
          tools: {
            ...tools,
          },
          maxRetries: 1, // Reduce retries per model to fail faster
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
              streamingData.close();
            }
          },
          experimental_telemetry: {
            isEnabled: true,
            functionId: 'stream-text',
          },
        });

        console.log(`✅ Successfully used model: ${modelId}`);
        break; // Success! Exit the loop
        
      } catch (error) {
        console.error(`❌ Model ${modelId} failed:`, error);
        lastError = error as Error;
        
        // If this is the last model to try, we'll throw the error
        if (modelId === modelsToTry[modelsToTry.length - 1]) {
          throw error;
        }
        
        // Otherwise, continue to the next model
        console.log(`🔄 Trying next fallback model...`);
        continue;
      }
    }

    if (!result) {
      throw lastError || new Error('All models failed');
    }

    console.log('✅ Returning stream response');

    // Return normal stream response - we'll filter in frontend
    return result.toDataStreamResponse({
      data: streamingData,
    });
  } catch (error) {
    console.error('❌ Error in streamText execution:', error);

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

    if (!chat) {
      return new Response('Chat not found', { status: 404 });
    }

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/chat:', error);
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}
