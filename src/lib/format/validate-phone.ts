/**
 * One answer to „is this a phone number we can call?", for every form.
 *
 * The order form already checks the number per country through
 * libphonenumber-js (`contact-step.tsx`); the account did its own loose check
 * — digits, a leading 0 or +, a length between 9 and 15 — which let through
 * `+40 12` and `0000000000` alike. A number we cannot dial is a customer we
 * cannot reach when something is wrong with their order, so the account now
 * asks the same question the wizard does.
 *
 * Returns the message to show, in Romanian, or `null` when the number is fine.
 */

import { isValidPhoneNumber } from 'libphonenumber-js';
import { normalizePhone } from './normalize-phone';

export const PHONE_EMPTY_MESSAGE = 'Scrie numărul la care te putem suna.';
export const PHONE_INVALID_MESSAGE =
  'Număr de telefon invalid (verifică numărul de cifre pentru țara aleasă).';

/**
 * `react-international-phone` reports „+40" while the field is still empty:
 * the dial code is forced, so it is never blank. Nothing typed = at most the
 * dial code, and dial codes are 1–3 digits.
 */
export function hasTypedPhone(raw: string): boolean {
  return raw.replace(/\D/g, '').length > 3;
}

export function validatePhone(raw: string): string | null {
  if (typeof raw !== 'string' || !hasTypedPhone(raw)) return PHONE_EMPTY_MESSAGE;
  // `normalizePhone` strips the trunk zero and separators, and reads a number
  // without a dial code as Romanian — the same reading the server gives it.
  const normalized = normalizePhone(raw);
  return isValidPhoneNumber(normalized) ? null : PHONE_INVALID_MESSAGE;
}
