/**
 * Keeps a redrawn cerere line inside the page margins.
 *
 * The Anexa 6 lines we rewrite already end exactly at the right margin, and the
 * values we inject are longer than the sample ones they replace — a locality
 * with its county ("Otopeni, jud. Ilfov") pushes the line past the edge.
 *
 * The slack is right there in the form: the dotted runs ("… … …", ". . . .")
 * are blanks for fields nobody fills in. So instead of shrinking the font or
 * clipping the text, we shorten the longest dotted run, one dot at a time, until
 * the line fits. Real content is never touched.
 */

/** A run of two or more dots/ellipses, optionally spaced. */
const FILLER_RUN = /(?:[….][ ]?){2,}/g;

/** Number of dot characters in a run. */
function fillerCount(run: string): number {
  return (run.match(/[….]/g) ?? []).length;
}

/**
 * Removes one dot from the longest filler run across `literals`.
 * Returns null when there is nothing left to give.
 */
export function shrinkFillers(literals: string[]): string[] | null {
  let best = { index: -1, start: -1, length: 0, count: 1 };

  literals.forEach((literal, index) => {
    for (const match of literal.matchAll(FILLER_RUN)) {
      const count = fillerCount(match[0]);
      if (count > best.count) {
        best = { index, start: match.index ?? 0, length: match[0].length, count };
      }
    }
  });

  if (best.index < 0) return null;

  const literal = literals[best.index];
  const run = literal.slice(best.start, best.start + best.length);
  const shortened = run.replace(/[….][ ]?$/, '');
  if (shortened === run) return null;

  const out = [...literals];
  out[best.index] = literal.slice(0, best.start) + shortened + literal.slice(best.start + best.length);
  return out;
}

export interface FitPiece {
  text: string;
  /** Values are drawn bold; the form's own wording is not, and only it may shrink. */
  isValue: boolean;
  gapAfter: number;
}

/**
 * Shortens filler runs until the line ends before `rightMargin`.
 * Gives up (returning the best it managed) rather than dropping real text.
 */
export function fitLine(
  pieces: FitPiece[],
  startX: number,
  rightMargin: number,
  measure: (text: string, isValue: boolean) => number
): FitPiece[] {
  const endX = (current: FitPiece[]) =>
    current.reduce((x, p) => x + (p.text ? measure(p.text, p.isValue) : 0) + p.gapAfter, startX);

  let current = pieces;
  while (endX(current) > rightMargin) {
    const literals = current.filter(p => !p.isValue).map(p => p.text);
    const shrunk = shrinkFillers(literals);
    if (!shrunk) return current; // nothing left to trim — better long than clipped

    let i = 0;
    current = current.map(p => (p.isValue ? p : { ...p, text: shrunk[i++] }));
  }
  return current;
}
