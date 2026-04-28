import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const persistentFrom = vi.fn();
const persistentClient = { from: persistentFrom };
const { getUser } = vi.hoisted(() => ({ getUser: vi.fn() }));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({ auth: { getUser } }),
}));
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => persistentClient),
}));

const { requirePermission } = vi.hoisted(() => ({ requirePermission: vi.fn() }));
vi.mock('@/lib/admin/permissions', () => ({ requirePermission }));

const { getCourierProvider } = vi.hoisted(() => ({ getCourierProvider: vi.fn() }));
vi.mock('@/lib/services/courier', () => ({ getCourierProvider, CourierCode: undefined }));

const { extractCourierProviderFromDeliveryMethod } = vi.hoisted(() => ({
  extractCourierProviderFromDeliveryMethod: vi.fn(),
}));
vi.mock('@/lib/services/courier/utils', () => ({ extractCourierProviderFromDeliveryMethod }));

const { POST } = await import('@/app/api/admin/orders/[id]/cancel-awb/route');

interface OrderRow {
  id?: string;
  delivery_tracking_number?: string | null;
  courier_provider?: string | null;
  delivery_method?: unknown;
  status?: string;
  friendly_order_id?: string;
}

function setupMocks(order: OrderRow | null, updateError: unknown = null) {
  persistentFrom.mockImplementation((table: string) => {
    if (table === 'order_history') {
      return { insert: vi.fn().mockResolvedValue({ error: null }) };
    }
    return {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(
            order ? { data: order, error: null } : { data: null, error: { message: 'not found' } },
          ),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: updateError }),
      }),
    };
  });
}

function callRoute(orderId: string, body: unknown = {}) {
  const req = new NextRequest(`http://localhost:3000/api/admin/orders/${orderId}/cancel-awb`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return POST(req, { params: Promise.resolve({ id: orderId }) });
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
  persistentFrom.mockReset();
  getUser.mockReset();
  requirePermission.mockReset();
  getCourierProvider.mockReset();
  extractCourierProviderFromDeliveryMethod.mockReset();
  getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } }, error: null });
  requirePermission.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('POST /api/admin/orders/[id]/cancel-awb', () => {
  it('returns 401 when not authenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });
    setupMocks(null);

    expect((await callRoute('o1')).status).toBe(401);
  });

  it('returns 403 when missing orders.manage permission', async () => {
    requirePermission.mockRejectedValue(
      new Response(JSON.stringify({ error: 'forbidden' }), { status: 403 }),
    );
    setupMocks(null);

    expect((await callRoute('o1')).status).toBe(403);
  });

  it('returns 404 when order not found', async () => {
    setupMocks(null);
    const res = await callRoute('o-missing');
    expect(res.status).toBe(404);
    expect((await res.json()).error.code).toBe('ORDER_NOT_FOUND');
  });

  it('returns 400 NO_AWB when order has no tracking number to cancel', async () => {
    setupMocks({ id: 'o1', delivery_tracking_number: null, courier_provider: 'fancourier', status: 'shipped' });
    const res = await callRoute('o1');
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe('NO_AWB');
  });

  it('returns 400 NO_PROVIDER when no courier_provider and delivery_method does not match', async () => {
    setupMocks({
      id: 'o1',
      delivery_tracking_number: 'AWB-X',
      courier_provider: null,
      delivery_method: { name: 'unknown service' },
      status: 'shipped',
    });
    extractCourierProviderFromDeliveryMethod.mockReturnValue(null);

    const res = await callRoute('o1');
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe('NO_PROVIDER');
  });

  it('successful cancel: clears tracking, reverts status to document_ready', async () => {
    let captured: Record<string, unknown> = {};
    persistentFrom.mockImplementation((table: string) => {
      if (table === 'order_history') {
        return { insert: vi.fn().mockResolvedValue({ error: null }) };
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'o1',
                delivery_tracking_number: 'AWB-OK',
                courier_provider: 'fancourier',
                status: 'shipped',
              },
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
    getCourierProvider.mockReturnValue({ cancelShipment: vi.fn().mockResolvedValue(true) });

    const res = await callRoute('o1', { reason: 'Customer changed address' });

    expect(res.status).toBe(200);
    expect(captured.delivery_tracking_number).toBeNull();
    expect(captured.delivery_tracking_status).toBeNull();
    expect(captured.status).toBe('document_ready');
  });

  it('continues to clear tracking even when courier cancellation fails (graceful degradation)', async () => {
    let updateCalled = false;
    persistentFrom.mockImplementation((table: string) => {
      if (table === 'order_history') {
        return { insert: vi.fn().mockResolvedValue({ error: null }) };
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'o1',
                delivery_tracking_number: 'AWB-CANT-CANCEL',
                courier_provider: 'sameday',
                status: 'shipped',
              },
              error: null,
            }),
          }),
        }),
        update: vi.fn(() => {
          updateCalled = true;
          return { eq: vi.fn().mockResolvedValue({ error: null }) };
        }),
      };
    });
    // Courier API throws (e.g. shipment already in transit)
    getCourierProvider.mockReturnValue({
      cancelShipment: vi.fn().mockRejectedValue(new Error('Already in transit')),
    });

    const res = await callRoute('o1', { reason: 'Picked up by mistake' });

    expect(res.status).toBe(200);
    expect(updateCalled).toBe(true);
    const body = await res.json();
    expect(body.data.courierCancelled).toBe(false);
    expect(body.data.cancelWarning).toMatch(/manually cancel/i);
  });

  it('returns 500 when DB update fails after cancellation', async () => {
    setupMocks({
      id: 'o1', delivery_tracking_number: 'AWB-X', courier_provider: 'fancourier', status: 'shipped',
    }, { message: 'lock' });
    getCourierProvider.mockReturnValue({ cancelShipment: vi.fn().mockResolvedValue(true) });

    const res = await callRoute('o1');
    expect(res.status).toBe(500);
    expect((await res.json()).error.code).toBe('UPDATE_FAILED');
  });
});
