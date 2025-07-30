'use server';

import { CoreMessage, CoreUserMessage, generateText } from 'ai';
import { cookies } from 'next/headers';


import { DEFAULT_MODEL_NAME } from '@/neural_ops/models';
import { getChatsByUserId } from '@/db/queries';
import { customModel } from '@/neural_ops';

export async function saveModelId(model: string) {
  const cookieStore = await cookies();
  cookieStore.set('model-id', model);
}

export async function generateTitleFromUserMessage({
  message,
  userId,
}: {
  message: CoreUserMessage;
  userId: string;
}) {
  // Get existing chat titles for this user to avoid duplicates
  const existingChats = await getChatsByUserId({ id: userId });
  const existingTitles = existingChats.map(chat => chat.title.toLowerCase());

  const { text: baseTitle } = await generateText({
    model: customModel(DEFAULT_MODEL_NAME),
    system: `You are an expert at creating concise, descriptive, and unique chat titles for DeFi/Web3 conversations.

RULES:
- Generate a short, descriptive title (max 60 characters)
- Focus on the main topic or question being asked
- Use specific terminology when possible (e.g., "DeFi Yield Farming" instead of "Making Money")
- Make it unique and distinguishable from other conversations
- Do not use quotes, colons, or special characters
- Capitalize properly (title case)
- Be specific about the blockchain/protocol if mentioned

EXAMPLES:
- "what is web3?" → "Web3 Fundamentals Explained"
- "how to make money with crypto?" → "Crypto Investment Strategies"
- "best defi protocols?" → "Top DeFi Protocol Analysis"
- "ethereum vs solana?" → "Ethereum vs Solana Comparison"
- "yield farming guide?" → "DeFi Yield Farming Guide"

Generate a unique, descriptive title for this message:`,
    prompt: typeof message.content === 'string' ? message.content : JSON.stringify(message.content),
  });

  // Clean and format the title
  let finalTitle = baseTitle.trim()
    .replace(/['":\[\]]/g, '') // Remove quotes, colons, brackets
    .replace(/\s+/g, ' ') // Normalize whitespace
    .slice(0, 60); // Ensure max length

  // Check for duplicates and add uniqueness if needed
  let uniqueTitle = finalTitle;
  let counter = 1;

  while (existingTitles.includes(uniqueTitle.toLowerCase())) {
    counter++;
    // Add a descriptive suffix instead of just numbers
    const suffixes = ['Discussion', 'Analysis', 'Guide', 'Overview', 'Deep Dive', 'Exploration'];
    const suffix = suffixes[(counter - 2) % suffixes.length];
    uniqueTitle = `${finalTitle} ${suffix}`;

    // If still too long, truncate the base title
    if (uniqueTitle.length > 60) {
      const truncatedBase = finalTitle.slice(0, 60 - suffix.length - 1);
      uniqueTitle = `${truncatedBase} ${suffix}`;
    }
  }

  return uniqueTitle;
}
