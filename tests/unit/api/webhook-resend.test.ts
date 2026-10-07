import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import crypto from 'node:crypto';
import { NextRequest } from 'next/server';

// Minimal postgrest fake: records every update and answers order lookups.
type Row = Record<string, unknown>;
const state = { orders: [] as Row[], updates: [] as { table: string; values: Row; filters: string[] }[] };
function chain(table: string) {
  const local = { op: 'select', values: null as Row | null, filters: [] as string[] };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = {};
  c.select = () => c;
  c.update = (v: Row) => ((local.op = 'update'), (local.values = v), c);
  for (const m of ['eq', 'neq', 'gte', 'order', 'limit', 'in']) {
    c[m] = (...a: unknown[]) => (local.filters.push(`${m}:${a.join(',')}`), c);
  }
  c.then = (ok: (v: unknown) => unknown, err?: (e: unknown) => unknown) => {
    if (local.op === 'update') state.updates.push({ table, values: local.values!, filters: local.filters });
    const data = local.op === 'select' && table === 'orders' ? state.orders : null;
    return Promise.resolve({ data, error: null }).then(ok, err);
  };
  return c;
}
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => ({ from: (t: string) => chain(t) }) }));
const { sendEmail } = vi.hoisted(() => ({ sendEmail: vi.fn() }));
vi.mock('@/lib/email/resend', () => ({ sendEmail }));

const { POST } = await import('@/app/api/webhooks/resend/route');

const SECRET = 'whsec_' + Buffer.from('test-secret').toString('base64');
function signed(body: object): NextRequest {
  const raw = JSON.stringify(body);
  const id = 'msg_1';
  const ts = String(Math.floor(Date.now() / 1000));
  const sig = crypto.createHmac('sha256', Buffer.from('test-secret')).update(`${id}.${ts}.${raw}`).digest('base64');
  return new NextRequest('http://localhost/api/webhooks/resend/', {
    method: 'POST',
    body: raw,
    headers: { 'svix-id': id, 'svix-timestamp': ts, 'svix-signature': `v1,${sig}` },
  });
}
const bounce = (to: string, bounceType = 'Permanent') => ({
  type: 'email.bounced',
  data: { email_id: 'e1', to: [to], subject: 'Warm-up', bounce: { type: bounceType, message: 'hard' } },
});
const contactUpdates = () => state.updates.filter((u) => u.table === 'contacts');

beforeEach(() => {
  vi.stubEnv('RESEND_WEBHOOK_SECRET', SECRET);
  vi.spyOn(console, 'error').mockImplementation(() => {});
  state.orders = [];
  state.updates = [];
  sendEmail.mockReset();
  sendEmail.mockResolvedValue({ id: 'x' });
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('POST /api/webhooks/resend — bounces', () => {
  it('hard bounce without an order: suppresses the contact, no admin alert', async () => {
    const res = await POST(signed(bounce('Ion@Gamil.com')));
    expect(res.status).toBe(200);
    expect(contactUpdates()).toHaveLength(1);
    expect(contactUpdates()[0].values.marketing_status).toBe('suppressed');
    expect(contactUpdates()[0].filters).toContain('eq:email,ion@gamil.com');
    expect(contactUpdates()[0].filters).toContain('neq:marketing_status,unsubscribed');
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('hard bounce with a recent order: flags the order AND alerts the team', async () => {
    state.orders = [{ id: 'o1', order_number: 'E-1', status: 'paid', created_at: '2026-10-06', customer_data: { contact: { phone: '07' } } }];
    await POST(signed(bounce('client@gmail.com')));
    expect(state.updates.some((u) => u.table === 'orders' && 'email_bounced_at' in u.values)).toBe(true);
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail.mock.calls[0][0].subject).toContain('E-1');
  });

  it('transient bounce (inbox full) does not suppress', async () => {
    await POST(signed(bounce('full@gmail.com', 'Transient')));
    expect(contactUpdates()).toHaveLength(0);
  });

  it('spam complaint suppresses', async () => {
    await POST(signed({ type: 'email.complained', data: { email_id: 'e2', to: ['x@yahoo.com'], subject: 's' } }));
    expect(contactUpdates()[0]?.values.marketing_status).toBe('suppressed');
  });

  it('rejects a bad signature', async () => {
    const req = signed(bounce('a@b.ro'));
    req.headers.set('svix-signature', 'v1,AAAA');
    expect((await POST(req)).status).toBe(401);
  });
});
