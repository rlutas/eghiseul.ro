/**
 * Identity documents the ACCOUNT can hold.
 *
 * The order wizard lets the customer say which identity document they own
 * (`DocumentTypePicker`: `ci_vechi` | `ci_nou` | `passport`) and then asks only
 * for what that choice needs. The account's identity tab used to know three
 * types (`ci_front`, `ci_back`, `selfie`), so a customer with a new electronic
 * CI or a passport could not prepare their account at all.
 *
 * This module is the single source of truth for that mapping, shared by the
 * account UI and by `POST /api/user/kyc/save`. The stored names are the ones
 * the DB CHECK accepts (migration 171) and the ones the wizard writes, so a
 * document uploaded in the account and one uploaded during an order are the
 * same row type.
 */

import type { IdDocumentType } from '@/components/orders/modules/personal-kyc/DocumentTypePicker';

export type { IdDocumentType };

/** The personal documents the account asks for, by their stored name. */
export type AccountKycDocumentType =
  | 'ci_front'
  | 'ci_nou_back'
  | 'passport_opened'
  | 'selfie'
  | 'certificat_domiciliu'
  | 'residence_permit'
  | 'permis_fata';

/**
 * Stored names that mean the same physical document. Rows written before the
 * picker existed (and rows written by the wizard's manual route) use different
 * names for the same thing, and the account must recognise them — otherwise a
 * customer who scanned during an order is asked to upload it again.
 */
const DOCUMENT_TYPE_ALIASES: Record<AccountKycDocumentType, readonly string[]> = {
  ci_front: ['ci_front', 'ci_nou_front', 'ci_vechi', 'act_identitate'],
  ci_nou_back: ['ci_nou_back', 'ci_back', 'act_identitate_back'],
  passport_opened: ['passport_opened', 'passport'],
  selfie: ['selfie', 'selfie_with_id'],
  certificat_domiciliu: ['certificat_domiciliu', 'address_certificate'],
  residence_permit: ['residence_permit'],
  permis_fata: ['permis_fata'],
};

/** Every stored name that counts as the given account document. */
export function documentTypeAliases(type: AccountKycDocumentType): readonly string[] {
  return DOCUMENT_TYPE_ALIASES[type];
}

/** Is a document of this kind already on file? */
export function hasDocument(
  type: AccountKycDocumentType,
  storedTypes: readonly string[]
): boolean {
  const aliases = DOCUMENT_TYPE_ALIASES[type];
  return storedTypes.some((stored) => aliases.includes(stored));
}

/**
 * What each picker choice needs, WITHOUT the selfie.
 *
 * The back of an old CI (buletin) carries no data, so it is never asked for —
 * same rule the wizard applies in `PersonalDataStep`.
 */
const ID_DOCUMENTS_BY_CHOICE: Record<IdDocumentType, readonly AccountKycDocumentType[]> = {
  ci_vechi: ['ci_front'],
  ci_nou: ['ci_front', 'ci_nou_back'],
  passport: ['passport_opened'],
};

/** Always required on top of the identity document: it proves the person registering is the customer. */
export const SELFIE_DOCUMENT_TYPE: AccountKycDocumentType = 'selfie';

/** Useful for some services (cazier auto, foreign citizens, address proof) but never required to be verified. */
export const OPTIONAL_DOCUMENT_TYPES = [
  'certificat_domiciliu',
  'residence_permit',
  'permis_fata',
] as const satisfies readonly AccountKycDocumentType[];

/** Everything the account must hold for a given identity document, selfie included. */
export function requiredDocumentsFor(choice: IdDocumentType): AccountKycDocumentType[] {
  return [...ID_DOCUMENTS_BY_CHOICE[choice], SELFIE_DOCUMENT_TYPE];
}

/** The identity documents only (no selfie) — used to label the chosen-document summary. */
export function identityDocumentsFor(choice: IdDocumentType): AccountKycDocumentType[] {
  return [...ID_DOCUMENTS_BY_CHOICE[choice]];
}

/** What is still missing, in the order it is asked for. */
export function missingDocumentsFor(
  choice: IdDocumentType,
  storedTypes: readonly string[]
): AccountKycDocumentType[] {
  return requiredDocumentsFor(choice).filter((type) => !hasDocument(type, storedTypes));
}

/** Is the account complete for this identity document? */
export function isCompleteFor(
  choice: IdDocumentType,
  storedTypes: readonly string[]
): boolean {
  return missingDocumentsFor(choice, storedTypes).length === 0;
}

/**
 * Guess which document the customer holds from what is already on file, so a
 * returning customer is not asked to pick again. A passport wins over a CI
 * (it is only ever uploaded deliberately), and a new-CI back means the new CI.
 * Returns null when nothing identity-shaped is on file — then we ask.
 */
export function detectIdDocumentType(storedTypes: readonly string[]): IdDocumentType | null {
  if (hasDocument('passport_opened', storedTypes)) return 'passport';
  if (hasDocument('ci_nou_back', storedTypes)) return 'ci_nou';
  if (hasDocument('ci_front', storedTypes)) return 'ci_vechi';
  return null;
}

/**
 * Which OCR extractor `POST /api/ocr/extract` (mode `specific`) runs for a
 * document. Documents absent from this map are stored as-is for manual review.
 */
const OCR_DOCUMENT_TYPES: Partial<
  Record<AccountKycDocumentType, 'ci_front' | 'ci_nou_back' | 'passport_opened'>
> = {
  ci_front: 'ci_front',
  ci_nou_back: 'ci_nou_back',
  passport_opened: 'passport_opened',
};

