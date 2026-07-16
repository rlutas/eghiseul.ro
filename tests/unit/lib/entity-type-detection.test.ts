import { describe, it, expect } from 'vitest';
import { detectEntityType } from '@/lib/services/entity-type-detection';

describe('detectEntityType', () => {
  describe('cedilla vs comma-below diacritics (bug: SRL flagged as PFA)', () => {
    // ANAF returns legacy cedilla diacritics (Ş U+015E, Ţ U+0162), not the
    // correct comma-below forms (Ș U+0218, Ț U+021A). The word-boundary regex
    // must treat BOTH as letters, otherwise "CONSTRUCŢII" is split so that
    // "II" matches as a standalone word → false PFA block (real incident:
    // VERIFICATOR ŞI EXPERT CONSTRUCŢII S.R.L., CUI 35456698).
    it('does not flag SRL with cedilla Ţ (U+0162) as PFA', () => {
      expect(
        detectEntityType('VERIFICATOR ŞI EXPERT CONSTRUCŢII S.R.L.'),
      ).toBeNull();
    });

    it('does not flag SRL with comma-below Ț (U+021A) as PFA', () => {
      expect(
        detectEntityType('VERIFICATOR ȘI EXPERT CONSTRUCȚII S.R.L.'),
      ).toBeNull();
    });

    it('does not flag SRL without diacritics as PFA', () => {
      expect(
        detectEntityType('VERIFICATOR SI EXPERT CONSTRUCTII S.R.L.'),
      ).toBeNull();
    });

    it('does not flag lowercase cedilla ţ (U+0163) as PFA', () => {
      expect(
        detectEntityType('verificator şi expert construcţii s.r.l.'),
      ).toBeNull();
    });

    it('still detects real II with cedilla neighbours', () => {
      expect(detectEntityType('POPESCU ANDREIŢA II')).toBe('pfa');
    });
  });

  describe('true positives stay detected', () => {
    it.each([
      ['POPESCU ION PFA', 'pfa'],
      ['IONESCU MARIA P.F.A.', 'pfa'],
      ['GEORGESCU DAN INTREPRINDERE INDIVIDUALA', 'pfa'],
      ['VASILE ANDREI II', 'pfa'],
      ['MARIN ELENA I.I.', 'pfa'],
      ['DINU FLORIN IF', 'pfa'],
      ['CABINET MEDICAL DR. POP', 'pfa'],
      ['CABINET DE AVOCAT IONESCU', 'pfa'],
      ['BIROU NOTARIAL STAN', 'pfa'],
      ['ASOCIATIA SPORTIVA VIITORUL', 'ong'],
      ['FUNDATIA SPERANTA', 'ong'],
    ])('%s → %s', (name, expected) => {
      expect(detectEntityType(name)).toBe(expected);
    });
  });

  describe('word-boundary false positives stay excluded', () => {
    it.each([
      'EDITII SRL', // "II" inside word
      'MEDIATIF SRL', // "IF" inside word
      'ALACABINET SRL', // "CABINET" inside word (no pattern anyway)
      'CLIFF CONSULTING SRL',
    ])('%s → null', (name) => {
      expect(detectEntityType(name)).toBeNull();
    });
  });
});
