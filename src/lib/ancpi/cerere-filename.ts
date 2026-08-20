/**
 * Filenames for the cereri handed to the topograph collaborator.
 *
 * He works straight off the filename — his words: "eu îmi iau informația direct
 * din denumirea pdf-ului, nu mai deschid cererea să o citesc". So the name IS
 * the interface: CF number, UAT and county, in his convention
 *
 *   cf 101010 - Baile Govora-Valcea.pdf
 *
 * Diacritics are stripped (his own examples are ASCII, and the files travel
 * through mail/Drive/Windows), and anything a filesystem chokes on is replaced.
 */
import { checkCf } from '@/lib/ancpi/cf-format';

/**
 * Normalization for the cerere flow. Deliberately NOT `normalizeCf` (which the
 * ANCPI worker depends on): that one deletes every inner space, so the real
 * values clients typed — "431001 C1 U2", "41971 Moara" — would come out as
 * "431001C1U2" and "41971MOARA", i.e. a wrong number on a filed cerere.
 *
 * Repairs only what is unambiguous (segment separators, a locality typed after
 * the number) and otherwise returns the value verbatim — we never invent a
 * number. Anything not recognisable stays for a human to look at (see
 * `needsReview` below).
 */
export function normalizeCfForCerere(raw: string | null | undefined): string {
  const value = (raw ?? '').trim().toUpperCase().replace(/\s+/g, ' ');
  if (!value) return '';

  // "123456 C1 U2" / "123456-C1 U2" → "123456-C1-U2"; same for "123456 C1".
  // A trailing word is the locality the client appended ("41971 MOARA").
  const unit = /^(\d{1,7})[\s-]+C(\d+)[\s-]+U(\d+)(?:\s+[A-ZĂÂÎȘȚ-]+)*$/.exec(value);
  if (unit) return `${unit[1]}-C${unit[2]}-U${unit[3]}`;

  const building = /^(\d{1,7})[\s-]+C(\d+)(?:\s+[A-ZĂÂÎȘȚ-]+)*$/.exec(value);
  if (building) return `${building[1]}-C${building[2]}`;

  const land = /^(\d{1,7})(?:[\s-]+[A-ZĂÂÎȘȚ-]+)*$/.exec(value);
  if (land) return land[1];

  return value;
}

/**
 * True when the filename can no longer be trusted as a faithful copy of the CF
 * — an old paper number, free text, or anything with a character a filesystem
 * cannot hold. He reads the name instead of opening the cerere, so these get a
 * "verifica" prefix: the one case where we WANT him to open the document.
 */
function needsReview(identifier: string): boolean {
  if (!identifier) return true;
  if (/[/\\<>:"|?*]/.test(identifier)) return true;
  return checkCf(identifier).status !== 'valid';
}

export interface CerereFilenameInput {
  carteFunciara?: string | null;
  cadastral?: string | null;
  uat: string;
  county: string;
}

/** Strip diacritics and collapse whitespace, keeping the original casing. */
function ascii(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    // Cedilla forms (ANAF/ANCPI legacy) do not decompose the same way.
    .replace(/[ŞŚ]/g, 'S').replace(/[şś]/g, 's')
    .replace(/[ŢŤ]/g, 'T').replace(/[ţť]/g, 't')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Replace characters that are illegal or ambiguous in a filename. */
function filesystemSafe(value: string): string {
  return value
    .replace(/[/\\]/g, '-')
    .replace(/[<>:"|?*]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildCerereFilename(input: CerereFilenameInput): string {
  const cf = normalizeCfForCerere(input.carteFunciara);
  const cad = normalizeCfForCerere(input.cadastral);

  const value = cf || cad;
  const identifier = cf
    ? `cf ${filesystemSafe(ascii(cf))}`
    : cad
      ? `cad ${filesystemSafe(ascii(cad))}`
      : 'cerere fara numar';

  const prefix = value && needsReview(value) ? 'verifica ' : '';

  const uat = filesystemSafe(ascii(input.uat)) || 'UAT necunoscut';
  const county = filesystemSafe(ascii(input.county)) || 'judet necunoscut';

  return `${prefix}${identifier} - ${uat}-${county}.pdf`;
}

export interface NamedCerere {
  name: string;
  /** friendly_order_id, used to tell same-CF cereri apart */
  orderRef: string;
}

/**
 * Two orders can legitimately carry the same CF (same flat, two clients), and a
 * ZIP silently overwriting one of them would lose a paid job. Collisions get the
 * order ref appended; a collision within one order gets a counter on top.
 */
export function disambiguateFilenames(items: NamedCerere[]): string[] {
  const counts = new Map<string, number>();
  for (const item of items) counts.set(item.name, (counts.get(item.name) ?? 0) + 1);

  const used = new Set<string>();
  return items.map(item => {
    if ((counts.get(item.name) ?? 0) < 2) return item.name;

    const base = item.name.replace(/\.pdf$/i, '');
    let candidate = `${base} (${item.orderRef}).pdf`;
    let n = 1;
    while (used.has(candidate)) {
      n += 1;
      candidate = `${base} (${item.orderRef}) ${n}.pdf`;
    }
    used.add(candidate);
    return candidate;
  });
}
