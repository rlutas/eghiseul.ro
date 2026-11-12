import { describe, expect, it } from 'vitest';
import { imobileForWork } from '@/lib/ancpi/imobile-for-work';

describe('imobileForWork', () => {
  it('un singur imobil → o singură intrare', () => {
    expect(imobileForWork({ locality: 'Odoreu', carteFunciara: '100123', cadastral: '100123' })).toEqual([
      { nr: 1, locality: 'Odoreu', imobilLocality: undefined, carteFunciara: '100123', cadastral: '100123', topografic: undefined },
    ]);
  });

  it('două CF-uri → CF 1 și CF 2, fiecare cu datele lui', () => {
    const rows = imobileForWork({
      locality: 'Odoreu',
      imobilLocality: 'Odoreu',
      carteFunciara: '100123',
      additionalImobile: [{ locality: 'Păulești', imobilLocality: 'Amați', carteFunciara: '200456', cadastral: '', topografic: '12/3' }],
    });
    expect(rows.map((r) => [r.nr, r.locality, r.imobilLocality, r.carteFunciara, r.topografic])).toEqual([
      [1, 'Odoreu', 'Odoreu', '100123', undefined],
      [2, 'Păulești', 'Amați', '200456', '12/3'],
    ]);
  });

  it('rândul adăugat și lăsat gol nu e imobil; numerotarea rămâne continuă', () => {
    const rows = imobileForWork({
      locality: 'Odoreu',
      carteFunciara: '1',
      additionalImobile: [{ locality: 'Odoreu', carteFunciara: '', cadastral: ' ' }, { carteFunciara: '3' }],
    });
    expect(rows.map((r) => [r.nr, r.carteFunciara])).toEqual([[1, '1'], [2, '3']]);
  });

  it('imobil suplimentar fără UAT propriu ia UAT-ul principal', () => {
    expect(imobileForWork({ locality: 'Odoreu', carteFunciara: '1', additionalImobile: [{ carteFunciara: '2' }] })[1].locality).toBe('Odoreu');
  });

  it('identificare fără CF → imobilul principal rămâne; fără property → gol', () => {
    expect(imobileForWork({ locality: 'Odoreu' })).toHaveLength(1);
    expect(imobileForWork(null)).toEqual([]);
  });
});
