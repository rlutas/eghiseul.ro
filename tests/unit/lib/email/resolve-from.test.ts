import { describe, expect, it } from 'vitest';
import { fallbackFrom, resolveFrom } from '@/lib/email/resend';

/**
 * Resend rejects a `from` on a domain it has not verified (403) and the email
 * is lost. Until documentero.ro is verified, its brand sender must fall back
 * to the default sender instead of failing (19.09.2026, test order
 * E-260919-HJ9X9). Default RESEND_VERIFIED_DOMAINS = eghiseul.ro,documentero.ro.
 */
describe('resolveFrom', () => {
  it('keeps a sender on a verified domain', () => {
    expect(resolveFrom('eGhișeul.ro <contact@eghiseul.ro>')).toBe('eGhișeul.ro <contact@eghiseul.ro>');
  });

  it('keeps the documentero sender (domain verified 20.09.2026)', () => {
    expect(resolveFrom('documentero.ro <contact@documentero.ro>')).toBe('documentero.ro <contact@documentero.ro>');
  });

  it('falls back to the default sender for an unverified domain', () => {
    const from = resolveFrom('Alt brand <contact@alt-brand.ro>');
    expect(from).not.toContain('alt-brand.ro');
    expect(from).toContain('@eghiseul.ro');
  });

  it('keeps the brand name on the default address when falling back (11.11.2026)', () => {
    expect(resolveFrom('cazierfiscal.com <contact@cazierfiscal.com>')).toBe('cazierfiscal.com <contact@eghiseul.ro>');
    expect(fallbackFrom('documentero.ro <contact@documentero.ro>')).toBe('documentero.ro <contact@eghiseul.ro>');
    expect(fallbackFrom('contact@alt.ro')).toContain('@eghiseul.ro');
  });

  it('returns the default sender when nothing is requested', () => {
    expect(resolveFrom(undefined)).toContain('@');
  });
});
