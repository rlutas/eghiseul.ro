import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const { from } = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => ({ from }) }));
vi.mock('@/lib/email/resend', () => ({ sendEmail: vi.fn(), ResendError: class extends Error {} }));

const { POST } = await import('@/app/api/cron/email-campaigns/route');

const campaign = {
  id: 'c1',
  subject: 'Subiect',
  body_text: 'Corpul campaniei',
  segment: 'service_buyers',
  service_slug: null,
  daily_batch_size: 10,
  sent_count: 0,
};

function campaignsQuery() {
  const chain = { select: () => chain, eq: () => chain, order: async () => ({ data: [campaign], error: null }) };
  return chain;
}

describe('POST /api/cron/email-campaigns — service_buyers guard', () => {
  beforeEach(() => {
    process.env.CRON_SECRET = 'secret';
    from.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('never reads contacts when service_slug is missing', async () => {
    from.mockImplementation((table: string) => {
      if (table === 'email_campaigns') return campaignsQuery();
      throw new Error(`unexpected table ${table}`);
    });
    const req = new NextRequest('http://localhost/api/cron/email-campaigns', {
      method: 'POST',
      headers: { authorization: 'Bearer secret' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(from).not.toHaveBeenCalledWith('contacts');
  });
});
