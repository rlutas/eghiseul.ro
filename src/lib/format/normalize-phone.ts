/**
 * One phone format for the whole account.
 *
 * The order form produces E.164 through `react-international-phone`
 * (`+40712345678`), while the account's profile field is a plain `type="tel"`
 * input where people write `0712 345 678`, `0712.345.678` or `+40 712 345 678`.
 * Both end up in `profiles.phone`, and the wizard reads that column to prefill
 * the contact step — so a number saved in the account came back in a shape the
 * phone field could not make sense of.
 *
 * Stored shape is E.164, always. What cannot be parsed is stored as the customer
 * typed it, trimmed: a phone we cannot read is still better than a phone we
 * dropped, and the team can call it.
 */

import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { stripTrunkZero } from './phone-trunk-zero';

/** Default country for a number written without a country code. */
const DEFAULT_COUNTRY = 'RO' as const;

export function normalizePhone(raw: unknown): string {
  if (typeof raw !== 'string') return '';

  const trimmed = raw.trim();
  if (!trimmed) return '';

  // `+400712…` — the trunk zero people type after the dial code the field
  // already shows. libphonenumber accepts it, so it has to go before parsing.
  const candidate = stripTrunkZero(trimmed.replace(/[\s.\-()]/g, ''));

  const parsed = parsePhoneNumberFromString(
    candidate,
    candidate.startsWith('+') ? undefined : DEFAULT_COUNTRY
  );

  if (parsed?.isValid()) return parsed.number;

  return trimmed;
}
