import { auth } from '@/app/(auth)/auth';
import { getVotesByChatId, voteMessage } from '@/db/queries';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) {
    return new Response('chatId is required', { status: 400 });
  }

  const session = await auth();

  if (!session || !session.user || !session.user.email) {
    return new Response('Unauthorized', { status: 401 });
  }

  const votes = await getVotesByChatId({ id: chatId });

  return Response.json(votes, { status: 200 });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const {
      chatId,
      messageId,
      type,
    }: { chatId: string; messageId: string; type: 'up' | 'down' } = body;

    console.log('Vote request received:', { chatId, messageId, type });

    if (!chatId || !messageId || !type) {
      console.error('Missing required fields:', { chatId: !!chatId, messageId: !!messageId, type: !!type });
      return new Response('chatId, messageId and type are required', { status: 400 });
    }

    if (type !== 'up' && type !== 'down') {
      console.error('Invalid vote type:', type);
      return new Response('type must be "up" or "down"', { status: 400 });
    }

    const session = await auth();

    if (!session || !session.user || !session.user.email) {
      return new Response('Unauthorized', { status: 401 });
    }

    await voteMessage({
      chatId,
      messageId,
      type: type,
    });

    console.log('Vote successful:', { chatId, messageId, type });
    return new Response('Message voted', { status: 200 });
  } catch (error) {
    console.error('Failed to process vote request:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
