/**
 * GET /api/admin/orders/priority-calls
 *
 * Coadă de priorizare pentru recuperarea telefonică a comenzilor abandonate.
 * Reia populația țintă a cron-ului `recovery-emails` (status draft/abandoned,
 * ≤30 zile, draft cu progres real dincolo de contact) și o ordonează pentru
 * un om care sună, nu pentru un cron care trimite email:
 *
 *   tier 2 — telefon străin ȘI serviciu de stare civilă (naștere/căsătorie/
 *            extras multilingv) — cazuri diaspora cu termen (ambasadă, etc.)
 *   tier 1 — telefon străin SAU serviciu de stare civilă
 *   tier 0 — restul
 *
 * Comenzile fără nume identificabil (personal/billing/contact) sau cu email
 * inventat („sssssssim@…", „test@…") NU intră în coadă — nu merită efortul
 * unui apel. Același client cu mai multe încercări (19 emailuri cu 44 de
 * comenzi în 30 de zile, audit 14.09) apare O dată, pe cea mai recentă, cu
 * contorul „×N".
 *
 * Ordinea în fiecare tier (cerere Raul 14.09 — „văd doar de-astea super
 * vechi"): întâi cele PROASPETE (<24 h, apoi <72 h — cercetare: conversia
 * scade mult după 24 h), în interiorul lor scorul de profunzime (cine a
 * completat mult nu a abandonat din prima), apoi cea mai recentă.
 *
 * Authentication: requires `orders.view` permission.
 * Query: `?includeContacted=1` arată și comenzile deja sunate (implicit ascunse).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import {
  hasProgressBeyondContact,
  isForeignPhone,
  dataDepthScore,
  identifiableName,
} from '@/lib/orders/abandoned-progress';
import { isSuspiciousEmail, isUndeliverable } from '@/lib/email/deliverability';

const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

// Servicii de stare civilă — prioritate mare: diaspora, termene de ambasadă/
// oficiu stare civilă, valoare/urgență ridicată (cercetare telefon vs email).
const CIVIL_STATUS_SLUGS = new Set([
  'certificat-nastere',
  'certificat-casatorie',
  'extras-multilingv-certificat-nastere',
]);

interface PriorityRow {
  id: string;
  friendlyOrderId: string | null;
  orderNumber: string | null;
  status: string;
  totalRon: number;
  createdAt: string;
  updatedAt: string;
  serviceName: string;
  serviceSlug: string | null;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  isForeignPhone: boolean;
  isCivilStatus: boolean;
  depthScore: number;
  tier: 0 | 1 | 2;
  phoneContactedAt: string | null;
  phoneContactedBy: string | null;
  phoneContactNotes: string | null;
  /** Câte comenzi draft/abandonate are același email în fereastră (1 = doar aceasta). */
  duplicateCount: number;
  /** 0 = <24 h, 1 = <72 h, 2 = mai vechi. */
  freshness: 0 | 1 | 2;
}

