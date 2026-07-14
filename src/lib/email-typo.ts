/**
 * Email domain typo detection — suggests the intended address for common
 * misspellings (gmali.com → gmail.com, gmail.ro → gmail.com, yaho.com →
 * yahoo.com). Motivated by order E-260713-MG6MF (2026-07-13): client typo'd
 * their Gmail address, both order emails hard-bounced and the client had no
 * idea. We can't verify the mailbox exists, but we CAN catch domain typos.
 *
 * Engine: @zootools/email-spell-checker (maintained mailcheck.js rewrite,
 * Sift3 distance, 39 domains + 66 TLDs) + a Romanian-specific hard-typo
 * table checked first (gmail.ro looks plausible but doesn't exist).
 */
import emailSpellChecker from '@zootools/email-spell-checker';

/** Domains that don't exist as mail providers but look plausible in RO. */
const HARD_TYPOS: Record<string, string> = {
  'gmail.ro': 'gmail.com',
  'icloud.ro': 'icloud.com',
  'hotmail.ro': 'hotmail.com',
  'outlook.ro': 'outlook.com',
};

/** Legit domains the fuzzy matcher must never "correct". */
const WHITELIST = new Set(['yahoo.ro', 'yahoo.it', 'yahoo.de', 'yahoo.es', 'yahoo.co.uk']);

/**
 * Returns the full corrected email address when the domain looks like a typo
 * of a popular provider, or null when the address looks fine / undecidable.
 */
export function suggestEmailCorrection(email: string): string | null {
  const at = email.lastIndexOf('@');
  if (at <= 0 || at === email.length - 1) return null;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1).toLowerCase().trim();
  if (!domain.includes('.')) return null;

  if (HARD_TYPOS[domain]) return `${local}@${HARD_TYPOS[domain]}`;
  if (WHITELIST.has(domain)) return null;

  const suggestion = emailSpellChecker.run({ email: email.trim() });
  return suggestion ? suggestion.full : null;
}
