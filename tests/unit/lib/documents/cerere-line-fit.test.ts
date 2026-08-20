import { describe, it, expect } from 'vitest';
import { shrinkFillers, fitLine, type FitPiece } from '@/lib/documents/cerere-line-fit';

/** Crude monospace metric — 1pt per character, enough to test the fitting. */
const measure = (text: string) => text.length;

describe('shrinkFillers', () => {
  it('takes one dot off the longest run', () => {
    expect(shrinkFillers(['a … … … b', 'c … d'])).toEqual(['a … … b', 'c … d']);
  });

  it('handles dot-space runs too', () => {
    expect(shrinkFillers(['nr. . . . . ,'])).toEqual(['nr. . . . ,']);
  });

  it('returns null when there is nothing left to trim', () => {
    expect(shrinkFillers(['fara umplutura'])).toBeNull();
    expect(shrinkFillers(['un singur … punct'])).toBeNull();
  });
});

describe('fitLine', () => {
  const line = (uat: string): FitPiece[] => [
    { text: 'comuna/orasul/municipiul … ', isValue: false, gapAfter: 0 },
    { text: uat, isValue: true, gapAfter: 0 },
    { text: ' … …, str. … … … … … … … …, nr. ....', isValue: false, gapAfter: 0 },
  ];

  const endX = (pieces: FitPiece[], startX = 0) =>
    pieces.reduce((x, p) => x + measure(p.text) + p.gapAfter, startX);

  it('leaves a line that already fits untouched', () => {
    const pieces = line('Odoreu');
    expect(fitLine(pieces, 0, 200, measure)).toEqual(pieces);
  });

  it('shortens the dotted blanks so a locality with its county fits', () => {
    const pieces = line('Otopeni, jud. Ilfov');
    const fitted = fitLine(pieces, 0, endX(line('Odoreu')), measure);

    expect(endX(fitted)).toBeLessThanOrEqual(endX(line('Odoreu')));
    // the value itself is never touched
    expect(fitted[1].text).toBe('Otopeni, jud. Ilfov');
  });

  it('never drops real wording — returns an over-long line instead', () => {
    const pieces: FitPiece[] = [
      { text: 'text fara puncte', isValue: false, gapAfter: 0 },
      { text: 'O VALOARE FOARTE FOARTE LUNGA', isValue: true, gapAfter: 0 },
    ];
    expect(fitLine(pieces, 0, 10, measure)).toEqual(pieces);
  });
});
