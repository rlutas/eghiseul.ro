import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Hoisted mocks for the courier facade. We don't test provider internals here;
// we test the route's parameter parsing, error mapping, and response shape.
const { getCourierProvider, getAllQuotes, getAvailableProvidersForDestination } = vi.hoisted(() => ({
  getCourierProvider: vi.fn(),
  getAllQuotes: vi.fn(),
  getAvailableProvidersForDestination: vi.fn(() => [
    { code: 'fancourier', name: 'Fan Courier', type: 'domestic' },
    { code: 'sameday', name: 'Sameday', type: 'domestic' },
  ]),
}));

vi.mock('@/lib/services/courier', () => ({
  getCourierProvider,
  getAllQuotes,
  getAvailableProvidersForDestination,
  DEFAULT_DOCUMENT_PACKAGE: { weight: 0.5, type: 'envelope', quantity: 1, length: 30, width: 22, height: 1 },
  // Re-export types as runtime no-ops (only used for type info)
  CourierCode: undefined,
  QuoteRequest: undefined,
}));

const { GET } = await import('@/app/api/courier/quote/route');

function makeReq(params: Record<string, string>): NextRequest {
  const url = new URL('http://localhost:3000/api/courier/quote');
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new NextRequest(url);
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  getCourierProvider.mockReset();
  getAllQuotes.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('GET /api/courier/quote — parameter validation', () => {
  it('returns 400 with MISSING_PARAMS when senderCounty missing', async () => {
    const res = await GET(makeReq({ senderCity: 'București', recipientCounty: 'Cluj', recipientCity: 'Cluj-Napoca' }));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe('MISSING_PARAMS');
  });

  it.each(['senderCounty', 'senderCity', 'recipientCounty', 'recipientCity'])(
    'returns 400 when %s is missing',
    async (missing) => {
      const all = {
        senderCounty: 'IL', senderCity: 'București',
        recipientCounty: 'Cluj', recipientCity: 'Cluj-Napoca',
      };
      delete (all as Record<string, string>)[missing];
      const res = await GET(makeReq(all));
      expect(res.status).toBe(400);
    },
  );
});

describe('GET /api/courier/quote — single provider mode', () => {
  it('uses specific provider when provider param present', async () => {
    const fakeProvider = { getQuotes: vi.fn().mockResolvedValue([{ provider: 'fancourier', cost: 18, currency: 'RON' }]) };
    getCourierProvider.mockReturnValue(fakeProvider);

    const res = await GET(makeReq({
      senderCounty: 'IL', senderCity: 'Slobozia',
      recipientCounty: 'Cluj', recipientCity: 'Cluj-Napoca',
      provider: 'fancourier',
    }));

    expect(res.status).toBe(200);
    expect(getCourierProvider).toHaveBeenCalledWith('fancourier');
    expect(fakeProvider.getQuotes).toHaveBeenCalled();
    const body = await res.json();
    expect(body.data.quotes[0].cost).toBe(18);
  });

  it('returns 400 PROVIDER_ERROR when provider throws (e.g. credentials missing)', async () => {
    getCourierProvider.mockImplementation(() => {
      throw new Error('Provider credentials not configured');
    });

    const res = await GET(makeReq({
      senderCounty: 'IL', senderCity: 'X',
      recipientCounty: 'CJ', recipientCity: 'Y',
      provider: 'fancourier',
    }));

    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe('PROVIDER_ERROR');
  });

  it('returns 400 PROVIDER_ERROR when provider.getQuotes rejects', async () => {
    getCourierProvider.mockReturnValue({
      getQuotes: vi.fn().mockRejectedValue(new Error('network down')),
    });

    const res = await GET(makeReq({
      senderCounty: 'IL', senderCity: 'X',
      recipientCounty: 'CJ', recipientCity: 'Y',
      provider: 'fancourier',
    }));

    expect(res.status).toBe(400);
    expect((await res.json()).error.message).toMatch(/network down/);
  });
});

describe('GET /api/courier/quote — multi-provider mode (no provider param)', () => {
  it('calls getAllQuotes when no specific provider requested', async () => {
    getAllQuotes.mockResolvedValue([
      { provider: 'fancourier', cost: 18, currency: 'RON' },
      { provider: 'sameday', cost: 22, currency: 'RON' },
    ]);

    const res = await GET(makeReq({
      senderCounty: 'IL', senderCity: 'București',
      recipientCounty: 'Cluj', recipientCity: 'Cluj-Napoca',
    }));

    expect(res.status).toBe(200);
    expect(getAllQuotes).toHaveBeenCalled();
    expect(getCourierProvider).not.toHaveBeenCalled();
    const body = await res.json();
    expect(body.data.quotes).toHaveLength(2);
  });

  it('returns availableProviders metadata for the destination', async () => {
    getAllQuotes.mockResolvedValue([]);

    const res = await GET(makeReq({
      senderCounty: 'IL', senderCity: 'X',
      recipientCounty: 'CJ', recipientCity: 'Y',
    }));

    const body = await res.json();
    expect(body.data.availableProviders).toEqual([
      { code: 'fancourier', name: 'Fan Courier', type: 'domestic' },
      { code: 'sameday', name: 'Sameday', type: 'domestic' },
    ]);
  });
});

describe('GET /api/courier/quote — package weight + COD', () => {
  it('forwards weight from query (default 0.5kg)', async () => {
    let captured: { packages?: Array<{ weight: number }> } = {};
    getAllQuotes.mockImplementation((req) => {
      captured = req;
      return Promise.resolve([]);
    });

    await GET(makeReq({
      senderCounty: 'IL', senderCity: 'X',
      recipientCounty: 'CJ', recipientCity: 'Y',
      weight: '2.5',
    }));

    expect(captured.packages?.[0].weight).toBe(2.5);
  });

  it('uses default weight 0.5kg when not specified', async () => {
    let captured: { packages?: Array<{ weight: number }> } = {};
    getAllQuotes.mockImplementation((req) => {
      captured = req;
      return Promise.resolve([]);
    });

    await GET(makeReq({
      senderCounty: 'IL', senderCity: 'X',
      recipientCounty: 'CJ', recipientCity: 'Y',
    }));

    expect(captured.packages?.[0].weight).toBe(0.5);
  });

  it('forwards cod amount when provided', async () => {
    let captured: { cod?: number } = {};
    getAllQuotes.mockImplementation((req) => {
      captured = req;
      return Promise.resolve([]);
    });

    await GET(makeReq({
      senderCounty: 'IL', senderCity: 'X',
      recipientCounty: 'CJ', recipientCity: 'Y',
      cod: '500',
    }));

    expect(captured.cod).toBe(500);
  });

  it('forwards country (default RO)', async () => {
    let captured: { recipient?: { country: string } } = {};
    getAllQuotes.mockImplementation((req) => {
      captured = req;
      return Promise.resolve([]);
    });

    await GET(makeReq({
      senderCounty: 'IL', senderCity: 'X',
      recipientCounty: 'CJ', recipientCity: 'Y',
    }));
    expect(captured.recipient?.country).toBe('RO');
  });
});

describe('GET /api/courier/quote — error handling', () => {
  it('returns 500 QUOTE_ERROR when getAllQuotes rejects', async () => {
    getAllQuotes.mockRejectedValue(new Error('something blew up'));

    const res = await GET(makeReq({
      senderCounty: 'IL', senderCity: 'X',
      recipientCounty: 'CJ', recipientCity: 'Y',
    }));

    expect(res.status).toBe(500);
    expect((await res.json()).error.code).toBe('QUOTE_ERROR');
  });
});
