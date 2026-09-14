import { describe, it, expect } from 'vitest';
import {
  hasProgressBeyondContact,
  isForeignPhone,
  dataDepthScore,
  hasIdentifiableName,
} from '@/lib/orders/abandoned-progress';

describe('hasProgressBeyondContact', () => {
  it('returns false for contact-only draft', () => {
    expect(hasProgressBeyondContact({ contact: { email: 'a@b.com' } })).toBe(false);
  });

  it('returns false for contact + billing scaffolding only', () => {
    expect(
      hasProgressBeyondContact({
        contact: { email: 'a@b.com' },
        billing: { type: 'individual' },
      })
    ).toBe(false);
  });

  it('ignores empty-string scaffolding in other sections', () => {
    expect(
      hasProgressBeyondContact({
        contact: { email: 'a@b.com' },
        vehicle: { plateNumber: '' },
      })
    ).toBe(false);
  });

  it('returns true when another section has a real value', () => {
    expect(
      hasProgressBeyondContact({
        contact: { email: 'a@b.com' },
        property: { county: 'Prahova' },
      })
    ).toBe(true);
  });

  it('returns false for null/non-object input', () => {
    expect(hasProgressBeyondContact(null)).toBe(false);
    expect(hasProgressBeyondContact(undefined)).toBe(false);
    expect(hasProgressBeyondContact('x')).toBe(false);
  });
});

describe('isForeignPhone', () => {
  it('treats standard Romanian mobile numbers as local', () => {
    expect(isForeignPhone('0722334455')).toBe(false);
    expect(isForeignPhone('+40722334455')).toBe(false);
    expect(isForeignPhone('40722334455')).toBe(false);
    expect(isForeignPhone('0722 334 455')).toBe(false);
  });

  it('treats other formats as foreign', () => {
    expect(isForeignPhone('+34612345678')).toBe(true); // Spain
    expect(isForeignPhone('+447911123456')).toBe(true); // UK
    expect(isForeignPhone('0212345678')).toBe(true); // RO landline, not mobile
  });

  it('returns false for missing phone', () => {
    expect(isForeignPhone(null)).toBe(false);
    expect(isForeignPhone(undefined)).toBe(false);
    expect(isForeignPhone('')).toBe(false);
  });
});

describe('dataDepthScore', () => {
  it('ignores contact and billing sections', () => {
    expect(
      dataDepthScore({ contact: { email: 'a@b.com', phone: '0722' }, billing: { type: 'individual' } })
    ).toBe(0);
  });

  it('counts meaningful leaf values across other sections', () => {
    expect(
      dataDepthScore({
        contact: { email: 'a@b.com' },
        personal: { firstName: 'Ion', cnp: '1234567890123' },
        property: { county: 'Prahova' },
      })
    ).toBe(3);
  });

  it('does not count empty-string scaffolding', () => {
    expect(dataDepthScore({ vehicle: { plateNumber: '', vin: '' } })).toBe(0);
  });

  it('returns 0 for null/non-object input', () => {
    expect(dataDepthScore(null)).toBe(0);
  });
});

describe('hasIdentifiableName', () => {
  it('finds name in personal section first', () => {
    expect(hasIdentifiableName({ personal: { firstName: 'Ion' }, contact: {} })).toBe(true);
  });

  it('falls back to contact section', () => {
    expect(hasIdentifiableName({ contact: { firstName: 'Ion' } })).toBe(true);
  });

  it('returns false when no name anywhere', () => {
    expect(hasIdentifiableName({ contact: { email: 'a@b.com', phone: '0722' } })).toBe(false);
  });

  it('returns false for null input', () => {
    expect(hasIdentifiableName(null)).toBe(false);
  });
});
