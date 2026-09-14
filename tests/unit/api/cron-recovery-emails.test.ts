import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Supabase fake — chain nou per from(), ca postgrest-js.
type Row = Record<string, unknown>;
interface Call {
  table: string;
  op: 'select' | 'insert' | 'update' | 'delete';
  values: Row | null;
  filters: string[];
}
const state = { calls: [] as Call[], candidates: [] as Row[] };

function chain(table: string) {
  const local: Call = { table, op: 'select', values: null, filters: [] };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = {};
  c.select = () => c;
  c.insert = (v: Row) => ((local.op = 'insert'), (local.values = v), c);
  c.update = (v: Row) => ((local.op = 'update'), (local.values = v), c);
  c.delete = () => ((local.op = 'delete'), c);
  for (const m of ['eq', 'in', 'lt', 'gte', 'lte', 'order', 'limit', 'is']) {
    c[m] = (...args: unknown[]) => (local.filters.push(`${m}:${args.map(String).join(',')}`), c);
  }
  c.then = (ok: (v: unknown) => unknown, err?: (e: unknown) => unknown) => {
    state.calls.push(local);
    const res =
      local.op === 'select' && table === 'orders'
        ? { data: state.candidates, error: null }
        : local.op === 'delete' && table === 'coupons'
          ? { data: [{ id: 'old1' }, { id: 'old2' }], error: null }
          : { data: null, error: null };
    return Promise.resolve(res).then(ok, err);
  };
  return c;
}
const persistentFrom = vi.fn((table: string) => chain(table));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn(() => ({ from: persistentFrom })) }));

const { sendEmail } = vi.hoisted(() => ({ sendEmail: vi.fn() }));
vi.mock('@/lib/email/resend', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/email/resend')>()),
  sendEmail,
}));

const { POST } = await import('@/app/api/cron/recovery-emails/route');

const NOW = new Date('2026-09-14T12:00:00Z');
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3_600_000).toISOString();

function makeReq(): NextRequest {
  return new NextRequest('http://localhost:3000/api/cron/recovery-emails', {
    method: 'POST',
    headers: { authorization: 'Bearer secret123' },
  });
}

function order(id: string, step: number, lastSentHoursAgo: number | null, extra: Row = {}): Row {
  return {
    id,
    order_number: null,
    friendly_order_id: `E-${id}`,
    status: 'abandoned',
    total_price: 199,
    customer_data: { contact: { email: `${id}@gmail.com` }, personal: { firstName: 'Ana' } },
    updated_at: hoursAgo(5),
    recovery_email_step: step,
    recovery_email_last_sent_at: lastSentHoursAgo === null ? null : hoursAgo(lastSentHoursAgo),
    services: { name: 'Cazier Judiciar', slug: 'cazier-judiciar-persoana-fizica', processing_config: { estimated_days_display: '3-5 zile lucrătoare' } },
    ...extra,
  };
}

