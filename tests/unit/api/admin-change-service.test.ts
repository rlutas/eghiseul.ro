import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const { getUser, requirePermission, from, registryFrom } = vi.hoisted(() => ({
  getUser: vi.fn(),
  requirePermission: vi.fn(),
  from: vi.fn(),
  registryFrom: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({ auth: { getUser } }),
}));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn(() => ({ from })) }));
vi.mock('@/lib/admin/permissions', () => ({ requirePermission }));
vi.mock('@/lib/registry/client', () => ({ getRegistryClient: () => ({ from: registryFrom }) }));
vi.mock('@/lib/orders/order-estimate', () => ({
  computeEstimatedCompletionISOForOrder: vi.fn().mockResolvedValue('2026-11-09T16:00:00.000Z'),
}));

const { POST } = await import('@/app/api/admin/orders/[id]/change-service/route');

/** Thenable query-builder stub: every filter returns itself; awaiting gives `result`. */
function chain(result: { data: unknown; error: unknown }, onUpdate?: (patch: unknown) => void) {
  const c: Record<string, unknown> = {};
  for (const m of ['select', 'eq', 'in', 'is', 'order', 'limit']) c[m] = vi.fn(() => c);
  c.delete = vi.fn(() => {
    deletes.push(true);
    return c;
  });
  c.single = vi.fn(() => Promise.resolve(result));
  c.update = vi.fn((patch: unknown) => {
    onUpdate?.(patch);
    return c;
  });
  c.insert = vi.fn((row: unknown) => {
    inserts.push(row as Record<string, unknown>);
    return Promise.resolve({ error: null });
  });
  c.then = (res: (v: unknown) => unknown, rej: (e: unknown) => unknown) => Promise.resolve(result).then(res, rej);
  return c;
}

const vcPerson = { signature: { required: true }, personalKyc: { enabled: true } };
const source = { id: 'svc-jpf', slug: 'cazier-judiciar-persoana-fizica', name: 'Cazier Judiciar PF', base_price: '198.00', is_active: true, verification_config: vcPerson, config: {} };
const fiscal = { id: 'svc-fiscal', slug: 'cazier-fiscal', name: 'Cazier Fiscal', base_price: '198.00', is_active: true, verification_config: vcPerson, config: {} };

let updates: unknown[];
let deletes: unknown[];
let inserts: Array<Record<string, unknown>>;

interface SetupExtra {
  src?: Record<string, unknown>;
  ancpiJobs?: unknown[];
  assignments?: unknown[];
  docs?: unknown[];
}

function setup(orderOver: Record<string, unknown> = {}, target: Record<string, unknown> = fiscal, extra: SetupExtra = {}) {
  updates = [];
  inserts = [];
  deletes = [];
  const src = extra.src ?? source;
  const order = {
    id: 'o1',
    friendly_order_id: 'E-000000-TEST1',
    platform: 'eghiseul',
    status: 'processing',
    payment_status: 'paid',
    base_price: '198.00',
    selected_options: [],
    customer_data: { personal: { cnp: '0000000000000' }, signature_s3_key: 'k' },
    paid_at: '2026-11-01T10:00:00Z',
    created_at: '2026-11-01T09:00:00Z',
    invoice_number: 'EGH-TEST-1',
    estimated_completion_date: null,
    services: src,
    ...orderOver,
  };
  from.mockImplementation((table: string) => {
    if (table === 'orders') {
      // read (single) and update(...).select('id')
      return chain({ data: updates.length ? [{ id: 'o1' }] : order, error: null }, (p) => updates.push(p));
    }
    if (table === 'services') return chain({ data: [target], error: null });
    if (table === 'service_options') return chain({ data: [], error: null });
    if (table === 'order_documents') return chain({ data: extra.docs ?? [{ type: 'contract_prestari' }, { type: 'imputernicire' }], error: null });
    if (table === 'ancpi_jobs') return chain({ data: extra.ancpiJobs ?? [], error: null });
    if (table === 'collaborator_service_assignments') return chain({ data: extra.assignments ?? [], error: null });
    return chain({ data: null, error: null });
  });
  registryFrom.mockImplementation(() =>
    chain({ data: [{ id: 'r1', type: 'delegation', service_type: source.slug }, { id: 'r2', type: 'contract', service_type: source.name }], error: null })
  );
}

