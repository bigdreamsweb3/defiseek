'use client';

import { Attachment, Message } from 'ai';
import { useChat } from 'ai/react';
import { AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { useWindowSize } from 'usehooks-ts';

import { ChatHeader } from '@/components/custom/chat-header';
import { PreviewMessage, ThinkingMessage } from '@/components/custom/message';
import { useScrollToBottom } from '@/components/custom/use-scroll-to-bottom';
import { Vote } from '@/db/schema';
import { fetcher } from '@/lib/utils';

import { Block, UIBlock } from './block';
import { BlockStreamHandler } from './block-stream-handler';
import { MultimodalInput } from './multimodal-input';
import { Overview } from './overview';

export function Chat({
  id,
  initialMessages,
  selectedModelId,
}: {
  id: string;
  initialMessages: Array<Message>;
  selectedModelId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { mutate } = useSWRConfig();

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
    data: streamingData,
  } = useChat({
    body: { id, modelId: selectedModelId },
    initialMessages,
    onFinish: () => {
      mutate('/api/history');
    },
  });

  useEffect(() => {
    if (streamingData) {
      const chatData = streamingData.find(
        (item: any) => item.chatId,
      ) as { chatId: string } | undefined;

      if (chatData?.chatId && pathname !== `/chat/${chatData.chatId}`) {
        // Only navigate if we're starting a new chat from the home page
        // Don't navigate if we're already in a chat or if the current chat ID matches
        if (pathname === '/' && id !== chatData.chatId) {
          // Use router.replace instead of router.push to avoid adding to history
          // and use a small delay to ensure the response is visible first
          setTimeout(() => {
            router.replace(`/chat/${chatData.chatId}`, { scroll: false });
          }, 100);
        }
      }
    }
  }, [streamingData, pathname, router, id]);

  const { width: windowWidth = 1920, height: windowHeight = 1080 } =
    useWindowSize();

  const [block, setBlock] = useState<UIBlock>({
    documentId: 'init',
    content: '',
    title: '',
    status: 'idle',
    isVisible: false,
    boundingBox: {
      top: windowHeight / 4,
      left: windowWidth / 4,
      width: 250,
      height: 50,
    },
  });

  const { data: votes } = useSWR<Array<Vote>>(
    `/api/vote?chatId=${id}`,
    fetcher
  );

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  return (
    <>
      {/* Main Chat Container with DeFiSeek branding */}
      <div className="flex flex-col h-dvh bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 overflow-hidden">
        
        {/* Header */}
        <div className="flex-shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
          <ChatHeader selectedModelId={selectedModelId} />
        </div>

        {/* Messages Container */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto scroll-smooth chat-scrollbar min-h-0"
        >
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
            {messages.length === 0 && (
              <div className="flex items-center justify-center min-h-[50vh]">
                <Overview />
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={message.id}
                className="w-full break-words"
                style={{
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere',
                  hyphens: 'auto'
                }}
              >
                <PreviewMessage
                  chatId={id}
                  message={message}
                  block={block}
                  setBlock={setBlock}
                  isLoading={isLoading && messages.length - 1 === index}
                  vote={
                    votes
                      ? votes.find((vote) => vote.messageId === message.id)
                      : undefined
                  }
                />
              </div>
            ))}

            {isLoading &&
              messages.length > 0 &&
              messages[messages.length - 1].role === 'user' && (
                <div className="w-full max-w-2xl mx-auto">
                  <ThinkingMessage />
                </div>
              )}

            <div
              ref={messagesEndRef}
              className="h-4 w-full flex-shrink-0"
            />
          </div>
        </div>

        {/* Input Form */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 safe-area-bottom">
          <div className="max-w-4xl mx-auto p-4 pb-safe">
            <form className="w-full">
              <MultimodalInput
                chatId={id}
                input={input}
                setInput={setInput}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
                stop={stop}
                attachments={attachments}
                setAttachments={setAttachments}
                messages={messages}
                setMessages={setMessages}
                append={append}
              />
            </form>
          </div>
        </div>
      </div>

      {/* Block Overlay */}
      <AnimatePresence>
        {block && block.isVisible && (
          <Block
            chatId={id}
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            append={append}
            block={block}
            setBlock={setBlock}
            messages={messages}
            setMessages={setMessages}
            votes={votes}
          />
        )}
      </AnimatePresence>

      <BlockStreamHandler streamingData={streamingData} setBlock={setBlock} />

      {/* Custom CSS for better text handling */}
      <style jsx global>{`
        /* Force break long words like wallet addresses */
        .message-content {
          word-break: break-all;
          overflow-wrap: break-word;
          hyphens: auto;
        }
        
        /* Ethereum address styling */
        .message-content code,
        .message-content pre {
          word-break: break-all;
          white-space: pre-wrap;
          overflow-wrap: break-word;
        }
        
        /* Mobile keyboard handling */
        @media (max-width: 768px) {
          .message-content {
            font-size: 14px;
            line-height: 1.5;
          }
          
          /* Ensure long strings don't break mobile layout */
          .message-content * {
            max-width: 100%;
            overflow-wrap: break-word;
            word-break: break-word;
          }
          
          /* Safe area for mobile devices */
          .safe-area-bottom {
            padding-bottom: env(safe-area-inset-bottom);
          }
          
          .pb-safe {
            padding-bottom: calc(1rem + env(safe-area-inset-bottom));
          }
          
          /* Ensure proper viewport height handling on mobile */
          .h-dvh {
            height: 100dvh;
            height: 100vh;
          }
        }
        
        /* DeFiSeek brand colors */
        .defiseek-gradient {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%);
        }
        
        .defiseek-text-gradient {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        /* Smooth scrolling */
        .scroll-smooth {
          scroll-behavior: smooth;
        }
        
        /* Custom scrollbar */
        .chat-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .chat-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .chat-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 3px;
        }
        
        .chat-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.5);
        }
      `}</style>
    </>
  );
                    }
