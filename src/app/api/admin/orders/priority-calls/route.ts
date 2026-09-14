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
 * Comenzile fără nume identificabil (doar email/telefon, nimic altceva) NU
 * intră în coadă — nu merită efortul unui apel, primesc oricum emailul
 * automat din `recovery-emails`.
 *
 * În fiecare tier, scor de profunzime mai mare primul (cine a completat mult
 * din wizard nu a abandonat "din prima" — e mai aproape de a cumpăra), apoi
 * cele mai recente abandonuri (fereastra utilă de apel se închide rapid —
 * cercetare: conversie scade mult după 24h).
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
  hasIdentifiableName,
} from '@/lib/orders/abandoned-progress';

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
    if (!hasIdentifiableName(order.customer_data)) {
      continue; // nici nume nu avem — nu merită apel, oricum primește email
    }

    const email = (cd.contact?.email ?? null) as string | null;
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
      firstName: (cd.personal?.firstName ?? cd.contact?.firstName ?? null) as string | null,
      lastName: (cd.personal?.lastName ?? cd.contact?.lastName ?? null) as string | null,
      isForeignPhone: foreign,
      isCivilStatus: civilStatus,
      depthScore,
      tier,
      phoneContactedAt: order.phone_contacted_at ?? null,
      phoneContactedBy: order.phone_contacted_by ?? null,
      phoneContactNotes: order.phone_contact_notes ?? null,
    });
  }

  rows.sort((a, b) => {
    if (a.tier !== b.tier) return b.tier - a.tier;
    if (a.depthScore !== b.depthScore) return b.depthScore - a.depthScore;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

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
