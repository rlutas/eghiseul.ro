import { describe, it, expect } from 'vitest';
import { sanitizeClientErrorPayload, scrubText, sizeBucket } from '@/lib/client-errors/schema';

describe('sanitizeClientErrorPayload', () => {
  it('rejects unknown kinds and non-objects', () => {
    expect(sanitizeClientErrorPayload(null)).toBeNull();
    expect(sanitizeClientErrorPayload([])).toBeNull();
    expect(sanitizeClientErrorPayload({ kind: 'drop_table' })).toBeNull();
  });

  it('keeps allowlisted fields and drops everything else', () => {
    const row = sanitizeClientErrorPayload({
      kind: 'image_decode',
      code: 'DECODE_FAILED',
      message: 'Imaginea nu a putut fi decodificată. Încearcă altă poză.',
      page: '/comanda/cazier-judiciar?resume=secret-token&email=a@b.ro#x',
      step: 'kyc-documents',
      serviceSlug: 'cazier-judiciar',
      orderRef: 'e-261102-abcde',
      cnp: '1740501110012',
      email: 'client@example.com',
      image: 'data:image/jpeg;base64,AAAA',
      meta: { mime: 'image/jpeg', sizeBucket: '1-3MB', fallback: 'original', cnp: '1740501110012', firstName: 'X' },
    })!;
    expect(row).toEqual({
      kind: 'image_decode',
      code: 'DECODE_FAILED',
      message: 'Imaginea nu a putut fi decodificată. Încearcă altă poză.',
      page: '/comanda/cazier-judiciar',
      step: 'kyc-documents',
      service_slug: 'cazier-judiciar',
      order_ref: 'E-261102-ABCDE',
      meta: { mime: 'image/jpeg', sizeBucket: '1-3MB', fallback: 'original' },
    });
    expect(JSON.stringify(row)).not.toMatch(/1740501110012|example\.com|base64/);
  });

  it('scrubs digit runs and emails from the message and truncates to 300', () => {
    const row = sanitizeClientErrorPayload({ kind: 'other', message: `CNP 1740501110012 mail x@y.ro ${'a'.repeat(400)}` })!;
    expect(row.message).not.toMatch(/1740501110012|x@y\.ro/);
    expect(row.message!.length).toBeLessThanOrEqual(300);
  });

  it('rejects identifier fields with odd characters and bogus order refs', () => {
    const row = sanitizeClientErrorPayload({ kind: 'other', code: 'A B<script>', orderRef: 'Ion Popescu', step: 'ok_step' })!;
    expect(row.code).toBeNull();
    expect(row.order_ref).toBeNull();
    expect(row.step).toBe('ok_step');
    expect(sanitizeClientErrorPayload({ kind: 'other', orderRef: 'TEST-NOT-REAL' })!.order_ref).toBe('TEST-NOT-REAL');
  });
});

describe('helpers', () => {
  it('scrubText', () => {
    expect(scrubText('tel 0722 123 456')).toBe('tel [cifre]');
    expect(scrubText('10MB')).toBe('10MB');
  });
  it('sizeBucket', () => {
    expect(sizeBucket(0)).toBe('0');
    expect(sizeBucket(500_000)).toBe('<1MB');
    expect(sizeBucket(2 * 1024 * 1024)).toBe('1-3MB');
    expect(sizeBucket(12 * 1024 * 1024)).toBe('>10MB');
  });
});
