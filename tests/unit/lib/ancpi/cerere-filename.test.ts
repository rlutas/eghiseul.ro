import { describe, it, expect } from 'vitest';
import { buildCerereFilename, disambiguateFilenames, normalizeCfForCerere } from '@/lib/ancpi/cerere-filename';

/**
 * The topograph reads the CF number, UAT and county STRAIGHT OFF THE FILENAME —
 * he never opens the cerere. A wrong or mangled name is a wrong filing, so these
 * cases are the contract with him, not cosmetics.
 */
describe('buildCerereFilename', () => {
  it('uses his convention: "cf <nr> - <UAT>-<Judet>.pdf"', () => {
    expect(buildCerereFilename({ carteFunciara: '101010', uat: 'Baile Govora', county: 'Vâlcea' }))
      .toBe('cf 101010 - Baile Govora-Valcea.pdf');
  });

  it('strips diacritics from UAT and county', () => {
    expect(buildCerereFilename({ carteFunciara: '55123', uat: 'Târgu Mureș', county: 'Mureș' }))
      .toBe('cf 55123 - Targu Mures-Mures.pdf');
  });

  it('keeps the electronic identifier suffixes of a unit CF', () => {
    expect(buildCerereFilename({ carteFunciara: '123456-c1-u2', uat: 'Cluj-Napoca', county: 'Cluj' }))
      .toBe('cf 123456-C1-U2 - Cluj-Napoca-Cluj.pdf');
  });

  it('falls back to the cadastral number when there is no CF', () => {
    expect(buildCerereFilename({ cadastral: '4567', uat: 'Odoreu', county: 'Satu Mare' }))
      .toBe('cad 4567 - Odoreu-Satu Mare.pdf');
  });

  it('removes characters that break a filesystem, and flags what it had to change', () => {
    // Slash is illegal in a filename, so the name can no longer be read as the
    // literal CF — he must open this one. The cerere itself keeps "11584/11".
    expect(buildCerereFilename({ carteFunciara: '11584/11', uat: 'Sector 1', county: 'București' }))
      .toBe('verifica cf 11584-11 - Sector 1-Bucuresti.pdf');
  });

  it('collapses whitespace instead of emitting double spaces', () => {
    expect(buildCerereFilename({ carteFunciara: ' 9001 ', uat: '  Baile   Govora ', county: ' Valcea ' }))
      .toBe('cf 9001 - Baile Govora-Valcea.pdf');
  });

  /**
   * Real values from the 109 paid orders waiting on the dead ANCPI portal —
   * clients type the CF freehand, so these ARE the input.
   */
  describe('pe datele reale din comenzile în așteptare', () => {
    it('repară un identificator de unitate scris cu spații', () => {
      expect(buildCerereFilename({ carteFunciara: '431001 C1 U2', uat: 'Timisoara', county: 'Timiș' }))
        .toBe('cf 431001-C1-U2 - Timisoara-Timis.pdf');
    });

    it('taie localitatea lipită după număr', () => {
      expect(buildCerereFilename({ carteFunciara: '41971 Moara', uat: 'Moara', county: 'Suceava' }))
        .toBe('cf 41971 - Moara-Suceava.pdf');
      expect(buildCerereFilename({ carteFunciara: '51482-C1-U8 Sighisoara', uat: 'Sighisoara', county: 'Mureș' }))
        .toBe('cf 51482-C1-U8 - Sighisoara-Mures.pdf');
    });

    it('marchează pentru verificare o carte funciară veche', () => {
      expect(buildCerereFilename({ carteFunciara: '9000/U2', uat: 'Târnaveni', county: 'Mureș' }))
        .toBe('verifica cf 9000-U2 - Tarnaveni-Mures.pdf');
    });

    it('marchează un CF de 1-3 cifre — numărul real e în alt câmp', () => {
      // E-260803-KLJAW: CF "1", cadastral "175587-C1-U9"
      expect(buildCerereFilename({ carteFunciara: '1', cadastral: '175587-C1-U9', uat: 'Brasov', county: 'Brașov' }))
        .toBe('verifica cf 1 - Brasov-Brasov.pdf');
    });

    it('marchează text liber în loc să inventeze un număr', () => {
      expect(buildCerereFilename({ carteFunciara: 'CF vechi 21 FUNDATICA', uat: 'Fundata', county: 'Brașov' }))
        .toBe('verifica cf CF VECHI 21 FUNDATICA - Fundata-Brasov.pdf');
    });
  });

  it('never emits an empty identifier slot', () => {
    expect(buildCerereFilename({ uat: 'Odoreu', county: 'Satu Mare' }))
      .toBe('cerere fara numar - Odoreu-Satu Mare.pdf');
  });
});

describe('disambiguateFilenames', () => {
  it('leaves distinct names untouched', () => {
    expect(disambiguateFilenames([
      { name: 'cf 1001 - A-Cluj.pdf', orderRef: 'E-1' },
      { name: 'cf 1002 - A-Cluj.pdf', orderRef: 'E-2' },
    ])).toEqual(['cf 1001 - A-Cluj.pdf', 'cf 1002 - A-Cluj.pdf']);
  });

  it('appends the order ref when two orders carry the same CF', () => {
    expect(disambiguateFilenames([
      { name: 'cf 1 - A-Cluj.pdf', orderRef: 'E-260821-AAA' },
      { name: 'cf 1 - A-Cluj.pdf', orderRef: 'E-260821-BBB' },
    ])).toEqual([
      'cf 1 - A-Cluj (E-260821-AAA).pdf',
      'cf 1 - A-Cluj (E-260821-BBB).pdf',
    ]);
  });

  it('still separates duplicates coming from the SAME order', () => {
    expect(disambiguateFilenames([
      { name: 'cf 1 - A-Cluj.pdf', orderRef: 'E-1' },
      { name: 'cf 1 - A-Cluj.pdf', orderRef: 'E-1' },
    ])).toEqual([
      'cf 1 - A-Cluj (E-1).pdf',
      'cf 1 - A-Cluj (E-1) 2.pdf',
    ]);
  });
});

describe('normalizeCfForCerere', () => {
  it('nu strică un identificator deja corect', () => {
    expect(normalizeCfForCerere('123456-C1-U2')).toBe('123456-C1-U2');
    expect(normalizeCfForCerere(' 228202-C1-U2')).toBe('228202-C1-U2');
    expect(normalizeCfForCerere('307983')).toBe('307983');
  });

  it('unește segmentele scrise cu spații', () => {
    expect(normalizeCfForCerere('431001 C1 U2')).toBe('431001-C1-U2');
    expect(normalizeCfForCerere('431001 c1')).toBe('431001-C1');
  });

  it('lasă neatins ce nu recunoaște — nu inventăm numere', () => {
    expect(normalizeCfForCerere('9363/N/S')).toBe('9363/N/S');
    expect(normalizeCfForCerere('CF vechi 21 FUNDATICA')).toBe('CF VECHI 21 FUNDATICA');
  });
});
