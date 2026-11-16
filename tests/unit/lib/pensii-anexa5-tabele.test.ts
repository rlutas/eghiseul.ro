import { describe, expect, it } from 'vitest';
import { formatAniLuni, formatLunaAn, iesiriInAn, tabelPeAnNastere, varstaPensionare } from '@/lib/pensii-anexa5';

const ym = (an: number, luna: number) => an * 12 + (luna - 1);

describe('tabele derivate din Anexa 5', () => {
  it('formats ages and months in Romanian', () => {
    expect(formatAniLuni(65, 0)).toBe('65 de ani');
    expect(formatAniLuni(62, 1)).toBe('62 de ani și o lună');
    expect(formatAniLuni(62, 6)).toBe('62 de ani și 6 luni');
    expect(formatLunaAn(ym(1963, 7))).toBe('iulie 1963');
  });

  it('women reaching the standard age in 2026 do so at 62y6m or 62y7m', () => {
    const g = iesiriInAn('f', 2026);
    expect(g.map((x) => x.varsta)).toEqual([750, 751]);
    expect(g[0]).toMatchObject({ nascutDeLa: ym(1963, 7), nascutPanaLa: ym(1963, 11), iesireDeLa: ym(2026, 1), iesirePanaLa: ym(2026, 5) });
    expect(g[1]).toMatchObject({ nascutDeLa: ym(1963, 12), nascutPanaLa: ym(1964, 4), iesireDeLa: ym(2026, 7), iesirePanaLa: ym(2026, 11) });
  });

  it('men reaching the standard age in 2026 were born in 1961 and are 65', () => {
    expect(iesiriInAn('b', 2026)).toEqual([
      { varsta: 780, nascutDeLa: ym(1961, 1), nascutPanaLa: ym(1961, 12), iesireDeLa: ym(2026, 1), iesirePanaLa: ym(2026, 12) },
    ]);
  });

  it('every group agrees with the calculator for each birth month', () => {
    for (const an of [2025, 2026, 2027, 2030, 2035]) {
      for (const g of iesiriInAn('f', an)) {
        for (let m = g.nascutDeLa; m <= g.nascutPanaLa; m++) {
          const v = varstaPensionare('f', Math.floor(m / 12), (m % 12) + 1);
          expect(v.ageY * 12 + v.ageM).toBe(g.varsta);
          expect(Math.floor((m + g.varsta) / 12)).toBe(an);
        }
      }
    }
  });

  it('the per-birth-year table ends the transition in 1970', () => {
    const t = tabelPeAnNastere('f', 1969, 1970);
    expect(t[0]).toMatchObject({ an: 1969, varstaMin: 768, varstaMax: 779 });
    expect(t[1]).toMatchObject({ an: 1970, varstaMin: 780, varstaMax: 780, stagiuMin: 420, iesireDeLa: ym(2035, 1), iesirePanaLa: ym(2035, 12) });
  });
});
