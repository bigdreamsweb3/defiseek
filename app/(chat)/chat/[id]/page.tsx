import { CoreMessage } from 'ai';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { DEFAULT_MODEL_NAME, models } from '@/neural_ops/models';
import { auth } from '@/app/(auth)/auth';
import { Chat as PreviewChat } from '@/components/custom/chat';
import { getChatById, getMessagesByChatId } from '@/db/queries';
import { convertToUIMessages } from '@/lib/utils';

// Helper function to retry getting chat with exponential backoff
async function getChatWithRetry(id: string, maxRetries = 5): Promise<any> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const chat = await getChatById({ id });

    if (chat) {
      return chat;
    }

    // If this is the last attempt, return null
    if (attempt === maxRetries - 1) {
      return null;
    }

    // Wait with exponential backoff: 100ms, 200ms, 400ms, 800ms
    const delay = Math.min(100 * Math.pow(2, attempt), 1000);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  return null;
}

export default async function Page(props: { params: Promise<any> }) {
  const params = await props.params;
  const { id } = params;

  // Try to get the chat with retry logic for newly created chats
  const chat = await getChatWithRetry(id);

  if (!chat) {
    notFound();
  }

  const session = await auth();

  if (!session || !session.user) {
    return notFound();
  }

  if (session.user.id !== chat.userId) {
    return notFound();
  }

  const messagesFromDb = await getMessagesByChatId({
    id,
  });

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('model-id')?.value;
  const selectedModelId =
    models.find((model) => model.id === modelIdFromCookie)?.id ||
    DEFAULT_MODEL_NAME;

  return (
    <PreviewChat
      id={chat.id}
      initialMessages={convertToUIMessages(messagesFromDb)}
      selectedModelId={selectedModelId}
    />
  );
}
