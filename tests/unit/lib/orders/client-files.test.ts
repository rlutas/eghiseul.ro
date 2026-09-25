import { describe, expect, it } from 'vitest';
import {
  buildClientFileKey,
  isClientFileKey,
  sanitizeClientFiles,
  CLIENT_FILES_MAX_COUNT,
} from '@/lib/orders/client-files';

const ORDER = '11111111-2222-3333-4444-555555555555';
const OTHER = '99999999-2222-3333-4444-555555555555';

describe('client files namespace', () => {
  it('builds keys inside the order namespace', () => {
    const key = buildClientFileKey(ORDER, 'image/jpeg');
    expect(key.startsWith(`orders/${ORDER}/acte-client/`)).toBe(true);
    expect(key.endsWith('.jpg')).toBe(true);
    expect(isClientFileKey(ORDER, key)).toBe(true);
  });

  it('rejects keys of another order, traversal and other folders', () => {
    expect(isClientFileKey(ORDER, `orders/${OTHER}/acte-client/a.jpg`)).toBe(false);
    expect(isClientFileKey(ORDER, `orders/${ORDER}/acte-client/../../kyc/x.jpg`)).toBe(false);
    expect(isClientFileKey(ORDER, `kyc/${ORDER}/selfie.jpg`)).toBe(false);
    expect(isClientFileKey(ORDER, `orders/${ORDER}/uploads/contract.pdf`)).toBe(false);
    expect(isClientFileKey(ORDER, 42)).toBe(false);
  });

  it('sanitizes a browser-supplied list', () => {
    const good = { key: `orders/${ORDER}/acte-client/1.pdf`, name: 'titlu.pdf', mimeType: 'application/pdf', size: 1200 };
    const list = [
      good,
      { key: `orders/${OTHER}/acte-client/2.pdf`, name: 'x', mimeType: 'application/pdf', size: 1 },
      { key: `orders/${ORDER}/acte-client/3.exe`, name: 'x', mimeType: 'application/x-msdownload', size: 1 },
      'garbage',
      null,
    ];
    expect(sanitizeClientFiles(ORDER, list)).toEqual([{ ...good, uploadedAt: undefined }]);
    expect(sanitizeClientFiles(ORDER, 'not-a-list')).toEqual([]);
  });

  it('caps the list', () => {
    const many = Array.from({ length: 12 }, (_, i) => ({
      key: `orders/${ORDER}/acte-client/${i}.jpg`,
      name: `${i}.jpg`,
      mimeType: 'image/jpeg',
      size: 10,
    }));
    expect(sanitizeClientFiles(ORDER, many)).toHaveLength(CLIENT_FILES_MAX_COUNT);
  });
});
