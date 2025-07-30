'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Chat as PreviewChat } from '@/components/custom/chat';
import { ChatLoading } from '@/components/custom/chat-loading';
import { convertToUIMessages } from '@/lib/utils';

interface ChatPageWrapperProps {
  chatId: string;
  initialChat: any;
  initialMessages: any[];
  selectedModelId: string;
  userId: string;
}

export function ChatPageWrapper({
  chatId,
  initialChat,
  initialMessages,
  selectedModelId,
  userId,
}: ChatPageWrapperProps) {
  const [chat, setChat] = useState(initialChat);
  const [messages, setMessages] = useState(initialMessages);
  const [isLoading, setIsLoading] = useState(!initialChat);
  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (!chat && retryCount < 5) {
      const fetchChat = async () => {
        try {
          const response = await fetch(`/api/chat/${chatId}`);
          if (response.ok) {
            const chatData = await response.json();
            if (chatData && chatData.userId === userId) {
              setChat(chatData);
              
              // Fetch messages for this chat
              const messagesResponse = await fetch(`/api/messages/${chatId}`);
              if (messagesResponse.ok) {
                const messagesData = await messagesResponse.json();
                setMessages(messagesData);
              }
              
              setIsLoading(false);
            } else if (chatData && chatData.userId !== userId) {
              // Unauthorized access
              router.push('/');
            }
          } else if (response.status === 404) {
            // Chat not found, retry with exponential backoff
            const delay = Math.min(200 * Math.pow(2, retryCount), 2000);
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, delay);
          } else {
            // Other error, redirect to home
            router.push('/');
          }
        } catch (error) {
          console.error('Error fetching chat:', error);
          // Retry on network error
          const delay = Math.min(200 * Math.pow(2, retryCount), 2000);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, delay);
        }
      };

      fetchChat();
    } else if (!chat && retryCount >= 5) {
      // Max retries reached, redirect to home
      router.push('/');
    }
  }, [chat, chatId, retryCount, userId, router]);

  if (isLoading) {
    return <ChatLoading />;
  }

  if (!chat) {
    return <ChatLoading />;
  }

  return (
    <PreviewChat
      id={chat.id}
      initialMessages={convertToUIMessages(messages)}
      selectedModelId={selectedModelId}
    />
  );
}
