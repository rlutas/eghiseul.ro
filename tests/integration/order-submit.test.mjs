// @ts-check
import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { readFileSync } from 'node:fs';

// Integration test for the full order submission pipeline:
//   POST /api/orders/draft → PATCH /api/orders/draft → POST /api/orders/[id]/submit
// All HTTP setup runs ONCE in beforeAll; individual `it` blocks verify
// different DB invariants on the resulting order.
//
// Opt-in: RUN_INTEGRATION=1 + dev server on :3000 + .env.local SUPABASE_SERVICE_ROLE_KEY.

const SHOULD_RUN = process.env.RUN_INTEGRATION === '1';
const BASE = (process.env.TEST_BASE_URL && process.env.TEST_BASE_URL.trim()) || 'http://localhost:3000';
const SUPABASE_URL = 'https://llbwmitdrppomeptqlue.supabase.co';

function getServiceKey() {
  try {
    const env = readFileSync(new URL('../../.env.local', import.meta.url), 'utf8');
    const line = env.split('\n').find((l) => l.startsWith('SUPABASE_SERVICE_ROLE_KEY='));
    return line?.split('=')[1]?.trim();
  } catch {
    return undefined;
  }
}

async function dbQuery(path) {
  const key = getServiceKey();
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!r.ok) throw new Error(`DB query failed: ${r.status} ${await r.text()}`);
  return r.json();
}

async function dbDelete(path) {
  const key = getServiceKey();
  if (!key) return;
  await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: 'DELETE',
    headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: 'return=minimal' },
  });
}

describe.runIf(SHOULD_RUN)('Order submit integration', () => {
  // Shared state across tests in this block.
  const ctx = {
    /** @type {string} */ serviceId: '',
    /** @type {string} */ orderId: '',
    /** @type {Response} */ submitResponse: /** @type {any} */ (null),
    /** @type {Record<string, unknown>} */ submitJson: {},
  };

  beforeAll(async () => {
    // 1. Look up service ID via public API (no hard-coded UUIDs).
    const svcRes = await fetch(`${BASE}/api/services/cazier-judiciar`);
    if (!svcRes.ok) throw new Error(`Service lookup failed: ${svcRes.status}`);
    const svcData = await svcRes.json();
    ctx.serviceId = svcData?.data?.service?.id || svcData?.data?.id || svcData?.id;
    if (!ctx.serviceId) throw new Error(`No service.id in: ${JSON.stringify(svcData).slice(0, 300)}`);

    // 2. Create draft order. Let the API assign the friendly_order_id to
    // avoid format validation pain (E-YYMMDD-XXXXX is enforced server-side).
    const draftRes = await fetch(`${BASE}/api/orders/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: ctx.serviceId,
        base_price: 250,
        total_price: 302.5,
      }),
    });
    if (draftRes.status !== 201) {
      throw new Error(`Draft create failed: ${draftRes.status} ${await draftRes.text()}`);
    }
    const draftData = await draftRes.json();
    ctx.orderId = draftData.data.order.id;

    // 3. Populate customer_data via PATCH.
    const patchRes = await fetch(`${BASE}/api/orders/draft`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: ctx.orderId,
        customer_data: {
          contact: { email: 'integration-test@example.com', phone: '+40712345678', preferredContact: 'email' },
          personal: {
            firstName: 'TEST',
            lastName: 'INTEGRATION',
            cnp: '2960507211209',
            birthDate: '1996-05-07',
            citizenship: 'romanian',
            documentSeries: 'IF',
            documentNumber: '999999',
          },
          billing: { source: 'self', type: 'persoana_fizica', isValid: true },
        },
        total_price: 302.5,
      }),
    });
    if (patchRes.status !== 200) {
      throw new Error(`Draft patch failed: ${patchRes.status}`);
    }

    // 4. Submit.
    ctx.submitResponse = await fetch(`${BASE}/api/orders/${ctx.orderId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '203.0.113.99',
        'user-agent': 'integration-test/1.0',
      },
      body: JSON.stringify({
        total_price: 302.5,
        consent: {
          termsAccepted: true,
          privacyAccepted: true,
          signatureConsent: false,
          withdrawalWaiver: true,
        },
      }),
    });
    ctx.submitJson = await ctx.submitResponse.json();
  }, 60_000);

  afterAll(async () => {
    if (ctx.orderId) {
      await dbDelete(`order_history?order_id=eq.${ctx.orderId}`);
      await dbDelete(`order_documents?order_id=eq.${ctx.orderId}`);
      await dbDelete(`orders?id=eq.${ctx.orderId}`);
    }
  }, 30_000);

  it('returns 200 success with status=pending in the response', () => {
    expect(ctx.submitResponse.status).toBe(200);
    expect(ctx.submitJson.success).toBe(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(/** @type {any} */ (ctx.submitJson).data.order.status).toBe('pending');
  });

  it('persists status=pending + submitted_at + contract_signed_at in DB', async () => {
    const rows = await dbQuery(
      `orders?select=status,submitted_at,contract_signed_at,estimated_completion_date&id=eq.${ctx.orderId}`
    );
    expect(rows.length).toBe(1);
    expect(rows[0].status).toBe('pending');
    expect(rows[0].submitted_at).toBeTruthy();
    expect(rows[0].contract_signed_at).toBeTruthy();
    // Estimated completion is computed at submit (holiday/cutoff-aware) and is in the future.
    expect(rows[0].estimated_completion_date).toBeTruthy();
    expect(new Date(rows[0].estimated_completion_date).getTime()).toBeGreaterThan(Date.now());
  });

  it('writes signature_metadata with IP, user-agent, document_hash, and consent snapshot', async () => {
    const rows = await dbQuery(`orders?select=customer_data&id=eq.${ctx.orderId}`);
    const meta = rows[0].customer_data?.signature_metadata;

    expect(meta).toBeDefined();
    expect(meta.ip_address).toBe('203.0.113.99');
    expect(meta.user_agent).toBe('integration-test/1.0');
    expect(meta.signed_at).toBeTruthy();
    expect(meta.document_hash).toMatch(/^[a-f0-9]{64}$/); // SHA-256
    expect(meta.consent.terms_accepted).toBe(true);
    expect(meta.consent.privacy_accepted).toBe(true);
    expect(meta.consent.withdrawal_waiver).toBe(true);
  });

  it('records an order_submitted event in order_history (audit trail)', async () => {
    const events = await dbQuery(
      `order_history?select=event_type,new_value,ip_address,user_agent,notes&order_id=eq.${ctx.orderId}`
    );
    const submitEvent = events.find((e) => e.event_type === 'order_submitted');

    expect(submitEvent).toBeDefined();
    expect(submitEvent.ip_address).toBe('203.0.113.99');
    expect(submitEvent.user_agent).toBe('integration-test/1.0');
    expect(submitEvent.new_value?.consent?.terms_accepted).toBe(true);
  });

  it('rejects double-submit with INVALID_STATUS (idempotency guard)', async () => {
    const res = await fetch(`${BASE}/api/orders/${ctx.orderId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consent: { termsAccepted: true, privacyAccepted: true, signatureConsent: true, withdrawalWaiver: true },
      }),
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_STATUS');
  });

  it('returns 404 when submitting a non-existent order id', async () => {
    const res = await fetch(`${BASE}/api/orders/00000000-0000-0000-0000-000000000000/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consent: {} }),
    });

    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error.code).toBe('NOT_FOUND');
  });
});

describe.skipIf(SHOULD_RUN)('Order submit integration', () => {
  it.skip('requires RUN_INTEGRATION=1 + dev server on :3000 + service role key', () => {});
});
