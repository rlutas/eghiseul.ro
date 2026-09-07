/**
 * Avansurile trimise colaboratorului pentru taxele instituțiilor.
 *
 * Banii pentru taxele OCPI pleacă din contul lui Raul în contul colaboratorului
 * (Revolut), iar consumul se înregistrează per comandă în `order_supplier_costs`.
 * Până acum soldul se putea afla doar din extrasul de cont; aici îl ținem în
 * platformă, ca să fie confruntabil la decont.
 *
 * GET  ?collaboratorId=…  → avansurile + soldul (avansuri − taxe înregistrate)
 * POST { collaboratorId, amountRon, sentAt?, method?, note? }
 * DELETE ?id=…
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { getCollaboratorServices } from '@/lib/admin/permissions';
import { sumAncpiCosts } from '@/lib/collaborator/settlement';

const METHODS = new Set(['revolut', 'card', 'transfer', 'numerar', 'alt']);

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
  const { data: advances, error } = await admin
    .from('collaborator_advances')
    .select('id, amount_ron, sent_at, method, note, created_at')
    .eq('collaborator_id', collaboratorId)
    .order('sent_at', { ascending: false })
    .limit(500);
  if (error) {
    console.error('[admin] advances list error:', error.message);
    return NextResponse.json({ success: false, error: 'Eroare la încărcarea avansurilor' }, { status: 500 });
  }

  // Consumul: taxele ANCPI înregistrate pe comenzile colaboratorului.
  const serviceIds = await getCollaboratorServices(collaboratorId);
  let spent = 0;
  if (serviceIds.length) {
    const { data: orders } = await admin
      .from('orders')
      .select('id')
      .or(`service_id.in.(${serviceIds.join(',')}),assigned_collaborator_id.eq.${collaboratorId}`)
      .eq('payment_status', 'paid')
      .neq('status', 'cancelled');
    const ids = (orders ?? []).map((o: { id: string }) => o.id);
    for (let i = 0; i < ids.length; i += 200) {
      const { data: rows } = await admin
        .from('order_supplier_costs')
        .select('supplier, category, amount_ron')
        .in('order_id', ids.slice(i, i + 200));
      spent += sumAncpiCosts(rows ?? []);
    }
  }

  const sent = (advances ?? []).reduce((s: number, a: { amount_ron: number }) => s + (Number(a.amount_ron) || 0), 0);
  return NextResponse.json({
    success: true,
    data: {
      advances: advances ?? [],
      summary: {
        sent: round2(sent),
        spent: round2(spent),
        // Pozitiv = are bani la el, neconsumați încă în taxe.
        balance: round2(sent - spent),
      },
    },
  });
}

export async function POST(request: NextRequest) {
  const auth = await authorize();
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => ({}));
  const collaboratorId = String(body.collaboratorId || '');
  const amount = Number(body.amountRon);
  const method = String(body.method || 'revolut');
  if (!collaboratorId || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ success: false, error: 'Colaborator și sumă valide sunt obligatorii' }, { status: 400 });
  }
  if (!METHODS.has(method)) {
    return NextResponse.json({ success: false, error: 'Metodă necunoscută' }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  const { data, error } = await admin
    .from('collaborator_advances')
    .insert({
      collaborator_id: collaboratorId,
      amount_ron: Math.round(amount * 100) / 100,
      sent_at: /^\d{4}-\d{2}-\d{2}$/.test(String(body.sentAt)) ? body.sentAt : new Date().toISOString().slice(0, 10),
      method,
      note: body.note ? String(body.note).slice(0, 500) : null,
      created_by: auth.userId,
    })
    .select('id')
    .single();
  if (error) {
    console.error('[admin] advance insert error:', error.message);
    return NextResponse.json({ success: false, error: 'Nu s-a putut salva avansul' }, { status: 500 });
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
  const { error } = await admin.from('collaborator_advances').delete().eq('id', id);
  if (error) {
    console.error('[admin] advance delete error:', error.message);
    return NextResponse.json({ success: false, error: 'Nu s-a putut șterge' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
