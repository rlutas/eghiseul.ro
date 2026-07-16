import { describe, it, expect } from 'vitest';
import {
  internationalAddressSchema,
  deriveIntlProvider,
  derivePhysicalRegion,
} from '@/lib/delivery/international-delivery';

describe('internationalAddressSchema', () => {
  const validAddress = {
    street: 'Anger 5',
    city: 'Töpen',
    postalCode: '95183',
    country: 'Germania',
    recipientName: 'Miklos Nyeste',
    recipientPhone: '+4915124406133',
  };

  it('accepts a complete international address', () => {
    expect(internationalAddressSchema.safeParse(validAddress).success).toBe(true);
  });

  it('rejects missing country (order E-260716-RAFUG scenario)', () => {
    const result = internationalAddressSchema.safeParse({ ...validAddress, country: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === 'country')).toBe(true);
    }
  });

  it('rejects missing recipient name and phone', () => {
    const result = internationalAddressSchema.safeParse({
      ...validAddress,
      recipientName: '',
      recipientPhone: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toContain('recipientName');
      expect(paths).toContain('recipientPhone');
    }
  });

  it('accepts 5-digit German postal codes (RO-only 6-digit rule must not apply)', () => {
    expect(
      internationalAddressSchema.safeParse({ ...validAddress, postalCode: '80331' }).success,
    ).toBe(true);
  });

  it('rejects phone with letters', () => {
    expect(
      internationalAddressSchema.safeParse({ ...validAddress, recipientPhone: 'abc12345' }).success,
    ).toBe(false);
  });
});

describe('deriveIntlProvider', () => {
  it('returns provider directly when persisted', () => {
    expect(deriveIntlProvider('posta_intl', null)).toBe('posta_intl');
    expect(deriveIntlProvider('dhl_intl', null)).toBe('dhl_intl');
  });

  it('falls back to method name for old drafts without persisted provider', () => {
    expect(
      deriveIntlProvider(null, 'Livrare internațională · Poșta Română International'),
    ).toBe('posta_intl');
    expect(
      deriveIntlProvider(undefined, 'Livrare internațională · DHL Express International'),
    ).toBe('dhl_intl');
  });

  it('matches unprefixed courier names too', () => {
    expect(deriveIntlProvider(null, 'Poșta Română International')).toBe('posta_intl');
    expect(deriveIntlProvider(null, 'DHL Express International')).toBe('dhl_intl');
  });

  it('returns null for domestic couriers', () => {
    expect(deriveIntlProvider('fancourier', 'Livrare România · Fan Courier - Standard')).toBe(null);
    expect(deriveIntlProvider(null, 'Livrare România · Sameday - EasyBox')).toBe(null);
    expect(deriveIntlProvider(null, null)).toBe(null);
  });
});

describe('derivePhysicalRegion', () => {
  it('returns null for email or no method', () => {
    expect(derivePhysicalRegion('email', null, null)).toBe(null);
    expect(derivePhysicalRegion(null, null, null)).toBe(null);
  });

  it('restores international region for intl drafts (was hardcoded romania)', () => {
    expect(
      derivePhysicalRegion('courier', null, 'Livrare internațională · Poșta Română International'),
    ).toBe('international');
    expect(derivePhysicalRegion('courier', 'dhl_intl', null)).toBe('international');
  });

  it('returns romania for domestic courier drafts', () => {
    expect(
      derivePhysicalRegion('courier', 'fancourier', 'Livrare România · Fan Courier - Standard'),
    ).toBe('romania');
  });
});
