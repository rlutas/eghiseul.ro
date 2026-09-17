/**
 * How long the document a customer already received stays usable.
 *
 * The one thing the account can say that no email and no status page can: „the
 * cazier you ordered in March expires on the 3rd of September, and here is the
 * button to order another one". The validity itself is not ours to invent — it
 * is in `src/lib/lifecycle/rules.ts`, the same table the expiry emails use, with
 * the legal basis written next to each number (Legea 290/2004 art. 27 for the
 * cazier judiciar, OG 39/2015 art. 11 for the fiscal one, and so on).
 *
 * Certificates of civil status never expire and must never be given a date here.
 */

import { DOCUMENT_VALIDITY_DAYS, expiryDate } from '@/lib/lifecycle/rules';

export type ValidityState = 'valid' | 'expiring' | 'expired';

export interface DocumentValidity {
  state: ValidityState;
  date: Date;
  /** Whole days left; negative once expired. */
  daysLeft: number;
  /** The validity period itself, for wording like „6 luni de la eliberare". */
  totalDays: number;
}

/** Inside this many days of expiry, the account starts saying so. */
export const EXPIRY_WARNING_DAYS = 30;

/**
 * The validity of the document produced by a finished order, or `null` when
 * there is nothing honest to say — the order is not finished, the service has no
 * legal validity period, or we have no completion date to count from.
 *
 * `completed_at` is a proxy for the issue date: the institution issues the
 * document one to three days before we mark the order finished, so the date here
 * falls slightly early and never late.
 */
export function documentValidity(
  serviceSlug: string | null | undefined,
  completedAt: string | Date | null | undefined,
  now: Date = new Date()
): DocumentValidity | null {
  if (!serviceSlug || !completedAt) return null;

  const totalDays = DOCUMENT_VALIDITY_DAYS[serviceSlug];
  if (!totalDays) return null;

  const completed = completedAt instanceof Date ? completedAt : new Date(completedAt);
  if (Number.isNaN(completed.getTime())) return null;

  const date = expiryDate(completed, serviceSlug);
  if (!date) return null;

  // Counted in calendar days, not in hours: a document that expires later today
  // must read „expiră astăzi", not „mâine" because the hour of issue happens to
  // be later than the hour you are reading it.
  const daysLeft = Math.round((atMidnight(date) - atMidnight(now)) / 86_400_000);
  const state: ValidityState =
    daysLeft < 0 ? 'expired' : daysLeft <= EXPIRY_WARNING_DAYS ? 'expiring' : 'valid';

  return { state, date, daysLeft, totalDays };
}

function atMidnight(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/**
 * The sentence for the card. Always names the date — „mai ai 12 zile" without a
 * date is the kind of thing that needs a calendar to act on.
 */
export function validityLabel(validity: DocumentValidity): string {
  const date = validity.date.toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (validity.state === 'expired') return `Documentul a expirat pe ${date}`;
  if (validity.state === 'expiring') {
    const days =
      validity.daysLeft === 0
        ? 'astăzi'
        : validity.daysLeft === 1
          ? 'mâine'
          : `în ${validity.daysLeft} zile`;
    return `Documentul expiră ${days}, pe ${date}`;
  }
  return `Documentul e valabil până pe ${date}`;
}
