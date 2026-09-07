/**
 * GET /api/admin/collaborators/avocat-decont?month=YYYY-MM[&platform=all|eghiseul|cjo][&format=tsv]
 *
 * Decontul avocatei colaboratoare (cazier judiciar / auto / fiscal / stare
 * civilă) — replica în admin a raportului cerut de Raul (05.08.2026): per
 * comandă, componentele care îi revin cabinetului (serviciu + urgență +
 * apostilă Haga), cu reducerile de cupon aplicate proporțional și FĂRĂ
 * livrare / traducere / legalizare / apostilă notarilor. Onorariul (15
 * RON/comandă) e afișat separat — nu se adună la total, se scade la decontare.
 *
 * Din 07.09.2026 raportul acoperă AMBELE platforme care intră în decont:
 * eghiseul (DB local, descompunere din base_price/selected_options) și
 * cazierjudiciaronline (DB separat, descompunere din
 * `contract_snapshot.lineItems`). ecazier NU intră — e cabinetul ei propriu
 * (`source = 'ecazier'`, cont Stripe cabinet_tarta, facturi SmartBill EJC).
 * Plățile prin vechiul WordPress nu au DB — se adaugă manual din Stripe.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createCjoClient } from '@/lib/supabase/cjo';
import { requirePermission } from '@/lib/admin/permissions';

const CAZIER_SLUGS = [
  // Tot ce trece prin cabinetul avocatei (confirmat Raul 05.08.2026, după
  // lista de iunie a contabililor): caziere + integritate + stare civilă.
  'cazier-judiciar',
  'cazier-judiciar-persoana-fizica',
  'cazier-judiciar-persoana-juridica',
  'cazier-auto',
  'cazier-fiscal',
  'certificat-integritate',
  'certificat-nastere',
  'certificat-casatorie',
  'certificat-celibat',
  'extras-multilingv-certificat-nastere',
  'extras-multilingv-certificat-casatorie',
];

/** LISTĂ ALBĂ (regula Raul 07.09.2026): în decont intră DOAR serviciul,
 *  urgența, apostila Haga și add-on-urile de cabinet. Traducerea, legalizarea,
 *  apostila notarilor, livrarea și orice alt extra NU se includ — iar o
 *  opțiune necunoscută cade automat AFARĂ (+ avertisment în raport), ca să nu
 *  se strecoare munca terților în banii ei. */
const OPTION_URGENTA = 'urgenta';
const OPTION_APOSTILA = 'apostila_haga';
/** Add-on-uri prestate tot de cabinet (al doilea cazier, taxa de cetățean
 *  străin, extrasul multilingv, pachetele de certificate). Orice cod nou
 *  `addon_*` e tratat la fel. */
const CABINET_OPTION_CODES = new Set([
  'cetatean_strain',
  'extras_multilingv',
  'certificat_pachet',
]);
/** Coduri cunoscute care NU sunt ale cabinetului — enumerate explicit ca să
 *  nu producă avertismente inutile. */
const NON_CABINET_OPTION_CODES = new Set([
  'traducere', 'legalizare', 'apostila_notari', 'custom_extra', 'verificare_expert',
  'livrare', 'delivery', 'curier', 'transport',
]);

/** CJO nu are coduri de opțiuni — liniile din contract au doar nume. Aceleași
 *  reguli, aplicate pe text. */
const CJO_DELIVERY_RE = /fan courier|posta|poșta|sameday|easybox|dhl|cargus|curier|livrare/i;
const CJO_THIRD_PARTY_RE = /traducere|legalizare|apostila camera notarilor|apostila notari|verificare expert/i;
const CJO_URGENTA_RE = /urgen/i;
const CJO_APOSTILA_RE = /apostila haga/i;
/** Serviciile principale CJO (linia de bază a comenzii). */
const CJO_SERVICE_RE = /cazier (judiciar|fiscal|auto)|certificat (de )?integritate/i;
/** Add-on-uri de cabinet pe CJO (același rol ca `CABINET_OPTION_CODES`). */
const CJO_CABINET_ADDON_RE = /cetatean strain|cetățean străin|add-on|extras multilingv/i;

