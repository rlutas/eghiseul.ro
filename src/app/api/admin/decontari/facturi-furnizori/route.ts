/**
 * Checklist lunar „facturi furnizori fără SPV" (Meta, Google, TikTok, OpenAI…).
 *
 * GET  /api/admin/decontari/facturi-furnizori            → istoric pe luni (progres)
 * GET  /api/admin/decontari/facturi-furnizori?month=YYYY-MM → furnizorii lunii + bife
 * POST { month, supplier_key, step: downloaded|printed|handed, done: boolean }
 * POST { month, supplier_key, note }
 *
 * Furnizorii se calculează din extrasul importat (supplierFor), bifele stau în
 * supplier_invoice_checks. Auth: payments.verify.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { CHECK_STEPS, groupBySupplier, type CheckStep } from '@/lib/accounting/supplier-invoices';

const MONTH_RE = /^\d{4}-\d{2}$/;

async function authorize(): Promise<{ userId: string } | Response> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  try {
    await requirePermission(user.id, 'payments.verify');
  } catch (err) {
    if (err instanceof Response) return err;
    throw err;
  }
  return { userId: user.id };
}

function monthRange(month: string): { start: string; end: string } {
  const [y, m] = month.split('-').map(Number);
  const end = new Date(Date.UTC(m === 12 ? y + 1 : y, m === 12 ? 0 : m, 1)).toISOString().slice(0, 10);
  return { start: `${month}-01`, end };
}

type EntryRow = { reference: string; tx_date: string; description: string | null; debit_bani: number; needs_invoice: boolean };
type CheckRow = {
  month: string;
  supplier_key: string;
  downloaded_at: string | null; downloaded_by: string | null;
  printed_at: string | null; printed_by: string | null;
  handed_at: string | null; handed_by: string | null;
  note: string | null;
};

export async function GET(request: NextRequest) {
  try {
    const auth = await authorize();
    if (auth instanceof Response) return auth;
    const admin = createAdminClient();
    const month = new URL(request.url).searchParams.get('month');

    if (month && MONTH_RE.test(month)) {
      const { start, end } = monthRange(month);
      const [entriesRes, checksRes] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (admin as any)
          .from('bank_statement_entries')
          .select('reference, tx_date, description, debit_bani, needs_invoice')
          .gt('debit_bani', 0)
          .gte('tx_date', start)
          .lt('tx_date', end)
          .order('tx_date', { ascending: true })
          .limit(2000),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (admin as any).from('supplier_invoice_checks').select('*').eq('month', start),
      ]);
      if (entriesRes.error) throw new Error(entriesRes.error.message);
      if (checksRes.error) throw new Error(checksRes.error.message);

      const checks = new Map<string, CheckRow>((checksRes.data ?? []).map((c: CheckRow) => [c.supplier_key, c]));
      const userIds = [...new Set(
        (checksRes.data ?? []).flatMap((c: CheckRow) => [c.downloaded_by, c.printed_by, c.handed_by]).filter(Boolean)
      )] as string[];
      const names = new Map<string, string>();
      if (userIds.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profiles } = await (admin as any)
          .from('profiles')
          .select('id, first_name, last_name, email')
          .in('id', userIds);
        for (const p of profiles ?? []) {
          names.set(p.id, [p.first_name, p.last_name].filter(Boolean).join(' ') || p.email || '—');
        }
      }

      const suppliers = groupBySupplier(entriesRes.data as EntryRow[]).map((g) => {
        const c = checks.get(g.key);
        const step = (s: CheckStep) => {
          const at = c?.[`${s}_at` as const] ?? null;
          const by = c?.[`${s}_by` as const] ?? null;
          return at ? { at, by: by ? names.get(by) ?? '—' : '—' } : null;
        };
        return { ...g, downloaded: step('downloaded'), printed: step('printed'), handed: step('handed'), note: c?.note ?? null };
      });
      return NextResponse.json({ success: true, data: { month, suppliers } });
    }

    // Istoric: toate lunile cu extras importat, cu progresul „predate contabil".
    // PostgREST taie la 1000 de rânduri per răspuns — paginăm, altfel lunile
    // vechi ar dispărea din istoric pe măsură ce se adună extrase.
    const allEntries: EntryRow[] = [];
    for (let from = 0; ; from += 1000) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (admin as any)
        .from('bank_statement_entries')
        .select('reference, tx_date, description, debit_bani, needs_invoice')
        .gt('debit_bani', 0)
        .order('reference', { ascending: true })
        .range(from, from + 999);
      if (error) throw new Error(error.message);
      allEntries.push(...(data ?? []));
      if (!data || data.length < 1000) break;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const checksRes = await (admin as any).from('supplier_invoice_checks').select('month, supplier_key, handed_at');
    if (checksRes.error) throw new Error(checksRes.error.message);

    const byMonth = new Map<string, EntryRow[]>();
    for (const e of allEntries) {
      const m = e.tx_date.slice(0, 7);
      const list = byMonth.get(m) ?? [];
      list.push(e);
      byMonth.set(m, list);
    }
    const handed = new Set(
      (checksRes.data ?? [])
        .filter((c: { handed_at: string | null }) => c.handed_at)
        .map((c: { month: string; supplier_key: string }) => `${c.month.slice(0, 7)}|${c.supplier_key}`)
    );
    const months = [...byMonth.entries()]
      .map(([m, list]) => {
        const groups = groupBySupplier(list);
        return {
          month: m,
          suppliers: groups.length,
          handed: groups.filter((g) => handed.has(`${m}|${g.key}`)).length,
          total_bani: groups.reduce((s, g) => s + g.total_bani, 0),
        };
      })
      .filter((m) => m.suppliers > 0)
      .sort((a, b) => b.month.localeCompare(a.month));

    return NextResponse.json({ success: true, data: { months } });
  } catch (err) {
    console.error('[admin/decontari] supplier invoices list failed', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authorize();
    if (auth instanceof Response) return auth;
    const body = await request.json().catch(() => null);
    const month: unknown = body?.month;
    const supplierKey: unknown = body?.supplier_key;
    if (typeof month !== 'string' || !MONTH_RE.test(month) || typeof supplierKey !== 'string' || !supplierKey || supplierKey.length > 120) {
      return NextResponse.json({ success: false, error: 'Lună sau furnizor invalid' }, { status: 400 });
    }

    const patch: Record<string, unknown> = { month: `${month}-01`, supplier_key: supplierKey, updated_at: new Date().toISOString() };
    if (typeof body.note === 'string') {
      patch.note = body.note.trim().slice(0, 500) || null;
    } else if (CHECK_STEPS.includes(body.step) && typeof body.done === 'boolean') {
      const step = body.step as CheckStep;
      patch[`${step}_at`] = body.done ? new Date().toISOString() : null;
      patch[`${step}_by`] = body.done ? auth.userId : null;
    } else {
      return NextResponse.json({ success: false, error: 'Acțiune invalidă' }, { status: 400 });
    }

    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin as any)
      .from('supplier_invoice_checks')
      .upsert(patch, { onConflict: 'month,supplier_key' });
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/decontari] supplier invoice check failed', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
