import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

// ── Supabase fake (fresh chain per from(), like postgrest-js) ────────────────
type Row = Record<string, unknown>;
interface Call {
  fromCall: number;
  table: string;
  op: 'select' | 'insert' | 'update' | 'delete';
  values: Row | null;
  filters: string[];
}

const state = {
  fromCalls: 0,
  calls: [] as Call[],
  settings: null as Row | null,
  orders: [] as Row[],
  laterOrders: [] as Row[],
  services: [] as Row[],
  contacts: [] as Row[],
  history: [] as Row[],
  recentCrossSell: [] as Row[],
  claimConflictOrderIds: new Set<string>(),
};

function chain(table: string, fromCall: number) {
  const local: Call = { fromCall, table, op: 'select', values: null, filters: [] };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = {};
  c.select = () => c;
  c.insert = (v: Row) => ((local.op = 'insert'), (local.values = v), c);
  c.update = (v: Row) => ((local.op = 'update'), (local.values = v), c);
  c.delete = () => ((local.op = 'delete'), c);
  for (const m of ['eq', 'is', 'not', 'order', 'limit', 'in', 'gte', 'lte', 'or']) {
    c[m] = (...args: unknown[]) => {
      local.filters.push(`${m}:${args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(',')}`);
      return c;
    };
  }
  const resolve = () => {
    state.calls.push(local);
    if (local.op !== 'select') {
      if (table === 'lifecycle_emails' && local.op === 'insert') {
        const orderId = String(local.values?.order_id);
        if (state.claimConflictOrderIds.has(orderId)) return { data: null, error: { code: '23505', message: 'duplicate' } };
        return { data: { id: `claim-${orderId}-${local.values?.kind}` }, error: null };
      }
      return { data: null, error: null };
    }
    switch (table) {
      case 'admin_settings':
        return { data: state.settings ? { value: state.settings } : null, error: null };
      case 'orders':
        return { data: local.filters.includes('eq:status,completed') ? state.orders : state.laterOrders, error: null };
      case 'services':
        return { data: state.services, error: null };
      case 'contacts':
        return { data: state.contacts, error: null };
      case 'order_history':
        return { data: state.history, error: null };
      case 'lifecycle_emails':
        return { data: state.recentCrossSell, error: null };
      default:
        return { data: [], error: null };
    }
  };
  c.maybeSingle = () => Promise.resolve(resolve());
  c.single = () => Promise.resolve(resolve());
  c.then = (ok: (v: unknown) => unknown, err?: (e: unknown) => unknown) => Promise.resolve(resolve()).then(ok, err);
  return c;
}

const persistentFrom = vi.fn((table: string) => chain(table, ++state.fromCalls));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn(() => ({ from: persistentFrom })) }));

const { sendEmail } = vi.hoisted(() => ({ sendEmail: vi.fn() }));
vi.mock('@/lib/email/resend', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/email/resend')>()),
  sendEmail,
}));
vi.mock('@/lib/contacts/upsert', () => ({ upsertContactForPaidOrder: vi.fn() }));

const { POST } = await import('@/app/api/cron/lifecycle-emails/route');

const NOW = new Date('2026-09-14T08:00:00Z');
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000).toISOString();

function makeReq(): NextRequest {
  return new NextRequest('http://localhost:3000/api/cron/lifecycle-emails', {
    method: 'POST',
    headers: { authorization: 'Bearer secret123' },
  });
}

function order(id: string, slug: string, completedDaysAgo: number, extra: Row = {}): Row {
  return {
    id,
    friendly_order_id: `E-${id}`,
    order_number: null,
    status: 'completed',
    paid_at: daysAgo(completedDaysAgo + 2),
    completed_at: daysAgo(completedDaysAgo),
    estimated_completion_date: daysAgo(completedDaysAgo), // la termen fix
    email_bounced_at: null,
    is_test: false,
    customer_data: { contact: { email: `${id}@gmail.com` }, billing: { firstName: 'Ana' } },
    services: { slug, name: `Serviciu ${slug}`, processing_config: { estimated_days_display: '3-5 zile lucrătoare' } },
    ...extra,
  };
}
function contact(id: string, extra: Row = {}): Row {
  return { id: `c-${id}`, email: `${id}@gmail.com`, first_name: 'Ana', marketing_status: 'soft_opt_in', unsubscribe_token: `tok-${id}`, services: [], ...extra };
}

