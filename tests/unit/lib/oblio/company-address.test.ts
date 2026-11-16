import { describe, expect, it } from 'vitest';
import { parseCompanyAddress } from '@/lib/oblio/address';
import { buildOblioClient } from '@/lib/oblio/invoice';

describe('parseCompanyAddress (adresa ANAF pe un rând)', () => {
  it('reads county and village from a rural address', () => {
    expect(parseCompanyAddress('JUD. SATU MARE, SAT ODOREU COM. ODOREU, STR. SALCÂMILOR, NR.2')).toEqual({
      county: 'Satu Mare',
      city: 'Odoreu',
    });
  });

  it('reads a municipality and a town', () => {
    expect(parseCompanyAddress('JUD. CLUJ, MUN. CLUJ-NAPOCA, STR. MEMORANDUMULUI, NR.10')).toEqual({
      county: 'Cluj',
      city: 'Cluj-Napoca',
    });
    expect(parseCompanyAddress('JUD. ILFOV, ORŞ. VOLUNTARI, BD. PIPERA, NR.1')).toEqual({ county: 'Ilfov', city: 'Voluntari' });
    expect(parseCompanyAddress('JUDEŢUL TIMIŞ, MUNICIPIUL TIMIŞOARA, STR. X, NR.3').county).toBe('Timiș');
  });

  it('turns a Bucharest address into county București + Sector N', () => {
    expect(parseCompanyAddress('MUNICIPIUL BUCUREŞTI, SECTOR 3, STR. LIPSCANI, NR.5')).toEqual({
      county: 'București',
      city: 'Sector 3',
    });
  });

  it('does not guess when the text names no county', () => {
    expect(parseCompanyAddress('Str. Exemplu Nr. 10')).toEqual({ county: '', city: '' });
    expect(parseCompanyAddress('')).toEqual({ county: '', city: '' });
  });
});

describe('factura pe firmă: județ și localitate', () => {
  const billing = {
    cui: '47872731',
    type: 'persoana_juridica',
    source: 'company',
    companyName: 'NETHUT DIGITAL S.R.L.',
    companyAddress: 'JUD. SATU MARE, SAT ODOREU COM. ODOREU, STR. SALCÂMILOR, NR.2',
  };

  it('sends the county and locality read from the firm address', () => {
    const c = buildOblioClient({ billing, company: { cui: '47872731' } });
    expect(c.state).toBe('Satu Mare');
    expect(c.city).toBe('Odoreu');
    expect(c.address).toContain('SALCÂMILOR');
  });

  it("never puts the buyer's own county on the firm's invoice", () => {
    const c = buildOblioClient({
      billing,
      company: { cui: '47872731' },
      personal: { firstName: 'Ion', lastName: 'Pop', address: { street: 'Str. A 1', city: 'Iași', county: 'Iași' } },
    });
    expect(c.state).toBe('Satu Mare');
    expect(c.city).toBe('Odoreu');
  });

  it('keeps a county the wizard did store', () => {
    const c = buildOblioClient({ billing: { ...billing, county: 'Bihor', city: 'Oradea' }, company: { cui: '47872731' } });
    expect(c.state).toBe('Bihor');
    expect(c.city).toBe('Oradea');
  });
});
