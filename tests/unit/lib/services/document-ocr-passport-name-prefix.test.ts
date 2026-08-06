/**
 * Prefixul MRZ de pașaport lipit de numele de familie („PEROU…").
 *
 * Bug real, raportat de trei ori de echipă înainte să fie prins:
 *   E-260713-NYT6R → lastName "PEROUZAVATE"  (real: ZAVATE)
 *   E-260718-ZZ4C5 → lastName "PEROU MIHAI"  (real: MIHAI)
 *   E-260728-YFHH2 → lastName "PEROUPOPA"    (real: POPA)
 *
 * Linia 1 din MRZ-ul TD3 începe cu `P<ROU`: `P` = tipul actului (pașaport),
 * `ROU` = țara emitentă. Modelul îl citea ca parte din nume și îl scria fără
 * `<` — deci „PEROU". Numele contaminat mergea mai departe în contract,
 * împuternicire și factură.
 *
 * Două apărări, testate aici: recuperarea corectă din MRZ (când avem liniile)
 * și tăierea prefixului direct din nume (când nu le avem).
 */

import { describe, it, expect } from 'vitest';
import {
  recoverNamesFromMrz,
  correctNamesFromMrz,
  stripMrzCountryPrefix,
  type OCRResult,
  applyCiDeterministicCorrections,
  deriveCityFromFullAddress,
  extractDocNumberFromMrz,
  parseGeminiOCRResponse,
} from '@/lib/services/document-ocr';

type PassportResult = OCRResult & {
  extractedData: OCRResult['extractedData'] & {
    mrz?: { line1?: string | null; line2?: string | null; line3?: string | null };
  };
};

describe('recoverNamesFromMrz — TD3 (pașaport)', () => {
  it('sare peste prefixul P<ROU și întoarce numele real', () => {
    const out = recoverNamesFromMrz({
      line1: 'P<ROUPOPA<<ADRIAN<MIHAIL<<<<<<<<<<<<<<<<<<<<',
      line2: '0630797571ROU7909305M3105012179093017318206',
      line3: null,
    });
    expect(out.surname).toBe('POPA');
    expect(out.givenNames).toBe('ADRIAN MIHAIL');
  });

  it('merge și pentru alte țări emitente (P<ITA)', () => {
    const out = recoverNamesFromMrz({
      line1: 'P<ITAROSSI<<MARIO<<<<<<<<<<<<<<<<<<<<<<<<<<<',
      line2: null,
      line3: null,
    });
    expect(out.surname).toBe('ROSSI');
    expect(out.givenNames).toBe('MARIO');
  });

  it('nu strică linia care vine deja fără prefix', () => {
    const out = recoverNamesFromMrz({ line1: 'ZAVATE<<GHEORGHE<<<<<<<<', line2: null, line3: null });
    expect(out.surname).toBe('ZAVATE');
    expect(out.givenNames).toBe('GHEORGHE');
  });

  it('prefixul de CI (IDROU) continuă să funcționeze', () => {
    const out = recoverNamesFromMrz({
      line1: 'IDROUANDREI<<<<EUGEN<<<<<<<<<<<<<<<<<',
      line2: 'NZ261166<4ROU7206018M31080312747856',
      line3: null,
    });
    expect(out.surname).toBe('ANDREI');
    expect(out.givenNames).toBe('EUGEN');
  });
});

describe('stripMrzCountryPrefix — plasa de siguranță, fără MRZ', () => {
  it('cele trei cazuri reale', () => {
    expect(stripMrzCountryPrefix('PEROUPOPA')).toBe('POPA');
    expect(stripMrzCountryPrefix('PEROUZAVATE')).toBe('ZAVATE');
    expect(stripMrzCountryPrefix('PEROU MIHAI')).toBe('MIHAI');
  });

  it('prinde și variantele cu „<" păstrat sau fără E', () => {
    expect(stripMrzCountryPrefix('P<ROUPOPA')).toBe('POPA');
    expect(stripMrzCountryPrefix('PROUPOPA')).toBe('POPA');
    expect(stripMrzCountryPrefix('IDROUANDREI')).toBe('ANDREI');
  });

  it('NU atinge numele reale care încep cu litere asemănătoare', () => {
    // „Roua" e nume real — nu tăiem un „ROU" care nu vine după tipul actului.
    expect(stripMrzCountryPrefix('ROUA')).toBe('ROUA');
    expect(stripMrzCountryPrefix('POPESCU')).toBe('POPESCU');
    expect(stripMrzCountryPrefix('PERUZZI')).toBe('PERUZZI');
    expect(stripMrzCountryPrefix('IDRICEANU')).toBe('IDRICEANU');
  });

  it('dacă după prefix n-ar rămâne un nume, lasă valoarea neatinsă', () => {
    // Mai bine un câmp ciudat, pe care operatorul îl vede și îl corectează,
    // decât unul gol care pierde informația.
    expect(stripMrzCountryPrefix('PEROU')).toBe('PEROU');
  });
});

describe('correctNamesFromMrz — end-to-end pe rezultatul OCR', () => {
  const build = (lastName: string, firstName: string, line1: string): PassportResult => ({
    success: true,
    documentType: 'passport',
    confidence: 95,
    extractedData: { documentType: 'passport', lastName, firstName, mrz: { line1, line2: null, line3: null } },
    issues: [],
    suggestions: [],
  });

  it('rescrie numele contaminat folosind MRZ-ul (cazul E-260728-YFHH2)', () => {
    const out = correctNamesFromMrz(
      build('PEROUPOPA', 'ADRIAN MIHAIL', 'P<ROUPOPA<<ADRIAN<MIHAIL<<<<<<<<<<<<')
    );
    expect(out.extractedData.lastName).toBe('POPA');
    expect(out.extractedData.firstName).toBe('ADRIAN MIHAIL');
    expect(out.issues?.some((i) => /mrz/i.test(i))).toBe(true);
  });

  it('nu schimbă nimic dacă extragerea vizuală era deja corectă', () => {
    const out = correctNamesFromMrz(build('POPA', 'ADRIAN MIHAIL', 'P<ROUPOPA<<ADRIAN<MIHAIL<<<<'));
    expect(out.extractedData.lastName).toBe('POPA');
    expect(out.issues ?? []).toHaveLength(0);
  });
});

