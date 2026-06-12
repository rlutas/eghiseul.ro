import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * ensureInvoiceForPaidOrder — lock-claim correctness.
 *
 * REGRESSION (2026-06-12, duplicate invoices EGI2024-24097/24098 on
 * E-260612-QT376): the original claim used a `.or()` filter on the UPDATE.
 * The production PostgREST instance rejects `or=` filters on ANY mutation
 * with 42703 "column ... does not exist" (the column exists — the message is
 * misleading). That error matched the graceful-degradation regex meant for
 * schema-cache staleness, so EVERY caller skipped the lock, and the Stripe
 * webhook + confirm-payment race double-issued invoices.
 *
 * The fake supabase client below reproduces production semantics exactly:
 * conditional UPDATEs apply real WHERE logic against an in-memory row, and
 * any update chain that uses `.or()` fails with the same 42703 PostgREST
 * returns in production.
 */

const createInvoiceMock = vi.fn();
vi.mock('@/lib/oblio/invoice', () => ({
  createInvoiceFromOrder: (...args: unknown[]) => createInvoiceMock(...args),
}));

// ---------------------------------------------------------------------------
// In-memory orders row + a supabase-js fake with production PostgREST quirks.
// ---------------------------------------------------------------------------

type Row = Record<string, unknown>;

let row: Row;
let historyNotes: string[];
// When set, conditional updates that FILTER on invoice_generating_at fail the
// way a stale PostgREST schema cache fails (degraded-mode scenario).
let lockColumnInvisible = false;

function makeOrderRow(overrides: Row = {}): Row {
  return {
    id: 'order-1',
    order_number: 'ORD-1',
    friendly_order_id: 'E-TEST-1',
    payment_status: 'paid',
    invoice_number: null,
    invoice_url: null,
    invoice_generating_at: null,
    total_price: 396,
    base_price: 396,
    selected_options: [],
    delivery_method: null,
    delivery_price: 0,
    coupon_code: null,
    discount_amount: null,
    customer_data: {},
    services: { name: 'Cazier Fiscal', lawyer_fee_ron: null },
    ...overrides,
  };
}

interface UpdateChain {
  payload: Row;
  filters: Array<(r: Row) => boolean>;
  usedOr: boolean;
  filteredOnLockColumn: boolean;
}

function applyUpdate(chain: UpdateChain): { data: Row[] | null; error: { code: string; message: string } | null } {
  if (chain.usedOr) {
    // Production PostgREST: or= on any UPDATE → 42703, column name echoed back.
    return {
      data: null,
      error: { code: '42703', message: 'column orders.invoice_generating_at does not exist' },
    };
  }
  if (lockColumnInvisible && (chain.filteredOnLockColumn || 'invoice_generating_at' in chain.payload)) {
    return {
      data: null,
      error: {
        code: 'PGRST204',
        message: "Could not find the 'invoice_generating_at' column of 'orders' in the schema cache",
      },
    };
  }
  if (chain.filters.every((f) => f(row))) {
    Object.assign(row, chain.payload);
    return { data: [{ id: row.id }], error: null };
  }
  return { data: [], error: null };
}

function makeUpdateChain(payload: Row) {
  const chain: UpdateChain = { payload, filters: [], usedOr: false, filteredOnLockColumn: false };
  const api = {
    eq(col: string, val: unknown) {
      chain.filters.push((r) => r[col] === val);
      return api;
    },
    is(col: string, val: unknown) {
      if (col === 'invoice_generating_at') chain.filteredOnLockColumn = true;
      chain.filters.push((r) => r[col] === val);
      return api;
    },
    lt(col: string, val: string) {
      if (col === 'invoice_generating_at') chain.filteredOnLockColumn = true;
      chain.filters.push((r) => typeof r[col] === 'string' && (r[col] as string) < val);
      return api;
    },
    or(_expr: string) {
      chain.usedOr = true;
      if (/invoice_generating_at/.test(_expr)) chain.filteredOnLockColumn = true;
      return api;
    },
    select() {
      return Promise.resolve(applyUpdate(chain));
    },
    // Awaiting the chain without .select() (e.g. the success-path update).
    then(resolve: (v: unknown) => void, reject?: (e: unknown) => void) {
      return Promise.resolve(applyUpdate(chain)).then(resolve, reject);
    },
  };
  return api;
}

function makeSelectChain() {
  const api = {
    eq: () => api,
    single: () => Promise.resolve({ data: { ...row }, error: null }),
  };
  return api;
}

const adminClient = {
  from(table: string) {
    if (table === 'order_history') {
      return {
        insert: (payload: { notes: string }) => {
          historyNotes.push(payload.notes);
          return Promise.resolve({ error: null });
        },
      };
    }
    return {
      select: () => makeSelectChain(),
      update: (payload: Row) => makeUpdateChain(payload),
    };
  },
};

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => adminClient,
}));

