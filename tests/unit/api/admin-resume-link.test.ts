import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const from = vi.fn();
const { getUser, requirePermission } = vi.hoisted(() => ({
  getUser: vi.fn(),
  requirePermission: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({ auth: { getUser } }),
}));
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({ from })),
}));
vi.mock('@/lib/admin/permissions', () => ({ requirePermission }));

const { POST } = await import('@/app/api/admin/orders/[id]/resume-link/route');

const HOUR = 60 * 60 * 1000;
let updates: Array<Record<string, unknown>>;

function setup(order: Record<string, unknown>) {
  updates = [];
  from.mockImplementation((table: string) => {
    if (table === 'order_history') {
      return { insert: vi.fn().mockResolvedValue({ error: null }) };
    }
    return {
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: order, error: null }) }) }),
      update: (patch: Record<string, unknown>) => {
        updates.push(patch);
        return { eq: () => ({ eq: () => Promise.resolve({ error: null }) }) };
      },
    };
  });
}

async function call() {
  const req = new NextRequest('http://localhost:3000/api/admin/orders/o1/resume-link', { method: 'POST' });
  const res = await POST(req, { params: Promise.resolve({ id: 'o1' }) });
  return res.json();
}

const base = {
  id: 'o1',
  friendly_order_id: 'E-000000-TEST1',
  status: 'draft',
  platform: 'eghiseul',
  services: { slug: 'cazier-judiciar' },
};

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  delete process.env.NEXT_PUBLIC_APP_URL;
  getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } }, error: null });
  requirePermission.mockResolvedValue(undefined);
});

describe('POST /api/admin/orders/[id]/resume-link', () => {
  it('reuses a live token so a link already sent keeps working', async () => {
    setup({ ...base, resume_token: 'live-token', resume_token_expires_at: new Date(Date.now() + 40 * HOUR).toISOString() });
    const body = await call();
    expect(body.data.resumeUrl).toBe('https://eghiseul.ro/comanda/cazier-judiciar?resume=live-token');
    expect(updates[0].resume_token).toBe('live-token');
    const newExpiry = new Date(updates[0].resume_token_expires_at as string).getTime();
    expect(newExpiry).toBeGreaterThan(Date.now() + 47 * HOUR);
  });

  it('mints a new token when none exists or it is about to expire', async () => {
    setup({ ...base, resume_token: 'old', resume_token_expires_at: new Date(Date.now() + HOUR).toISOString() });
    const body = await call();
    expect(updates[0].resume_token).not.toBe('old');
    expect(body.data.resumeUrl).toContain(`resume=${updates[0].resume_token}`);

    setup({ ...base, resume_token: null, resume_token_expires_at: null });
    await call();
    expect(typeof updates[0].resume_token).toBe('string');
    expect((updates[0].resume_token as string).length).toBeGreaterThan(20);
  });

  it('builds documentero links on documentero.ro', async () => {
    setup({ ...base, platform: 'documentero', resume_token: null, resume_token_expires_at: null });
    const body = await call();
    expect(body.data.resumeUrl.startsWith('https://documentero.ro/comanda/')).toBe(true);
  });
});
