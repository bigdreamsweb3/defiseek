'use server';

import { CoreMessage, CoreUserMessage, generateText } from 'ai';
import { cookies } from 'next/headers';


import { DEFAULT_MODEL_NAME } from '@/neural_ops/models';
import { getChatsByUserId } from '@/db/queries';
import { customModel } from '@/neural_ops';

// Helper function to generate fallback titles when AI fails
function generateFallbackTitle(messageText: string): string {
  // Extract first meaningful words from the message
  const words = messageText
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2)
    .slice(0, 6);
  
  if (words.length === 0) {
    return 'New Chat';
  }
  
  // Create title from keywords
  const title = words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return title.slice(0, 50) + (title.length > 50 ? '...' : '');
}

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
  try {
    // Get existing chat titles for this user to avoid duplicates
    const existingChats = await getChatsByUserId({ id: userId });
    const existingTitles = existingChats.map(chat => chat.title.toLowerCase());

    // Try to generate title with AI, with fallback
    let baseTitle: string;
    
    try {
      const result = await generateText({
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
        maxRetries: 2, // Reduce retries to fail faster
        maxTokens: 100, // Limit tokens for title generation
      });
      
      baseTitle = result.text;
    } catch (aiError) {
      console.error('Failed to generate title with AI, using fallback:', aiError);
      
      // Fallback: Generate title from message content
      const messageText = typeof message.content === 'string' 
        ? message.content 
        : JSON.stringify(message.content);
      
      // Simple fallback title generation
      baseTitle = generateFallbackTitle(messageText);
    }

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
  } catch (error) {
    console.error('Error in generateTitleFromUserMessage:', error);
    // Ultimate fallback
    return `New Chat ${new Date().toLocaleDateString()}`;
  }
}