/** Nume prietenoase pentru service_type-urile CJO (nu există tabelă services). */
const CJO_SERVICE_NAMES: Record<string, string> = {
  'cazier-judiciar': 'Cazier Judiciar',
  'cazier-auto': 'Cazier Auto',
  'cazier-fiscal': 'Cazier Fiscal',
  'certificat-integritate': 'Certificat de Integritate',
};

/** Onorariul avocatei per comandă (RON). */
const ONORARIU_PER_COMANDA = 15;

const TVA = 1.21;

type Platform = 'eghiseul' | 'cjo';

interface DecontRow {
  id: string;
  platform: Platform;
  orderNumber: string;
  paidAt: string;
  client: string;
  service: string;
  status: string;
  isTest: boolean;
  cazier: number;
  urgenta: number;
  apostila: number;
  /** Add-on-uri prestate tot de cabinet (al 2-lea cazier, cetățean străin,
   *  extras multilingv, pachet) — coloană separată, dar intră în total. */
  addon: number;
  total: number;
  totalNet: number;
  /** Suma returnată clientului (RON) — comandă cu retur parțial: intră în
   *  raport, dar marcată, ca s-o poată decide Raul la decontare. */
  refunded: number;
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
  const platformParam = request.nextUrl.searchParams.get('platform') || 'all';

  let range: { start: string; end: string } | null = null;
  if (/^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split('-').map(Number);
    range = {
      start: new Date(Date.UTC(y, m - 1, 1)).toISOString(),
      end: new Date(Date.UTC(y, m, 1)).toISOString(),
    };
  }

  const warnings: string[] = [];
  const rows: DecontRow[] = [];

  if (platformParam !== 'cjo') {
    const eghRows = await loadEghiseul(range, warnings);
    rows.push(...eghRows);
  }
  if (platformParam !== 'eghiseul') {
    const cjoRows = await loadCjo(range, warnings);
    rows.push(...cjoRows);
  }
  rows.sort((a, b) => (a.paidAt || '').localeCompare(b.paidAt || ''));

  const real = rows.filter((r) => !r.isTest);
  const summary = summarize(real);
  const byPlatform = {
    eghiseul: summarize(real.filter((r) => r.platform === 'eghiseul')),
    cjo: summarize(real.filter((r) => r.platform === 'cjo')),
  };

  if (format === 'tsv') {
    const head = ['Platforma', 'Comanda', 'Data platii', 'Client', 'Serviciu', 'Status', 'Serviciu (cu TVA)', 'Urgenta', 'Apostila Haga', 'Add-on cabinet', 'Total (cu TVA)', 'Total (fara TVA)', 'Onorariu', 'Retur'];
    const lines = rows.map((r) =>
      [platformLabel(r.platform), r.orderNumber, (r.paidAt || '').slice(0, 10), r.client, r.service, r.status, r.cazier, r.urgenta, r.apostila, r.addon, r.total, r.totalNet, ONORARIU_PER_COMANDA, r.refunded || ''].join('\t')
    );
    lines.push('');
    for (const [key, s] of [['eghiseul', byPlatform.eghiseul], ['cjo', byPlatform.cjo]] as const) {
      if (!s.count) continue;
      lines.push([`TOTAL ${platformLabel(key)} (${s.count} comenzi)`, '', '', '', '', '', s.totalCazier, s.totalUrgenta, s.totalApostila, s.totalAddon, s.total, s.totalNet, s.onorarii, ''].join('\t'));
    }
    lines.push(['TOTAL GENERAL', '', '', '', '', '', summary.totalCazier, summary.totalUrgenta, summary.totalApostila, summary.totalAddon, summary.total, summary.totalNet, summary.onorarii, ''].join('\t'));
    lines.push([`  din care APOSTILE HAGA (${summary.apostilaCount} buc)`, '', '', '', '', '', '', '', summary.totalApostila, '', '', round2(summary.totalApostila / TVA), '', ''].join('\t'));
    lines.push(['ONORARII (se scad la decontare)', '', '', '', '', '', '', '', '', '', '', '', summary.onorarii, ''].join('\t'));
    lines.push(['EXCLUSE din decont: livrare, traducere, legalizare, apostila notarilor, alte extra'].join('\t'));
    return new NextResponse([head.join('\t'), ...lines].join('\n'), {
      headers: {
        'Content-Type': 'text/tab-separated-values; charset=utf-8',
        'Content-Disposition': `attachment; filename="decont-avocat-${month || 'toate'}.tsv"`,
      },
    });
  }

