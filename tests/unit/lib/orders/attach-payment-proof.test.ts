import { describe, it, expect, vi, beforeEach } from 'vitest';

const s3 = vi.hoisted(() => ({
  getFileInfo: vi.fn<(key: string) => Promise<Record<string, unknown>>>(),
  copyFile: vi.fn<(src: string, dest: string) => Promise<string>>(),
  deleteFile: vi.fn<(key: string) => Promise<void>>(),
}));
vi.mock('@/lib/aws/s3', async (orig) => {
  const real = await orig<typeof import('@/lib/aws/s3')>();
  return { ...real, getFileInfo: s3.getFileInfo, copyFile: s3.copyFile, deleteFile: s3.deleteFile };
});

const db = vi.hoisted(() => ({
  rpc: vi.fn<(name: string, args?: Record<string, unknown>) => Promise<{ data: unknown; error: null }>>(),
  event: { id: 'evt-1', team_notified_at: null as string | null },
}));
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    rpc: db.rpc,
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: table === 'payment_proof_events' ? db.event : null }),
          single: async () => ({
            data: { id: 'o1', friendly_order_id: 'E-1', total_price: 100, customer_data: { contact: { email: 'a@b.ro' } }, services: { name: 'Cazier' } },
          }),
        }),
      }),
    }),
  }),
}));

const mail = vi.hoisted(() => ({
  sendEmail: vi.fn<(input: { idempotencyKey?: string }) => Promise<{ id: string }>>(async () => ({ id: 'm1' })),
}));
vi.mock('@/lib/email/resend', () => ({ sendEmail: mail.sendEmail }));

import { attachPaymentProof } from '@/lib/orders/attach-payment-proof';

const ORDER = 'e0a5b3f2-1111-4222-8333-444455556666';
const UPLOAD = `orders/2026/09/${ORDER}/uploads/proof-1.jpg`;

beforeEach(() => {
  vi.clearAllMocks();
  db.event = { id: 'evt-1', team_notified_at: null };
  s3.getFileInfo.mockResolvedValue({ key: UPLOAD, size: 1234, lastModified: new Date(), contentType: 'image/jpeg', etag: 'abc123' });
  s3.copyFile.mockResolvedValue('ok');
  db.rpc.mockImplementation(async (name: string) => {
    if (name === 'attach_payment_proof') return { data: { outcome: 'attached', event_id: 'evt-1', history_id: 'h1' }, error: null };
    return { data: true, error: null };
  });
});

describe('attachPaymentProof', () => {
  it('refuses a key outside the order namespace before touching S3', async () => {
    const r = await attachPaymentProof({ orderId: ORDER, uploadKey: 'orders/2026/09/other/uploads/x.jpg', changedBy: null });
    expect(r.outcome).toBe('invalid_key');
    expect(s3.getFileInfo).not.toHaveBeenCalled();
  });

  it('deletes and refuses an object over 10 MB', async () => {
    s3.getFileInfo.mockResolvedValue({ key: UPLOAD, size: 11 * 1024 * 1024, lastModified: new Date(), etag: 'big' });
    const r = await attachPaymentProof({ orderId: ORDER, uploadKey: UPLOAD, changedBy: null });
    expect(r.outcome).toBe('too_large');
    expect(s3.deleteFile).toHaveBeenCalledWith(UPLOAD);
    expect(db.rpc).not.toHaveBeenCalled();
  });

  it('copies to an immutable key named after the ETag, attaches, notifies the team once', async () => {
    const r = await attachPaymentProof({ orderId: ORDER, uploadKey: UPLOAD, changedBy: 'u1' });
    expect(r.outcome).toBe('attached');
    expect(s3.copyFile).toHaveBeenCalledTimes(1);
    const finalKey = s3.copyFile.mock.calls[0][1] as string;
    expect(finalKey).toMatch(new RegExp(`^orders/\\d{4}/\\d{2}/${ORDER}/proof/abc123\\.jpg$`));
    expect(db.rpc).toHaveBeenCalledWith('attach_payment_proof', expect.objectContaining({ p_key: finalKey, p_digest: 'abc123' }));
    expect(mail.sendEmail).toHaveBeenCalledTimes(1);
    expect(mail.sendEmail.mock.calls[0][0]).toMatchObject({ idempotencyKey: `bank-transfer-proof-${ORDER}-abc123` });
    expect(db.rpc).toHaveBeenCalledWith('mark_payment_proof_notified', { p_event_id: 'evt-1' });
  });

  it('a replay is unchanged and does not e-mail again once notified', async () => {
    db.rpc.mockImplementation(async (name: string) =>
      name === 'attach_payment_proof' ? { data: { outcome: 'unchanged', event_id: 'evt-1', history_id: 'h1' }, error: null } : { data: true, error: null }
    );
    db.event = { id: 'evt-1', team_notified_at: '2026-09-18T10:00:00Z' };
    const r = await attachPaymentProof({ orderId: ORDER, uploadKey: UPLOAD, changedBy: null });
    expect(r.outcome).toBe('unchanged');
    expect(mail.sendEmail).not.toHaveBeenCalled();
  });

  it('a replay whose earlier e-mail died sends it now (healing)', async () => {
    db.rpc.mockImplementation(async (name: string) =>
      name === 'attach_payment_proof' ? { data: { outcome: 'unchanged', event_id: 'evt-1', history_id: 'h1' }, error: null } : { data: true, error: null }
    );
    const r = await attachPaymentProof({ orderId: ORDER, uploadKey: UPLOAD, changedBy: null });
    expect(r.outcome).toBe('unchanged');
    expect(mail.sendEmail).toHaveBeenCalledTimes(1);
  });

  it('a non-awaiting order is refused by the database, no e-mail', async () => {
    db.rpc.mockImplementation(async () => ({ data: { outcome: 'not_awaiting' }, error: null }));
    const r = await attachPaymentProof({ orderId: ORDER, uploadKey: UPLOAD, changedBy: null });
    expect(r.outcome).toBe('not_awaiting');
    expect(mail.sendEmail).not.toHaveBeenCalled();
  });
});