export function ocrDocumentTypeFor(
  type: AccountKycDocumentType
): 'ci_front' | 'ci_nou_back' | 'passport_opened' | null {
  return OCR_DOCUMENT_TYPES[type] ?? null;
}

/**
 * Gemini's confidence is unreliable — it returns 0 on documents it read
 * perfectly (see the note in `PersonalDataStep`). Rejecting on confidence
 * alone threw away good scans, so we accept a result whose DATA is usable:
 * a CNP, a full name, or (for the back of a new CI) an address.
 */
export function isOcrResultUsable(ocr: {
  success?: boolean;
  confidence?: number;
  extractedData?: {
    cnp?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    address?: unknown;
  } | null;
} | null | undefined): boolean {
  if (!ocr?.success) return false;
  if ((ocr.confidence ?? 0) >= 50) return true;

  const data = ocr.extractedData;
  if (!data) return false;
  if ((data.cnp ?? '').replace(/\D/g, '').length === 13) return true;
  if (data.firstName && data.lastName) return true;
  return !!data.address;
}

/** The company documents, stored in the same table. */
export const COMPANY_KYC_DOCUMENT_TYPES = [
  'company_registration_cert',
  'company_statement_cert',
] as const;

export function isCompanyDocumentType(stored: string): boolean {
  return (COMPANY_KYC_DOCUMENT_TYPES as readonly string[]).includes(stored);
}

/**
 * Every `document_type` the table accepts. MUST stay in sync with the CHECK
 * constraint (migration 171) — a value missing here is refused by the API, a
 * value missing there is refused by Postgres.
 */
export const STORABLE_KYC_DOCUMENT_TYPES = [
  'ci_front',
  'ci_back',
  'ci_nou_front',
  'ci_nou_back',
  'ci_vechi',
  'act_identitate',
  'act_identitate_back',
  'passport',
  'passport_opened',
  'ro_cei_reader_pdf',
  'selfie',
  'address_certificate',
  'certificat_domiciliu',
  'residence_permit',
  'permis_fata',
  'permis_verso',
  ...COMPANY_KYC_DOCUMENT_TYPES,
] as const;

export function isStorableKycDocumentType(stored: string): boolean {
  return (STORABLE_KYC_DOCUMENT_TYPES as readonly string[]).includes(stored);
}

/**
 * Documents that establish WHO the person is. Only these flip
 * `profiles.kyc_verified`: a driving licence or a residence permit is useful
 * to an order but says nothing about the identity check being done.
 */
/**
 * Documents that establish WHO someone is.
 *
 * The selfie is deliberately NOT here. It is the check that the person holding
 * the document is the person in it — on its own, a face identifies nobody. Both
 * callers of `isIdentityDocumentType` gate an identity bypass on it
 * (`profiles.kyc_verified` in api/user/kyc/save, `has_valid_kyc` in
 * api/user/prefill-data), and the wizard skips its whole KYC step when either is
 * true. With the selfie in this list, uploading one alone would have been enough
 * to order a cazier with no document on file.
 */
const IDENTITY_DOCUMENT_TYPES: readonly string[] = [
  ...DOCUMENT_TYPE_ALIASES.ci_front,
  ...DOCUMENT_TYPE_ALIASES.ci_nou_back,
  ...DOCUMENT_TYPE_ALIASES.passport_opened,
];

/** Selfie types, kept separate because a selfie is a check, not a document. */
export function isSelfieType(stored: string): boolean {
  return (DOCUMENT_TYPE_ALIASES.selfie as readonly string[]).includes(stored);
}

export function isIdentityDocumentType(stored: string): boolean {
  return IDENTITY_DOCUMENT_TYPES.includes(stored);
}

/**
 * Documents whose OCR data may fill the profile, the saved address and the PF
 * billing profile. The back of a new CI carries the address; the front of a CI
 * and the passport carry name, CNP and birth data.
 */
const PROFILE_SOURCE_DOCUMENT_TYPES: readonly string[] = [
  ...DOCUMENT_TYPE_ALIASES.ci_front,
  ...DOCUMENT_TYPE_ALIASES.ci_nou_back,
  ...DOCUMENT_TYPE_ALIASES.passport_opened,
  'ro_cei_reader_pdf',
];

export function fillsProfileFromOcr(stored: string): boolean {
  return PROFILE_SOURCE_DOCUMENT_TYPES.includes(stored);
}

/**
 * „KYC verificat" = an identity document AND the selfie holding it. Either one
 * alone proves nothing: the document could be anyone's, the selfie shows a
 * face with no name. This is the one predicate behind `profiles.kyc_verified`,
 * `has_valid_kyc` in prefill and the order-submit bypass — they used to
 * disagree, and a scanned front alone let a cazier order skip its documents
 * (E-260918-SJCQY, 18.09.2026).
 */
export function hasCompleteKyc(storedTypes: readonly string[]): boolean {
  return storedTypes.some(isIdentityFrontType) && storedTypes.some(isSelfieType);
}

/**
 * The side of the document that carries the person: a CI front or a
 * passport's data page. The back of a new CI carries the address and proves
 * nothing about identity, so „verso + selfie" must not count as complete.
 */
const IDENTITY_FRONT_TYPES: readonly string[] = [
  ...DOCUMENT_TYPE_ALIASES.ci_front,
  ...DOCUMENT_TYPE_ALIASES.passport_opened,
];

export function isIdentityFrontType(stored: string): boolean {
  return IDENTITY_FRONT_TYPES.includes(stored);
}
