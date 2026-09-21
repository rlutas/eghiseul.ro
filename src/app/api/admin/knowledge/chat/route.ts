import { NextRequest } from 'next/server';
import { handleChat } from '@/lib/knowledge/chat-route';

/** POST /api/admin/knowledge/chat { question, history? } — chatbotul echipei, peste corpusul echipei. */
export const maxDuration = 60;
export async function POST(request: NextRequest) {
  return handleChat(request, 'team');
}
