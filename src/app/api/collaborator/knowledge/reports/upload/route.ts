import { NextRequest } from 'next/server';
import { handleReportShotUpload } from '@/lib/knowledge/chat-route';

/** POST /api/collaborator/knowledge/reports/upload { contentType, size, name } — URL semnat pentru o captură la raport. */
export async function POST(request: NextRequest) {
  return handleReportShotUpload(request, 'collaborator');
}
