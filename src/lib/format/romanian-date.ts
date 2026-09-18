/**
 * Dates as documents and people write them („02.07.2029") versus what code
 * and `<input type="date">` need („2029-07-02").
 *
 * The OCR returns the expiry date as printed on the document; stored raw and
 * fed to `new Date()` it becomes „Invalid Date" on screen (seen on the
 * profile tab, 18.09.2026) and an exception in `toISOString()`.
 */

/** „02.07.1992" / „02/07/1992" / „02-07-1992" → „1992-07-02", or '' when it is none of these. */
export function isoFromRomanianDate(value?: string | null): string {
  const match = /^(\d{2})[.\-/](\d{2})[.\-/](\d{4})$/.exec((value ?? '').trim());
  return match ? `${match[3]}-${match[2]}-${match[1]}` : '';
}

/**
 * Whatever shape a date arrived in — Romanian, ISO date, ISO timestamp — as
 * `YYYY-MM-DD`, or `null` when it cannot be read. Never throws.
 */
export function toIsoDate(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  const romanian = isoFromRomanianDate(trimmed);
  if (romanian) return romanian;
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const d = new Date(trimmed);
    return Number.isNaN(d.getTime()) ? null : trimmed.slice(0, 10);
  }
  const d = new Date(trimmed);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

/** „2 iulie 2029" for the customer, or the raw text when it is not a date. */
export function formatRoDateLoose(value?: string | null): string {
  const iso = toIsoDate(value);
  if (!iso) return value ?? '';
  return new Date(`${iso}T00:00:00`).toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
