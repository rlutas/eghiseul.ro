import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Central registry client — the thin layer every platform uses to talk to the
 * dedicated Supabase registry project. Runs inside payment webhooks, so:
 *  - allocateNumber maps RPC rows correctly (incl. the `reused` idempotency flag),
 *  - allocateNumberSafe NEVER throws (fail-soft, D3),
 *  - formatRegistryNumber matches the Barou display conventions
 *    (contract '004271', delegation 'SM005757').
 */

// Mutable per-test RPC behavior.
let rpcResult: { data: unknown; error: { code?: string; message: string } | null } = {
  data: null,
  error: null,
};
let rpcCalls: { fn: string; params: Record<string, unknown> }[] = [];

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    rpc: (fn: string, params: Record<string, unknown>) => {
      rpcCalls.push({ fn, params });
      return Promise.resolve(rpcResult);
    },
  }),
}));

process.env.REGISTRY_SUPABASE_URL = 'https://registry.test.supabase.co';
process.env.REGISTRY_SUPABASE_SERVICE_KEY = 'test-service-key';

import {
  allocateNumber,
  allocateNumberSafe,
  findExistingNumber,
  formatRegistryNumber,
} from '@/lib/registry/client';

beforeEach(() => {
  rpcResult = { data: null, error: null };
  rpcCalls = [];
});

describe('formatRegistryNumber', () => {
  it('pads contract numbers to 6 digits without series', () => {
    expect(formatRegistryNumber('contract', 4271)).toBe('004271');
    expect(formatRegistryNumber('contract', 4271, 'SM')).toBe('004271');
  });

  it('prefixes delegation numbers with the series', () => {
    expect(formatRegistryNumber('delegation', 5757, 'SM')).toBe('SM005757');
  });

  it('defaults delegation series to SM when missing', () => {
    expect(formatRegistryNumber('delegation', 7255, null)).toBe('SM007255');
    expect(formatRegistryNumber('delegation', 7255)).toBe('SM007255');
  });

  it('keeps numbers above 6 digits intact', () => {
    expect(formatRegistryNumber('contract', 1234567)).toBe('1234567');
  });
});

describe('allocateNumber', () => {
  const params = {
    type: 'contract' as const,
    platform: 'eghiseul' as const,
    orderRef: 'E-260709-TEST1',
    clientName: 'Ion Testescu',
  };

  it('maps the RPC row to AllocateResult (fresh allocation)', async () => {
    rpcResult = {
      data: [
        {
          allocated_number: 5772,
          allocated_series: null,
          allocated_year: 2026,
          range_id: 'range-1',
          registry_id: 'reg-1',
          reused: false,
        },
      ],
      error: null,
    };

    const result = await allocateNumber(params);
    expect(result).toEqual({
      number: 5772,
      series: null,
      year: 2026,
      rangeId: 'range-1',
      registryId: 'reg-1',
      reused: false,
    });
    expect(rpcCalls[0].fn).toBe('allocate_number');
    expect(rpcCalls[0].params.p_platform).toBe('eghiseul');
    expect(rpcCalls[0].params.p_order_ref).toBe('E-260709-TEST1');
    expect(rpcCalls[0].params.p_source).toBe('platform');
  });

  it('surfaces the reused flag on idempotent re-allocation', async () => {
    rpcResult = {
      data: [
        {
          allocated_number: 5772,
          allocated_series: 'SM',
          allocated_year: 2026,
          range_id: 'range-1',
          registry_id: 'reg-1',
          reused: true,
        },
      ],
      error: null,
    };

    const result = await allocateNumber({ ...params, type: 'delegation' });
    expect(result.reused).toBe(true);
    expect(result.series).toBe('SM');
  });

  it('throws on RPC error (e.g. P0002 no active range)', async () => {
    rpcResult = {
      data: null,
      error: { code: 'P0002', message: 'No active number range available' },
    };
    await expect(allocateNumber(params)).rejects.toThrow(/No active number range/);
  });

  it('throws when the RPC returns no row', async () => {
    rpcResult = { data: [], error: null };
    await expect(allocateNumber(params)).rejects.toThrow(/no row/);
  });
});

describe('allocateNumberSafe (fail-soft for payment webhooks)', () => {
  it('returns ok:true with data on success', async () => {
    rpcResult = {
      data: [
        {
          allocated_number: 7255,
          allocated_series: 'SM',
          allocated_year: 2026,
          range_id: 'range-2',
          registry_id: 'reg-2',
          reused: false,
        },
      ],
      error: null,
    };

    const result = await allocateNumberSafe({
      type: 'delegation',
      platform: 'cazierjudiciaronline',
      orderRef: 'CJO-20260709-12345',
      clientName: 'Test SRL',
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.number).toBe(7255);
  });

  it('NEVER throws — returns ok:false on registry error', async () => {
    rpcResult = { data: null, error: { code: 'P0002', message: 'exhausted' } };
    const result = await allocateNumberSafe({
      type: 'contract',
      platform: 'ecazier',
      orderRef: 'EJC-20260709-1',
      clientName: 'X',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/exhausted/);
  });
});

describe('findExistingNumber', () => {
  it('returns null when nothing is allocated', async () => {
    rpcResult = { data: [], error: null };
    const result = await findExistingNumber('eghiseul', 'E-260709-NONE', 'contract');
    expect(result).toBeNull();
  });

  it('maps an existing allocation', async () => {
    rpcResult = {
      data: [
        { registry_id: 'reg-9', existing_number: 5771, existing_series: null, existing_year: 2026 },
      ],
      error: null,
    };
    const result = await findExistingNumber('eghiseul', 'E-260709-OLD', 'contract');
    expect(result).toEqual({ registryId: 'reg-9', number: 5771, series: null, year: 2026 });
  });
});
