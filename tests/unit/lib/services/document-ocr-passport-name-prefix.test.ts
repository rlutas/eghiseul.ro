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