const { ensureInvoiceForPaidOrder } = await import('@/lib/oblio/ensure-invoice');

// ---------------------------------------------------------------------------

let invoiceCounter: number;

beforeEach(() => {
  row = makeOrderRow();
  historyNotes = [];
  lockColumnInvisible = false;
  invoiceCounter = 0;
  createInvoiceMock.mockReset();
  createInvoiceMock.mockImplementation(async () => {
    invoiceCounter += 1;
    return {
      invoiceNumber: `EGI2024-${24096 + invoiceCounter}`,
      pdfUrl: 'https://oblio.example/pdf',
      createdAt: '2026-06-12T06:04:49.000Z',
    };
  });
});

describe('ensureInvoiceForPaidOrder — lock claim', () => {
  it('creates the invoice and releases the lock on the happy path', async () => {
    const result = await ensureInvoiceForPaidOrder('order-1');

    expect(result.status).toBe('created');
    expect(createInvoiceMock).toHaveBeenCalledTimes(1);
    expect(row.invoice_number).toBe('EGI2024-24097');
    // Lock must not be left dangling after success.
    expect(row.invoice_generating_at).toBeNull();
  });

  it('REGRESSION: two concurrent callers issue exactly ONE invoice (webhook vs confirm-payment race)', async () => {
    // Hold invoice creation open until BOTH callers have run their claim,
    // reproducing the production interleaving (~1s apart, Oblio call pending).
    let releaseFirst!: () => void;
    const firstBlocked = new Promise<void>((r) => (releaseFirst = r));
    createInvoiceMock.mockImplementation(async () => {
      invoiceCounter += 1;
      if (invoiceCounter === 1) await firstBlocked;
      return {
        invoiceNumber: `EGI2024-${24096 + invoiceCounter}`,
        pdfUrl: 'https://oblio.example/pdf',
        createdAt: '2026-06-12T06:04:49.000Z',
      };
    });

    const callA = ensureInvoiceForPaidOrder('order-1');
    // Give A time to claim the lock and enter the (blocked) Oblio call.
    await new Promise((r) => setTimeout(r, 10));
    const callB = ensureInvoiceForPaidOrder('order-1');
    const resultB = await callB;
    releaseFirst();
    const resultA = await callA;

    expect(resultA.status).toBe('created');
    expect(resultB.status).toBe('locked');
    expect(createInvoiceMock).toHaveBeenCalledTimes(1);
  });

  it('returns already_exists without touching Oblio when the invoice is already set', async () => {
    row = makeOrderRow({ invoice_number: 'EGI2024-11111' });

    const result = await ensureInvoiceForPaidOrder('order-1');

    expect(result).toEqual({ status: 'already_exists', invoiceNumber: 'EGI2024-11111' });
    expect(createInvoiceMock).not.toHaveBeenCalled();
  });

  it('refuses to issue for unpaid orders', async () => {
    row = makeOrderRow({ payment_status: 'pending' });

    const result = await ensureInvoiceForPaidOrder('order-1');

    expect(result.status).toBe('failed');
    expect(createInvoiceMock).not.toHaveBeenCalled();
  });

  it('returns locked while another caller holds a fresh lock', async () => {
    row = makeOrderRow({ invoice_generating_at: new Date().toISOString() });

    const result = await ensureInvoiceForPaidOrder('order-1');

    expect(result.status).toBe('locked');
    expect(createInvoiceMock).not.toHaveBeenCalled();
  });

  it('takes over a stale lock (claimant died >2 min ago)', async () => {
    row = makeOrderRow({
      invoice_generating_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    });

    const result = await ensureInvoiceForPaidOrder('order-1');

    expect(result.status).toBe('created');
    expect(createInvoiceMock).toHaveBeenCalledTimes(1);
  });

  it('releases the lock when Oblio fails so a retry can re-claim', async () => {
    createInvoiceMock.mockRejectedValue(new Error('Oblio 500'));

    const result = await ensureInvoiceForPaidOrder('order-1');

    expect(result.status).toBe('failed');
    expect(row.invoice_generating_at).toBeNull();
    expect(row.invoice_number).toBeNull();
  });

  it('degrades gracefully (creates WITHOUT lock) when the lock column is truly invisible to PostgREST', async () => {
    lockColumnInvisible = true;

    const result = await ensureInvoiceForPaidOrder('order-1');

    expect(result.status).toBe('created');
    expect(createInvoiceMock).toHaveBeenCalledTimes(1);
    expect(row.invoice_number).toBe('EGI2024-24097');
  });
});
