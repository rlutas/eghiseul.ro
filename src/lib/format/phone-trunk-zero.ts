/**
 * The leading zero people actually type into the phone field.
 *
 * The order form shows „+40 " and the customer types their number the way they
 * say it out loud: `0712 345 678`. The result is `+400712345678` — one digit too
 * many for Romania. `react-international-phone` does not strip that zero on its
 * own (verified in the browser on production, 17.09.2026).
 *
 * The order still goes through: `isValidPhoneNumber` is lenient and recognises
 * the 0 as the national trunk prefix. The damage is downstream — that exact
 * string is what we store, print on the AWB and send to Oblio, and dialled as
 * written it reaches nobody. So this is a data-quality fix, not a validation
 * one.
 *
 * The zero is the national trunk prefix: you dial it inside the country and drop
 * it when you dial in from abroad. Every country in the list below uses `0` that
 * way, so a national number starting with `0` there is the trunk prefix and not
 * part of the number.
 *
 * Italy is the exception that makes the allowlist necessary: Italian landlines
 * KEEP their leading zero (`+39 06 …` for Rome), and Italy is one of the
 * preferred countries in this field because of the Romanian diaspora. Stripping
 * it there would break a valid number, so `+39` is deliberately absent.
 */

/**
 * Dial codes whose national numbers never start with 0. Kept deliberately
 * short: only the countries the field offers as preferred, minus Italy.
 */
const TRUNK_ZERO_DIAL_CODES = [
  '40', // România
  '34', // Spania
  '49', // Germania
  '44', // Marea Britanie
  '33', // Franța
  '32', // Belgia
  '43', // Austria
  '31', // Olanda
  '41', // Elveția
] as const;

/**
 * `+400712345678` → `+40712345678`. Anything else is returned untouched:
 * a number without the extra zero, a country not in the list, or a value that
 * is not in E.164 form yet.
 */
export function stripTrunkZero(phone: string): string {
  if (typeof phone !== 'string') return phone;

  const compact = phone.replace(/\s+/g, '');
  if (!compact.startsWith('+')) return phone;

  for (const dial of TRUNK_ZERO_DIAL_CODES) {
    const prefix = `+${dial}`;
    if (!compact.startsWith(prefix)) continue;

    const national = compact.slice(prefix.length);
    // Only when there is a zero AND something after it — `+400` on its own is
    // someone mid-typing, not a trunk prefix to remove.
    if (national.startsWith('0') && national.replace(/^0+/, '').length > 0) {
      return `${prefix}${national.replace(/^0+/, '')}`;
    }
    // Nothing to fix: hand back exactly what came in, spaces and all.
    return phone;
  }

  return phone;
}
