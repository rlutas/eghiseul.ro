import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Persistent supabase chain (reused across calls)
const persistentFrom = vi.fn();
const persistentClient = {
  auth: { getUser: vi.fn() },
  from: persistentFrom,
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(persistentClient),
}));

const { requirePermission } = vi.hoisted(() => ({ requirePermission: vi.fn() }));
vi.mock('@/lib/admin/permissions', () => ({ requirePermission }));

const { createInvoiceFromOrder } = vi.hoisted(() => ({ createInvoiceFromOrder: vi.fn() }));
vi.mock('@/lib/oblio', () => ({ createInvoiceFromOrder }));

const { POST } = await import('@/app/api/admin/orders/[id]/verify-payment/route');

interface MockSetup {
  order?: { data: unknown; error: unknown };
  updateError?: unknown;
}

function setupMocks(s: MockSetup = {}) {
  persistentFrom.mockImplementation((table: string) => {
    if (table === 'order_history') {
      return { insert: vi.fn().mockResolvedValue({ error: null }) };
    }
    return {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(s.order ?? { data: null, error: { message: 'not found' } }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: s.updateError ?? null }),
      }),
    };
  });
}

function callRoute(orderId: string, body: unknown) {
  const req = new NextRequest(`http://localhost:3000/api/admin/orders/${orderId}/verify-payment`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return POST(req, { params: Promise.resolve({ id: orderId }) });
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
  persistentFrom.mockReset();
  persistentClient.auth.getUser.mockReset();
  requirePermission.mockReset();
  createInvoiceFromOrder.mockReset();
  // default: authenticated admin with permission
  persistentClient.auth.getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } }, error: null });
  requirePermission.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('POST /api/admin/orders/[id]/verify-payment — auth + validation', () => {
  it('returns 400 when action is missing', async () => {
    setupMocks();
    const res = await callRoute('o1', {});
    expect(res.status).toBe(400);
  });

  it('returns 400 when action is not "approve" or "reject"', async () => {
    setupMocks();
    const res = await callRoute('o1', { action: 'invalid' });
    expect(res.status).toBe(400);
  });

  it('returns 401 when not authenticated', async () => {
    persistentClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
    setupMocks();

    const res = await callRoute('o1', { action: 'approve' });
    expect(res.status).toBe(401);
  });

  it('returns 403 when user lacks payments.verify permission', async () => {
    requirePermission.mockRejectedValue(
      new Response(JSON.stringify({ error: 'Insufficient permissions' }), { status: 403 }),
    );
    setupMocks();

    const res = await callRoute('o1', { action: 'approve' });
    expect(res.status).toBe(403);
  });

  it('checks for payments.verify (NOT orders.manage — different concern)', async () => {
    setupMocks({ order: { data: { id: 'o1', payment_status: 'awaiting_verification' }, error: null } });

    await callRoute('o1', { action: 'reject', notes: 'test' });

    expect(requirePermission).toHaveBeenCalledWith('admin-1', 'payments.verify');
  });
});

describe('POST /api/admin/orders/[id]/verify-payment — order checks', () => {
  it('returns 404 when order not found', async () => {
    setupMocks({ order: { data: null, error: { message: 'not found' } } });

    const res = await callRoute('o-missing', { action: 'approve' });
    expect(res.status).toBe(404);
  });

  it('rejects when order not in awaiting_verification status (e.g. already paid)', async () => {
    setupMocks({ order: { data: { id: 'o1', payment_status: 'paid' }, error: null } });

    const res = await callRoute('o1', { action: 'approve' });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/paid/);
  });

  it('rejects when order is in unpaid status (Stripe path, not bank transfer)', async () => {
    setupMocks({ order: { data: { id: 'o1', payment_status: 'unpaid' }, error: null } });

    const res = await callRoute('o1', { action: 'approve' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/admin/orders/[id]/verify-payment — REJECT flow', () => {
  it('marks payment_status="failed" and verified_by=admin', async () => {
    let captured: Record<string, unknown> = {};
    persistentFrom.mockImplementation((table: string) => {
      if (table === 'order_history') {
        return { insert: vi.fn().mockResolvedValue({ error: null }) };
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'o1', payment_status: 'awaiting_verification' },
              error: null,
            }),
          }),
        }),
        update: vi.fn((row) => {
          captured = row;
          return { eq: vi.fn().mockResolvedValue({ error: null }) };
        }),
      };
    });

    const res = await callRoute('o1', { action: 'reject', notes: 'No proof' });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.payment_status).toBe('failed');
    expect(captured.payment_status).toBe('failed');
    expect(captured.verified_by).toBe('admin-1');
  });

  it('records payment_rejected event in order_history with admin notes', async () => {
    let historyCall: Record<string, unknown> = {};
    persistentFrom.mockImplementation((table: string) => {
      if (table === 'order_history') {
        return {
          insert: vi.fn((row) => {
            historyCall = row;
            return Promise.resolve({ error: null });
          }),
        };
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'o1', payment_status: 'awaiting_verification' },
              error: null,
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
      };
    });

    await callRoute('o1', { action: 'reject', notes: 'Dovada neclară' });

    expect(historyCall.event_type).toBe('payment_rejected');
    expect(historyCall.notes).toBe('Dovada neclară');
    expect(historyCall.changed_by).toBe('admin-1');
  });

  it('uses default rejection note when admin sends none', async () => {
    let historyCall: Record<string, unknown> = {};
    persistentFrom.mockImplementation((table: string) => {
      if (table === 'order_history') {
        return {
          insert: vi.fn((row) => {
            historyCall = row;
            return Promise.resolve({ error: null });
          }),
        };
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'o1', payment_status: 'awaiting_verification' },
              error: null,
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
      };
    });

    await callRoute('o1', { action: 'reject' }); // no notes

    expect(historyCall.notes).toMatch(/respinsa/i);
  });

  it('returns 500 when DB update fails on reject', async () => {
    setupMocks({
      order: { data: { id: 'o1', payment_status: 'awaiting_verification' }, error: null },
      updateError: { message: 'DB lock' },
    });

    const res = await callRoute('o1', { action: 'reject' });
    expect(res.status).toBe(500);
  });

  it('REJECT path does NOT call Oblio (no invoice for rejected payment)', async () => {
    setupMocks({ order: { data: { id: 'o1', payment_status: 'awaiting_verification' }, error: null } });

    await callRoute('o1', { action: 'reject' });

    expect(createInvoiceFromOrder).not.toHaveBeenCalled();
  });
});
