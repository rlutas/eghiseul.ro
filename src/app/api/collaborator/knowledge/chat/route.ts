import { NextRequest } from 'next/server';
import { handleChat } from '@/lib/knowledge/chat-route';

/** POST /api/collaborator/knowledge/chat { question, history? } — chatbotul colaboratorului, doar peste ghidurile lui. */
export const maxDuration = 60;
export async function POST(request: NextRequest) {
  return handleChat(request, 'collaborator');
}
