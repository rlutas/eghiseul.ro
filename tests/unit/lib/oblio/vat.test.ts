import { describe, it, expect } from 'vitest';
import { assertVatOnAllLines, RO_VAT_NAME, RO_VAT_RATE } from '@/lib/oblio/vat';

describe('assertVatOnAllLines — firma e plătitoare de TVA, nimic nu iese fără 21%', () => {
  const ok = (name: string) => ({
    name,
    vatName: RO_VAT_NAME,
    vatPercentage: RO_VAT_RATE,
  });

  it('lets a fully taxed document through', () => {
    expect(() =>
      assertVatOnAllLines(
        [ok('Cazier Judiciar'), ok('Onorariu Avocat'), ok('Livrare: Fan Courier')],
        'test'
      )
    ).not.toThrow();
  });

  it('accepts an empty line list (nothing to tax)', () => {
    expect(() => assertVatOnAllLines([], 'test')).not.toThrow();
  });

  it('refuses a line the nomenclature turned into „Scutita" — the June/July 2026 bug', () => {
    expect(() =>
      assertVatOnAllLines(
        [ok('Cazier Judiciar'), { name: 'Onorariu Avocat', vatName: 'Scutita', vatPercentage: 0 }],
        'createInvoice'
      )
    ).toThrow(/Onorariu Avocat[\s\S]*Scutita 0%/);
  });

  it('refuses a line with the right percentage but no vatName', () => {
    // vatName is what actually stops the nomenclature from overriding the rate,
    // so a line without it is not safe even at 21%.
    expect(() =>
      assertVatOnAllLines([{ name: 'Traducere', vatPercentage: 21 }], 'createInvoice')
    ).toThrow(/fără vatName/);
  });

  it('refuses the old 19% rate', () => {
    expect(() =>
      assertVatOnAllLines([{ name: 'Serviciu', vatName: 'Veche', vatPercentage: 19 }], 'createInvoice')
    ).toThrow(/Veche 19%/);
  });

  it('names the calling context so the log says which document failed', () => {
    expect(() =>
      assertVatOnAllLines([{ name: 'X', vatName: 'Scutita', vatPercentage: 0 }], 'createProformaForExtra')
    ).toThrow(/^createProformaForExtra:/);
  });
});
