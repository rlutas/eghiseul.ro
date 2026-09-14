import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

// ── Supabase fake ────────────────────────────────────────────────────────────
// A fresh chain per `from()` call, exactly like postgrest-js. The route MUST
// create a new `from('contacts')` for every UPDATE — reusing the SELECT
// builder would stack `id=eq.A&id=eq.B` and mark only the first contact.
// This fake records which `from()` produced each update so the test can
// assert that discipline.

type Row = Record<string, unknown>;
type Update = { fromCall: number; table: string; values: Row; filters: string[] };

const state = {
  fromCalls: 0,
  updates: [] as Update[],
  selects: [] as { fromCall: number; table: string; filters: string[] }[],
  candidates: [] as Row[],
  settings: null as Row | null,
};

function chain(table: string, fromCall: number) {
  const local = { op: 'select', values: null as Row | null, filters: [] as string[] };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = {};
  c.select = () => c;
  c.update = (v: Row) => {
    local.op = 'update';
    local.values = v;
    return c;
  };
  for (const m of ['eq', 'is', 'not', 'order', 'limit', 'in', 'gte']) {
    c[m] = (...args: unknown[]) => {
      local.filters.push(`${m}:${args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(',')}`);
      return c;
    };
  }
  c.maybeSingle = () => Promise.resolve({ data: state.settings ? { value: state.settings } : null, error: null });
  c.then = (onOk: (v: unknown) => unknown, onErr?: (e: unknown) => unknown) => {
    if (local.op === 'update') {
      state.updates.push({ fromCall, table, values: local.values!, filters: local.filters });
      return Promise.resolve({ data: null, error: null }).then(onOk, onErr);
    }
    state.selects.push({ fromCall, table, filters: local.filters });
    return Promise.resolve({ data: state.candidates, error: null }).then(onOk, onErr);
  };
  return c;
}

const persistentFrom = vi.fn((table: string) => chain(table, ++state.fromCalls));
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({ from: persistentFrom })),
}));

const { sendEmail } = vi.hoisted(() => ({ sendEmail: vi.fn() }));
vi.mock('@/lib/email/resend', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/email/resend')>()),
  sendEmail,
}));

const { ResendError } = await import('@/lib/email/resend');
const { POST } = await import('@/app/api/cron/warmup-campaign/route');

function makeReq(): NextRequest {
  return new NextRequest('http://localhost:3000/api/cron/warmup-campaign', {
    method: 'POST',
    headers: { authorization: 'Bearer secret123' },
  });
}

const contact = (id: string, email: string, extra: Row = {}): Row => ({
  id,
  email,
  first_name: 'Ana',
  services: ['cazier-judiciar'],
  unsubscribe_token: `tok-${id}`,
  ...extra,
});

