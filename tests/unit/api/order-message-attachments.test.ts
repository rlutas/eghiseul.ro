/**
 * Staff → client message attachments (02.11.2026):
 *  - presign routes (admin `orders.manage`, collaborator non-preview): type,
 *    size, auth;
 *  - admin POST message with files: count, namespace, existence/size on S3,
 *    text optional when files are attached, email mentions the files;
 *  - client download route: same access as the thread, key read from the
 *    message row of THIS order, never from the browser.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const ORDER = '11111111-2222-3333-4444-555555555555';
const MSG = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const staffKey = (n = 1) => `orders/${ORDER}/mesaje-echipa/${n}.pdf`;
const staffFile = (n = 1) => ({ key: staffKey(n), name: `cf-${n}.pdf`, mimeType: 'application/pdf', size: 1000 });

// ── Fake Supabase (service role) ──────────────────────────────────────────
interface TableConf {
  single?: unknown;
}
let tables: Record<string, TableConf> = {};
const inserts: Array<{ table: string; row: Record<string, unknown> }> = [];

function chain(table: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = {};
  for (const m of ['select', 'eq', 'neq', 'is', 'order', 'limit', 'in', 'gte', 'update']) c[m] = vi.fn(() => c);
  c.maybeSingle = vi.fn(async () => ({ data: tables[table]?.single ?? null, error: null }));
  c.single = vi.fn(async () => ({ data: tables[table]?.single ?? null, error: null }));
  c.insert = vi.fn((row: Record<string, unknown>) => {
    inserts.push({ table, row });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ins: any = {
      select: () => ({
        single: async () => ({
          data: { id: MSG, created_at: '2026-11-02T10:00:00Z', read_by_client_at: null, read_by_staff_at: null, ...row },
          error: null,
        }),
      }),
      then: (ok: (v: unknown) => unknown) => Promise.resolve({ error: null }).then(ok),
    };
    return ins;
  });
  c.then = (ok: (v: unknown) => unknown) => Promise.resolve({ data: [], error: null }).then(ok);
  return c;
}
const adminClient = { from: vi.fn((t: string) => chain(t)), rpc: vi.fn(), auth: { admin: { getUserById: vi.fn() } } };

const { getUser } = vi.hoisted(() => ({ getUser: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn(async () => ({ auth: { getUser } })) }));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn(() => adminClient) }));

const { requirePermission, requireCollaboratorForOrder } = vi.hoisted(() => ({
  requirePermission: vi.fn(),
  requireCollaboratorForOrder: vi.fn(),
}));
vi.mock('@/lib/admin/permissions', () => ({ requirePermission, requireCollaboratorForOrder }));
const { resolveCollaboratorContext } = vi.hoisted(() => ({ resolveCollaboratorContext: vi.fn() }));
vi.mock('@/lib/admin/collaborator-context', () => ({ resolveCollaboratorContext }));

const { getUploadUrl, getDownloadUrl, getFileInfo } = vi.hoisted(() => ({
  getUploadUrl: vi.fn(),
  getDownloadUrl: vi.fn(),
  getFileInfo: vi.fn(),
}));
vi.mock('@/lib/aws/s3', async (orig) => ({
  ...(await orig<typeof import('@/lib/aws/s3')>()),
  getUploadUrl,
  getDownloadUrl,
  getFileInfo,
}));

const { sendEmail } = vi.hoisted(() => ({ sendEmail: vi.fn() }));
vi.mock('@/lib/email/resend', () => ({ sendEmail }));

const { verifyOrderClientToken } = vi.hoisted(() => ({ verifyOrderClientToken: vi.fn() }));
vi.mock('@/lib/orders/order-client-token', () => ({ verifyOrderClientToken }));

const { POST: adminPresign } = await import('@/app/api/admin/orders/[id]/messages/files/route');
const { POST: collabPresign } = await import('@/app/api/collaborator/orders/[id]/messages/files/route');
const { POST: adminPost } = await import('@/app/api/admin/orders/[id]/messages/route');
const { GET: clientFile } = await import('@/app/api/orders/[id]/messages/file/route');

const params = { params: Promise.resolve({ id: ORDER }) };
// The admin route's inferred return type includes `undefined` (its auth helper
// returns the thrown Response); at runtime it always answers.
const postAdmin = async (req: NextRequest, p: typeof params): Promise<Response> => (await adminPost(req, p))!;
const forbidden = () => new Response(JSON.stringify({ error: 'forbidden' }), { status: 403 });

function postReq(path: string, body: unknown): NextRequest {
  return new NextRequest(`http://localhost:3000${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  tables = {};
  inserts.length = 0;
  for (const f of [getUser, requirePermission, requireCollaboratorForOrder, resolveCollaboratorContext, getUploadUrl, getDownloadUrl, getFileInfo, sendEmail, verifyOrderClientToken]) {
    f.mockReset();
  }
  getUser.mockResolvedValue({ data: { user: { id: 'staff-1' } }, error: null });
  requirePermission.mockResolvedValue(undefined);
  requireCollaboratorForOrder.mockResolvedValue(undefined);
  resolveCollaboratorContext.mockResolvedValue({ collaboratorId: 'collab-1', preview: false });
  getUploadUrl.mockImplementation(async (key: string) => ({ key, url: `https://s3.test/${key}?sig=1`, bucket: 'b' }));
  getDownloadUrl.mockResolvedValue('https://s3.test/download?sig=1');
  getFileInfo.mockResolvedValue({ key: 'k', size: 2048, lastModified: new Date() });
  sendEmail.mockResolvedValue({ skipped: false });
  verifyOrderClientToken.mockReturnValue(false);
});

// ── Presign ───────────────────────────────────────────────────────────────

describe('POST /api/admin/orders/[id]/messages/files', () => {
  const path = `/api/admin/orders/${ORDER}/messages/files`;
  const ok = { contentType: 'application/pdf', fileSize: 5000, filename: 'extras.pdf' };

  it('401 without a session', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });
    expect((await adminPresign(postReq(path, ok), params)).status).toBe(401);
  });

  it('requires orders.manage', async () => {
    requirePermission.mockRejectedValue(forbidden());
    expect((await adminPresign(postReq(path, ok), params)).status).toBe(403);
    expect(requirePermission).toHaveBeenCalledWith('staff-1', 'orders.manage');
  });

  it('rejects a disallowed type', async () => {
    tables.orders = { single: { id: ORDER } };
    const res = await adminPresign(postReq(path, { ...ok, contentType: 'text/html' }), params);
    expect(res.status).toBe(400);
    expect(getUploadUrl).not.toHaveBeenCalled();
  });

  it('rejects files over 10 MB and empty files', async () => {
    tables.orders = { single: { id: ORDER } };
    expect((await adminPresign(postReq(path, { ...ok, fileSize: 10 * 1024 * 1024 + 1 }), params)).status).toBe(400);
    expect((await adminPresign(postReq(path, { ...ok, fileSize: 0 }), params)).status).toBe(400);
  });

  it('404 for an unknown order', async () => {
    expect((await adminPresign(postReq(path, ok), params)).status).toBe(404);
  });

  it('presigns into the order staff folder', async () => {
    tables.orders = { single: { id: ORDER } };
    const res = await adminPresign(postReq(path, ok), params);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.key.startsWith(`orders/${ORDER}/mesaje-echipa/`)).toBe(true);
    expect(json.data.key.endsWith('.pdf')).toBe(true);
    expect(json.data.uploadUrl).toContain('https://s3.test/');
  });
});

describe('POST /api/collaborator/orders/[id]/messages/files', () => {
  const path = `/api/collaborator/orders/${ORDER}/messages/files`;
  const ok = { contentType: 'image/jpeg', fileSize: 5000 };

  it('only for an order of the collaborator', async () => {
    requireCollaboratorForOrder.mockRejectedValue(forbidden());
    expect((await collabPresign(postReq(path, ok), params)).status).toBe(403);
  });

  it('admin preview is read-only', async () => {
    resolveCollaboratorContext.mockResolvedValue({ collaboratorId: 'collab-1', preview: true });
    expect((await collabPresign(postReq(path, ok), params)).status).toBe(403);
    expect(getUploadUrl).not.toHaveBeenCalled();
  });

  it('presigns for the topograph', async () => {
    tables.orders = { single: { id: ORDER } };
    expect((await collabPresign(postReq(path, ok), params)).status).toBe(200);
  });
});

// ── Admin posts a message with files ──────────────────────────────────────

describe('POST /api/admin/orders/[id]/messages with attachments', () => {
  const path = `/api/admin/orders/${ORDER}/messages`;

  beforeEach(() => {
    tables.profiles = { single: { first_name: 'Ana', last_name: 'Test', email: 'ana@example.test' } };
    tables.orders = {
      single: {
        id: ORDER,
        friendly_order_id: 'E-TEST-1',
        status: 'processing',
        platform: 'eghiseul',
        customer_data: { contact: { email: 'client@example.test' } },
        services: { name: 'Extras CF', slug: 'extras-carte-funciara' },
      },
    };
  });

  const messageInsert = () => inserts.find((i) => i.table === 'order_messages')?.row;

  it('stores the files with the real S3 size and tells the client in the email', async () => {
    getFileInfo.mockResolvedValue({ key: staffKey(1), size: 4321, lastModified: new Date() });
    const res = await postAdmin(postReq(path, { body: 'Extrasul nu poate fi folosit.', attachments: [staffFile(1)] }), params);
    expect(res.status).toBe(200);
    const row = messageInsert();
    expect(row?.attachments).toEqual([expect.objectContaining({ key: staffKey(1), size: 4321 })]);
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail.mock.calls[0][0].text).toContain('un fișier atașat');
  });

  it('files alone are enough: a neutral text is stored', async () => {
    const res = await postAdmin(postReq(path, { body: '  ', attachments: [staffFile(1), staffFile(2)] }), params);
    expect(res.status).toBe(200);
    expect(messageInsert()?.body).toMatch(/2 documente/);
  });

  it('empty text and no files is still rejected', async () => {
    expect((await postAdmin(postReq(path, { body: '' }), params)).status).toBe(400);
  });

  it('rejects more than 5 files', async () => {
    const files = Array.from({ length: 6 }, (_, i) => staffFile(i));
    expect((await postAdmin(postReq(path, { body: 'x', attachments: files }), params)).status).toBe(400);
    expect(messageInsert()).toBeUndefined();
  });

  it('rejects a key outside the order staff folder', async () => {
    const res = await postAdmin(
      postReq(path, { body: 'x', attachments: [{ ...staffFile(), key: `orders/${ORDER}/acte-client/1.pdf` }] }),
      params
    );
    expect(res.status).toBe(400);
    expect(messageInsert()).toBeUndefined();
  });

  it('rejects a file that never reached S3', async () => {
    getFileInfo.mockRejectedValue(new Error('NotFound'));
    expect((await postAdmin(postReq(path, { body: 'x', attachments: [staffFile()] }), params)).status).toBe(400);
    expect(messageInsert()).toBeUndefined();
  });

  it('rejects a file bigger than 10 MB on S3 (presigned PUT does not cap size)', async () => {
    getFileInfo.mockResolvedValue({ key: staffKey(), size: 11 * 1024 * 1024, lastModified: new Date() });
    expect((await postAdmin(postReq(path, { body: 'x', attachments: [staffFile()] }), params)).status).toBe(400);
  });

  it('requires orders.manage', async () => {
    requirePermission.mockRejectedValue(forbidden());
    expect((await postAdmin(postReq(path, { body: 'x', attachments: [staffFile()] }), params)).status).toBe(403);
  });
});

// ── Client downloads a file from the thread ───────────────────────────────

describe('GET /api/orders/[id]/messages/file', () => {
  const url = (q: string) => new NextRequest(`http://localhost:3000/api/orders/${ORDER}/messages/file?${q}`);

  beforeEach(() => {
    tables.orders = { single: { id: ORDER, user_id: 'owner-1', platform: 'eghiseul', customer_data: {} } };
    tables.order_messages = { single: { id: MSG, attachments: [staffFile(1)] } };
    getUser.mockResolvedValue({ data: { user: null }, error: null });
  });

  it('400 on malformed parameters', async () => {
    expect((await clientFile(url(`m=nope&i=0`), params)).status).toBe(400);
    expect((await clientFile(url(`m=${MSG}&i=-1`), params)).status).toBe(400);
  });

  it('403 without token or owner session', async () => {
    expect((await clientFile(url(`m=${MSG}&i=0`), params)).status).toBe(403);
    expect(getDownloadUrl).not.toHaveBeenCalled();
  });

  it('403 for a logged-in user who does not own the order', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'someone-else' } }, error: null });
    expect((await clientFile(url(`m=${MSG}&i=0`), params)).status).toBe(403);
  });

  it('redirects to a short-lived URL with a valid token', async () => {
    verifyOrderClientToken.mockReturnValue(true);
    const res = await clientFile(url(`m=${MSG}&i=0&token=t`), params);
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('https://s3.test/download?sig=1');
    expect(getDownloadUrl).toHaveBeenCalledWith(staffKey(1), 300);
  });

  it('works for the owner session', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'owner-1' } }, error: null });
    expect((await clientFile(url(`m=${MSG}&i=0`), params)).status).toBe(302);
  });

  it('404 when the index or message does not exist', async () => {
    verifyOrderClientToken.mockReturnValue(true);
    expect((await clientFile(url(`m=${MSG}&i=3&token=t`), params)).status).toBe(404);
    tables.order_messages = { single: null };
    expect((await clientFile(url(`m=${MSG}&i=0&token=t`), params)).status).toBe(404);
  });

  it('never presigns a stored key outside this order', async () => {
    verifyOrderClientToken.mockReturnValue(true);
    tables.order_messages = {
      single: { id: MSG, attachments: [{ ...staffFile(), key: 'orders/99999999-2222-3333-4444-555555555555/mesaje-echipa/1.pdf' }] },
    };
    expect((await clientFile(url(`m=${MSG}&i=0&token=t`), params)).status).toBe(404);
    expect(getDownloadUrl).not.toHaveBeenCalled();
  });
});
