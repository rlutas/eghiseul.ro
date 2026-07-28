/**
 * Normalizarea adresei clientului pentru e-Factura (SPV).
 * Cazurile vin din facturile blocate real (raport echipă 27.07.2026).
 */
import { describe, it, expect } from 'vitest';
import {
  canonicalCounty,
  isBucharestCounty,
  extractSector,
  formatSector,
  hasBucharestSector,
  countryForOblio,
  isForeignCountry,
  resolveInvoiceAddress,
} from '@/lib/oblio/address';

describe('canonicalCounty', () => {
  it.each([
    ['Cluj', 'Cluj'],
    ['cluj', 'Cluj'],
    ['CLUJ', 'Cluj'],
    ['Jud. Cluj', 'Cluj'],
    ['Timis', 'Timiș'],
    ['Timiş', 'Timiș'], // cedilla legacy (ANAF)
    ['Constanta', 'Constanța'],
    ['satu mare', 'Satu Mare'],
    ['Bistrita-Nasaud', 'Bistrița-Năsăud'],
  ])('„%s" → %s', (input, expected) => {
    expect(canonicalCounty(input)).toBe(expected);
  });

  it.each(['Bucuresti', 'BUCUREȘTI', 'Municipiul Bucuresti', 'București Sector 3', 'B', 'Sectorul 5'])(
    'orice formă de București („%s") → București',
    (input) => {
      expect(canonicalCounty(input)).toBe('București');
      expect(isBucharestCounty(input)).toBe(true);
    }
  );

  it.each(['', '   ', 'Berkshire', 'Lombardia', 'judetul inexistent'])(
    'null pentru „%s" (nu e județ din RO)',
    (input) => {
      expect(canonicalCounty(input)).toBeNull();
    }
  );
});

describe('sector', () => {
  it.each([
    ['Sector 3', 3],
    ['Sectorul 3', 3],
    ['sector3', 3],
    ['București, Sector 5', 5],
    ['Bucuresti/sector 4', 4],
    ['sec 2', 2],
  ])('extrage sectorul din „%s"', (input, nr) => {
    expect(extractSector(input)).toBe(nr);
    expect(formatSector(input)).toBe(`Sector ${nr}`);
  });

  it('null când nu există sector', () => {
    expect(extractSector('București')).toBeNull();
    expect(formatSector('Cluj-Napoca')).toBeNull();
    expect(extractSector('Sector 7')).toBeNull(); // sectoarele sunt 1..6
  });

  it('hasBucharestSector cere exact forma acceptată de SPV', () => {
    expect(hasBucharestSector('Sector 4')).toBe(true);
    expect(hasBucharestSector('Sectorul 4')).toBe(false);
    expect(hasBucharestSector('București')).toBe(false);
  });
});

describe('countryForOblio', () => {
  it.each([
    ['', 'Romania'],
    ['România', 'Romania'],
    ['Romania', 'Romania'],
    ['Franța', 'Franta'],
    ['Elveția', 'Elvetia'],
    ['Germania', 'Germania'],
    ['Italia', 'Italia'],
    // Oblio nu are „Marea Britanie" în listă → factura EGH-0172 a rămas fără țară
    ['Marea Britanie', 'Regatul Unit (UK)'],
    ['Anglia', 'Regatul Unit (UK)'],
    ['Țările de Jos', 'Olanda'],
    ['Republica Moldova', 'Moldova'],
  ])('„%s" → „%s"', (input, expected) => {
    expect(countryForOblio(input)).toBe(expected);
  });

  it('nu trimite coduri ISO — Oblio le refuză la e-Factura', () => {
    expect(countryForOblio('Germania')).not.toBe('DE');
    expect(countryForOblio('Franța')).not.toBe('FR');
  });

  it('isForeignCountry tratează golul ca România', () => {
    expect(isForeignCountry('')).toBe(false);
    expect(isForeignCountry('România')).toBe(false);
    expect(isForeignCountry('Italia')).toBe(true);
  });
});

