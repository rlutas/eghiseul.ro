import { describe, it, expect } from 'vitest';
import {
  documentValidity,
  validityLabel,
  EXPIRY_WARNING_DAYS,
} from '@/lib/orders/document-validity';
import { DOCUMENT_VALIDITY_DAYS } from '@/lib/lifecycle/rules';

const completed = '2026-03-01T12:00:00Z';

describe('documentValidity', () => {
  it('counts from the order being finished, with the period the law gives', () => {
    // Cazier judiciar: 6 months, Legea 290/2004 art. 27.
    const validity = documentValidity('cazier-judiciar', completed, new Date('2026-03-10T12:00:00Z'));
    expect(validity?.totalDays).toBe(180);
    expect(validity?.date.toISOString().slice(0, 10)).toBe('2026-08-28');
    expect(validity?.state).toBe('valid');
  });

  it('warns inside the last 30 days', () => {
    const validity = documentValidity('cazier-fiscal', completed, new Date('2026-03-25T12:00:00Z'));
    // Cazier fiscal: 30 days, OG 39/2015 art. 11 — so it is already in the
    // warning window the day it is issued.
    expect(validity?.state).toBe('expiring');
    expect(validity?.daysLeft).toBe(6);
  });

  it('says so once it is past', () => {
    const validity = documentValidity('cazier-fiscal', completed, new Date('2026-04-15T12:00:00Z'));
    expect(validity?.state).toBe('expired');
    expect(validity?.daysLeft).toBeLessThan(0);
  });

  it('switches to warning exactly on the boundary', () => {
    const at = new Date(new Date('2026-08-28T12:00:00Z').getTime() - EXPIRY_WARNING_DAYS * 86_400_000);
    expect(documentValidity('cazier-judiciar', completed, at)?.state).toBe('expiring');
    expect(
      documentValidity('cazier-judiciar', completed, new Date(at.getTime() - 86_400_000))?.state
    ).toBe('valid');
  });

  it('says nothing for a document that does not expire', () => {
    // Civil-status certificates have no validity period, and inventing one would
    // push people to reorder something they do not need.
    for (const slug of ['certificat-nastere', 'certificat-casatorie', 'copie-carte-funciara']) {
      expect(documentValidity(slug, completed), slug).toBeNull();
      expect(DOCUMENT_VALIDITY_DAYS[slug]).toBeUndefined();
    }
  });

  it('says nothing without a completion date or a service', () => {
    expect(documentValidity('cazier-judiciar', null)).toBeNull();
    expect(documentValidity(null, completed)).toBeNull();
    expect(documentValidity('cazier-judiciar', 'nu-i o dată')).toBeNull();
  });
});

describe('validityLabel', () => {
  const at = (iso: string) => documentValidity('cazier-judiciar', completed, new Date(iso))!;

  it('always names the date', () => {
    expect(validityLabel(at('2026-03-10T12:00:00Z'))).toBe('Documentul e valabil până pe 28 august 2026');
    expect(validityLabel(at('2026-09-10T12:00:00Z'))).toBe('Documentul a expirat pe 28 august 2026');
  });

  it('counts the last days in words a person uses', () => {
    expect(validityLabel(at('2026-08-28T11:00:00Z'))).toContain('astăzi');
    expect(validityLabel(at('2026-08-27T11:00:00Z'))).toContain('mâine');
    expect(validityLabel(at('2026-08-20T12:00:00Z'))).toContain('în 8 zile');
  });
});
