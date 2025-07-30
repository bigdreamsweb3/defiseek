import { auth } from '@/app/(auth)/auth';
import { getChatById } from '@/db/queries';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const session = await auth();
  
  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });
    
    if (!chat) {
      return Response.json({ exists: false });
    }
    
    if (chat.userId !== session.user.id) {
      return Response.json({ exists: false });
    }
    
    return Response.json({ exists: true });
  } catch (error) {
    console.error('Error checking chat existence:', error);
    return Response.json({ exists: false });
  }
}