  return NextResponse.json({ success: true, data: { rows, summary, byPlatform, warnings } });
}

/** Comenzile eghiseul — descompunere directă din prețurile din DB. */
async function loadEghiseul(range: { start: string; end: string } | null, warnings: string[]): Promise<DecontRow[]> {
  const admin = createAdminClient();
  let query = admin
    .from('orders')
    .select(
      'id, order_number, status, paid_at, is_test, base_price, options_price, delivery_price, discount_amount, total_price, refunded_amount, additional_paid_amount, selected_options, customer_data, services!inner(slug, name)'
    )
    .in('services.slug', CAZIER_SLUGS)
    .eq('payment_status', 'paid')
    .not('status', 'in', '(refunded,cancelled)')
    .order('paid_at', { ascending: true })
    .limit(2000);
  if (range) query = query.gte('paid_at', range.start).lt('paid_at', range.end);
  const { data: orders, error } = await query;
  if (error) {
    warnings.push(`eghiseul: ${error.message}`);
    return [];
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
    let addon = 0;
    // Tot ce NU e al cabinetului (livrare + terți) — absoarbe primul retururile.
    let nonCabinet = Number(o.delivery_price) || 0;
    for (const opt of o.selected_options ?? []) {
      const code = String(opt?.code ?? '');
      const pm = Number(opt?.price_modifier ?? opt?.priceModifier) || 0;
      if (code === OPTION_URGENTA) urgenta += pm * factor;
      else if (code === OPTION_APOSTILA) apostila += pm * factor;
      else if (CABINET_OPTION_CODES.has(code) || code.startsWith('addon_')) addon += pm * factor;
      else if (NON_CABINET_OPTION_CODES.has(code)) nonCabinet += pm * factor;
      else {
        // Opțiune necunoscută: rămâne AFARĂ din decont, dar o semnalăm.
        nonCabinet += pm * factor;
        warnings.push(`${o.order_number}: opțiune necunoscută „${code || '(fără cod)'}" (${round2(pm)} RON) — exclusă din decont, verifică dacă e muncă de cabinet`);
      }
    }
    const cazier = base * factor;
    let total = cazier + urgenta + apostila + addon;
    // Componente facturate > bani încasați = opțiune adăugată fără plată
    // (link de extra netrimis/neplătit). Ar umfla decontul cu bani pe care
    // nu i-am luat — o semnalăm, nu o ascundem.
    const collected = (Number(o.total_price) || 0) + (Number(o.additional_paid_amount) || 0);
    const billed = base + optsSum + (Number(o.delivery_price) || 0) - disc;
    if (collected > 0 && billed - collected > 0.5) {
      warnings.push(`${o.order_number}: componente ${round2(billed)} RON dar încasat ${round2(collected)} RON (Δ${round2(billed - collected)}) — opțiune neplătită, verifică înainte de decont`);
    }
    const refunded = Number(o.refunded_amount) || 0;
    const scale = refundScale(refunded, nonCabinet, total);
    if (scale < 1) {
      urgenta *= scale; apostila *= scale; addon *= scale; total *= scale;
      warnings.push(`${o.order_number}: retur ${round2(refunded)} RON — partea cabinetului redusă la ${round2(total)} RON (i se decontează doar ce a rămas)`);
    }
    const cazierFinal = cazier * scale;
    const svc = Array.isArray(o.services) ? o.services[0] : o.services;
    rows.push({
      id: o.id,
      platform: 'eghiseul',
      orderNumber: o.order_number,
      paidAt: o.paid_at,
      client,
      service: svc?.name ?? svc?.slug ?? '',
      status: o.status,
      isTest: !!o.is_test,
      cazier: round2(cazierFinal),
      urgenta: round2(urgenta),
      apostila: round2(apostila),
      addon: round2(addon),
      total: round2(total),
      totalNet: round2(total / TVA),
      refunded: round2(refunded),
    });
  }
  return rows;
}

