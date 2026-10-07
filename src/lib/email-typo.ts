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

/** Furnizorii mari: doar spre ei o „corectură" e sigur o greșeală de tipar. */
const BIG_PROVIDERS = new Set([
  'gmail.com', 'yahoo.com', 'yahoo.ro', 'hotmail.com', 'outlook.com', 'icloud.com', 'live.com', 'ymail.com',
]);
/** Domenii reale pe care matcher-ul fuzzy le „corectează" spre un furnizor mare. */
const REAL_LOOKALIKES = new Set(['email.com', 'mail.com', 'gmx.com', 'live.it', 'live.ro']);

/**
 * Filtru pentru trimiteri în masă (warm-up): true doar când domeniul e o
 * greșeală de tipar a unui furnizor mare (`gamil.com`, `gmail.con`,
 * `yahoo.comm`). `suggestEmailCorrection` singur e prea agresiv pentru a
 * exclude adrese: pe lista de 72k „corecta" și `libero.it`, `gmx.net`,
 * `uaic.ro`, `yahoo.com.sg` — toate reale.
 */
export function isLikelyProviderTypo(email: string): boolean {
  const at = email.lastIndexOf('@');
  if (at <= 0) return false;
  const domain = email.slice(at + 1).toLowerCase().trim();
  if (HARD_TYPOS[domain]) return true;
  if (BIG_PROVIDERS.has(domain) || REAL_LOOKALIKES.has(domain)) return false;
  const suggested = suggestEmailCorrection(email);
  if (!suggested) return false;
  const target = suggested.slice(suggested.lastIndexOf('@') + 1).toLowerCase();
  // `yahoo.com.sg` → `yahoo.com` e o variantă regională reală, nu o greșeală.
  return BIG_PROVIDERS.has(target) && !domain.startsWith(`${target}.`);
}