beforeEach(() => {
  vi.stubEnv('CRON_SECRET', 'secret123');
  vi.spyOn(console, 'error').mockImplementation(() => {});
  // Rate-limit spacing (600 ms/send) would make the suite slow — collapse it.
  vi.spyOn(globalThis, 'setTimeout').mockImplementation(((fn: () => void) => {
    fn();
    return 0;
  }) as unknown as typeof setTimeout);
  state.fromCalls = 0;
  state.updates = [];
  state.selects = [];
  state.candidates = [];
  state.settings = null;
  persistentFrom.mockClear();
  sendEmail.mockReset();
  sendEmail.mockResolvedValue({ id: 're_1', skipped: false });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('POST /api/cron/warmup-campaign — kill switch', () => {
  it('sends nothing when the setting row is missing (default disabled)', async () => {
    state.candidates = [contact('c1', 'a@gmail.com')];
    const res = await POST(makeReq());
    const body = await res.json();
    expect(body.data.reason).toBe('disabled');
    expect(sendEmail).not.toHaveBeenCalled();
    expect(state.selects.filter((s) => s.table === 'contacts')).toHaveLength(0);
  });

  it('sends nothing when enabled=false explicitly', async () => {
    state.settings = { enabled: false, dailyBatchSize: 500 };
    state.candidates = [contact('c1', 'a@gmail.com')];
    await POST(makeReq());
    expect(sendEmail).not.toHaveBeenCalled();
  });
});

describe('POST /api/cron/warmup-campaign — batch', () => {
  it('selects only unsent, unskipped, eligible contacts, limited to dailyBatchSize', async () => {
    state.settings = { enabled: true, dailyBatchSize: 7 };
    await POST(makeReq());
    const sel = state.selects.find((s) => s.table === 'contacts')!;
    expect(sel.filters).toContain('is:warmup_email_sent_at,null');
    expect(sel.filters).toContain('is:warmup_skipped_at,null');
    expect(sel.filters).toContain('not:marketing_status,in,(unsubscribed,suppressed)');
    expect(sel.filters).toContain('limit:7');
  });

  it('marks each sent contact with a FRESH from() (no builder reuse)', async () => {
    state.settings = { enabled: true, dailyBatchSize: 25 };
    state.candidates = [contact('c1', 'a@gmail.com'), contact('c2', 'b@yahoo.com'), contact('c3', 'c@gmail.com')];

    const res = await POST(makeReq());
    const body = await res.json();

    expect(body.data.sentCount).toBe(3);
    expect(sendEmail).toHaveBeenCalledTimes(3);

    const sent = state.updates.filter((u) => 'warmup_email_sent_at' in u.values);
    expect(sent.map((u) => u.filters)).toEqual([['eq:id,c1'], ['eq:id,c2'], ['eq:id,c3']]);
    const selectCall = state.selects.find((s) => s.table === 'contacts')!.fromCall;
    for (const u of sent) expect(u.fromCall).not.toBe(selectCall);
    expect(new Set(sent.map((u) => u.fromCall)).size).toBe(3);
  });

  it('sends List-Unsubscribe headers + idempotency key', async () => {
    state.settings = { enabled: true, dailyBatchSize: 25 };
    state.candidates = [contact('c1', 'a@gmail.com')];
    await POST(makeReq());
    const arg = sendEmail.mock.calls[0][0];
    expect(arg.idempotencyKey).toBe('warmup-c1');
    expect(arg.headers['List-Unsubscribe']).toContain('/api/contacts/unsubscribe?token=tok-c1');
    expect(arg.headers['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click');
    expect(arg.html).toContain('tok-c1');
  });
});

describe('POST /api/cron/warmup-campaign — leaving the queue', () => {
  it('skips undeliverable / test / empty addresses AND marks them so they stop clogging the FIFO head', async () => {
    state.settings = { enabled: true, dailyBatchSize: 25 };
    state.candidates = [
      contact('c1', 'x@example.com'),
      contact('c2', 'serviciiseonethut@gmail.com'),
      contact('c3', ''),
      contact('c4', 'ok@gmail.com'),
    ];

    const res = await POST(makeReq());
    const body = await res.json();

    expect(body.data.skippedCount).toBe(3);
    expect(body.data.sentCount).toBe(1);
    expect(sendEmail).toHaveBeenCalledTimes(1);

    const skipped = state.updates.filter((u) => 'warmup_skipped_at' in u.values);
    expect(skipped.map((u) => [u.filters[0], u.values.warmup_skip_reason])).toEqual([
      ['eq:id,c1', 'undeliverable domain'],
      ['eq:id,c2', 'test email'],
      ['eq:id,c3', 'no email'],
    ]);
  });

  it('Resend 4xx (bad recipient) → skipped permanently; 429/5xx → left for retry', async () => {
    state.settings = { enabled: true, dailyBatchSize: 25 };
    state.candidates = [contact('c1', 'bad@gmail.com'), contact('c2', 'later@gmail.com'), contact('c3', 'ok@gmail.com')];
    sendEmail
      .mockRejectedValueOnce(new ResendError(422, 'Invalid `to` field'))
      .mockRejectedValueOnce(new ResendError(429, 'Too many requests'))
      .mockResolvedValueOnce({ id: 're_3', skipped: false });

    const res = await POST(makeReq());
    const body = await res.json();

    expect(body.data.sentCount).toBe(1);
    expect(body.data.skippedCount).toBe(1);
    expect(body.data.errorCount).toBe(1);

    const touched = state.updates.map((u) => u.filters[0]);
    expect(touched).toContain('eq:id,c1'); // skipped → marked
    expect(touched).not.toContain('eq:id,c2'); // transient → untouched, retry tomorrow
    expect(touched).toContain('eq:id,c3'); // sent → marked
    expect(state.updates.find((u) => u.filters[0] === 'eq:id,c1')!.values.warmup_skip_reason).toMatch(/^resend rejected/);
  });

  it('Resend not configured → nothing marked (retry when configured)', async () => {
    state.settings = { enabled: true, dailyBatchSize: 25 };
    state.candidates = [contact('c1', 'a@gmail.com')];
    sendEmail.mockResolvedValue({ id: null, skipped: true, reason: 'RESEND_API_KEY not set' });
    await POST(makeReq());
    expect(state.updates).toHaveLength(0);
  });
});