const DAY = 86_400_000;
function freshnessOf(createdAt: string, now: number): 0 | 1 | 2 {
  const age = now - new Date(createdAt).getTime();
  return age < DAY ? 0 : age < 3 * DAY ? 1 : 2;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  try {
    await requirePermission(user.id, 'orders.view');
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }

  const includeContacted = request.nextUrl.searchParams.get('includeContacted') === '1';

  const admin = createAdminClient();
  const minIso = new Date(Date.now() - MAX_AGE_MS).toISOString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ordersTable = admin.from('orders') as any;
  let query = ordersTable
    .select(
      'id, order_number, friendly_order_id, status, total_price, customer_data, created_at, updated_at, phone_contacted_at, phone_contacted_by, phone_contact_notes, services(name, slug)'
    )
    .in('status', ['abandoned', 'draft'])
    .gte('created_at', minIso)
    .order('created_at', { ascending: false })
    .limit(300);

  if (!includeContacted) {
    query = query.is('phone_contacted_at', null);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_FAILED', message: error.message } },
      { status: 500 }
    );
  }

  const rows: PriorityRow[] = [];
  for (const order of data ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cd = (order.customer_data ?? {}) as any;

    if (order.status === 'draft' && !hasProgressBeyondContact(order.customer_data)) {
      continue; // window-shopper — nimic real de discutat la telefon
    }
    const name = identifiableName(order.customer_data);
    if (!name) {
      continue; // nici nume nu avem — nu merită apel, oricum primește email
    }

    const email = ((cd.contact?.email ?? '') as string).trim().toLowerCase() || null;
    if (email && (isUndeliverable(email) || isSuspiciousEmail(email))) {
      continue; // adresă inventată — apelul ar fi pe un „client" fictiv
    }
    const phone = (cd.contact?.phone ?? null) as string | null;
    const foreign = isForeignPhone(phone);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const slug = ((order as any).services?.slug ?? null) as string | null;
    const civilStatus = slug ? CIVIL_STATUS_SLUGS.has(slug) : false;

    const tier: 0 | 1 | 2 = foreign && civilStatus ? 2 : foreign || civilStatus ? 1 : 0;
    const depthScore = dataDepthScore(order.customer_data);

    rows.push({
      id: order.id,
      friendlyOrderId: order.friendly_order_id ?? null,
      orderNumber: order.order_number ?? null,
      status: order.status,
      totalRon: Number(order.total_price ?? 0),
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      serviceName: ((order as any).services?.name ?? 'necunoscut') as string,
      serviceSlug: slug,
      email,
      phone,
      firstName: name.firstName || null,
      lastName: name.lastName || null,
      isForeignPhone: foreign,
      isCivilStatus: civilStatus,
      depthScore,
      tier,
      phoneContactedAt: order.phone_contacted_at ?? null,
      phoneContactedBy: order.phone_contacted_by ?? null,
      phoneContactNotes: order.phone_contact_notes ?? null,
      duplicateCount: 1,
      freshness: freshnessOf(order.created_at, Date.now()),
    });
  }

  // Un rând per email: cea mai recentă comandă (query-ul vine desc după
  // created_at, deci prima întâlnită), cu contorul celorlalte încercări.
  const byEmail = new Map<string, PriorityRow>();
  const deduped: PriorityRow[] = [];
  for (const r of rows) {
    if (!r.email) {
      deduped.push(r);
      continue;
    }
    const seen = byEmail.get(r.email);
    if (seen) {
      seen.duplicateCount += 1;
      if (r.depthScore > seen.depthScore) seen.depthScore = r.depthScore;
      continue;
    }
    byEmail.set(r.email, r);
    deduped.push(r);
  }

  deduped.sort((a, b) => {
    if (a.tier !== b.tier) return b.tier - a.tier;
    if (a.freshness !== b.freshness) return a.freshness - b.freshness;
    if (a.depthScore !== b.depthScore) return b.depthScore - a.depthScore;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  rows.length = 0;
  rows.push(...deduped);

  // Conversie: din toate comenzile sunate vreodată (orice vechime, orice
  // status), câte au ieșit din draft/abandoned = au dus comanda mai departe.
  // Proxy simplu — nu urmărim apeluri individuale, doar bifa curentă.
  // `from()` nou pentru fiecare: builder-ul postgrest-js își mută URL-ul la
  // fiecare filtru, deci refolosirea lui `ordersTable` ar moșteni filtrele
  // cozii (status/vechime/limit) și ar da mereu 0.
  const { count: contactedTotal } = await admin
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .not('phone_contacted_at', 'is', null);
  const { count: contactedConverted } = await admin
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .not('phone_contacted_at', 'is', null)
    .not('status', 'in', '(draft,abandoned,cancelled)');

  return NextResponse.json({
    success: true,
    data: {
      rows,
      counts: {
        total: rows.length,
        tier2: rows.filter((r) => r.tier === 2).length,
        tier1: rows.filter((r) => r.tier === 1).length,
        tier0: rows.filter((r) => r.tier === 0).length,
      },
      conversion: {
        contactedTotal: contactedTotal ?? 0,
        contactedConverted: contactedConverted ?? 0,
      },
    },
  });
}
