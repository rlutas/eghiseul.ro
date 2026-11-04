// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { queueClientError, flushQueuedClientErrors, __resetClientErrorDedupe } from '@/lib/client-errors/report';

const payload = { kind: 'save_failed', code: 'NETWORK', step: 'personal-data', orderRef: 'E-261104-SAQKA' } as const;

describe('queued client errors', () => {
  beforeEach(() => {
    sessionStorage.clear();
    __resetClientErrorDedupe();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('keeps the error while the connection is down and sends it once it is back', async () => {
    const fetchMock = vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch')).mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    queueClientError(payload);
    await flushQueuedClientErrors();
    expect(sessionStorage.getItem('client_error_queue')).toContain('E-261104-SAQKA');

    await flushQueuedClientErrors();
    expect(sessionStorage.getItem('client_error_queue')).toBeNull();
    const sent = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(sent).toMatchObject({ kind: 'save_failed', orderRef: 'E-261104-SAQKA' });
  });

  it('survives a page reload, because the customer is likely to reload', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    sessionStorage.setItem('client_error_queue', JSON.stringify([{ ...payload, page: '/comanda/cazier-auto/' }]));
    await flushQueuedClientErrors();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem('client_error_queue')).toBeNull();
  });

  it('counts the same failure once per page view', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    queueClientError(payload);
    queueClientError(payload);
    await flushQueuedClientErrors();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('never throws when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() => { throw new Error('blocked'); });
    expect(() => queueClientError(payload)).not.toThrow();
    vi.restoreAllMocks();
  });
});
