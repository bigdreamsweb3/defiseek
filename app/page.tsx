import { redirect } from 'next/navigation';
import { getUser } from '@civic/auth/nextjs';

export default async function RootPage() {
  const user = await getUser();
  
  if (!user) {
    // User is not authenticated, redirect to login
    redirect('/login');
  }
  
  // User is authenticated, redirect to the chat interface
  // The chat interface is in the (chat) route group
  redirect('/chat');
}
