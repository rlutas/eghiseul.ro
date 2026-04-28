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

const { getCourierProvider } = vi.hoisted(() => ({ getCourierProvider: vi.fn() }));
vi.mock('@/lib/services/courier', () => ({ getCourierProvider, CourierCode: undefined }));

const { isFinalStatus, extractCourierProviderFromDeliveryMethod } = vi.hoisted(() => ({
  isFinalStatus: vi.fn((s: string) => ['delivered', 'returned', 'cancelled'].includes(s)),
  extractCourierProviderFromDeliveryMethod: vi.fn(),
}));
vi.mock('@/lib/services/courier/utils', () => ({
  isFinalStatus,
  extractCourierProviderFromDeliveryMethod,
}));

const { GET } = await import('@/app/api/orders/[id]/tracking/route');

interface OrderRow {
  id?: string;
  user_id?: string | null;
  delivery_tracking_number?: string | null;
  delivery_tracking_url?: string | null;
  delivery_tracking_events?: unknown;
  delivery_tracking_status?: string | null;
  delivery_tracking_last_update?: string | null;
  courier_provider?: string | null;
  delivery_method?: unknown;
  customer_data?: unknown;
  status?: string;
}

function setupOrder(order: OrderRow | null, profile: { role?: string } | null = null) {
  persistentFrom.mockImplementation((table: string) => {
    if (table === 'profiles') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: profile, error: null }),
          }),
        }),
      };
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
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    };
  });
}

function callRoute(orderId: string, query: Record<string, string> = {}): Promise<Response> {
  const url = new URL(`http://localhost:3000/api/orders/${orderId}/tracking`);
  for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
  const req = new NextRequest(url);
  return GET(req, { params: Promise.resolve({ id: orderId }) });
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
  persistentFrom.mockReset();
  getUser.mockReset();
  getCourierProvider.mockReset();
  // default: anonymous (guest)
  getUser.mockResolvedValue({ data: { user: null }, error: null });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('GET /api/orders/[id]/tracking — order lookup', () => {
  it('returns 404 when order does not exist', async () => {
    setupOrder(null);
    const res = await callRoute('o-missing');
    expect(res.status).toBe(404);
    expect((await res.json()).error.code).toBe('ORDER_NOT_FOUND');
  });
});

describe('GET /api/orders/[id]/tracking — access control', () => {
  it('returns 401 when guest accesses an order owned by another user', async () => {
    setupOrder({
      id: 'o1', user_id: 'someone-else',
      delivery_tracking_number: 'AWB-X', delivery_tracking_status: 'in_transit',
    });

    const res = await callRoute('o1');
    expect(res.status).toBe(401);
  });

  it('returns 403 when authenticated user tries to access another user order (non-admin)', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'user-a' } }, error: null });
    setupOrder(
      { id: 'o1', user_id: 'user-b', delivery_tracking_number: 'AWB' },
      { role: 'customer' }, // not admin
    );

    const res = await callRoute('o1');
    expect(res.status).toBe(403);
  });

  it('allows admin to view any order', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } }, error: null });
    setupOrder(
      {
        id: 'o1', user_id: 'user-b',
        delivery_tracking_number: 'AWB',
        delivery_tracking_status: 'delivered',
        delivery_tracking_events: [{ status: 'delivered', timestamp: '2026-04-28' }],
        delivery_tracking_last_update: new Date().toISOString(),
      },
      { role: 'admin' },
    );

    const res = await callRoute('o1');
    expect(res.status).toBe(200);
  });

  it('allows owner to view their own order', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    setupOrder({
      id: 'o1', user_id: 'user-1',
      delivery_tracking_number: 'AWB',
      delivery_tracking_status: 'delivered',
      delivery_tracking_events: [],
      delivery_tracking_last_update: new Date().toISOString(),
    });

    const res = await callRoute('o1');
    expect(res.status).toBe(200);
  });
});

describe('GET /api/orders/[id]/tracking — guest order access', () => {
  it('allows guest with matching email param on a guest order', async () => {
    setupOrder({
      id: 'o1', user_id: null,
      delivery_tracking_number: 'AWB',
      delivery_tracking_status: 'delivered',
      delivery_tracking_events: [],
      delivery_tracking_last_update: new Date().toISOString(),
      customer_data: { contact: { email: 'guest@example.com' } },
    });

    const res = await callRoute('o1', { email: 'guest@example.com' });
    expect(res.status).toBe(200);
  });
});

describe('GET /api/orders/[id]/tracking — cache behavior', () => {
  it('returns cached tracking data when last update was within 30min', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });

    // Recent update — within TTL
    setupOrder({
      id: 'o1', user_id: 'user-1',
      delivery_tracking_number: 'AWB-CACHED',
      delivery_tracking_status: 'in_transit',
      delivery_tracking_events: [{ status: 'in_transit', timestamp: '2026-04-28T08:00:00Z' }],
      delivery_tracking_last_update: new Date(Date.now() - 60_000).toISOString(), // 1 min ago
      courier_provider: 'fancourier',
    });

    const res = await callRoute('o1');
    expect(res.status).toBe(200);
    // No fresh provider call should happen for cache hit
    expect(getCourierProvider).not.toHaveBeenCalled();
  });

  it('does NOT refresh when status is final (delivered/returned/cancelled)', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });

    setupOrder({
      id: 'o1', user_id: 'user-1',
      delivery_tracking_number: 'AWB-DONE',
      delivery_tracking_status: 'delivered',
      delivery_tracking_events: [{ status: 'delivered', timestamp: '2026-04-20T10:00:00Z' }],
      delivery_tracking_last_update: new Date(Date.now() - 7 * 24 * 3_600_000).toISOString(), // 7 days ago
      courier_provider: 'fancourier',
    });

    const res = await callRoute('o1');
    expect(res.status).toBe(200);
    // Even though stale, final status should NOT trigger a new provider call
    expect(getCourierProvider).not.toHaveBeenCalled();
  });
});
