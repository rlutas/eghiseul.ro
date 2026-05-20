import { describe, it, expect } from 'vitest';
import {
  detectEntityType,
  matchesAnyWord,
  PFA_II_IF_PATTERNS,
  ONG_PATTERNS,
  entityTypeMessage,
} from '@/lib/services/entity-type-detection';

describe('detectEntityType', () => {
  describe('PFA / II / IF / Cabinet (returns "pfa")', () => {
    it.each([
      ['POPESCU ION PFA', 'pfa'],
      ['ION P.F.A. CONSULTING', 'pfa'],
      ['MARIA POPA PERSOANA FIZICA AUTORIZATA', 'pfa'],
      ['POPA & SONS II', 'pfa'],
      ['STAN MARIA I.I.', 'pfa'],
      ['IONESCU FAMILY IF', 'pfa'],
      ['INTREPRINDERE INDIVIDUALA STAN', 'pfa'],
      ['CABINET MEDICAL DR. POPESCU', 'pfa'],
      ['CABINET DE AVOCAT ANDREI', 'pfa'],
      ['BIROU NOTARIAL MARIA', 'pfa'],
      ['NOTAR PUBLIC ION POPA', 'pfa'],
      ['EXECUTOR JUDECATORESC X', 'pfa'],
      ['MEDIC SPECIALIST DR. RADU', 'pfa'],
    ])('"%s" → %s', (name, expected) => {
      expect(detectEntityType(name)).toBe(expected);
    });
  });

  describe('ONG / non-profit (returns "ong")', () => {
    it.each([
      ['ASOCIATIA SALVATI COPIII', 'ong'],
      ['FUNDATIA DAN VOICULESCU', 'ong'],
      ['FEDERATIA ROMANA DE FOTBAL', 'ong'],
      ['CLUB SPORTIV STEAUA', 'ong'],
      ['CLUB ROTARY BUCURESTI', 'ong'],
      ['ORGANIZATIA TINERILOR', 'ong'],
      ['SINDICATUL LIBER X', 'ong'],
      ['PAROHIA SF. NICOLAE', 'ong'],
      ['BISERICA EVANGHELICA X', 'ong'],
      ['MANASTIREA SINAIA', 'ong'],
      ['ONG TINERETUL', 'ong'],
    ])('"%s" → %s', (name, expected) => {
      expect(detectEntityType(name)).toBe(expected);
    });
  });

  describe('Ordinary commercial entities (returns null)', () => {
    it.each([
      ['ORANGE ROMANIA S.A.'],
      ['TEST SRL'],
      ['ABC TRADING S.R.L.'],
      ['COOPERATIVA AGRICOLA'],
      ['SOCIETATE EUROPEANA SCS'],
      ['BANCA TRANSILVANIA SA'],
    ])('"%s" → null', (name) => {
      expect(detectEntityType(name)).toBeNull();
    });
  });

  describe('Word-boundary false-positive guards', () => {
    it('"EDITII SRL" does NOT match "II"', () => {
      expect(detectEntityType('EDITII SRL')).toBeNull();
    });

    it('"MEDIATIF SRL" does NOT match "IF"', () => {
      expect(detectEntityType('MEDIATIF SRL')).toBeNull();
    });

    it('"FACABINET SRL" does NOT match "CABINET"', () => {
      expect(detectEntityType('FACABINET SRL')).toBeNull();
    });

    it('"LIGAMENT MEDICAL SRL" does NOT match "LIGA"', () => {
      expect(detectEntityType('LIGAMENT MEDICAL SRL')).toBeNull();
    });

    it('"CONSILIA SRL" does NOT match "ASOCIATIA"', () => {
      expect(detectEntityType('CONSILIA SRL')).toBeNull();
    });

    it('"SINDICATEMENT SRL" does NOT match "SINDICAT"', () => {
      // SINDICATE — SINDICAT followed by E (alphanumeric) → no match
      expect(detectEntityType('SINDICATEMENT SRL')).toBeNull();
    });

    it('"MEDICALA SRL" does NOT match "MEDIC SPECIALIST"', () => {
      expect(detectEntityType('MEDICALA SRL')).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('empty string returns null', () => {
      expect(detectEntityType('')).toBeNull();
    });

    it('handles diacritics', () => {
      expect(detectEntityType('ASOCIAȚIA TINERILOR')).toBe('ong');
      expect(detectEntityType('FUNDAȚIA X')).toBe('ong');
      expect(detectEntityType('ÎNTREPRINDERE INDIVIDUALĂ POPA')).toBe('pfa');
    });

    it('PFA takes precedence over ONG when both patterns match', () => {
      // Hypothetical: an ASOCIATIE that's also a PFA — PFA blocks first
      expect(detectEntityType('ASOCIATIA PFA TEST')).toBe('pfa');
    });

    it('is case-insensitive', () => {
      expect(detectEntityType('pfa popescu')).toBe('pfa');
      expect(detectEntityType('Asociatia X')).toBe('ong');
    });
  });
});

describe('matchesAnyWord', () => {
  it('respects word boundaries', () => {
    expect(matchesAnyWord('EDITII SRL', ['II'])).toBe(false);
    expect(matchesAnyWord('ABC II SRL', ['II'])).toBe(true);
  });

  it('matches at string start', () => {
    expect(matchesAnyWord('PFA POPESCU', ['PFA'])).toBe(true);
  });

  it('matches at string end', () => {
    expect(matchesAnyWord('POPESCU PFA', ['PFA'])).toBe(true);
  });

  it('caller passes uppercase patterns', () => {
    // Function expects uppercased input — verify it doesn't lowercase internally
    expect(matchesAnyWord('PFA POPESCU', ['pfa'])).toBe(false);
    expect(matchesAnyWord('PFA POPESCU', ['PFA'])).toBe(true);
  });
});

describe('entityTypeMessage', () => {
  it('returns PF guidance for "pfa"', () => {
    const msg = entityTypeMessage('pfa');
    expect(msg).toMatch(/persoan[ăa] fizic[ăa]/i);
    expect(msg).toMatch(/PFA/);
  });

  it('returns extra-docs guidance for "ong"', () => {
    const msg = entityTypeMessage('ong');
    expect(msg).toMatch(/registrul asocia[țt]iilor/i);
  });

  it('returns null for null', () => {
    expect(entityTypeMessage(null)).toBeNull();
  });
});

describe('Pattern lists (smoke)', () => {
  it('PFA_II_IF_PATTERNS contains expected core variants', () => {
    expect(PFA_II_IF_PATTERNS).toContain('PFA');
    expect(PFA_II_IF_PATTERNS).toContain('II');
    expect(PFA_II_IF_PATTERNS).toContain('IF');
    expect(PFA_II_IF_PATTERNS).toContain('CABINET MEDICAL');
    expect(PFA_II_IF_PATTERNS).toContain('BIROU NOTARIAL');
  });

  it('ONG_PATTERNS contains expected variants', () => {
    expect(ONG_PATTERNS).toContain('ASOCIATIA');
    expect(ONG_PATTERNS).toContain('FUNDATIE');
    expect(ONG_PATTERNS).toContain('ONG');
    expect(ONG_PATTERNS).toContain('SINDICAT');
  });
});
