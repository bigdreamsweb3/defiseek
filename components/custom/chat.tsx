'use client';

import { Attachment, Message } from 'ai';
import { useChat } from 'ai/react';
import { AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { useWindowSize } from 'usehooks-ts';

import { ChatHeader } from '@/components/custom/chat-header';
import { PreviewMessage, ThinkingMessage } from '@/components/custom/message';
import { Vote } from '@/db/schema';
import { fetcher } from '@/lib/utils';

import { Block, UIBlock } from './block';
import { BlockStreamHandler } from './block-stream-handler';
import { MultimodalInput } from './multimodal-input';
import { Overview } from './overview';
import { QuickQuestions } from '@/components/custom/quick-questions';
import { useControlledScrollToBottom } from '../ui/control/improved-chat-scrolling';

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

  const {
    messagesContainerRef,
    messagesEndRef,
    scrollToBottom,
    shouldAutoScroll,
    isUserScrolling,
    setShouldAutoScroll
  } = useControlledScrollToBottom<HTMLDivElement>();

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const [showQuickQuestions, setShowQuickQuestions] = useState(false);

  // Auto-scroll only when appropriate
  useEffect(() => {
    if (messages.length > 0 && shouldAutoScroll && !isUserScrolling) {
      // Small delay to ensure content is rendered
      const timer = setTimeout(() => scrollToBottom(), 50);
      return () => clearTimeout(timer);
    }
  }, [messages, shouldAutoScroll, isUserScrolling, scrollToBottom]);

  // Force scroll to bottom for new conversations
  useEffect(() => {
    if (messages.length === 1) {
      scrollToBottom(true);
      setShouldAutoScroll(true);
    }
  }, [messages.length, scrollToBottom, setShouldAutoScroll]);

  useEffect(() => {
    if (messages.length === 0) {
      const timeout = setTimeout(() => setShowQuickQuestions(true), 300);
      return () => clearTimeout(timeout);
    }
  }, [messages]);

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background overflow-hidden">
        <ChatHeader selectedModelId={selectedModelId} />
        <div
          ref={messagesContainerRef}
          className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4 scroll-smooth"
        >
          {messages.length === 0 && (
            <>
              <Overview />
              {showQuickQuestions && (
                <QuickQuestions
                  onSelect={(q) => {
                    setInput(q);
                    handleSubmit(new Event('submit'));
                  }}
                />
              )}
            </>
          )}

          {messages.map((message, index) => (
            <div
              key={message.id}
              className="w-full"
              style={{
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
                maxWidth: '100%'
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
              <ThinkingMessage />
            )}

          <div
            ref={messagesEndRef}
            className="shrink-0 min-w-[24px] min-h-[24px]"
          />
        </div>

        {/* Scroll to bottom button - shows when user has scrolled up */}
        {!shouldAutoScroll && (
          <div className="absolute bottom-20 right-6 z-10">
            <button
              onClick={() => {
                scrollToBottom(true);
                setShouldAutoScroll(true);
              }}
              className="bg-background border border-border rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:border-cyan-accent"
              aria-label="Scroll to bottom"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m18 15-6-6-6 6" />
              </svg>
            </button>
          </div>
        )}

        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl flex-shrink-0">
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

      {/* Logo-themed styling with cyan accents */}
      <style jsx global>{`
        /* Smooth scrolling */
        .scroll-smooth {
          scroll-behavior: smooth;
        }
        
        /* Responsive text breaking for crypto addresses */
        .message-content,
        .message-content * {
          word-break: break-word;
          overflow-wrap: break-word;
          max-width: 100%;
        }
        
        /* Crypto addresses and long strings */
        .message-content code,
        .message-content pre {
          word-break: break-all;
          white-space: pre-wrap;
          overflow-wrap: break-word;
          font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
          font-size: 0.9em;
        }
        
        /* Mobile responsive improvements */
        @media (max-width: 768px) {
          .message-content {
            font-size: 14px;
            line-height: 1.5;
          }
          
          .message-content code,
          .message-content pre {
            font-size: 12px;
            padding: 4px 6px;
            border-radius: 4px;
          }
          
          /* Ensure long strings don't break mobile layout */
          * {
            max-width: 100%;
            box-sizing: border-box;
          }
          
          /* Mobile viewport handling */
          .h-dvh {
            height: 100vh;
            height: 100dvh;
          }
        }
        
        /* DeFiSeek cyan theme matching the logo */
        :root {
          --defiseek-cyan: #00ffff;
          --defiseek-cyan-light: #4dffff;
          --defiseek-cyan-dark: #00cccc;
          --defiseek-glow: 0 0 20px rgba(0, 255, 255, 0.3);
        }
        
        /* Subtle cyan accents */
        .border-cyan-accent {
          border-color: rgba(0, 255, 255, 0.2);
        }
        
        .bg-cyan-glow {
          background: radial-gradient(circle at center, rgba(0, 255, 255, 0.05) 0%, transparent 70%);
        }
        
        .text-cyan-accent {
          color: var(--defiseek-cyan);
        }
        
        /* Hover states with cyan */
        .hover-cyan:hover {
          border-color: rgba(0, 255, 255, 0.4);
          box-shadow: var(--defiseek-glow);
        }
        
        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 255, 0.3);
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 255, 0.5);
        }
        
        /* Dark mode scrollbar */
        .dark ::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 255, 0.4);
        }
        
        .dark ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 255, 0.6);
        }
        
        /* Selection color matching logo */
        ::selection {
          background: rgba(0, 255, 255, 0.3);
          color: inherit;
        }
        
        /* Smooth transitions */
        * {
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
      `}</style>
    </>
  );
}