import { describe, expect, it } from 'vitest';
import { extractOrderNumber, platformFromOrderNumber } from '@/lib/accounting/payout-sync';

describe('payout rows: order number and platform from the Stripe description', () => {
  it('reads an ecazier auto order (EAC-) from the description and sends it to the CJO database', () => {
    const nr = extractOrderNumber(null, 'Cazier Auto Online - PF Standard - EAC-20261110-21848');
    expect(nr).toBe('EAC-20261110-21848');
    expect(platformFromOrderNumber(nr)).toBe('cjo');
  });

  it('knows every prefix the sister sites generate', () => {
    for (const p of ['CJO', 'CAO', 'CFO', 'CIC', 'EJC', 'EFC', 'EAC']) {
      const nr = extractOrderNumber(null, `Serviciu - ${p}-20261110-12345`);
      expect(nr, p).toBe(`${p}-20261110-12345`);
      expect(platformFromOrderNumber(nr), p).toBe('cjo');
    }
  });

  it('keeps eghiseul orders on eghiseul and unknown text unmatched', () => {
    expect(platformFromOrderNumber(extractOrderNumber(null, 'Comanda E-261110-QHJVN'))).toBe('eghiseul');
    expect(extractOrderNumber(null, 'Plata fara numar')).toBeNull();
    expect(platformFromOrderNumber(null)).toBe('necunoscut');
  });
});
