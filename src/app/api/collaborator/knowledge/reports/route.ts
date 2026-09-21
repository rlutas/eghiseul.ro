import { NextRequest } from 'next/server';
import { handleCreateReport } from '@/lib/knowledge/chat-route';

/** POST /api/collaborator/knowledge/reports { kind, message, context? } — colaboratorul raportează o problemă din Ghid. */
export async function POST(request: NextRequest) {
  return handleCreateReport(request, 'collaborator');
}