describe('resolveInvoiceAddress', () => {
  it('București: localitatea devine „Sector N"', () => {
    const r = resolveInvoiceAddress(
      { street: 'Str. Lujerului 2', city: 'Sectorul 5', county: 'Bucuresti' },
      null
    );
    expect(r.state).toBe('București');
    expect(r.city).toBe('Sector 5');
    expect(r.country).toBe('Romania');
  });

  it('București fără sector identificabil → localitate goală (guard-ul o cere)', () => {
    const r = resolveInvoiceAddress(
      { street: 'Str. X 1', city: 'București', county: 'București' },
      null
    );
    expect(r.state).toBe('București');
    expect(r.city).toBe('');
  });

  // EGH-0048: județ din billing + localitate din KYC = adresă inexistentă.
  it('NU amestecă blocurile: billing incomplet + KYC complet → tot blocul KYC', () => {
    const r = resolveInvoiceAddress(
      { street: 'LUJERULUI NR. 2', city: '', county: 'București' },
      { street: 'Salciei', number: '59', city: 'Ditrau', county: 'Harghita' }
    );
    expect(r.state).toBe('Harghita');
    expect(r.city).toBe('Ditrau');
    expect(r.address).toBe('Salciei 59');
    expect(r.usedFallback).toBe(true);
  });

  // EGH-0078/0095/0152: județ în facturare, localitate doar în KYC, județele
  // NU se contrazic → completarea e sigură și trebuie făcută (altfel factura
  // pleacă fără localitate, adică tot blocată în SPV).
  it('completează câmp-cu-câmp când blocurile nu se contrazic', () => {
    const r = resolveInvoiceAddress(
      { street: 'Str. A 1', city: '', county: 'Constanța' },
      { city: 'Constanţa', county: '' } // cedilla legacy, fără județ
    );
    expect(r.state).toBe('Constanța');
    expect(r.city).toBe('Constanţa');
  });

  it('completează sectorul din KYC când județul de facturare e București', () => {
    const r = resolveInvoiceAddress(
      { street: 'Bd. X 1', city: '', county: 'București' },
      { city: 'București, Sector 5' }
    );
    expect(r.state).toBe('București');
    expect(r.city).toBe('Sector 5');
  });

  it('blocuri contradictorii, dar niciunul complet → rămâne pe facturare', () => {
    const r = resolveInvoiceAddress(
      { street: 'Str. A 1', city: '', county: 'București' },
      { city: 'Ditrau', county: 'Harghita' } // fără stradă → incomplet
    );
    expect(r.state).toBe('București');
    expect(r.city).toBe(''); // NU împrumută „Ditrau"
    expect(r.address).toBe('Str. A 1');
  });

  it('billing complet câștigă peste KYC', () => {
    const r = resolveInvoiceAddress(
      { street: 'Str. A 1', city: 'Sibiu', county: 'Sibiu' },
      { street: 'Str. B 2', city: 'Ditrau', county: 'Harghita' }
    );
    expect(r.city).toBe('Sibiu');
    expect(r.state).toBe('Sibiu');
    expect(r.usedFallback).toBe(false);
  });

  it('client străin: județ „-" când lipsește, țara din lista Oblio', () => {
    const r = resolveInvoiceAddress(
      { street: '12 Clifton Road', city: 'Slough', county: '', country: 'Marea Britanie' },
      null
    );
    expect(r.country).toBe('Regatul Unit (UK)');
    expect(r.city).toBe('Slough');
    expect(r.state).toBe('-');
  });

  it('client străin păstrează regiunea când e completată', () => {
    const r = resolveInvoiceAddress(
      { street: 'Via Roma 1', city: 'Stezzano', county: 'Lombardia', country: 'Italia' },
      null
    );
    expect(r.state).toBe('Lombardia');
    expect(r.country).toBe('Italia');
  });

  it('sectorul din adresa KYC (câmp separat) ajunge în localitate', () => {
    const r = resolveInvoiceAddress(null, {
      street: 'Bd. Unirii 1',
      city: 'București',
      county: 'București',
      sector: 2,
    });
    expect(r.city).toBe('Sector 2');
  });

  it('fără nicio adresă → câmpuri goale, fără excepție', () => {
    const r = resolveInvoiceAddress(null, null);
    expect(r).toMatchObject({ address: '', city: '', state: '', country: 'Romania' });
  });
});
