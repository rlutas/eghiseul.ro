import { describe, it, expect } from 'vitest';
import {
  MOTIV_CAZIER_OPTIONS, MOTIV_CAZIER_FISCAL_OPTIONS, MOTIV_CAZIER_AUTO_OPTIONS, MOTIV_INTEGRITATE_OPTIONS,
  PINNED_MOTIVE, pinnedFirst,
} from '@/config/motiv-options';

describe('pinned purposes', () => {
  it('every pinned value is an exact member of its official list', () => {
    const pairs: Array<[readonly string[], readonly string[]]> = [
      [MOTIV_CAZIER_OPTIONS, PINNED_MOTIVE.cazier],
      [MOTIV_CAZIER_FISCAL_OPTIONS, PINNED_MOTIVE.cazierFiscal],
      [MOTIV_CAZIER_AUTO_OPTIONS, PINNED_MOTIVE.cazierAuto],
      [MOTIV_INTEGRITATE_OPTIONS, PINNED_MOTIVE.integritate],
    ];
    for (const [list, pinned] of pairs) for (const p of pinned) expect(list).toContain(p);
  });

  it('puts the pinned values first and keeps the rest, without duplicates', () => {
    const out = pinnedFirst(MOTIV_CAZIER_OPTIONS, PINNED_MOTIVE.cazier);
    expect(out.slice(0, PINNED_MOTIVE.cazier.length)).toEqual([...PINNED_MOTIVE.cazier]);
    expect(out.length).toBe(MOTIV_CAZIER_OPTIONS.length);
    expect(new Set(out).size).toBe(out.length);
  });
});
