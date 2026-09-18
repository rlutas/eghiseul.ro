/**
 * How complete a customer's profile is, and what is worth filling in next.
 *
 * Nothing here gates anything: a customer can order every service with an empty
 * account, and the wizard asks for whatever is missing. The point is only that
 * what they have already given us is not asked for again — so the checklist is
 * framed as "fewer steps next time", never as "you may not order".
 *
 * Pure on purpose: the account page, the services list and the tests all read
 * the same function instead of each deciding for itself what "complete" means.
 */

/**
 * The identity document is not a step of the account any more (18.09.2026).
 * Uploading it here meant a second ask right after the personal-data scan, and
 * a document that would be months old by the time an order needed it. The
 * order form asks for the document and the selfie itself, only for services
 * that need them, so what reaches the institution is always fresh.
 */
export type ProfileStepId = 'contact' | 'personal' | 'address' | 'billing';

export interface ProfileInput {
  firstName?: string | null;
  lastName?: string | null;
  cnp?: string | null;
  phone?: string | null;
  birthDate?: string | null;
  savedAddressCount?: number;
  billingProfileCount?: number;
}

export interface ProfileStep {
  id: ProfileStepId;
  /** Short label for the checklist row. */
  label: string;
  /** What the customer gains, in their words. */
  benefit: string;
  done: boolean;
  /** Tab of /account that completes it. */
  href: string;
}

export interface ProfileCompleteness {
  steps: ProfileStep[];
  doneCount: number;
  totalCount: number;
  /** 0–100, rounded. */
  percent: number;
  isComplete: boolean;
  /** The step to nudge next, or null when everything is done. */
  nextStep: ProfileStep | null;
}

/**
 * Same rule the account header already uses for the KYC badge: an identity
 * document on its own is not enough, the selfie is what makes it verifiable.
 */
const ID_FRONT_TYPES = ['ci_front', 'ci_nou_front', 'ci_vechi', 'act_identitate', 'passport', 'passport_opened'];
const SELFIE_TYPES = ['selfie'];

export function hasIdentityDocuments(kycDocumentTypes: string[] = []): boolean {
  const hasFront = kycDocumentTypes.some((t) => ID_FRONT_TYPES.includes(t));
  const hasSelfie = kycDocumentTypes.some((t) => SELFIE_TYPES.includes(t));
  return hasFront && hasSelfie;
}

function filled(value?: string | null): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

export function profileCompleteness(input: ProfileInput): ProfileCompleteness {
  const steps: ProfileStep[] = [
    {
      id: 'contact',
      label: 'Telefon de contact',
      benefit: 'Te sunăm doar dacă apare ceva de lămurit la comandă.',
      done: filled(input.phone),
      href: '/account/?tab=profile&edit=1',
    },
    {
      id: 'personal',
      label: 'Date personale',
      benefit: 'Nume, CNP și data nașterii — completate automat la fiecare comandă.',
      done: filled(input.firstName) && filled(input.lastName) && filled(input.cnp),
      href: '/account/?tab=profile&edit=1',
    },
    {
      id: 'address',
      label: 'Adresă de livrare',
      benefit: 'Alegi adresa dintr-o listă, în loc să o scrii de fiecare dată.',
      done: (input.savedAddressCount ?? 0) > 0,
      href: '/account/?tab=addresses&edit=1',
    },
    {
      id: 'billing',
      label: 'Date de facturare',
      benefit: 'Factura se emite pe datele salvate, fără să le mai introduci.',
      done: (input.billingProfileCount ?? 0) > 0,
      href: '/account/?tab=billing&edit=1',
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const totalCount = steps.length;

  return {
    steps,
    doneCount,
    totalCount,
    percent: Math.round((doneCount / totalCount) * 100),
    isComplete: doneCount === totalCount,
    nextStep: steps.find((s) => !s.done) ?? null,
  };
}
