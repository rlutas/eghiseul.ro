/**
 * Cheltuielile de perioadă pe zona unui colaborator — în primul rând bugetul
 * de reclamă pentru serviciile lucrate împreună (Google Ads pe cadastru/PAD,
 * Meta). Nu se pot lega de o comandă anume, dar se scad din profit înainte de
 * împărțeala 50/50, ca orice cost real.
 *
 * GET    ?collaboratorId=…   → lista + totalul
 * POST   { collaboratorId, label, amountRon, periodStart, periodEnd?, category?, note? }
 * DELETE ?id=…
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

const CATEGORIES = new Set(['reclama', 'abonament', 'instrumente', 'alt']);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

async function authorize() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return { error: NextResponse.json({ success: false, error: 'Neautentificat' }, { status: 401 }) };
  }
  try {
    await requirePermission(user.id, 'orders.view');
  } catch (e) {
    if (e instanceof Response) return { error: e };
    throw e;
  }
  return { userId: user.id };
}

export async function GET(request: NextRequest) {
  const auth = await authorize();
  if (auth.error) return auth.error;

  const collaboratorId = request.nextUrl.searchParams.get('collaboratorId') || '';
  if (!collaboratorId) {
    return NextResponse.json({ success: false, error: 'collaboratorId lipsă' }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  const { data, error } = await admin
    .from('collaborator_period_costs')
    .select('id, label, amount_ron, period_start, period_end, category, note')
    .eq('collaborator_id', collaboratorId)
    .order('period_start', { ascending: false })
    .limit(500);
  if (error) {
    console.error('[admin] period costs list error:', error.message);
    return NextResponse.json({ success: false, error: 'Eroare la încărcarea costurilor' }, { status: 500 });
  }

  const total = (data ?? []).reduce((s: number, c: { amount_ron: number }) => s + (Number(c.amount_ron) || 0), 0);
  return NextResponse.json({
    success: true,
    data: { costs: data ?? [], total: Math.round(total * 100) / 100 },
  });
}

export async function POST(request: NextRequest) {
  const auth = await authorize();
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => ({}));
  const collaboratorId = String(body.collaboratorId || '');
  const label = String(body.label || '').trim();
  const amount = Number(body.amountRon);
  const category = String(body.category || 'reclama');
  const periodStart = String(body.periodStart || '');
  const periodEnd = String(body.periodEnd || periodStart);

  if (!collaboratorId || !label || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ success: false, error: 'Denumire și sumă valide sunt obligatorii' }, { status: 400 });
  }
  if (!ISO_DATE.test(periodStart) || !ISO_DATE.test(periodEnd) || periodEnd < periodStart) {
    return NextResponse.json({ success: false, error: 'Perioadă invalidă' }, { status: 400 });
  }
  if (!CATEGORIES.has(category)) {
    return NextResponse.json({ success: false, error: 'Categorie necunoscută' }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  const { data, error } = await admin
    .from('collaborator_period_costs')
    .insert({
      collaborator_id: collaboratorId,
      label: label.slice(0, 200),
      amount_ron: Math.round(amount * 100) / 100,
      period_start: periodStart,
      period_end: periodEnd,
      category,
      note: body.note ? String(body.note).slice(0, 500) : null,
      created_by: auth.userId,
    })
    .select('id')
    .single();
  if (error) {
    console.error('[admin] period cost insert error:', error.message);
    return NextResponse.json({ success: false, error: 'Nu s-a putut salva costul' }, { status: 500 });
  }
  return NextResponse.json({ success: true, data: { id: data.id } });
}

export async function DELETE(request: NextRequest) {
  const auth = await authorize();
  if (auth.error) return auth.error;

  const id = request.nextUrl.searchParams.get('id') || '';
  if (!id) return NextResponse.json({ success: false, error: 'id lipsă' }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  const { error } = await admin.from('collaborator_period_costs').delete().eq('id', id);
  if (error) {
    console.error('[admin] period cost delete error:', error.message);
    return NextResponse.json({ success: false, error: 'Nu s-a putut șterge' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
