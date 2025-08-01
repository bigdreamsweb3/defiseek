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
        if (pathname === '/' && id !== chatData.chatId) {
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
      {/* Professional Chat Interface */}
      <div className="flex flex-col h-dvh bg-neutral-50 dark:bg-neutral-950 font-mono">
        
        {/* Clean Header */}
        <div className="flex-shrink-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-b border-neutral-200/50 dark:border-neutral-800/50">
          <ChatHeader selectedModelId={selectedModelId} />
        </div>

        {/* Messages Area */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700"
        >
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 && (
              <div className="flex items-center justify-center min-h-[60vh]">
                <Overview />
              </div>
            )}

            <div className="space-y-1">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className="px-4 py-3 hover:bg-neutral-100/30 dark:hover:bg-neutral-900/30 transition-colors duration-200"
                >
                  <div 
                    className="max-w-none break-words"
                    style={{
                      wordBreak: 'break-word',
                      overflowWrap: 'anywhere'
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
                </div>
              ))}
            </div>

            {isLoading &&
              messages.length > 0 &&
              messages[messages.length - 1].role === 'user' && (
                <div className="px-4 py-3">
                  <ThinkingMessage />
                </div>
              )}

            <div ref={messagesEndRef} className="h-6" />
          </div>
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-t border-neutral-200/50 dark:border-neutral-800/50">
          <div className="max-w-4xl mx-auto p-4">
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

      {/* Minimal Professional Styling */}
      <style jsx global>{`
        /* Typography - Blockchain precision */
        .font-mono {
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', monospace;
          font-variant-numeric: tabular-nums;
          letter-spacing: -0.025em;
        }
        
        /* Message content styling */
        .message-content {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          font-size: 15px;
          line-height: 1.6;
          color: #171717;
          word-break: break-word;
          overflow-wrap: break-word;
        }
        
        .dark .message-content {
          color: #fafafa;
        }
        
        /* Code and addresses */
        .message-content code,
        .message-content pre,
        .message-content .crypto-address {
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
          font-size: 13px;
          background: #f5f5f5;
          color: #525252;
          padding: 2px 6px;
          border-radius: 4px;
          word-break: break-all;
          white-space: pre-wrap;
        }
        
        .dark .message-content code,
        .dark .message-content pre,
        .dark .message-content .crypto-address {
          background: #262626;
          color: #a3a3a3;
        }
        
        /* Wallet addresses and hashes */
        .message-content [data-crypto-address] {
          font-family: 'SF Mono', monospace;
          font-size: 13px;
          background: #f8f8f8;
          border: 1px solid #e5e5e5;
          padding: 4px 8px;
          border-radius: 6px;
          word-break: break-all;
          display: inline-block;
          max-width: 100%;
        }
        
        .dark .message-content [data-crypto-address] {
          background: #1a1a1a;
          border-color: #404040;
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
          .message-content {
            font-size: 14px;
            line-height: 1.5;
          }
          
          .message-content code,
          .message-content pre {
            font-size: 12px;
            padding: 3px 6px;
          }
          
          /* Ensure proper mobile viewport */
          .h-dvh {
            height: 100vh;
            height: 100dvh;
          }
        }
        
        /* Subtle scroll indicators */
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        
        .scrollbar-track-transparent {
          scrollbar-color: transparent transparent;
        }
        
        .scrollbar-thumb-neutral-300 {
          scrollbar-color: #d4d4d4 transparent;
        }
        
        .dark .scrollbar-thumb-neutral-700 {
          scrollbar-color: #404040 transparent;
        }
        
        /* Webkit scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #d4d4d4;
          border-radius: 3px;
        }
        
        .dark ::-webkit-scrollbar-thumb {
          background: #404040;
        }
        
        /* Focus states */
        *:focus-visible {
          outline: 2px solid #171717;
          outline-offset: 2px;
        }
        
        .dark *:focus-visible {
          outline-color: #fafafa;
        }
        
        /* Subtle animations */
        .transition-colors {
          transition-property: color, background-color, border-color;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 200ms;
        }
        
        /* Clean selection */
        ::selection {
          background: #171717;
          color: white;
        }
        
        .dark ::selection {
          background: #fafafa;
          color: black;
        }
      `}</style>
    </>
  );
        }
