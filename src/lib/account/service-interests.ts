/**
 * The one question the account asks a new customer: what do you come here for?
 *
 * Faza 2 of `docs/dashboard-client/PLAN.md`. The answer has exactly one job —
 * decide whether the account asks for an identity document at all. 11 of the 31
 * active services have `personalKyc.enabled`; the other 20 do not, and we do not
 * hand an identity document to ONRC either, so someone who only ever wants a
 * certificat constatator or an extras de carte funciară must never be asked for
 * one in their account.
 *
 * Four groups, not six categories: „auto" and „fiscale" hold one service each
 * and mean nothing on their own to the person reading the question.
 *
 * Skipping is a first-class answer. A skipped question leaves the account
 * exactly as the order left it — it never means „ask for everything".
 */

export type InterestId = 'caziere' | 'stare-civila' | 'imobile' | 'firma';

export interface InterestGroup {
  id: InterestId;
  /** The answer, as the customer reads it. */
  label: string;
  /** What falls under it, so nobody has to guess. */
  examples: string;
  /** Service categories (the `services.category` column) this answer covers. */
  categories: string[];
  /**
   * Whether services in this group ask for an identity document.
   *
   * Written down here as the answer expected from today's catalogue, and
   * checked against the live `verification_config` of every active service by
   * `tests/unit/lib/account/service-interests.test.ts` via the catalogue
   * snapshot — so a service that changes its configuration shows up as a failed
   * test instead of a question that quietly lies.
   */
  expectsIdentity: boolean;
}

export const INTEREST_GROUPS: readonly InterestGroup[] = [
  {
    id: 'caziere',
    label: 'Caziere și certificate despre mine',
    examples: 'Cazier judiciar, cazier fiscal, cazier auto, certificat de integritate',
    categories: ['juridice', 'fiscale', 'auto'],
    expectsIdentity: true,
  },
  {
    id: 'stare-civila',
    label: 'Acte de stare civilă',
    examples: 'Certificat de naștere, de căsătorie, de celibat, extrase multilingve',
    categories: ['personale'],
    expectsIdentity: true,
  },
  {
    id: 'imobile',
    label: 'Acte despre un imobil sau un teren',
    examples: 'Extras de carte funciară, plan cadastral, releveu, certificat de urbanism',
    categories: ['imobiliare'],
    expectsIdentity: false,
  },
  {
    id: 'firma',
    label: 'Acte despre o firmă',
    examples: 'Certificat constatator ONRC',
    categories: ['comerciale'],
    expectsIdentity: false,
  },
] as const;

const BY_ID = new Map(INTEREST_GROUPS.map((g) => [g.id, g]));

export function isInterestId(value: string): value is InterestId {
  return BY_ID.has(value as InterestId);
}

/** Drops anything unknown, so a stale value in the database cannot widen a question. */
export function parseInterests(stored: unknown): InterestId[] {
  if (!Array.isArray(stored)) return [];
  const seen = new Set<InterestId>();
  for (const value of stored) {
    if (typeof value === 'string' && isInterestId(value)) seen.add(value);
  }
  return [...seen];
}

export function interestGroup(id: InterestId): InterestGroup | undefined {
  return BY_ID.get(id);
}

/** The service categories the customer said they care about. */
export function categoriesForInterests(interests: InterestId[]): string[] {
  return [...new Set(interests.flatMap((id) => BY_ID.get(id)?.categories ?? []))];
}

/**
 * Whether the account should ask this customer for an identity document.
 *
 * `null` (nothing recorded, or the question was skipped) is NOT the same as an
 * answer: the caller keeps whatever behaviour it had, because we know nothing
 * about this person yet. Only an explicit answer can remove the request.
 */
export function interestsRequireIdentity(interests: InterestId[] | null | undefined): boolean | null {
  if (!interests || interests.length === 0) return null;
  return interests.some((id) => BY_ID.get(id)?.expectsIdentity === true);
}

/**
 * The sentence shown right after the question is answered.
 *
 * The plan's own test for the question (§3.6): it must be possible to say
 * „because you answered X, the account no longer asks you for Y". If we cannot
 * say that, the question is not worth asking.
 */
export function interestConsequence(interests: InterestId[]): string | null {
  const needsIdentity = interestsRequireIdentity(interests);
  if (needsIdentity === null) return null;
  if (needsIdentity) {
    return 'Pentru ce ai ales, instituția cere actul de identitate — îl fotografiezi direct în comandă, ca să fie mereu actual.';
  }
  return 'Pentru ce ai ales nu e nevoie de act de identitate, așa că nu ți-l cerem. Nici noi nu depunem act la ONRC sau la ANCPI.';
}

/**
 * Sorts a list of services so the ones the customer asked about come first.
 * Stable: everything else keeps the order it came in.
 */
export function sortByInterest<T extends { category?: string | null }>(
  services: T[],
  interests: InterestId[]
): T[] {
  if (interests.length === 0) return services;
  const wanted = new Set(categoriesForInterests(interests));
  return [...services].sort((a, b) => {
    const aWanted = wanted.has(a.category ?? '') ? 0 : 1;
    const bWanted = wanted.has(b.category ?? '') ? 0 : 1;
    return aWanted - bWanted;
  });
}
