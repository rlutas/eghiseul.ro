import { afterEach, describe, expect, it, vi } from 'vitest';
import { sendEmail } from '@/lib/email/resend';

/**
 * 11.11.2026: documentero.ro was missing from the Resend account, every
 * documentero email got 403 "domain is not verified" and was lost.
 * sendEmail must retry once from the default address, brand name kept.
 */
describe('sendEmail — unverified domain fallback', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('retries from the default address and keeps Reply-To on the brand', async () => {
    vi.stubEnv('RESEND_API_KEY', 'test');
    const calls: Array<{ from: string; reply_to: string; key?: string }> = [];
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body));
      const headers = init.headers as Record<string, string>;
      calls.push({ from: body.from, reply_to: body.reply_to, key: headers['Idempotency-Key'] });
      if (calls.length === 1) {
        return new Response('{"message":"The documentero.ro domain is not verified."}', { status: 403 });
      }
      return new Response('{"id":"re_1"}', { status: 200 });
    }));

    const res = await sendEmail({
      to: 'client@example.com',
      subject: 's',
      html: 'h',
      from: 'documentero.ro <contact@documentero.ro>',
      idempotencyKey: 'k1',
    });

    expect(res.id).toBe('re_1');
    expect(calls).toHaveLength(2);
    expect(calls[1].from).toBe('documentero.ro <contact@eghiseul.ro>');
    expect(calls[1].reply_to).toBe(calls[0].reply_to);
    expect(calls[1].key).toBe('k1:fallback');
  });

  it('does not retry other 4xx errors', async () => {
    vi.stubEnv('RESEND_API_KEY', 'test');
    const fetchMock = vi.fn(async () => new Response('{"message":"Invalid to"}', { status: 422 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(
      sendEmail({ to: 'x', subject: 's', html: 'h', from: 'documentero.ro <contact@documentero.ro>' })
    ).rejects.toThrow('Resend 422');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
