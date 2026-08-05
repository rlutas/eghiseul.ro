/**
 * GET /api/admin/collaborators/avocat-decont?month=YYYY-MM[&format=tsv]
 *
 * Decontul avocatei colaboratoare (cazier judiciar / auto / fiscal) — replica
 * în admin a raportului cerut de Raul (05.08.2026): per comandă, componentele
 * care îi revin cabinetului (cazier + urgență + apostilă Haga), cu reducerile
 * de cupon aplicate proporțional și FĂRĂ livrare / traducere / legalizare /
 * apostilă notarilor. Onorariul (15 RON/comandă) e afișat separat — nu se
 * adună la total, se scade la decontare.
 *
 * Doar comenzile eghiseul — CJO/ecazier au DB-uri separate; decontul CJO se
 * scoate separat (script sesiune 05.08).
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

const CAZIER_SLUGS = [
  'cazier-judiciar',
  'cazier-judiciar-persoana-fizica',
  'cazier-judiciar-persoana-juridica',
  'cazier-auto',
  'cazier-fiscal',
];

/** Onorariul avocatei per comandă (RON). */
const ONORARIU_PER_COMANDA = 15;

const TVA = 1.21;

interface DecontRow {
  id: string;
  orderNumber: string;
  paidAt: string;
  client: string;
  service: string;
  status: string;
  isTest: boolean;
  cazier: number;
  urgenta: number;
  apostila: number;
  total: number;
  totalNet: number;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Neautentificat' }, { status: 401 });
  }
  try {
    await requirePermission(user.id, 'orders.view');
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }

  const month = request.nextUrl.searchParams.get('month') || '';
  const format = request.nextUrl.searchParams.get('format') || '';

  const admin = createAdminClient();
  let query = admin
    .from('orders')
    .select(
      'id, order_number, status, paid_at, is_test, base_price, options_price, discount_amount, selected_options, customer_data, services!inner(slug, name)'
    )
    .in('services.slug', CAZIER_SLUGS)
    .eq('payment_status', 'paid')
    .not('status', 'in', '(refunded,cancelled)')
    .order('paid_at', { ascending: true })
    .limit(2000);
  if (/^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split('-').map(Number);
    const start = new Date(Date.UTC(y, m - 1, 1)).toISOString();
    const end = new Date(Date.UTC(y, m, 1)).toISOString();
    query = query.gte('paid_at', start).lt('paid_at', end);
  }
  const { data: orders, error } = await query;
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  const rows: DecontRow[] = [];
  for (const r of orders ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const o = r as any;
    const cd = o.customer_data ?? {};
    const p = cd.personal ?? {};
    const c = cd.contact ?? {};
    const comp = cd.company ?? {};
    const bill = cd.billing ?? {};
    const client =
      `${(p.lastName || c.lastName || '').trim()} ${(p.firstName || c.firstName || '').trim()}`.trim() ||
      (comp.name || comp.companyName || bill.companyName || '').trim() ||
      `${(bill.lastName || '').trim()} ${(bill.firstName || '').trim()}`.trim() ||
      c.email || '';

    const base = Number(o.base_price) || 0;
    const optsSum = Number(o.options_price) || 0;
    const disc = Number(o.discount_amount) || 0;
    // Reducerea (cupon) se aplică pe bază+opțiuni, nu pe livrare — factor
    // proporțional pe componentele avocatei, ca în raportul CSV.
    const factor = disc > 0 && base + optsSum > 0 ? 1 - disc / (base + optsSum) : 1;

    let urgenta = 0;
    let apostila = 0;
    let extraCazier = 0;
    for (const opt of o.selected_options ?? []) {
      const code = opt?.code;
      const pm = Number(opt?.price_modifier ?? opt?.priceModifier) || 0;
      if (code === 'urgenta') urgenta += pm * factor;
      else if (code === 'apostila_haga') apostila += pm * factor;
      else if (code === 'cazier_secundar' || code === 'addon_cazier_fiscal') extraCazier += pm * factor;
      // traducere / legalizare / apostila_notari / livrare — EXCLUSE
    }
    const cazier = base * factor + extraCazier;
    const total = cazier + urgenta + apostila;
    const svc = Array.isArray(o.services) ? o.services[0] : o.services;
    rows.push({
      id: o.id,
      orderNumber: o.order_number,
      paidAt: o.paid_at,
      client,
      service: svc?.name ?? svc?.slug ?? '',
      status: o.status,
      isTest: !!o.is_test,
      cazier: round2(cazier),
      urgenta: round2(urgenta),
      apostila: round2(apostila),
      total: round2(total),
      totalNet: round2(total / TVA),
    });
  }

  const real = rows.filter((r) => !r.isTest);
  const summary = {
    count: real.length,
    total: round2(real.reduce((s, r) => s + r.total, 0)),
    totalNet: round2(real.reduce((s, r) => s + r.total, 0) / TVA),
    onorarii: round2(real.length * ONORARIU_PER_COMANDA),
    onorariuPerComanda: ONORARIU_PER_COMANDA,
  };

  if (format === 'tsv') {
    const head = ['Comanda', 'Data platii', 'Client', 'Serviciu', 'Status', 'Cazier (cu TVA)', 'Urgenta', 'Apostila Haga', 'Total (cu TVA)', 'Total (fara TVA)', 'Onorariu'];
    const lines = rows.map((r) =>
      [r.orderNumber, (r.paidAt || '').slice(0, 10), r.client, r.service, r.status, r.cazier, r.urgenta, r.apostila, r.total, r.totalNet, ONORARIU_PER_COMANDA].join('\t')
    );
    lines.push('', ['TOTAL SERVICII', '', '', '', '', '', '', '', summary.total, summary.totalNet, ''].join('\t'));
    lines.push(['ONORARII (se scad la decontare)', '', '', '', '', '', '', '', '', '', summary.onorarii].join('\t'));
    return new NextResponse([head.join('\t'), ...lines].join('\n'), {
      headers: {
        'Content-Type': 'text/tab-separated-values; charset=utf-8',
        'Content-Disposition': `attachment; filename="decont-avocat-${month || 'toate'}.tsv"`,
      },
    });
  }

  return NextResponse.json({ success: true, data: { rows, summary } });
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
