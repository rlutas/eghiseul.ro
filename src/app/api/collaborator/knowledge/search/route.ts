import { NextRequest, NextResponse } from 'next/server';
import { searchDocs } from '@/lib/knowledge/docs';
import { asResponse, requireKnowledgeActor } from '@/lib/knowledge/request-auth';

/** GET /api/collaborator/knowledge/search?q=… — căutare doar în ghidurile colaboratorului. */
export async function GET(request: NextRequest) {
  try {
    await requireKnowledgeActor(request, 'collaborator');
    const q = (request.nextUrl.searchParams.get('q') || '').trim().slice(0, 200);
    if (q.length < 2) return NextResponse.json({ success: true, data: { query: q, results: [] } });
    const results = await searchDocs(q, 10, 'collaborator');
    return NextResponse.json({ success: true, data: { query: q, scope: 'collaborator', results } });
  } catch (e) {
    const r = asResponse(e);
    if (r) return r;
    console.error('[collaborator/knowledge/search] failed:', e);
    return NextResponse.json({ success: false, error: 'Eroare internă.' }, { status: 500 });
  }
}
