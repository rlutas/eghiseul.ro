/**
 * Input rules for the ANCPI electronic identifier (număr carte funciară /
 * cadastral). Client-side, NON-BLOCKING: we normalize light typos and WARN when
 * the value doesn't look like a valid e-Terra electronic identifier, but we never
 * stop the order (product decision — let people order, just set expectations).
 *
 * Valid electronic identifier formats (ANCPI):
 *   12783            → teren (land)
 *   4567-C3          → construcție (building)
 *   123456-C1-U2     → unitate individuală (apartment)
 *
 * Old / non-digitized CF (e.g. "11584/11", roman numerals, "nr. top ...") is NOT
 * in e-Terra electronically → can't be issued instantly online.
 */

export type CfStatus = 'empty' | 'valid' | 'collective' | 'old_format' | 'suspicious';

export interface CfCheck {
  normalized: string;
  status: CfStatus;
  message?: string;
}

// Identifier shapes:
//   12783          → teren (land)        ✅ issued
//   123456-C1-U2   → apartament (unit)   ✅ issued
//   123456-C1      → construcție/bloc întreg (CF colectivă) ⚠️ NOT issued online
const VALID_LAND = /^\d{1,7}$/;
const VALID_UNIT = /^\d{1,7}-C\d+-U\d+$/;
const COLLECTIVE = /^\d{1,7}-C\d+$/;

/**
 * Light, SAFE normalization (never changes a correct value):
 * trim, uppercase, remove inner spaces, strip a trailing appended county/word
 * after a valid identifier (e.g. "309659-C1-U2-Cluj" → keep "309659-C1-U2").
 */
export function normalizeCf(raw: string): string {
  let v = (raw || '').trim().toUpperCase().replace(/\s+/g, '');
  // Drop a trailing "-WORD" that isn't a -C/-U segment (county/UAT appended).
  const m = /^(\d{1,7}(?:-C\d+(?:-U\d+)?)?)-[A-Z]{2,}$/.exec(v);
  if (m) v = m[1]!;
  return v;
}

/**
 * The identifier we should actually order with. For a collective building number
 * ("123456-C1") we fall back to the land number ("123456"); everything else is
 * used as normalized. (Product decision: no collective service → issue the land.)
 */
export function effectiveIdentifier(raw: string): string {
  const n = normalizeCf(raw);
  if (COLLECTIVE.test(n)) return n.replace(/-C\d+$/, '');
  return n;
}

export function checkCf(raw: string): CfCheck {
  const normalized = normalizeCf(raw);
  if (!normalized) return { normalized, status: 'empty' };

  if (VALID_LAND.test(normalized) || VALID_UNIT.test(normalized)) {
    return { normalized, status: 'valid' };
  }

  // "123456-C1" = the whole building (CF colectivă) — not issued online. We don't
  // offer a collective service, so we fall back to the TEREN extract (123456) and
  // warn. For a specific apartment the unit number (-U..) is required.
  const col = COLLECTIVE.exec(normalized);
  if (col) {
    const land = normalized.replace(/-C\d+$/, '');
    return {
      normalized,
      status: 'collective',
      message:
        `Ai introdus construcția întreagă (CF colectivă). Vom emite extrasul pe TEREN (${land}). ` +
        `Pentru un apartament anume, adaugă unitatea (ex. ${normalized}-U20).`,
    };
  }

  // Old / non-digitized markers: slash-separated, roman numerals, "top", letters/words.
  const oldFormat =
    normalized.includes('/') ||
    /\bTOP\b|NR\.?TOP|TITLU|PROPRIET/i.test(normalized) ||
    /\d+\/[IVX]+/i.test(normalized);
  if (oldFormat) {
    return {
      normalized,
      status: 'old_format',
      message:
        'Numărul pare în format vechi (nedigitalizat). Identificatorul electronic arată ca 123456 sau 123456-C1-U2. ' +
        'Poți continua comanda, dar dacă imobilul nu e digitalizat în sistemul ANCPI, extrasul NU se eliberează instant și poate dura.',
    };
  }

  return {
    normalized,
    status: 'suspicious',
    message:
      'Verifică numărul — nu pare un identificator electronic standard (ex. 123456 sau 123456-C1-U2). ' +
      'Poți continua, dar un număr greșit întârzie eliberarea extrasului.',
  };
}
