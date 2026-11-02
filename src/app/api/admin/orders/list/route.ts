import { NextRequest, NextResponse } from 'next/server';
import { slimCustomerData } from '@/lib/admin/slim-customer-data';
import { unreadClientMessageCounts } from '@/lib/orders/messages';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission, getUserPermissions } from '@/lib/admin/permissions';
import { applyStatusFilter, parseTestFilter, resolveStatusFilter } from '@/lib/admin/orders-tabs';
import { LAWYER_SERVICE_SLUGS } from '@/lib/documents/no-lawyer-services';
import { applyQuickOrStage } from '@/lib/admin/order-quick-filters';
import { getOpenOutages } from '@/lib/services/platform-services';
import { buildCallIndex, findCall, type CalledOrderRef } from '@/lib/orders/phone-recovery-wins';
import { findClaim, hidesFromAbandoned, MATCH_WINDOW_DAYS, pickVisibleIds, type ClaimReason } from '@/lib/orders/recovery-claims';
import { loadRecoveryClaimIndex } from '@/lib/orders/recovery-claims-loader';

// Calls logged in „Recuperare telefonică" within this window are shown on the
// unpaid orders, matched by email or phone across all the client's orders.
const CALL_MARK_DAYS = 60;

/**
 * GET /api/admin/orders/list - List all orders (for admin)
 * Query params:
 * - status: filter by status (default: all non-draft)
 * - search: search by order number, email, name, AWB
 * - page: page number (0-indexed, default 0)
 * - limit: number of results per page (default 25)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authentication
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

    // Check permission
    try {
      await requirePermission(user.id, 'orders.view');
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }
    // Rolul decide scoparea listei: avocatul vede DOAR comenzile serviciilor
    // cu avocat (cele fără avocat — constatator/CF/cadastru — nu o privesc),
    // același principiu ca scoparea colaboratorului pe serviciile asignate.
    const { role: userRole } = await getUserPermissions(user.id);

    const adminClient = createAdminClient();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    const service = searchParams.get('service') || '';
    const page = parseInt(searchParams.get('page') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '25', 10);
    // Sandbox/test filter (parity with cazierjudiciaronline.com):
    //   ?test=only → only test orders (Stripe test-mode)
    //   ?test=all  → both test + live
    //   anything else (default = "hide") → live only (is_test=false)
    const testFilter = parseTestFilter(searchParams.get('test'));

    const SELECT = `
        id,
        friendly_order_id,
        order_number,
        status,
        current_step,
        stripe_checkout_session_id,
        payment_failed_count,
        payment_last_error,
        total_price,
        payment_status,
        payment_method,
        courier_provider,
        courier_service,
        delivery_tracking_number,
        delivery_method,
        is_test,
        platform,
        customer_data:customer_data_list,
        selected_options,
        created_at,
        paid_at,
        estimated_completion_date,
        invoice_number,
        invoice_url,
        coupon_code,
        admin_notes,
        services(name, slug)
      `;

    // Scopare avocat: DOAR serviciile prin avocat (restul nu o privesc).
    let lawyerServiceIds: string[] | null = null;
    if (userRole === 'avocat') {
      const { data: lawyerServices } = await adminClient
        .from('services')
        .select('id')
        .in('slug', [...LAWYER_SERVICE_SLUGS]);
      lawyerServiceIds = (lawyerServices ?? []).map((s) => s.id);
    }
    const platformFilter = searchParams.get('platform');
    const quick = searchParams.get('quick') || '';

    // Every filter of the list, as one function: the page query, the id
    // prefix and the „Recuperare telefonică" lookups below must see the same rows.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const withFilters = (q: any): any => {
      // Apply status filter via the shared resolver — supports tab values
      // (paid/processing/shipped/completed/abandoned) plus the all + debug
      // statuses (draft/pending/etc).
      q = applyStatusFilter(q, resolveStatusFilter(status));
      // Sandbox/test filter — three-state chip group: hide | only | all.
      if (testFilter === 'only') q = q.eq('is_test', true);
      else if (testFilter === 'hide') q = q.eq('is_test', false);
      // Brand filter (`?platform=eghiseul|documentero`) — the two public sites
      // share this list; the chip narrows it to one of them.
      if (platformFilter === 'eghiseul' || platformFilter === 'documentero') {
        q = q.eq('platform', platformFilter);
      }
      // Service filter — exact match on service_id (UUID). The UI passes the
      // service id from the services dropdown.
      if (service) q = q.eq('service_id', service);
      if (lawyerServiceIds) {
        // Fără potrivire = niciun serviciu prin avocat → listă goală, nu listă completă.
        q = q.in('service_id', lawyerServiceIds.length > 0 ? lawyerServiceIds : ['00000000-0000-0000-0000-000000000000']);
      }
      // Quick-filter / workflow-stage chip (overdue | deadline_soon | with_coupon
      // | documents_generated | submitted | received | ready).
      if (quick) q = applyQuickOrStage(q, quick);
      // Apply search filter (server-side). Parity with sister: also match client
      // name (first/last), phone and billing name — the team looks people up by name.
      if (search) {
        // PostgREST uses -> for JSON traversal, ->> for text extraction.
        q = q.or(
          [
            `order_number.ilike.%${search}%`,
            `friendly_order_id.ilike.%${search}%`,
            `delivery_tracking_number.ilike.%${search}%`,
            `customer_data->contact->>email.ilike.%${search}%`,
            `customer_data->contact->>phone.ilike.%${search}%`,
            `customer_data->personal->>firstName.ilike.%${search}%`,
            `customer_data->personal->>lastName.ilike.%${search}%`,
            `customer_data->billing->>name.ilike.%${search}%`,
          ].join(',')
        );
      }
      return q;
    };
    // paid_at first: o comandă creată ca draft ieri și plătită azi trebuie
    // să apară în top AZI (echipa se uită la capul listei) — sortarea pe
    // created_at o îngropa printre comenzile de ieri (caz real E-260714-773QA).
    // Neplătitele (paid_at null) cad pe created_at.
    // `nullsFirst`: an order that is live but not yet paid (transfer bancar
    // with the proof uploaded, E-260918-SJCQY) has paid_at NULL — with
    // NULLS LAST it sank under every paid order onto the final page of
    // „Toate" and looked lost. Drafts/pending are already out of this list.
    // Closed orders (completed / cancelled / refunded — `is_closed`, a
    // generated column, migration 179) sink under the live ones: they need
    // nothing from the team, and „Toate" is read from the top (Raul,
    // 18.09.2026). Inside each half the recency order below still applies.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const withOrder = (q: any): any =>
      q
        .order('is_closed', { ascending: true })
        .order('paid_at', { ascending: false, nullsFirst: true })
        .order('created_at', { ascending: false });

    // „Abandonuri" / „Neplătite" without the clients of „Recuperare
    // telefonică" (team request 12.10.2026: the same client was called from
    // both lists). Hidden by default: clients waiting in „De sunat" and those
    // with a „Nu a răspuns" (retried from the queue). A client already called
    // stays visible with „Sunat" (owner decision 02.11.2026).
    // `?includeRecovery=1` shows the hidden ones, marked. A search shows
    // everything (looking a client up must find them).
    const isUnpaidTab = status === 'abandoned';
    const includeRecovery = searchParams.get('includeRecovery') === '1';
    let claimIndex: Map<string, ClaimReason> | null = null;
    const hiddenReasons = new Map<string, ClaimReason>();
    if (isUnpaidTab) {
      claimIndex = await loadRecoveryClaimIndex(adminClient);
      if (!search && claimIndex.size > 0) {
        // One contact read per unpaid order of the window (an `or` of 40
        // email/phone conditions re-reads customer_data per condition and hit
        // the statement timeout, measured 02.11.2026).
        const since = new Date(Date.now() - MATCH_WINDOW_DAYS * 86_400_000).toISOString();
        for (let from = 0; from < 5000; from += 1000) {
          const res = await withFilters(adminClient.from('orders').select('id, contact:customer_data->contact'))
            .gte('created_at', since)
            .order('created_at', { ascending: false })
            .range(from, from + 999);
          if (res.error) {
            console.error('List orders: recovery lookup failed:', res.error.message);
            break;
          }
          const batch = (res.data ?? []) as Array<{ id: string; contact: { email?: string | null; phone?: string | null } | null }>;
          for (const row of batch) {
            const reason = findClaim(claimIndex, row.contact?.email, row.contact?.phone);
            if (hidesFromAbandoned(reason)) hiddenReasons.set(row.id, reason!);
          }
          if (batch.length < 1000) break;
        }
      }
    }
    const hideRecovery = isUnpaidTab && !search && !includeRecovery && hiddenReasons.size > 0;

    let orders: unknown[] | null = null;
    let error: { message: string } | null = null;
    let count: number | null = null;
    if (!hideRecovery) {
      const res = await withOrder(withFilters(adminClient.from('orders').select(SELECT, { count: 'estimated' }))).range(
        page * limit,
        (page + 1) * limit - 1
      );
      orders = res.data;
      error = res.error;
      count = res.count;
    } else {
      // The ids in list order, far enough to hold this page once the hidden
      // ones are skipped (PostgREST returns at most 1000 rows per request).
      const offset = page * limit;
      const need = offset + limit + hiddenReasons.size;
      const orderedIds: string[] = [];
      for (let from = 0; from < need; from += 1000) {
        const to = Math.min(from + 999, need - 1);
        const res = await withOrder(withFilters(adminClient.from('orders').select('id'))).range(from, to);
        if (res.error) {
          error = res.error;
          break;
        }
        const batch = ((res.data ?? []) as Array<{ id: string }>).map((r) => r.id);
        orderedIds.push(...batch);
        if (batch.length < to - from + 1) break;
      }
      const pageIds = pickVisibleIds(orderedIds, new Set(hiddenReasons.keys()), offset, limit);
      if (!error) {
        const [pageRes, countRes] = await Promise.all([
          pageIds.length
            ? withFilters(adminClient.from('orders').select(SELECT)).in('id', pageIds)
            : Promise.resolve({ data: [], error: null }),
          withFilters(adminClient.from('orders').select('id', { count: 'exact', head: true })),
        ]);
        error = pageRes.error ?? countRes.error ?? null;
        const position = new Map(pageIds.map((id, i) => [id, i]));
        orders = ((pageRes.data ?? []) as Array<{ id: string }>).sort(
          (a, b) => (position.get(a.id) ?? 0) - (position.get(b.id) ?? 0)
        );
        count = Math.max(0, (countRes.count ?? 0) - hiddenReasons.size);
      }
    }
    const recoveryHidden = isUnpaidTab && !search
      ? {
          total: hiddenReasons.size,
          queue: [...hiddenReasons.values()].filter((r) => r === 'queue').length,
          noAnswer: [...hiddenReasons.values()].filter((r) => r === 'no_answer').length,
          shown: !hideRecovery,
        }
      : null;

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Team-note counts per order (sister parity: StickyNote icon + count in
    // the list). Counts human-authored order_history notes (non-empty, not
    // system-*) for just the current page of orders — one cheap query.
    const noteCounts: Record<string, number> = {};
    const orderRows = (orders || []) as unknown as Array<Record<string, unknown> & { id: string }>;
    const ids = orderRows.map((o) => o.id);
    // The five lookups below only depend on the current page of orders, so
    // they run in parallel (they used to run one after another: ~2–5 s on
    // „Abandonuri”, 14.10.2026).
    const loadNotes = async () => {
    if (ids.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: noteRows } = await (adminClient as any)
        .from('order_history')
        .select('order_id, changed_by, notes')
        .in('order_id', ids)
        .eq('event_type', 'note_added')
        .not('notes', 'is', null)
        .not('changed_by', 'is', null);
      for (const r of (noteRows || []) as Array<{ order_id: string; changed_by: string | null; notes: string | null }>) {
        // Team-added notes only: real author (auto-generated rows have
        // changed_by NULL) and not a system job.
        const by = (r.changed_by || '').toLowerCase();
        if (!by || by.startsWith('system')) continue;
        if (!(r.notes || '').trim()) continue;
        noteCounts[r.order_id] = (noteCounts[r.order_id] || 0) + 1;
      }
    }

    };

    // Nr. contract asistență + delegație per comandă (order_documents) —
    // afișate sub numărul comenzii, paritate cu admin-ul CJO.
    const barouByOrder: Record<string, { contract: string | null; delegation: string | null }> = {};
    const loadBarou = async () => {
    if (orderRows.length) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: docNumbers } = await (adminClient as any)
        .from('order_documents')
        .select('order_id, type, document_number')
        .in('order_id', orderRows.map((o) => o.id))
        .in('type', ['contract_asistenta', 'imputernicire'])
        .not('document_number', 'is', null);
      for (const d of (docNumbers ?? []) as { order_id: string; type: string; document_number: string }[]) {
        const entry = (barouByOrder[d.order_id] ??= { contract: null, delegation: null });
        if (d.type === 'contract_asistenta') entry.contract = d.document_number;
        else entry.delegation = d.document_number;
      }
    }

    };

    // Starea automatizării ONRC per comandă (constatator) — lista arată un badge
    // roșu când botul a eșuat, ca echipa să știe că trebuie făcut manual fără
    // să deschidă /admin/onrc (incident 14.09.2026: 2 comenzi plătite, eșuate
    // tăcut). Un job per comandă; dacă sunt mai multe, îl luăm pe cel mai nou.
    const onrcByOrder: Record<string, { status: string; error_message: string | null }> = {};
    const loadOnrc = async () => {
    if (orderRows.length) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: onrcJobs } = await (adminClient as any)
        .from('onrc_jobs')
        .select('order_id, status, error_message, created_at')
        .in('order_id', orderRows.map((o) => o.id))
        .order('created_at', { ascending: false });
      for (const j of (onrcJobs ?? []) as { order_id: string; status: string; error_message: string | null }[]) {
        if (!onrcByOrder[j.order_id]) onrcByOrder[j.order_id] = { status: j.status, error_message: j.error_message };
      }
    }

    };

    // Open ANCPI/ONRC outage windows — the list UI shows instant services
    // (extras CF / plan cadastral / constatator) as "on hold" instead of a
    // deadline while the backing platform is down.
    // „Sunat" marker on unpaid orders: a call logged on ANY order of the same
    // client (email or phone) counts, so the team sees in „Neplătite" who was
    // already called from „Recuperare telefonică" and does not call twice.
    const callByOrder: Record<string, ReturnType<typeof findCall>> = {};
    const unpaidRows = orderRows.filter((o) => !o.paid_at);
    const loadCalls = async () => {
    if (unpaidRows.length) {
      const callSince = new Date(Date.now() - CALL_MARK_DAYS * 86_400_000).toISOString();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: calledRows, error: calledError } = await (adminClient as any)
        .from('orders')
        .select('id, friendly_order_id, order_number, contact:customer_data->contact, phone_contacted_at, phone_contacted_by, phone_contact_notes')
        .not('phone_contacted_at', 'is', null)
        .gte('phone_contacted_at', callSince)
        .limit(2000);
      if (calledError) console.error('List orders: called orders fetch failed:', calledError.message);
      const contactOf = (cd: unknown) =>
        ((cd as { contact?: { email?: string | null; phone?: string | null } } | null)?.contact) ?? {};
      const callIndex = buildCallIndex(
        ((calledRows ?? []) as Array<Record<string, unknown>>).map((o): CalledOrderRef => ({
          email: ((o.contact as { email?: string | null } | null)?.email) ?? null,
          phone: ((o.contact as { phone?: string | null } | null)?.phone) ?? null,
          at: o.phone_contacted_at as string,
          by: (o.phone_contacted_by as string | null) ?? null,
          notes: (o.phone_contact_notes as string | null) ?? null,
          ref: ((o.friendly_order_id || o.order_number) as string) ?? '',
          orderId: o.id as string,
        })),
      );
      for (const o of unpaidRows) {
        const contact = contactOf(o.customer_data);
        callByOrder[o.id] = findCall(callIndex, contact.email, contact.phone);
      }
    }

    };

    const [, , , , openOutages, unreadMessages] = await Promise.all([
      loadNotes(),
      loadBarou(),
      loadOnrc(),
      loadCalls(),
      getOpenOutages(adminClient),
      unreadClientMessageCounts(orderRows.map((o) => o.id)),
    ]);

    return NextResponse.json({
      success: true,
      data: orderRows.map((o) => ({
        ...o,
        // Old drafts carry ID scans as base64 inside customer_data (pre-S3):
        // two of them made „Abandonuri” a 795 KB response. The list only
        // needs names, contact and document types.
        customer_data: slimCustomerData(o.customer_data),
        note_count: noteCounts[o.id] || 0,
        barou: barouByOrder[o.id] ?? null,
        onrc: onrcByOrder[o.id] ?? null,
        unread_messages: unreadMessages[o.id] ?? 0,
        phone_call: callByOrder[o.id] ?? null,
        recovery_claim: claimIndex
          ? findClaim(
              claimIndex,
              (o.customer_data as { contact?: { email?: string | null } } | null)?.contact?.email,
              (o.customer_data as { contact?: { phone?: string | null } } | null)?.contact?.phone
            )
          : null,
      })),
      total: count || 0,
      openOutages,
      recoveryHidden,
    });
  } catch (error) {
    console.error('List orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}