describe('recoverNamesFromMrz — numele în P nu se mutilează după IDROU (CJO-20260804-61939)', () => {
  it('PARASCHIV rămâne PARASCHIV pe CI TD2', () => {
    const out = recoverNamesFromMrz({
      line1: 'IDROUPARASCHIV<<CATALIN<ALEXANDRU<<<',
    });
    expect(out.surname).toBe('PARASCHIV');
    expect(out.givenNames).toBe('CATALIN ALEXANDRU');
  });

  it('prefixul de pașaport se taie în continuare când linia chiar începe cu P<ROU', () => {
    const out = recoverNamesFromMrz({ line1: 'P<ROUPOPA<<ION<<<<<<' });
    expect(out.surname).toBe('POPA');
  });
});

describe('MRZ reconstruit din citirea greșită (E-260805-AX99C)', () => {
  // Modelul a returnat linia 1 ca prefix canonic PESTE numele deja contaminat:
  // „P<ROU" + „PEROUPOPESCU". Tăierea unui singur prefix lăsa „PEROUPOPESCU",
  // iar rescrierea din MRZ bătea curățarea făcută la parsare.
  it('taie și copia mâzgălită a prefixului, nu doar pe cea canonică', () => {
    const out = recoverNamesFromMrz({
      line1: 'P<ROUPEROUPOPESCU<<MARIA<ELENA<<<<<<<<<<<<<<<<<<<<<<<<<<<<<',
      line2: '2000000000000<9807306ROU<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<',
    });
    expect(out.surname).toBe('POPESCU');
    expect(out.givenNames).toBe('MARIA ELENA');
  });

  it('numele final scris în rezultat e curat', () => {
    const out = correctNamesFromMrz({
      success: true,
      documentType: 'passport',
      confidence: 99,
      extractedData: {
        documentType: 'passport',
        lastName: 'PEROUPOPESCU',
        firstName: 'MARIA ELENA',
        mrz: { line1: 'P<ROUPEROUPOPESCU<<MARIA<ELENA<<<<<<<<', line2: null, line3: null },
      },
      issues: [],
      suggestions: [],
    } as PassportResult);
    expect(out.extractedData.lastName).toBe('POPESCU');
    expect(out.extractedData.firstName).toBe('MARIA ELENA');
  });

  it('un nume real care începe cu ROU rămâne intact', () => {
    const out = recoverNamesFromMrz({ line1: 'P<ROUROUA<<ION<<<<<<<<<<' });
    expect(out.surname).toBe('ROUA');
  });
});

describe('corecții deterministe CI — port CJO 05.08.2026', () => {
  it('seria/numărul din MRZ TD2 bat citirea vizuală, localitatea din adresa brută', () => {
    const raw = JSON.stringify({
      success: true, confidence: 0.9,
      extractedData: {
        lastName: 'PARASCHIV', firstName: 'CĂTĂLIN-ALEXANDRU',
        series: 'IL', number: '699332',
        address: { fullAddress: 'Jud.IL Sat.Vlădeni (Com.Vlădeni) Str.Mihai Viteazul nr.130', county: 'Ialomița', city: 'Slobozia' },
        mrz: { line1: 'IDROUPARASCHIV<<CATALIN<ALEXANDRU<<<', line2: 'SZ699332<7ROU0004145M3108033521118' },
      },
    });
    const r = applyCiDeterministicCorrections(parseGeminiOCRResponse(raw, 'ci_front'));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = r.extractedData as any;
    expect(d.series).toBe('SZ');
    expect(d.number).toBe('699332');
    expect(d.address.city).toBe('Vlădeni');
  });

  it('TD1 eCI: seria din linia 1; fără MRZ → null', () => {
    expect(extractDocNumberFromMrz({ line1: 'IDROUMB113912841710211434518<<<<' })).toEqual({ series: 'MB', number: '1139128' });
    expect(extractDocNumberFromMrz(undefined)).toBeNull();
  });

  it('deriveCityFromFullAddress: sat > comună > municipiu', () => {
    expect(deriveCityFromFullAddress('Jud.IL Sat.Vlădeni (Com.Vlădeni) Str.Mihai Viteazul nr.130')).toBe('Vlădeni');
    expect(deriveCityFromFullAddress('Jud.CJ Mun.Cluj-Napoca Str.Memorandumului nr.2')).toBe('Cluj-Napoca');
  });

  it('numele compus cu cratimă păstrează diacriticele la corecția din MRZ', () => {
    const raw = JSON.stringify({
      success: true, confidence: 0.9,
      extractedData: {
        lastName: 'PARASCHIV', firstName: 'CĂTĂLIN-ALEXANDRU',
        mrz: { line1: 'IDROUPARASCHIV<<CATALIN<ALEXANDRU<<<' },
      },
    });
    const r = correctNamesFromMrz(parseGeminiOCRResponse(raw, 'ci_front'));
    expect(r.extractedData?.firstName).toBe('CĂTĂLIN-ALEXANDRU');
  });
});
