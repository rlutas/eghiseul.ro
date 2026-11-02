import { describe, expect, it } from 'vitest';
import {
  MESSAGE_FILES_MAX_COUNT,
  buildStaffMessageFileKey,
  checkStaffAttachments,
  defaultBodyForAttachments,
  isOrderMessageFileKey,
  isStaffMessageFileKey,
  messageFilesEndpoint,
  validateMessageFileUpload,
} from '@/lib/orders/message-files';
import { renderOrderMessageToClientEmail } from '@/lib/email/templates/order-message';

const ORDER = '11111111-2222-3333-4444-555555555555';
const OTHER = '99999999-2222-3333-4444-555555555555';

const staffFile = (n = 1) => ({
  key: `orders/${ORDER}/mesaje-echipa/${n}.pdf`,
  name: `extras-${n}.pdf`,
  mimeType: 'application/pdf',
  size: 1200,
});

describe('staff message files namespace', () => {
  it('builds keys in the order staff folder, separate from client acts', () => {
    const key = buildStaffMessageFileKey(ORDER, 'image/png');
    expect(key.startsWith(`orders/${ORDER}/mesaje-echipa/`)).toBe(true);
    expect(key.endsWith('.png')).toBe(true);
    expect(isStaffMessageFileKey(ORDER, key)).toBe(true);
  });

  it('rejects other orders, traversal, client acts and non-strings', () => {
    expect(isStaffMessageFileKey(ORDER, `orders/${OTHER}/mesaje-echipa/a.pdf`)).toBe(false);
    expect(isStaffMessageFileKey(ORDER, `orders/${ORDER}/mesaje-echipa/../../kyc/x.jpg`)).toBe(false);
    expect(isStaffMessageFileKey(ORDER, `orders/${ORDER}/acte-client/a.jpg`)).toBe(false);
    expect(isStaffMessageFileKey(ORDER, null)).toBe(false);
  });

  it('a message of the order may reference either namespace, never another order', () => {
    expect(isOrderMessageFileKey(ORDER, `orders/${ORDER}/acte-client/a.jpg`)).toBe(true);
    expect(isOrderMessageFileKey(ORDER, `orders/${ORDER}/mesaje-echipa/a.jpg`)).toBe(true);
    expect(isOrderMessageFileKey(ORDER, `orders/${OTHER}/mesaje-echipa/a.jpg`)).toBe(false);
    expect(isOrderMessageFileKey(ORDER, `contracts/${ORDER}/c.pdf`)).toBe(false);
  });
});

describe('validateMessageFileUpload', () => {
  it.each(['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])('accepts %s', (t) => {
    expect(validateMessageFileUpload(t, 2000)).toEqual({ ok: true });
  });

  it.each(['image/gif', 'application/zip', 'text/html', '', undefined])('rejects type %s', (t) => {
    expect(validateMessageFileUpload(t, 2000).ok).toBe(false);
  });

  it('rejects empty, invalid and > 10 MB sizes; accepts exactly 10 MB', () => {
    expect(validateMessageFileUpload('application/pdf', 0).ok).toBe(false);
    expect(validateMessageFileUpload('application/pdf', 'abc').ok).toBe(false);
    expect(validateMessageFileUpload('application/pdf', 10 * 1024 * 1024 + 1).ok).toBe(false);
    expect(validateMessageFileUpload('application/pdf', 10 * 1024 * 1024).ok).toBe(true);
  });
});

describe('checkStaffAttachments', () => {
  it('no list = no files', () => {
    expect(checkStaffAttachments(ORDER, undefined)).toEqual({ ok: true, files: [] });
  });

  it('accepts up to the max', () => {
    const list = Array.from({ length: MESSAGE_FILES_MAX_COUNT }, (_, i) => staffFile(i));
    const res = checkStaffAttachments(ORDER, list);
    expect(res.ok && res.files).toHaveLength(MESSAGE_FILES_MAX_COUNT);
  });

  it('rejects more than the max instead of silently dropping', () => {
    const list = Array.from({ length: MESSAGE_FILES_MAX_COUNT + 1 }, (_, i) => staffFile(i));
    expect(checkStaffAttachments(ORDER, list).ok).toBe(false);
  });

  it('rejects a client key, another order key or a bad type', () => {
    expect(checkStaffAttachments(ORDER, [{ ...staffFile(), key: `orders/${ORDER}/acte-client/1.pdf` }]).ok).toBe(false);
    expect(checkStaffAttachments(ORDER, [{ ...staffFile(), key: `orders/${OTHER}/mesaje-echipa/1.pdf` }]).ok).toBe(false);
    expect(checkStaffAttachments(ORDER, [{ ...staffFile(), mimeType: 'text/html' }]).ok).toBe(false);
    expect(checkStaffAttachments(ORDER, 'nope').ok).toBe(false);
  });
});

describe('labels and endpoints', () => {
  it('default body agrees in number', () => {
    expect(defaultBodyForAttachments(1)).toMatch(/un document/);
    expect(defaultBodyForAttachments(3)).toMatch(/3 documente/);
  });

  it('files endpoint keeps the preview query', () => {
    expect(messageFilesEndpoint('/api/admin/orders/x/messages')).toBe('/api/admin/orders/x/messages/files');
    expect(messageFilesEndpoint('/api/collaborator/orders/x/messages?as=abc')).toBe(
      '/api/collaborator/orders/x/messages/files?as=abc'
    );
  });
});

describe('client email', () => {
  const base = {
    friendlyOrderId: 'E-TEST-1',
    serviceName: 'Extras CF',
    authorLabel: 'Echipa eGhișeul',
    body: 'Extrasul primit nu poate fi folosit.',
    viewUrl: 'https://example.test/comanda/status/?order=E-TEST-1#mesaje',
  };

  it('says how many files are attached and links to the order page', () => {
    const mail = renderOrderMessageToClientEmail({ ...base, attachmentCount: 2 });
    expect(mail.text).toContain('2 fișiere atașate');
    expect(mail.html).toContain('2 fișiere atașate');
    expect(mail.html).toContain(base.viewUrl);
  });

  it('says nothing about files when there are none', () => {
    const mail = renderOrderMessageToClientEmail(base);
    expect(mail.text).not.toContain('atașat');
  });
});
