/**
 * Dependency rules for the apostilă/traducere/legalizare extras chain.
 *
 * Chain: traducere → legalizare → apostila_notari
 *   - "legalizare" requires "traducere"
 *   - "apostila_notari" requires "legalizare" (and therefore traducere)
 *   - "apostila_haga" has no prerequisite
 *
 * Enforced in BOTH the primary options section and the bundled
 * (secondary-service) options, so the customer can never select a dependent
 * before its prerequisite.
 */

import { describe, it, expect } from 'vitest';
import {
  isOptionDepBlocked,
  cascadeDropCodes,
} from '@/lib/services/option-dependencies';

describe('isOptionDepBlocked', () => {
  it('blocks legalizare until traducere is selected', () => {
    expect(isOptionDepBlocked('legalizare', new Set())).toBe(true);
    expect(isOptionDepBlocked('legalizare', new Set(['traducere']))).toBe(false);
  });

  it('blocks apostila_notari until BOTH traducere and legalizare are selected', () => {
    expect(isOptionDepBlocked('apostila_notari', new Set())).toBe(true);
    expect(isOptionDepBlocked('apostila_notari', new Set(['traducere']))).toBe(true);
    expect(
      isOptionDepBlocked('apostila_notari', new Set(['traducere', 'legalizare'])),
    ).toBe(false);
  });

  it('never blocks options without a prerequisite', () => {
    expect(isOptionDepBlocked('apostila_haga', new Set())).toBe(false);
    expect(isOptionDepBlocked('traducere', new Set())).toBe(false);
    expect(isOptionDepBlocked('urgenta', new Set())).toBe(false);
  });
});

describe('cascadeDropCodes', () => {
  it('drops legalizare + apostila_notari when traducere is removed', () => {
    expect(cascadeDropCodes('traducere')).toEqual(
      new Set(['traducere', 'legalizare', 'apostila_notari']),
    );
  });

  it('drops apostila_notari when legalizare is removed', () => {
    expect(cascadeDropCodes('legalizare')).toEqual(
      new Set(['legalizare', 'apostila_notari']),
    );
  });

  it('drops only itself for a leaf option', () => {
    expect(cascadeDropCodes('apostila_notari')).toEqual(new Set(['apostila_notari']));
    expect(cascadeDropCodes('apostila_haga')).toEqual(new Set(['apostila_haga']));
  });
});
