import { auth } from "@/app/(auth)/auth";
import { getChatsByUserId } from "@/db/queries";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return Response.json("Unauthorized!", { status: 401 });
    }

    const chats = await getChatsByUserId({ id: session.user.id! });
    return Response.json(chats);
  } catch (error) {
    console.error('Error in /api/history:', error);
    // Return empty array instead of 500 error to prevent UI crashes
    return Response.json([]);
  }
}