beforeEach(() => {
  vi.useFakeTimers({ now: NOW, toFake: ['Date'] });
  vi.stubEnv('CRON_SECRET', 'secret123');
  vi.spyOn(console, 'error').mockImplementation(() => {});
  state.calls = [];
  state.candidates = [];
  sendEmail.mockReset();
  sendEmail.mockResolvedValue({ id: 're_1', skipped: false });
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

const orderUpdates = () => state.calls.filter((c) => c.table === 'orders' && c.op === 'update');
const couponInserts = () => state.calls.filter((c) => c.table === 'coupons' && c.op === 'insert');

describe('secvența de recovery în 3 pași', () => {
  it('selectează doar comenzile cu pasul < 3', async () => {
    await POST(makeReq());
    const sel = state.calls.find((c) => c.table === 'orders' && c.op === 'select')!;
    expect(sel.filters).toContain('lt:recovery_email_step,3');
    expect(sel.filters).toContain('in:status,abandoned,draft');
  });

  it('pasul 1: fără cupon, link fără ?coupon, stampează recovery_email_sent_at + step 1', async () => {
    state.candidates = [order('a', 0, null)];
    const body = await (await POST(makeReq())).json();

    expect(body.data.byStep).toEqual({ 1: 1, 2: 0, 3: 0 });
    expect(couponInserts()).toHaveLength(0);
    const mail = sendEmail.mock.calls[0][0];
    expect(mail.subject).toMatch(/te așteaptă/);
    expect(mail.html).not.toContain('coupon=');
    expect(mail.html).not.toMatch(/reducere/i);
    expect(mail.idempotencyKey).toBe('recovery-a-step1');
    const upd = orderUpdates()[0].values!;
    expect(upd.recovery_email_step).toBe(1);
    expect(upd.recovery_email_sent_at).toBeTruthy();
    expect(upd.recovery_email_last_sent_at).toBeTruthy();
  });

  it('pasul 2 abia după 24 h de la pasul 1; fără cupon, cu dovada socială', async () => {
    state.candidates = [order('early', 1, 10), order('due', 1, 25)];
    const body = await (await POST(makeReq())).json();

    expect(body.data.byStep).toEqual({ 1: 0, 2: 1, 3: 0 });
    expect(body.data.results.find((r: Row) => r.orderId === 'early').reason).toBe('waiting for next step');
    expect(couponInserts()).toHaveLength(0);
    const mail = sendEmail.mock.calls[0][0];
    expect(mail.subject).toMatch(/Ce se întâmplă după ce plătești/);
    expect(mail.html).toContain('pe Google');
    expect(orderUpdates()[0].values!.recovery_email_step).toBe(2);
    expect(orderUpdates()[0].values!.recovery_email_sent_at).toBeUndefined(); // rămâne = primul email
  });

  it('pasul 3 abia după 48 h de la pasul 2: cupon 10%/48h, link cu ?coupon, secvență terminată', async () => {
    state.candidates = [order('early', 2, 30), order('due', 2, 50, { status: 'draft' })];
    const body = await (await POST(makeReq())).json();

    expect(body.data.byStep).toEqual({ 1: 0, 2: 0, 3: 1 });
    expect(couponInserts()).toHaveLength(1);
    const coupon = couponInserts()[0].values!;
    expect(coupon.system_kind).toBe('recovery');
    expect(coupon.discount_value).toBe(10);
    expect(coupon.max_uses).toBe(1);
    const mail = sendEmail.mock.calls[0][0];
    expect(mail.subject).toMatch(/reducere 10% pe 48h/);
    expect(mail.html).toContain(`coupon=${coupon.code}`);
    // href-ul e escapat în HTML (& → &amp;); varianta text are URL-ul brut.
    expect(mail.text).toContain(`/comanda/cazier-judiciar-persoana-fizica?order=E-due&email=due%40gmail.com&coupon=${coupon.code}`);
    expect(orderUpdates()[0].values!.recovery_email_step).toBe(3);
  });

  it('draft activ (<2h idle) sau doar cu contact → sărit, fără avans de pas', async () => {
    state.candidates = [
      order('active', 0, null, { status: 'draft', updated_at: hoursAgo(1) }),
      order('contactonly', 0, null, { status: 'draft', customer_data: { contact: { email: 'c@gmail.com' } } }),
    ];
    const body = await (await POST(makeReq())).json();
    expect(sendEmail).not.toHaveBeenCalled();
    expect(orderUpdates()).toHaveLength(0);
    expect(body.data.results.map((r: Row) => r.reason)).toEqual(['draft still active', 'contact-only draft']);
  });

  it('curăță cupoanele de sistem expirate de >7 zile și nefolosite (nu pe cele manuale)', async () => {
    const body = await (await POST(makeReq())).json();
    const del = state.calls.find((c) => c.table === 'coupons' && c.op === 'delete')!;
    expect(del.filters).toContain('in:system_kind,recovery,phone_recovery');
    expect(del.filters).toContain('eq:times_used,0');
    expect(del.filters.some((f) => f.startsWith('lt:valid_until,'))).toBe(true);
    expect(body.data.cleanedCoupons).toBe(2);
  });

  it('email inventat (sssssss@…) → sărit, nu-l trimitem la Resend', async () => {
    state.candidates = [order('fake', 0, null, { customer_data: { contact: { email: 'sssssssim@yahoo.com' }, personal: { firstName: 'X' } } })];
    const body = await (await POST(makeReq())).json();
    expect(sendEmail).not.toHaveBeenCalled();
    expect(body.data.results[0].reason).toBe('undeliverable or suspicious email');
  });

  it('Resend neconfigurat → pasul NU avansează (retry la rularea următoare)', async () => {
    state.candidates = [order('a', 0, null)];
    sendEmail.mockResolvedValue({ id: null, skipped: true, reason: 'RESEND_API_KEY not set' });
    await POST(makeReq());
    expect(orderUpdates()).toHaveLength(0);
  });
});
