import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/admin/permissions';
import { asResponse, requireKnowledgeActor } from '@/lib/knowledge/request-auth';
import { isReportStatus, updateReportStatus } from '@/lib/knowledge/reports';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** PATCH /api/admin/knowledge/reports/[id] { status, note? } — Raul mută raportul (nou → în lucru → rezolvat). */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireKnowledgeActor(request, 'team');
    await requirePermission(actor.id, 'settings.manage');
    const { id } = await params;
    if (!UUID_RE.test(id)) return NextResponse.json({ success: false, error: 'Raport invalid' }, { status: 400 });
    const body = (await request.json().catch(() => ({}))) as { status?: unknown; note?: unknown };
    if (!isReportStatus(body.status)) {
      return NextResponse.json({ success: false, error: 'Status invalid' }, { status: 400 });
    }
    await updateReportStatus({ id, status: body.status, note: typeof body.note === 'string' ? body.note : null, by: actor.id });
    return NextResponse.json({ success: true });
  } catch (e) {
    const r = asResponse(e);
    if (r) return r;
    console.error('[knowledge/reports] patch failed:', e);
    return NextResponse.json({ success: false, error: 'Eroare internă.' }, { status: 500 });
  }
}