beforeEach(() => {
  vi.useFakeTimers({ now: NOW, toFake: ['Date'] });
  vi.stubEnv('CRON_SECRET', 'secret123');
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(globalThis, 'setTimeout').mockImplementation(((fn: () => void) => (fn(), 0)) as unknown as typeof setTimeout);
  Object.assign(state, {
    fromCalls: 0,
    calls: [],
    settings: null,
    orders: [],
    laterOrders: [],
    services: [{ slug: 'certificat-integritate', name: 'Certificat integritate', is_active: true }, { slug: 'cazier-fiscal', name: 'Cazier fiscal', is_active: true }],
    contacts: [],
    history: [],
    recentCrossSell: [],
    claimConflictOrderIds: new Set(),
  });
  sendEmail.mockReset();
  sendEmail.mockResolvedValue({ id: 're_1', skipped: false });
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

const sentSubjects = () => sendEmail.mock.calls.map((c) => c[0].subject as string);
const claims = () => state.calls.filter((c) => c.table === 'lifecycle_emails' && c.op === 'insert').map((c) => `${c.values?.kind}:${c.values?.order_id}`);

describe('kill switch', () => {
  it('fără setare → nimic nu pleacă, comenzile nici nu se citesc', async () => {
    state.orders = [order('o1', 'cazier-judiciar-persoana-fizica', 5)];
    const body = await (await POST(makeReq())).json();
    expect(body.data.reason).toBe('all disabled');
    expect(sendEmail).not.toHaveBeenCalled();
    expect(state.calls.some((c) => c.table === 'orders')).toBe(false);
  });
});

describe('review_request', () => {
  beforeEach(() => {
    state.settings = { reviewRequest: true, expiryReminder: false, crossSell: false };
  });

  it('trimite doar comenzilor la 3–10 zile, în termen, fără incidente; claim ÎNAINTE de send', async () => {
    state.orders = [
      order('ok', 'cazier-judiciar-persoana-fizica', 5),
      order('late', 'cazier-judiciar-persoana-fizica', 5, { estimated_completion_date: daysAgo(7) }), // finalizată după termen
      order('fresh', 'cazier-judiciar-persoana-fizica', 1), // prea recentă
      order('standby', 'cazier-judiciar-persoana-fizica', 6),
    ];
    state.history = [{ order_id: 'standby', event_type: 'standby_started' }];
    state.contacts = [contact('ok'), contact('late'), contact('fresh'), contact('standby')];

    const body = await (await POST(makeReq())).json();

    expect(body.data.sent.review_request).toBe(1);
    expect(claims()).toEqual(['review_request:ok']);
    const claimIdx = state.calls.findIndex((c) => c.table === 'lifecycle_emails' && c.op === 'insert');
    const markIdx = state.calls.findIndex((c) => c.table === 'lifecycle_emails' && c.op === 'update');
    expect(claimIdx).toBeGreaterThan(-1);
    expect(markIdx).toBeGreaterThan(claimIdx);
    expect(sendEmail.mock.calls[0][0].headers['List-Unsubscribe']).toContain('tok-ok');
    expect(sendEmail.mock.calls[0][0].html).toContain('g.page/r/');
  });

  it('dezabonat → sărit; claim deja existent (rulare suprapusă) → sărit fără send', async () => {
    state.orders = [order('unsub', 'cazier-fiscal', 4), order('dup', 'cazier-fiscal', 4)];
    state.contacts = [contact('unsub', { marketing_status: 'unsubscribed' }), contact('dup')];
    state.claimConflictOrderIds.add('dup');
    const body = await (await POST(makeReq())).json();
    expect(sendEmail).not.toHaveBeenCalled();
    expect(body.data.results.map((r: Row) => r.reason)).toEqual(['unsubscribed or no contact', 'already claimed']);
  });

  it('Resend 429 → claim șters (retry mâine); 422 → claim păstrat cu failed_reason', async () => {
    const { ResendError } = await import('@/lib/email/resend');
    state.orders = [order('a', 'cazier-fiscal', 4), order('b', 'cazier-fiscal', 4)];
    state.contacts = [contact('a'), contact('b')];
    sendEmail.mockRejectedValueOnce(new ResendError(429, 'slow down')).mockRejectedValueOnce(new ResendError(422, 'bad address'));
    await POST(makeReq());
    const le = state.calls.filter((c) => c.table === 'lifecycle_emails' && c.op !== 'select');
    expect(le.map((c) => c.op)).toEqual(['insert', 'delete', 'insert', 'update']);
    expect(le[3].values?.failed_reason).toMatch(/422/);
  });
});

describe('expiry_reminder', () => {
  beforeEach(() => {
    state.settings = { reviewRequest: false, expiryReminder: true, crossSell: false };
  });

  it('cazier (180 zile): pleacă în fereastră, nu în afara ei, nu la stare civilă, nu dacă a recomandat deja', async () => {
    state.orders = [
      order('soon', 'cazier-judiciar-persoana-fizica', 170), // expiră în 10 zile → în fereastră
      order('early', 'cazier-judiciar-persoana-fizica', 100), // expiră în 80 zile → nu
      order('expired', 'cazier-fiscal', 45), // 30 zile + 15 grație → în fereastră, deja expirat
      order('cf', 'certificat-nastere', 170), // nu expiră
      order('reordered', 'cazier-judiciar-persoana-fizica', 172),
    ];
    state.laterOrders = [{ paid_at: daysAgo(3), customer_data: { contact: { email: 'reordered@gmail.com' } }, services: { slug: 'cazier-judiciar-persoana-fizica' } }];
    state.contacts = [contact('soon'), contact('early'), contact('expired'), contact('cf'), contact('reordered')];

    const body = await (await POST(makeReq())).json();

    expect(body.data.sent.expiry_reminder).toBe(2);
    expect(claims()).toEqual(['expiry_reminder:soon', 'expiry_reminder:expired']);
    const subjects = sentSubjects();
    expect(subjects[0]).toMatch(/expiră în jurul datei/);
    expect(subjects[1]).toMatch(/a expirat/);
    expect(body.data.results.find((r: Row) => r.orderId === 'reordered').reason).toBe('reordered already');
  });
});

describe('cross_sell', () => {
  beforeEach(() => {
    state.settings = { reviewRequest: false, expiryReminder: false, crossSell: true };
  });

  it('30–60 zile, sugestii active și necumpărate, un email per client (cooldown)', async () => {
    state.orders = [
      order('a', 'cazier-judiciar-persoana-fizica', 40),
      order('a2', 'cazier-fiscal', 35, { customer_data: { contact: { email: 'a@gmail.com' } } }), // același client → nu al doilea
      order('cool', 'cazier-judiciar-persoana-fizica', 45),
      order('none', 'certificat-integritate', 40), // a cumpărat deja tot ce i-am sugera
      order('old', 'cazier-judiciar-persoana-fizica', 90), // în afara ferestrei
    ];
    state.contacts = [contact('a'), contact('cool'), contact('none', { services: ['certificat-integritate', 'cazier-judiciar-persoana-fizica', 'cazier-fiscal'] }), contact('old')];
    state.recentCrossSell = [{ recipient_email: 'cool@gmail.com' }];

    const body = await (await POST(makeReq())).json();

    expect(claims()).toEqual(['cross_sell:a']);
    expect(body.data.sent.cross_sell).toBe(1);
    const html = sendEmail.mock.calls[0][0].html as string;
    expect(html).toContain('Certificat integritate');
    expect(html).toContain('utm_campaign=cross_sell');
    expect(body.data.results.find((r: Row) => r.orderId === 'none').reason).toBe('nothing to suggest');
    expect(body.data.results.find((r: Row) => r.orderId === 'cool').reason).toBe('cooldown');
  });
});
