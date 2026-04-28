import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Persistent supabase + admin client mocks
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

const { getCourierProvider, getTrackingUrl } = vi.hoisted(() => ({
  getCourierProvider: vi.fn(),
  getTrackingUrl: vi.fn(() => 'https://example.com/track/AWB123'),
}));

vi.mock('@/lib/services/courier', () => ({
  getCourierProvider,
  getTrackingUrl,
  CourierCode: undefined,
  ShipmentRequest: undefined,
  SenderAddress: undefined,
  Address: undefined,
}));

const { extractCourierProviderFromDeliveryMethod } = vi.hoisted(() => ({
  extractCourierProviderFromDeliveryMethod: vi.fn(),
}));
vi.mock('@/lib/services/courier/utils', () => ({
  extractCourierProviderFromDeliveryMethod,
  DEFAULT_DOCUMENT_PACKAGE: { weight: 0.5, type: 'envelope', quantity: 1, length: 30, width: 22, height: 1 },
}));

const { POST } = await import('@/app/api/admin/orders/[id]/generate-awb/route');

interface MockOrder {
  id?: string;
  friendly_order_id?: string;
  delivery_tracking_number?: string | null;
  delivery_method?: unknown;
  delivery_address?: unknown;
  courier_provider?: string | null;
  courier_service?: string | null;
  courier_quote?: unknown;
  customer_data?: unknown;
  services?: { name: string };
}

function setupMocks(order: MockOrder | null, updateError: unknown = null) {
  persistentFrom.mockImplementation((table: string) => {
    if (table === 'order_history' || table === 'order_documents') {
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

function callRoute(orderId: string) {
  const req = new NextRequest(`http://localhost:3000/api/admin/orders/${orderId}/generate-awb`, {
    method: 'POST',
  });
  return POST(req, { params: Promise.resolve({ id: orderId }) });
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
  persistentFrom.mockReset();
  getUser.mockReset();
  requirePermission.mockReset();
  getCourierProvider.mockReset();
  extractCourierProviderFromDeliveryMethod.mockReset();
  // defaults
  getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } }, error: null });
  requirePermission.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('POST /api/admin/orders/[id]/generate-awb — auth', () => {
  it('returns 401 when no authenticated user', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });
    setupMocks(null);

    const res = await callRoute('o1');
    expect(res.status).toBe(401);
  });

  it('returns 403 when user lacks orders.manage permission', async () => {
    requirePermission.mockRejectedValue(
      new Response(JSON.stringify({ error: 'Insufficient permissions' }), { status: 403 }),
    );
    setupMocks(null);

    const res = await callRoute('o1');
    expect(res.status).toBe(403);
  });
});

describe('POST /api/admin/orders/[id]/generate-awb — order validation', () => {
  it('returns 404 when order not found', async () => {
    setupMocks(null);
    const res = await callRoute('o-missing');
    expect(res.status).toBe(404);
    expect((await res.json()).error.code).toBe('ORDER_NOT_FOUND');
  });

  it('returns 400 AWB_EXISTS when order already has tracking number (idempotency)', async () => {
    setupMocks({
      id: 'o1',
      delivery_tracking_number: 'AWB-EXISTING-123',
      courier_provider: 'fancourier',
    });

    const res = await callRoute('o1');
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe('AWB_EXISTS');
  });

  it('returns 400 NO_COURIER when delivery_method is email/personal pickup', async () => {
    setupMocks({
      id: 'o1',
      delivery_tracking_number: null,
      delivery_method: { type: 'email', name: 'Email delivery' },
      courier_provider: null,
    });
    extractCourierProviderFromDeliveryMethod.mockReturnValue(null);

    const res = await callRoute('o1');
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe('NO_COURIER');
  });

  it('returns 400 NO_ADDRESS when no locker AND missing delivery_address fields', async () => {
    setupMocks({
      id: 'o1',
      delivery_tracking_number: null,
      delivery_method: { type: 'home', name: 'Acasă' },
      delivery_address: null,
      courier_provider: 'fancourier',
    });

    const res = await callRoute('o1');
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe('NO_ADDRESS');
  });

  it('returns 400 INVALID_PROVIDER when courier provider lookup throws', async () => {
    setupMocks({
      id: 'o1',
      delivery_tracking_number: null,
      delivery_method: { type: 'home', name: 'X' },
      delivery_address: { county: 'IL', city: 'Slobozia', street: 'Y' },
      courier_provider: 'fancourier',
    });
    getCourierProvider.mockImplementation(() => {
      throw new Error('Fan Courier credentials not configured');
    });

    const res = await callRoute('o1');
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe('INVALID_PROVIDER');
  });
});

describe('POST /api/admin/orders/[id]/generate-awb — courier provider derivation', () => {
  it('uses order.courier_provider when set (no fallback to delivery_method parse)', async () => {
    setupMocks({
      id: 'o1',
      delivery_tracking_number: null,
      delivery_method: { type: 'home', name: 'Sameday EasyBox' },
      delivery_address: { county: 'IL', city: 'Slobozia', street: 'X' },
      courier_provider: 'fancourier', // explicit
      customer_data: { contact: { name: 'X', phone: '0700' } },
    });
    getCourierProvider.mockReturnValue({
      createShipment: vi.fn().mockResolvedValue({ success: true, awb: 'AWB-NEW', price: 18, priceWithVAT: 21.42, currency: 'RON', estimatedDays: 1 }),
    });

    await callRoute('o1');

    expect(getCourierProvider).toHaveBeenCalledWith('fancourier');
    // extractCourierProviderFromDeliveryMethod is fallback only
    expect(extractCourierProviderFromDeliveryMethod).not.toHaveBeenCalled();
  });

  it('falls back to extractCourierProviderFromDeliveryMethod when courier_provider is null', async () => {
    setupMocks({
      id: 'o1',
      delivery_tracking_number: null,
      delivery_method: { type: 'home', name: 'Fan Courier Standard' },
      delivery_address: { county: 'IL', city: 'Slobozia', street: 'X' },
      courier_provider: null,
      customer_data: { contact: { name: 'X', phone: '0700' } },
    });
    extractCourierProviderFromDeliveryMethod.mockReturnValue('fancourier');
    getCourierProvider.mockReturnValue({
      createShipment: vi.fn().mockResolvedValue({ success: true, awb: 'AWB-NEW', price: 18, priceWithVAT: 21.42, currency: 'RON', estimatedDays: 1 }),
    });

    await callRoute('o1');

    expect(extractCourierProviderFromDeliveryMethod).toHaveBeenCalled();
    expect(getCourierProvider).toHaveBeenCalledWith('fancourier');
  });
});

describe('POST /api/admin/orders/[id]/generate-awb — locker delivery (no address required)', () => {
  it('proceeds with empty address when locker delivery (lockerId set)', async () => {
    const createShipment = vi.fn().mockResolvedValue({
      success: true,
      awb: 'AWB-LOCKER',
      price: 12.5,
      priceWithVAT: 14.88,
      currency: 'RON',
      estimatedDays: 1,
    });
    setupMocks({
      id: 'o1',
      delivery_tracking_number: null,
      delivery_method: { type: 'locker', name: 'Sameday EasyBox Piata' },
      delivery_address: null,
      courier_provider: 'sameday',
      courier_quote: { lockerId: 'EBX-1234', lockerName: 'EasyBox Piata' },
      customer_data: { contact: { name: 'X', phone: '0700' } },
    });
    getCourierProvider.mockReturnValue({ createShipment });

    const res = await callRoute('o1');

    expect(res.status).toBe(200);
    expect(createShipment).toHaveBeenCalled();
  });
});
