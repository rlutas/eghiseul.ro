/**
 * True when the customer typed something real beyond the contact step.
 * `contact` is step 1 (always present) and `billing` is auto-initialized with
 * defaults, so neither counts. Any other section counts if it holds at least
 * one non-empty string, number, `true`, or non-empty array — empty-string
 * scaffolding like {"plateNumber":""} does not qualify.
 *
 * Shared by the recovery-emails cron and the phone priority-calls queue —
 * both need the same "is this draft worth chasing" filter.
 */
export function hasProgressBeyondContact(customerData: unknown): boolean {
  if (!customerData || typeof customerData !== 'object') return false;
  const sections = customerData as Record<string, unknown>;
  const hasMeaningfulValue = (value: unknown): boolean => {
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return true;
    if (value === true) return true;
    if (Array.isArray(value)) return value.length > 0;
    if (value && typeof value === 'object') {
      return Object.values(value).some(hasMeaningfulValue);
    }
    return false;
  };
  return Object.entries(sections).some(
    ([key, value]) =>
      key !== 'contact' &&
      key !== 'billing' &&
      value !== null &&
      typeof value === 'object' &&
      hasMeaningfulValue(value)
  );
}

/**
 * Câte valori reale (non-goale) sunt completate în afara `contact`/`billing`.
 * Folosit pentru a prioriza la telefon clienții care au avansat mult în
 * wizard (au introdus multe date) față de cei care au abia atins pasul 1 —
 * cine a completat mult nu a abandonat "din prima", deci merită apel înaintea
 * cuiva care a lăsat doar contactul.
 */
export function dataDepthScore(customerData: unknown): number {
  if (!customerData || typeof customerData !== 'object') return 0;
  const sections = customerData as Record<string, unknown>;
  const countMeaningful = (value: unknown): number => {
    if (typeof value === 'string') return value.trim().length > 0 ? 1 : 0;
    if (typeof value === 'number') return 1;
    if (value === true) return 1;
    if (Array.isArray(value)) return value.filter((v) => countMeaningful(v) > 0).length;
    if (value && typeof value === 'object') {
      return Object.values(value).reduce((sum: number, v) => sum + countMeaningful(v), 0);
    }
    return 0;
  };
  return Object.entries(sections).reduce(
    (sum, [key, value]) => (key === 'contact' || key === 'billing' ? sum : sum + countMeaningful(value)),
    0
  );
}

/**
 * True dacă avem un nume real (nu doar email/telefon) — merită sunat.
 * Caută în `personal`, `billing` ȘI `contact`: la extras CF / servicii pe
 * proprietate numele stă doar în `billing` (audit 14.09: 162 de comenzi
 * ascunse din coadă pentru că se citea doar personal/contact).
 */
export function hasIdentifiableName(customerData: unknown): boolean {
  return identifiableName(customerData) !== null;
}

/** Primul (prenume, nume) găsit în personal → billing → contact, sau null. */
export function identifiableName(customerData: unknown): { firstName: string; lastName: string } | null {
  if (!customerData || typeof customerData !== 'object') return null;
  const sections = customerData as Record<string, { firstName?: unknown; lastName?: unknown } | undefined>;
  for (const key of ['personal', 'billing', 'contact']) {
    const s = sections[key];
    const first = (s?.firstName ?? '').toString().trim();
    const last = (s?.lastName ?? '').toString().trim();
    if (first.length > 0 || last.length > 0) return { firstName: first, lastName: last };
  }
  return null;
}

// Romanian mobile numbers: optional +40/0040/0 prefix, then 7 + 8 digits.
// Anything with a phone that doesn't match this pattern is treated as a
// foreign number for call-prioritization purposes (diaspora customers).
const RO_MOBILE_PATTERN = /^(\+?40|0)?7[0-9]{8}$/;

export function isForeignPhone(phone: string | null | undefined): boolean {
  if (!phone) return false;
  const digits = phone.replace(/[\s\-().]/g, '');
  return !RO_MOBILE_PATTERN.test(digits);
}