/** Comenzile cazierjudiciaronline — descompunere din liniile contractului
 *  (`contract_snapshot.lineItems`), singura sursă exactă pe CJO (nu există
 *  base_price/selected_options). Cuponul se aplică pe tot ce NU e livrare
 *  (curierul nu se discountează — verificat pe august 2026). */
async function loadCjo(range: { start: string; end: string } | null, warnings: string[]): Promise<DecontRow[]> {
  const cjo = createCjoClient();
  if (!cjo) {
    warnings.push('CJO sărit: CJO_SUPABASE_URL / CJO_SUPABASE_SERVICE_KEY lipsesc din env');
    return [];
  }
  let query = cjo
    .from('orders')
    .select('id, order_number, status, paid_at, is_test, source, service_type, amount_total, refunded_amount_bani, additional_paid_bani, contract_snapshot, nume, prenume, company_name, email')
    // ecazier (cabinetul ei propriu, Stripe cabinet_tarta / SmartBill EJC) NU intră în decont.
    .eq('source', 'cazierjudiciaronline')
    .not('paid_at', 'is', null)
    .not('status', 'in', '(cancelled,abandoned)')
    .order('paid_at', { ascending: true })
    .limit(2000);
  if (range) query = query.gte('paid_at', range.start).lt('paid_at', range.end);
  const { data: orders, error } = await query;
  if (error) {
    warnings.push(`CJO: ${error.message}`);
    return [];
  }

  const rows: DecontRow[] = [];
  for (const r of orders ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const o = r as any;
    const amount = (Number(o.amount_total) || 0) / 100;
    const refunded = (Number(o.refunded_amount_bani) || 0) / 100;
    // Retur integral = comanda nu s-a prestat; retur parțial (de obicei doar
    // curierul) rămâne în raport, marcat.
    if (refunded > 0 && refunded >= amount - 0.01) continue;

    const lineItems = Array.isArray(o.contract_snapshot?.lineItems) ? o.contract_snapshot.lineItems : [];
    if (!lineItems.length) {
      warnings.push(`${o.order_number}: fără lineItems în contract — verifică manual (${amount.toFixed(2)} RON)`);
      continue;
    }
    const positive = lineItems.filter((l: { price: number }) => Number(l.price) > 0);
    const coupon = Math.abs(lineItems.filter((l: { price: number }) => Number(l.price) < 0).reduce((s: number, l: { price: number }) => s + Number(l.price), 0));
    const discountBase = positive
      .filter((l: { name: string }) => !CJO_DELIVERY_RE.test(l.name))
      .reduce((s: number, l: { price: number }) => s + Number(l.price), 0);
    const factor = coupon > 0 && discountBase > 0 ? 1 - coupon / discountBase : 1;

    let cazier = 0;
    let urgenta = 0;
    let apostila = 0;
    let addon = 0;
    // Livrare + terți — absorb primele retururile (curierul nu se discountează).
    let nonCabinet = 0;
    for (const l of positive) {
      const name = String(l.name ?? '');
      const price = Number(l.price) || 0;
      if (CJO_DELIVERY_RE.test(name)) { nonCabinet += price; continue; }
      if (CJO_THIRD_PARTY_RE.test(name)) { nonCabinet += price * factor; continue; }
      if (CJO_URGENTA_RE.test(name)) urgenta += price * factor;
      else if (CJO_APOSTILA_RE.test(name)) apostila += price * factor;
      else if (CJO_CABINET_ADDON_RE.test(name)) addon += price * factor;
      else if (CJO_SERVICE_RE.test(name)) cazier += price * factor;
      else {
        // Linie necunoscută: rămâne AFARĂ din decont, dar o semnalăm.
        nonCabinet += price * factor;
        warnings.push(`${o.order_number}: linie necunoscută „${name}" (${round2(price)} RON) — exclusă din decont, verifică dacă e muncă de cabinet`);
      }
    }
    let total = cazier + urgenta + apostila + addon;
    const scale = refundScale(refunded, nonCabinet, total);
    if (scale < 1) {
      urgenta *= scale; apostila *= scale; addon *= scale; total *= scale;
      warnings.push(`${o.order_number}: retur ${round2(refunded)} RON — partea cabinetului redusă la ${round2(total)} RON (i se decontează doar ce a rămas)`);
    }
    const cazierFinal = cazier * scale;
    // Aceeași gardă ca pe eghiseul: liniile din contract trebuie acoperite de
    // banii încasați (comanda + eventualele plăți extra).
    const billed = lineItems.reduce((sum: number, l: { price: number }) => sum + (Number(l.price) || 0), 0);
    const collected = amount + (Number(o.additional_paid_bani) || 0) / 100;
    if (collected > 0 && billed - collected > 0.5) {
      warnings.push(`${o.order_number}: componente ${round2(billed)} RON dar încasat ${round2(collected)} RON (Δ${round2(billed - collected)}) — opțiune neplătită, verifică înainte de decont`);
    }
    rows.push({
      id: o.id,
      platform: 'cjo',
      orderNumber: o.order_number,
      paidAt: o.paid_at,
      client: `${(o.nume || '').trim()} ${(o.prenume || '').trim()}`.trim() || (o.company_name || '').trim() || o.email || '',
      service: CJO_SERVICE_NAMES[o.service_type] ?? o.service_type ?? '',
      status: o.status,
      isTest: !!o.is_test,
      cazier: round2(cazierFinal),
      urgenta: round2(urgenta),
      apostila: round2(apostila),
      addon: round2(addon),
      total: round2(total),
      totalNet: round2(total / TVA),
      refunded: round2(refunded),
    });
  }
  return rows;
}

