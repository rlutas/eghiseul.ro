import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

type Row = {
  id: string;
  friendly_order_id: string | null;
  courier_provider: string | null;
  shipped_at: string | null;
  status: string;
};

const state: {
  selectRows: Row[];
  selectError: { message: string } | null;
  updateError: { message: string } | null;
  historyError: { message: string } | null;
  updateCalls: Array<{ patch: Record<string, unknown>; ids: string[] }>;
  historyCalls: Array<Array<Record<string, unknown>>>;
} = {
  selectRows: [],
  selectError: null,
  updateError: null,
  historyError: null,
  updateCalls: [],
  historyCalls: [],
};

const fromMock = vi.fn((table: string) => {
  if (table === 'orders') {
    return {
      select: () => ({
        eq: () => ({
          not: () => ({
            limit: async () => ({ data: state.selectRows, error: state.selectError }),
          }),
        }),
      }),
      update: (patch: Record<string, unknown>) => ({
        in: async (_col: string, ids: string[]) => {
          state.updateCalls.push({ patch, ids });
          return { error: state.updateError };
        },
      }),
    };
  }
  if (table === 'order_history') {
    return {
      insert: async (rows: Array<Record<string, unknown>>) => {
        state.historyCalls.push(rows);
        return { error: state.historyError };
      },
    };
  }
  throw new Error(`Unexpected table: ${table}`);
});

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({ from: fromMock })),
}));

const { POST } = await import('@/app/api/cron/auto-finalize-delivered/route');

function makeReq(authHeader?: string): NextRequest {
  const headers: Record<string, string> = {};
  if (authHeader) headers.authorization = authHeader;
  return new NextRequest('http://localhost:3000/api/cron/auto-finalize-delivered', {
    method: 'POST',
    headers,
  });
}

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
}

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  state.selectRows = [];
  state.selectError = null;
  state.updateError = null;
  state.historyError = null;
  state.updateCalls = [];
  state.historyCalls = [];
  fromMock.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('POST /api/cron/auto-finalize-delivered — auth', () => {
  it('returns 500 when CRON_SECRET not configured', async () => {
    vi.stubEnv('CRON_SECRET', '');
    const res = await POST(makeReq('Bearer x'));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toMatch(/not configured/i);
  });

  it('returns 401 when no Authorization header', async () => {
    vi.stubEnv('CRON_SECRET', 'secret');
    const res = await POST(makeReq());
    expect(res.status).toBe(401);
  });

  it('returns 401 when wrong Bearer token', async () => {
    vi.stubEnv('CRON_SECRET', 'secret');
    const res = await POST(makeReq('Bearer wrong'));
    expect(res.status).toBe(401);
  });
});

describe('POST /api/cron/auto-finalize-delivered — behavior', () => {
  beforeEach(() => {
    vi.stubEnv('CRON_SECRET', 'secret');
  });

  it('returns zero counts when no shipped orders exist', async () => {
    state.selectRows = [];
    const res = await POST(makeReq('Bearer secret'));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.finalizedCount).toBe(0);
    expect(body.data.blockedCount).toBe(0);
    expect(state.updateCalls).toHaveLength(0);
  });

  it('finalizes orders past per-courier threshold', async () => {
    state.selectRows = [
      // Sameday 5d → 6 days = finalize
      { id: 'o1', friendly_order_id: 'EGH-001', courier_provider: 'sameday', shipped_at: daysAgo(6), status: 'shipped' },
      // FAN 7d → 10 days = finalize
      { id: 'o2', friendly_order_id: 'EGH-002', courier_provider: 'fancourier', shipped_at: daysAgo(10), status: 'shipped' },
      // Sameday 5d → 2 days = no
      { id: 'o3', friendly_order_id: 'EGH-003', courier_provider: 'sameday', shipped_at: daysAgo(2), status: 'shipped' },
    ];
    const res = await POST(makeReq('Bearer secret'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.finalizedCount).toBe(2);
    expect(body.data.finalized.map((f: { id: string }) => f.id).sort()).toEqual(['o1', 'o2']);
    expect(state.updateCalls).toHaveLength(1);
    expect(state.updateCalls[0].patch.status).toBe('completed');
    expect(state.updateCalls[0].ids.sort()).toEqual(['o1', 'o2']);
  });

  it('flags blocked-in-transit (2× threshold) but still finalizes them', async () => {
    state.selectRows = [
      // Sameday 5d, shipped 12d ago → 12 ≥ 10 (2×), blocked = true, finalize = true
      { id: 'o1', friendly_order_id: 'EGH-001', courier_provider: 'sameday', shipped_at: daysAgo(12), status: 'shipped' },
    ];
    const res = await POST(makeReq('Bearer secret'));
    const body = await res.json();

    expect(body.data.finalizedCount).toBe(1);
    expect(body.data.blockedCount).toBe(1);
    expect(body.data.blocked[0].id).toBe('o1');
  });

  it('inserts order_history audit row per finalized order with system-cron actor', async () => {
    state.selectRows = [
      { id: 'o1', friendly_order_id: 'EGH-001', courier_provider: 'sameday', shipped_at: daysAgo(6), status: 'shipped' },
    ];
    await POST(makeReq('Bearer secret'));

    expect(state.historyCalls).toHaveLength(1);
    const rows = state.historyCalls[0];
    expect(rows[0].order_id).toBe('o1');
    expect(rows[0].event_type).toBe('status_change');
    expect(rows[0].changed_by).toBe('system-cron');
    expect((rows[0].new_value as { status: string }).status).toBe('completed');
    expect((rows[0].new_value as { reason: string }).reason).toBe('auto_finalize');
  });

  it('uses default threshold (10d) for unknown courier providers', async () => {
    state.selectRows = [
      // unknown courier, 11d ago → finalize (default 10d)
      { id: 'o1', friendly_order_id: 'EGH-001', courier_provider: 'whatever', shipped_at: daysAgo(11), status: 'shipped' },
      // unknown courier, 9d ago → don't
      { id: 'o2', friendly_order_id: 'EGH-002', courier_provider: 'whatever', shipped_at: daysAgo(9), status: 'shipped' },
    ];
    const res = await POST(makeReq('Bearer secret'));
    const body = await res.json();
    expect(body.data.finalizedCount).toBe(1);
    expect(body.data.finalized[0].id).toBe('o1');
  });

  it('returns 500 if orders update fails (does not leave half-written audit trail)', async () => {
    state.selectRows = [
      { id: 'o1', friendly_order_id: 'EGH-001', courier_provider: 'sameday', shipped_at: daysAgo(6), status: 'shipped' },
    ];
    state.updateError = { message: 'db down' };

    const res = await POST(makeReq('Bearer secret'));
    expect(res.status).toBe(500);
    expect(state.historyCalls).toHaveLength(0);
  });

  it('does not fail when history insert errors (status update is the priority)', async () => {
    state.selectRows = [
      { id: 'o1', friendly_order_id: 'EGH-001', courier_provider: 'sameday', shipped_at: daysAgo(6), status: 'shipped' },
    ];
    state.historyError = { message: 'history table busy' };

    const res = await POST(makeReq('Bearer secret'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.finalizedCount).toBe(1);
  });
});
