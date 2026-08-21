import { describe, it, expect } from 'vitest';
import { taxaEliberare } from '@/lib/ancpi/taxe-eliberare';

describe('taxaEliberare', () => {
  it('urmează tarifele oficiale ANCPI (Ordin 16/2019)', () => {
    expect(taxaEliberare('extras-carte-funciara')).toBe(20); // cod 2.7.6
    expect(taxaEliberare('extras-plan-cadastral')).toBe(15); // cod 2.7.7
  });

  it('nu inventează o taxă pentru serviciile unde nu plătim una fixă', () => {
    expect(taxaEliberare('identificare-imobil')).toBeNull();
    expect(taxaEliberare('cazier-judiciar-persoana-fizica')).toBeNull();
    expect(taxaEliberare(null)).toBeNull();
    expect(taxaEliberare(undefined)).toBeNull();
  });
});
