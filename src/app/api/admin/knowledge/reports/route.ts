import { NextRequest, NextResponse } from 'next/server';
import { handleCreateReport } from '@/lib/knowledge/chat-route';
import { asResponse, requireKnowledgeActor } from '@/lib/knowledge/request-auth';
import { listReports } from '@/lib/knowledge/reports';

/** POST /api/admin/knowledge/reports { kind, message, context? } — echipa raportează o problemă din Ghid. */
export async function POST(request: NextRequest) {
  return handleCreateReport(request, 'team');
}

/** GET /api/admin/knowledge/reports — lista rapoartelor (cele mai noi primele). */
export async function GET(request: NextRequest) {
  try {
    await requireKnowledgeActor(request, 'team');
    const reports = await listReports();
    return NextResponse.json({ success: true, data: { reports } });
  } catch (e) {
    const r = asResponse(e);
    if (r) return r;
    console.error('[knowledge/reports] list failed:', e);
    return NextResponse.json({ success: false, error: 'Eroare internă.' }, { status: 500 });
  }
}