async function call(body: unknown) {
  const req = new NextRequest('http://localhost:3000/api/admin/orders/o1/change-service', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  const res = await POST(req, { params: Promise.resolve({ id: 'o1' }) });
  return { status: res.status, json: await res.json() };
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  getUser.mockResolvedValue({ data: { user: { id: 'admin-1', email: 'ops@example.test' } }, error: null });
  requirePermission.mockResolvedValue(undefined);
  setup();
});

describe('POST /api/admin/orders/[id]/change-service — guards', () => {
  it('401 without a session', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });
    expect((await call({ action: 'preview' })).status).toBe(401);
  });

  it('requires orders.manage', async () => {
    requirePermission.mockRejectedValue(new Response(JSON.stringify({ success: false }), { status: 403 }));
    expect((await call({ action: 'preview' })).status).toBe(403);
    expect(requirePermission).toHaveBeenCalledWith('admin-1', 'orders.manage');
  });

  it('400 on a bad action, missing target or missing reason', async () => {
    expect((await call({ action: 'nope' })).status).toBe(400);
    expect((await call({ action: 'apply', note: 'motiv' })).status).toBe(400);
    expect((await call({ action: 'apply', targetServiceSlug: 'cazier-fiscal' })).status).toBe(400);
  });

  it('409 on apply when the price differs — nothing written', async () => {
    setup({}, { ...fiscal, base_price: '219.00' });
    const { status, json } = await call({ action: 'apply', targetServiceSlug: 'cazier-fiscal', note: 'clientul voia fiscal' });
    expect(status).toBe(409);
    expect(json.error).toContain('Modifică');
    expect(updates).toHaveLength(0);
    expect(inserts).toHaveLength(0);
  });

  it('409 on a cancelled order', async () => {
    setup({ status: 'cancelled' });
    const { status } = await call({ action: 'apply', targetServiceSlug: 'cazier-fiscal', note: 'motiv' });
    expect(status).toBe(409);
  });
});

describe('POST /api/admin/orders/[id]/change-service — preview & apply', () => {
  it('preview lists documents to regenerate and the invoice note', async () => {
    const { status, json } = await call({ action: 'preview', targetServiceSlug: 'cazier-fiscal' });
    expect(status).toBe(200);
    expect(json.data.eligible).toBe(true);
    expect(json.data.documents.toRegenerate).toHaveLength(2);
    expect(json.data.invoiceNote).toContain('EGH-TEST-1');
    expect(updates).toHaveLength(0);
  });

  it('apply switches service_id, recomputes the term, moves Barou numbers and logs `modified`', async () => {
    const { status, json } = await call({ action: 'apply', targetServiceSlug: 'cazier-fiscal', note: 'clientul voia fiscal' });
    expect(status).toBe(200);
    expect(updates[0]).toMatchObject({ service_id: 'svc-fiscal', estimated_completion_date: '2026-11-09T16:00:00.000Z' });
    expect(json.data.registry.moved).toBe(2);
    expect(inserts[0]).toMatchObject({ order_id: 'o1', event_type: 'modified' });
    expect(String(inserts[0].notes)).toContain('Serviciu schimbat: Cazier Judiciar PF → Cazier Fiscal (clientul voia fiscal)');
  });
});

