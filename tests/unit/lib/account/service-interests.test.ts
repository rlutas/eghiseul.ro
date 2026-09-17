import { describe, it, expect } from 'vitest';
import {
  INTEREST_GROUPS,
  categoriesForInterests,
  interestConsequence,
  interestsRequireIdentity,
  isInterestId,
  parseInterests,
  sortByInterest,
  type InterestId,
} from '@/lib/account/service-interests';
import catalogue from '../../../fixtures/active-services.json';

/**
 * The question decides whether the account asks for an identity document, so
 * every answer has to match what the services in it actually require. The
 * fixture is a snapshot of the live catalogue: when a service turns
 * `personalKyc` on or off, or a new category appears, these fail instead of the
 * question quietly lying to the customer.
 */
describe('the answers cover the catalogue', () => {
  const services = catalogue.services;

  it('every active category belongs to exactly one answer', () => {
    const categories = [...new Set(services.map((s) => s.category))];
    for (const category of categories) {
      const owners = INTEREST_GROUPS.filter((g) => g.categories.includes(category));
      expect(owners.map((g) => g.id), `category ${category}`).toHaveLength(1);
    }
  });

  it('no answer claims a category that does not exist', () => {
    const categories = new Set(services.map((s) => s.category));
    for (const group of INTEREST_GROUPS) {
      for (const category of group.categories) {
        expect(categories.has(category), `${group.id} → ${category}`).toBe(true);
      }
    }
  });

  it('`expectsIdentity` matches what the services in that answer require', () => {
    for (const group of INTEREST_GROUPS) {
      const inGroup = services.filter((s) => group.categories.includes(s.category));
      expect(inGroup.length, group.id).toBeGreaterThan(0);
      expect(inGroup.some((s) => s.personalKyc), group.id).toBe(group.expectsIdentity);
    }
  });

  it('the split is the one the plan recorded: 11 services ask for an identity document, 20 do not', () => {
    expect(services.filter((s) => s.personalKyc)).toHaveLength(11);
    expect(services.filter((s) => !s.personalKyc)).toHaveLength(20);
  });

  it('a property-only or company-only customer is never asked for an identity document', () => {
    for (const id of ['imobile', 'firma'] as InterestId[]) {
      const group = INTEREST_GROUPS.find((g) => g.id === id)!;
      const inGroup = services.filter((s) => group.categories.includes(s.category));
      expect(inGroup.every((s) => !s.personalKyc), id).toBe(true);
    }
  });
});

describe('interestsRequireIdentity', () => {
  it('distinguishes "no answer" from "answered, and no document needed"', () => {
    // null means we know nothing yet — the caller keeps whatever it did before.
    expect(interestsRequireIdentity(null)).toBeNull();
    expect(interestsRequireIdentity([])).toBeNull();
    expect(interestsRequireIdentity(['imobile'])).toBe(false);
  });

  it('one answer that needs a document is enough', () => {
    expect(interestsRequireIdentity(['imobile', 'caziere'])).toBe(true);
    expect(interestsRequireIdentity(['stare-civila'])).toBe(true);
    expect(interestsRequireIdentity(['imobile', 'firma'])).toBe(false);
  });
});

describe('parseInterests', () => {
  it('drops anything that is not a known answer', () => {
    expect(parseInterests(['imobile', 'inexistent', 42, null])).toEqual(['imobile']);
    expect(parseInterests('imobile')).toEqual([]);
    expect(parseInterests(null)).toEqual([]);
  });

  it('removes duplicates', () => {
    expect(parseInterests(['firma', 'firma'])).toEqual(['firma']);
  });

  it('accepts every id it hands out', () => {
    for (const group of INTEREST_GROUPS) {
      expect(isInterestId(group.id)).toBe(true);
      expect(parseInterests([group.id])).toEqual([group.id]);
    }
  });
});

describe('interestConsequence', () => {
  it('can always name what changes — otherwise the question is not worth asking', () => {
    expect(interestConsequence(['imobile'])).toContain('nu ți-l cerem');
    expect(interestConsequence(['caziere'])).toContain('actul de identitate');
  });

  it('says nothing when the question was skipped', () => {
    expect(interestConsequence([])).toBeNull();
  });
});

describe('categoriesForInterests / sortByInterest', () => {
  it('maps answers back to catalogue categories', () => {
    expect(categoriesForInterests(['caziere'])).toEqual(['juridice', 'fiscale', 'auto']);
    expect(categoriesForInterests(['imobile', 'firma'])).toEqual(['imobiliare', 'comerciale']);
    expect(categoriesForInterests([])).toEqual([]);
  });

  it('brings the chosen categories first and leaves the rest in place', () => {
    const list = [
      { slug: 'extras-carte-funciara', category: 'imobiliare' },
      { slug: 'cazier-judiciar', category: 'juridice' },
      { slug: 'cazier-fiscal', category: 'fiscale' },
    ];
    expect(sortByInterest(list, ['caziere']).map((s) => s.slug)).toEqual([
      'cazier-judiciar',
      'cazier-fiscal',
      'extras-carte-funciara',
    ]);
    expect(sortByInterest(list, []).map((s) => s.slug)).toEqual(list.map((s) => s.slug));
  });
});
