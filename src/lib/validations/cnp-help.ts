/**
 * Help for a customer whose CNP is rejected: decode what the 13 digits they
 * typed currently say (sex, century, birth date, county), so they can spot the
 * typo themselves.
 *
 * Deliberately does NOT compute or suggest a "correct" control digit: if the
 * typo sits in the date or the sequence, a recomputed control digit would turn
 * it into a valid but WRONG CNP (another person's). The customer must find the
 * wrong digit by comparing with the ID card.
 *
 * The county code is shown when we know its name and never treated as an
 * error (the register issues codes outside the classic list).
 */
import { getCountyFromCNP, validateCNP } from './cnp';

export type CnpErrorCode =
  | 'EMPTY'
  | 'LENGTH'
  | 'NON_NUMERIC'
  | 'FIRST_DIGIT'
  | 'DATE'
  | 'COUNTY'
  | 'CHECKSUM'
  | 'OTHER';

/** Machine code for a rejected CNP (for telemetry; never logs the CNP). */
export function cnpErrorCode(cnp: string): CnpErrorCode | null {
  const clean = (cnp || '').replace(/[\s-]/g, '');
  if (!clean) return 'EMPTY';
  const res = validateCNP(clean);
  if (res.valid) return null;
  const msg = res.errors[0] || '';
  if (/13 cifre/.test(msg)) return 'LENGTH';
  if (/doar cifre/.test(msg)) return 'NON_NUMERIC';
  if (/Prima cifră/.test(msg)) return 'FIRST_DIGIT';
  if (/Luna|Ziua|Data de naștere/.test(msg)) return 'DATE';
  if (/județului/.test(msg)) return 'COUNTY';
  if (/cifra de control/.test(msg)) return 'CHECKSUM';
  return 'OTHER';
}

export type CnpSex = 'male' | 'female';

interface FirstDigitInfo {
  sex: CnpSex | null;
  /** Human text: „bărbat", „femeie, rezidentă străină", … */
  label: string;
  /** Birth century for 1–6; null for 7/8/9 (residents/foreigners: not encoded). */
  century: number | null;
}

const FIRST_DIGIT: Record<string, FirstDigitInfo> = {
  '1': { sex: 'male', label: 'bărbat', century: 1900 },
  '2': { sex: 'female', label: 'femeie', century: 1900 },
  '3': { sex: 'male', label: 'bărbat', century: 1800 },
  '4': { sex: 'female', label: 'femeie', century: 1800 },
  '5': { sex: 'male', label: 'bărbat', century: 2000 },
  '6': { sex: 'female', label: 'femeie', century: 2000 },
  '7': { sex: 'male', label: 'bărbat, rezident străin', century: null },
  '8': { sex: 'female', label: 'femeie, rezidentă străină', century: null },
  '9': { sex: null, label: 'persoană străină', century: null },
};

export interface CnpDecodeHelp {
  /** What the digits currently say, ready to show under the error. */
  summary: string;
  /** Extra line when the first digit contradicts the sex we know from the ID. */
  sexHint: string | null;
  sex: CnpSex | null;
  birthDate: string | null; // DD.MM.YYYY (or DD.MM.YY when the century is unknown)
  county: string | null;
  /** Which part to re-check. */
  checkHint: string;
}

/**
 * Decode a 13-digit CNP that failed validation. Returns null when there is
 * nothing to decode (not 13 digits) or when the CNP is valid.
 *
 * @param expectedSex sex known from elsewhere (ID OCR), if any.
 */
export function describeInvalidCnp(cnp: string, expectedSex?: CnpSex | null): CnpDecodeHelp | null {
  const clean = (cnp || '').replace(/[\s-]/g, '');
  if (!/^\d{13}$/.test(clean)) return null;
  const code = cnpErrorCode(clean);
  if (code == null) return null;

  const first = FIRST_DIGIT[clean[0]] ?? null;
  const yy = clean.substring(1, 3);
  const mm = Number(clean.substring(3, 5));
  const dd = Number(clean.substring(5, 7));

  let birthDate: string | null = null;
  let dateOk = mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31;
  if (dateOk && first?.century != null) {
    const year = first.century + Number(yy);
    const d = new Date(year, mm - 1, dd);
    dateOk = d.getFullYear() === year && d.getMonth() === mm - 1 && d.getDate() === dd;
    if (dateOk) birthDate = `${String(dd).padStart(2, '0')}.${String(mm).padStart(2, '0')}.${year}`;
  } else if (dateOk) {
    birthDate = `${String(dd).padStart(2, '0')}.${String(mm).padStart(2, '0')}.${yy}`;
  }

  const county = getCountyFromCNP(clean);

  const parts: string[] = [];
  if (first) parts.push(first.label);
  else parts.push(`prima cifră ${clean[0]} nu e folosită în CNP-uri`);
  if (birthDate) parts.push(`născut${first?.sex === 'female' ? 'ă' : ''} pe ${birthDate}`);
  else parts.push(`data de naștere ${clean.substring(5, 7)}.${clean.substring(3, 5)}.${yy} nu există`);
  if (county) parts.push(`județul ${county}`);
  const summary = `Din CNP reiese: ${parts.join(', ')}.`;

  let checkHint: string;
  if (!first || code === 'FIRST_DIGIT') {
    checkHint = 'Verifică prima cifră: 1 sau 2 pentru născuți între 1900 și 1999, 5 sau 6 după 2000.';
  } else if (!birthDate || code === 'DATE') {
    checkHint = 'Verifică cifrele 2–7 (anul, luna și ziua nașterii).';
  } else {
    checkHint = 'Dacă acestea sunt corecte, verifică ultimele 4 cifre.';
  }

  let sexHint: string | null = null;
  if (expectedSex && first?.sex && first.sex !== expectedSex) {
    const d = clean[0];
    sexHint =
      expectedSex === 'male'
        ? `Prima cifră ${d} înseamnă femeie — pentru bărbat e 1 (născut 1900–1999) sau 5 (după 2000).`
        : `Prima cifră ${d} înseamnă bărbat — pentru femeie e 2 (născută 1900–1999) sau 6 (după 2000).`;
  }

  return { summary, sexHint, sex: first?.sex ?? null, birthDate, county, checkHint };
}
