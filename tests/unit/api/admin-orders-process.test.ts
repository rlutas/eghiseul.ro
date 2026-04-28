import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Persistent mock chain so the module-level admin client (if any) keeps working.
const persistentFrom = vi.fn();
const persistentClient = { from: persistentFrom };

// Auth mock — user identity for permission checks
const { getUser } = vi.hoisted(() => ({ getUser: vi.fn() }));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({ auth: { getUser } }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => persistentClient),
}));

const { requirePermission } = vi.hoisted(() => ({ requirePermission: vi.fn() }));
vi.mock('@/lib/admin/permissions', () => ({ requirePermission }));

const { POST } = await import('@/app/api/admin/orders/[id]/process/route');

interface MockSetup {
  order?: { data: unknown; error: unknown };
  updateError?: unknown;
}

function setupMocks(s: MockSetup = {}) {
  persistentFrom.mockImplementation((table: string) => {
    if (table === 'order_history' || table === 'order_documents' || table === 'order_option_status') {
      return {
        insert: vi.fn().mockResolvedValue({ error: null }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }),
      };
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
  const req = new NextRequest(`http://localhost:3000/api/admin/orders/${orderId}/process`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return POST(req, { params: Promise.resolve({ id: orderId }) });
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
  persistentFrom.mockReset();
  getUser.mockReset();
  requirePermission.mockReset();
  // default: authenticated user with permission
  getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } }, error: null });
  requirePermission.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('POST /api/admin/orders/[id]/process — auth', () => {
  it('returns 401 when no authenticated user', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });
    setupMocks();

    const res = await callRoute('o1', { action: 'start_processing' });

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 401 when auth call errors', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: { message: 'jwt expired' } });
    setupMocks();

    const res = await callRoute('o1', { action: 'start_processing' });
    expect(res.status).toBe(401);
  });

  it('returns 403 when user lacks orders.manage permission', async () => {
    requirePermission.mockRejectedValue(
      new Response(JSON.stringify({ error: 'Insufficient permissions' }), { status: 403 }),
    );
    setupMocks();

    const res = await callRoute('o1', { action: 'start_processing' });
    expect(res.status).toBe(403);
  });

  it('checks specifically for orders.manage permission', async () => {
    setupMocks({ order: { data: { id: 'o1', status: 'paid' }, error: null } });

    await callRoute('o1', { action: 'start_processing' });

    expect(requirePermission).toHaveBeenCalledWith('admin-1', 'orders.manage');
  });
});

describe('POST /api/admin/orders/[id]/process — validation', () => {
  it('returns 400 when action is missing', async () => {
    setupMocks();
    const res = await callRoute('o1', {});

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('INVALID_ACTION');
  });

  it('returns 400 when action is unknown', async () => {
    setupMocks();
    const res = await callRoute('o1', { action: 'do_something_random' });

    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe('INVALID_ACTION');
  });

  it('returns 404 when order does not exist', async () => {
    setupMocks({ order: { data: null, error: { message: 'not found' } } });

    const res = await callRoute('o-missing', { action: 'start_processing' });

    expect(res.status).toBe(404);
    expect((await res.json()).error.code).toBe('NOT_FOUND');
  });
});

describe('POST /api/admin/orders/[id]/process — status transitions', () => {
  it('rejects invalid transition (paid → completed) with 400 + INVALID_TRANSITION', async () => {
    setupMocks({ order: { data: { id: 'o1', status: 'paid' }, error: null } });

    const res = await callRoute('o1', { action: 'complete' });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('INVALID_TRANSITION');
    expect(body.error.message).toContain('paid');
    expect(body.error.message).toContain('completed');
  });

  it('rejects skipping a state (paid → submitted_to_institution)', async () => {
    setupMocks({ order: { data: { id: 'o1', status: 'paid' }, error: null } });

    const res = await callRoute('o1', { action: 'mark_submitted' });
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe('INVALID_TRANSITION');
  });

  it.each([
    ['paid',                       'start_processing',  'processing'],
    ['processing',                 'generate_cerere',   'documents_generated'],
    ['documents_generated',        'mark_submitted',    'submitted_to_institution'],
    ['submitted_to_institution',   'upload_received',   'document_received'],
    ['document_received',          'mark_ready',        'document_ready'],
    ['document_ready',             'complete',          undefined], // complete maps to 'completed' but valid only after shipped
  ])('valid transition %s → %s when action="%s"', async (from, action, expected) => {
    setupMocks({ order: { data: { id: 'o1', status: from }, error: null } });

    const res = await callRoute('o1', { action });

    if (expected) {
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.new_status).toBe(expected);
    } else {
      // 'complete' from 'document_ready' is INVALID — completed only after shipped
      expect(res.status).toBe(400);
    }
  });

  it('writes order_history with status_changed event when transition succeeds', async () => {
    setupMocks({ order: { data: { id: 'o1', status: 'paid' }, error: null } });

    await callRoute('o1', { action: 'start_processing', data: { notes: 'Manual trigger' } });

    expect(persistentFrom).toHaveBeenCalledWith('order_history');
  });

  it('returns 500 when DB update fails', async () => {
    setupMocks({
      order: { data: { id: 'o1', status: 'paid' }, error: null },
      updateError: { message: 'lock timeout' },
    });

    const res = await callRoute('o1', { action: 'start_processing' });

    expect(res.status).toBe(500);
    expect((await res.json()).error.code).toBe('UPDATE_FAILED');
  });
});

describe('POST /api/admin/orders/[id]/process — document upload action', () => {
  it('stores document reference when action includes file_key + file_name', async () => {
    setupMocks({ order: { data: { id: 'o1', status: 'submitted_to_institution' }, error: null } });

    await callRoute('o1', {
      action: 'upload_received',
      data: { file_key: 'orders/o1/received.pdf', file_name: 'Cazier.pdf' },
    });

    expect(persistentFrom).toHaveBeenCalledWith('order_documents');
  });

  it('sets visible_to_client correctly: document_received=false, document_final=true', async () => {
    setupMocks({ order: { data: { id: 'o1', status: 'submitted_to_institution' }, error: null } });

    let captured: Record<string, unknown> = {};
    persistentFrom.mockImplementation((table: string) => {
      if (table === 'order_documents') {
        return {
          insert: vi.fn((row) => {
            captured = row;
            return Promise.resolve({ error: null });
          }),
        };
      }
      if (table === 'order_history') {
        return { insert: vi.fn().mockResolvedValue({ error: null }) };
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { id: 'o1', status: 'submitted_to_institution' }, error: null }),
          }),
        }),
        update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
      };
    });

    await callRoute('o1', {
      action: 'upload_received',
      data: { file_key: 'k1', file_name: 'doc.pdf' },
    });

    expect(captured.type).toBe('document_received');
    expect(captured.visible_to_client).toBe(false);
  });
});