function summarize(rows: DecontRow[]) {
  const sum = (f: (r: DecontRow) => number) => round2(rows.reduce((s, r) => s + f(r), 0));
  const total = sum((r) => r.total);
  return {
    count: rows.length,
    total,
    totalNet: round2(total / TVA),
    totalCazier: sum((r) => r.cazier),
    totalUrgenta: sum((r) => r.urgenta),
    totalAddon: sum((r) => r.addon),
    // Totalul apostilelor Haga — cerut explicit de Raul (se urmăresc separat).
    totalApostila: sum((r) => r.apostila),
    apostilaCount: rows.filter((r) => r.apostila > 0).length,
    onorarii: round2(rows.length * ONORARIU_PER_COMANDA),
    onorariuPerComanda: ONORARIU_PER_COMANDA,
  };
}

function platformLabel(p: Platform | 'eghiseul' | 'cjo'): string {
  return p === 'cjo' ? 'cazierjudiciaronline' : 'eghiseul';
}

/** Cât din partea cabinetului mai rămâne după un retur parțial.
 *  Regula Raul (07.09.2026): banii returnați se iau ÎNTÂI din ce nu e al ei
 *  (livrare, traduceri, legalizări — ex. cei 25 RON de curier de pe
 *  CJO-20260804-15831), și doar ce depășește îi taie din partea ei; i se
 *  decontează doar ce a rămas la noi. */
function refundScale(refunded: number, nonCabinet: number, cabinetTotal: number): number {
  if (!(refunded > 0) || !(cabinetTotal > 0)) return 1;
  const hitsCabinet = Math.max(0, refunded - Math.max(0, nonCabinet));
  if (hitsCabinet <= 0) return 1;
  return Math.max(0, (cabinetTotal - hitsCabinet) / cabinetTotal);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
