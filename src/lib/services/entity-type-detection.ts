/**
 * Entity Type Detection (Romanian legal entities)
 *
 * Detects when a company name corresponds to:
 *   - PFA/II/IF/Cabinet/Birou Notarial (tax-PF entities that legally should
 *     NOT be invoiced as PJ — cazierul/cazierul fiscal se eliberează pe
 *     persoana fizică titulară)
 *   - ONG (Asociație/Fundație/Biserică/Sindicat etc. — allowed but require
 *     extra docs: extras la zi din Registrul Asociațiilor + încheiere)
 *
 * Uses word-boundary matching so e.g. "EDITII" does NOT trigger "II",
 * "MEDIATIF" does NOT trigger "IF", "ALACABINET" does NOT trigger "CABINET".
 *
 * Ported from cazierjudiciaronline.com Step2PersonalData.tsx:24-92 and
 * extended with additional patterns surfaced by ANAF data in production.
 */

/**
 * Patterns that flag the entity as tax-PF — block the PJ flow and suggest
 * switching to the Persoană Fizică wizard.
 */
export const PFA_II_IF_PATTERNS: readonly string[] = [
  'PFA',
  'P.F.A.',
  'PERSOANA FIZICA AUTORIZATA',
  'PERSOANĂ FIZICĂ AUTORIZATĂ',
  'PERSOANE FIZICE AUTORIZATE',
  'INTREPRINDERE INDIVIDUALA',
  'ÎNTREPRINDERE INDIVIDUALĂ',
  'II',
  'I.I.',
  'INTREPRINDERE FAMILIALA',
  'ÎNTREPRINDERE FAMILIALĂ',
  'IF',
  'I.F.',
  'CABINET MEDICAL',
  'CABINET INDIVIDUAL',
  'CABINET DE AVOCAT',
  'CABINET AVOCAT',
  'BIROU NOTARIAL',
  'NOTAR PUBLIC',
  'BIROU INDIVIDUAL',
  'BIROU EXECUTARE',
  'BIROU DE EXECUTARE',
  'EXECUTOR JUDECATORESC',
  'EXECUTOR JUDECĂTORESC',
  'MEDIC SPECIALIST',
];

/**
 * Patterns that flag the entity as ONG / non-profit — accepted in PJ flow
 * but require extra documents from the user (extras Registrul Asociațiilor +
 * încheierea de înregistrare).
 */
export const ONG_PATTERNS: readonly string[] = [
  'ASOCIATIA',
  'ASOCIAȚIA',
  'ASOCIAŢIA',
  'ASOCIATIE',
  'ASOCIAȚIE',
  'FUNDATIE',
  'FUNDAȚIA',
  'FUNDAŢIE',
  'FUNDATIA',
  'FEDERATIE',
  'FEDERAȚIA',
  'FEDERAŢIE',
  'FEDERATIA',
  'ONG',
  'CLUB',
  'CLUB SPORTIV',
  'LIGA',
  'CERCUL',
  'UNIUNEA',
  'ORGANIZATIA',
  'ORGANIZAȚIA',
  'ORGANIZAŢIA',
  'SINDICATUL',
  'SINDICAT',
  'PAROHIA',
  'BISERICA',
  'MANASTIRE',
  'MANASTIREA',
  'MĂNĂSTIRE',
  'MĂNĂSTIREA',
];

export type EntityType = 'pfa' | 'ong' | null;

/**
 * Escape regex metacharacters in a pattern so it can be embedded in a RegExp.
 */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Build a word-boundary regex that matches `pattern` only when surrounded by
 * non-alphanumeric chars (Romanian alphabet) or string boundaries.
 *
 * Example: matches "II" in "ABC II SRL" but NOT in "EDITII".
 */
function wordBoundaryRegex(pattern: string): RegExp {
  return new RegExp(
    `(^|[^A-ZĂÂÎȘȚ0-9])${escapeRegex(pattern)}([^A-ZĂÂÎȘȚ0-9]|$)`,
  );
}

/**
 * True iff `name` contains any of the patterns, with word boundaries.
 * Case-insensitive — caller should pre-uppercase `name`.
 */
export function matchesAnyWord(
  upperName: string,
  patterns: readonly string[],
): boolean {
  return patterns.some((p) => wordBoundaryRegex(p).test(upperName));
}

/**
 * Detect entity type from a company display name.
 *
 * Returns:
 *   - 'pfa' → tax-PF entity (PFA/II/IF/Cabinet/Birou/Executor/Medic) — block PJ
 *   - 'ong' → non-profit (Asociație/Fundație/etc.) — warn (extra docs needed)
 *   - null → ordinary commercial entity (SRL/SA/SCS/SNC/etc.) — allow
 */
export function detectEntityType(name: string): EntityType {
  if (!name) return null;
  const upper = name.toUpperCase();
  if (matchesAnyWord(upper, PFA_II_IF_PATTERNS)) return 'pfa';
  if (matchesAnyWord(upper, ONG_PATTERNS)) return 'ong';
  return null;
}

/**
 * Human-readable Romanian message for a detected entity type. Used to
 * populate the warning/blocking UI in the company-kyc step.
 */
export function entityTypeMessage(entity: EntityType): string | null {
  if (entity === 'pfa') {
    return (
      'Pentru PFA / Întreprindere Individuală / Întreprindere Familială / Cabinet, ' +
      'cazierul se eliberează pe numele persoanei fizice titulare. ' +
      'Te rugăm să folosești fluxul pentru Persoană Fizică.'
    );
  }
  if (entity === 'ong') {
    return (
      'Pentru ONG (Asociație / Fundație / etc.) este nevoie de documente ' +
      'suplimentare: extras la zi din Registrul Asociațiilor și Fundațiilor ' +
      'și încheierea motivată de înregistrare (originale).'
    );
  }
  return null;
}