describe('POST /api/admin/orders/[id]/change-service — decizii 02.11', () => {
  it('completed order: allowed, warning in preview, deadline and status untouched on apply', async () => {
    setup({ status: 'completed', estimated_completion_date: '2026-10-10T15:00:00.000Z' });
    const pv = await call({ action: 'preview', targetServiceSlug: 'cazier-fiscal' });
    expect(pv.json.data.eligible).toBe(true);
    expect(pv.json.data.warnings[0]).toContain('schimbarea corectează doar evidența');
    expect(pv.json.data.estimate).toEqual({ old: '2026-10-10T15:00:00.000Z', new: '2026-10-10T15:00:00.000Z', kept: true });

    const { status } = await call({ action: 'apply', targetServiceSlug: 'cazier-fiscal', note: 'corectare evidență' });
    expect(status).toBe(200);
    expect(updates[0]).toMatchObject({ service_id: 'svc-fiscal' });
    expect(updates[0]).not.toHaveProperty('estimated_completion_date');
    expect(updates[0]).not.toHaveProperty('status');
  });

  it('order paid at an older price: allowed when current catalogue prices match', async () => {
    setup({ base_price: '179.00' });
    const { status, json } = await call({ action: 'preview', targetServiceSlug: 'cazier-fiscal' });
    expect(status).toBe(200);
    expect(json.data.eligible).toBe(true);
    expect(json.data.changes.join(' ')).toContain('preț vechi');
  });

  const propVc = {
    signature: { required: true },
    conventie: { enabled: true },
    propertyVerification: {
      enabled: true,
      fields: { county: { required: true }, locality: { required: true }, carteFunciara: { required: true } },
      identificationService: { enabled: false },
    },
  };
  const copieIntabulare = { id: 'svc-ci', slug: 'copie-intabulare', name: 'Copie intabulare', base_price: '216.59', is_active: true, verification_config: propVc, config: {} };
  const copieContract = { id: 'svc-ccv', slug: 'copie-contract-vanzare', name: 'Copie contract vânzare', base_price: '216.59', is_active: true, verification_config: propVc, config: {} };
  const imobCd = {
    property: {
      county: 'Cluj', locality: 'Dej', carteFunciara: '123', beneficiaryName: 'Pop Ion', beneficiaryCnp: '0000000000000',
      beneficiaryAddress: 'Str. X', beneficiaryIdSeries: 'CJ', beneficiaryIdNumber: '1',
    },
    signature_s3_key: 'k',
  };
  const mircea = [
    { collaborator_id: 'mircea', service_id: 'svc-ci' },
    { collaborator_id: 'mircea', service_id: 'svc-ccv' },
  ];

  it('imobiliare same price: switches, deletes a queued ANCPI job first, no Barou move', async () => {
    setup({ base_price: '216.59', customer_data: imobCd }, copieContract, {
      src: copieIntabulare,
      assignments: mircea,
      ancpiJobs: [{ id: 'job-1', status: 'PENDING', ancpi_order_id: null }],
      docs: [{ type: 'contract_prestari' }, { type: 'conventie' }],
    });
    registryFrom.mockClear();
    const { status, json } = await call({ action: 'apply', targetServiceSlug: 'copie-contract-vanzare', note: 'clientul voia contractul' });
    expect(status).toBe(200);
    expect(deletes).toHaveLength(1);
    expect(updates[0]).toMatchObject({ service_id: 'svc-ccv' });
    expect(registryFrom).not.toHaveBeenCalled();
    expect(json.data.documents.toRegenerate.map((d: { type: string }) => d.type)).toEqual(['contract_prestari', 'conventie']);
    expect(String(inserts[0].notes)).toContain('jobul ANCPI');
  });

  it('imobiliare: an ANCPI job already started blocks, nothing written', async () => {
    setup({ base_price: '216.59', customer_data: imobCd }, copieContract, {
      src: copieIntabulare,
      assignments: mircea,
      ancpiJobs: [{ id: 'job-1', status: 'PROCESSING', ancpi_order_id: '10054451' }],
    });
    const { status, json } = await call({ action: 'apply', targetServiceSlug: 'copie-contract-vanzare', note: 'motiv' });
    expect(status).toBe(409);
    expect(json.error).toContain('Robotul ANCPI');
    expect(updates).toHaveLength(0);
    expect(deletes).toHaveLength(0);
  });

  it('lawyer → imobiliare is blocked', async () => {
    setup({}, { ...copieContract, base_price: '198.00' });
    const { status, json } = await call({ action: 'apply', targetServiceSlug: 'copie-contract-vanzare', note: 'motiv' });
    expect(status).toBe(409);
    expect(json.error).toContain('aceeași familie');
  });

  it('candidate list stays inside the family of the current service', async () => {
    setup({ base_price: '216.59', customer_data: imobCd }, copieContract, { src: copieIntabulare, assignments: mircea });
    from.mockImplementation((table: string) => {
      if (table === 'orders') return chain({ data: { id: 'o1', platform: 'eghiseul', status: 'processing', payment_status: 'paid', base_price: '216.59', customer_data: imobCd, services: copieIntabulare }, error: null });
      if (table === 'services') return chain({ data: [copieIntabulare, copieContract, fiscal], error: null });
      if (table === 'collaborator_service_assignments') return chain({ data: mircea, error: null });
      return chain({ data: [], error: null });
    });
    const { json } = await call({ action: 'preview' });
    expect(json.data.candidates.map((c: { slug: string }) => c.slug)).toEqual(['copie-contract-vanzare']);
    expect(json.data.candidates[0].eligible).toBe(true);
  });
});
