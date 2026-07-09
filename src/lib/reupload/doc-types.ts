/**
 * Shared catalog for the "Solicită documente" (document re-upload) flow.
 * Used by: the admin request endpoint + modal, the public token-gated upload
 * API/page, and the customer status page banner.
 *
 * `target` says where the uploaded file lands inside orders.customer_data:
 *   - 'personal' → personal / personalData .uploadedDocuments (KYC shapes)
 *   - 'company'  → company.uploadedDocuments (PJ documents)
 */

export interface ReuploadDocSpec {
  /** Human label shown to both the team and the customer. */
  label: string;
  /** Short hint shown on the upload card. */
  hint: string;
  target: 'personal' | 'company';
  /** Company paperwork usually arrives as PDF; ID photos are images only. */
  acceptsPdf: boolean;
  /**
   * Optional companion of another doc type: not selectable in the admin
   * modal and not required for completion, but offered as an extra upload
   * slot on the customer page whenever its parent type is requested
   * (e.g. the back of a generic ID — passports have no back).
   */
  companionOf?: string;
}

export const REUPLOAD_DOC_SPECS: Record<string, ReuploadDocSpec> = {
  // Generic ID — use when you don't know which document the customer holds.
  // Lands as type 'act_identitate', which the /submit KYC guard accepts as a
  // manual ID (same type the wizard's manual route writes).
  act_identitate: {
    label: 'Act de identitate — față (CI sau pașaport)',
    hint: 'Poză clară cu fața buletinului sau pagina cu poza din pașaport, toate datele lizibile',
    target: 'personal',
    acceptsPdf: false,
  },
  act_identitate_back: {
    label: 'Act de identitate — verso',
    hint: 'Doar pentru carte de identitate — versoul actului (la pașaport nu e cazul)',
    target: 'personal',
    acceptsPdf: false,
    companionOf: 'act_identitate',
  },
  selfie: {
    label: 'Selfie cu actul de identitate',
    hint: 'Fața și actul de identitate vizibile, bine luminate',
    target: 'personal',
    acceptsPdf: false,
  },
  ci_vechi: {
    label: 'Carte de identitate (model vechi)',
    hint: 'Fața cărții de identitate, toate datele lizibile',
    target: 'personal',
    acceptsPdf: false,
  },
  ci_nou_front: {
    label: 'Carte de identitate nouă — față',
    hint: 'Fața cărții electronice de identitate',
    target: 'personal',
    acceptsPdf: false,
  },
  ci_nou_back: {
    label: 'Carte de identitate nouă — verso',
    hint: 'Versoul cărții electronice de identitate',
    target: 'personal',
    acceptsPdf: false,
  },
  passport: {
    label: 'Pașaport',
    hint: 'Pagina cu poza, complet vizibilă',
    target: 'personal',
    acceptsPdf: false,
  },
  certificat_domiciliu: {
    label: 'Certificat de domiciliu',
    hint: 'Document care atestă adresa de domiciliu',
    target: 'personal',
    acceptsPdf: true,
  },
  permis_fata: {
    label: 'Permis de conducere — față',
    hint: 'Poză clară cu fața permisului de conducere, numărul și datele lizibile',
    target: 'personal',
    acceptsPdf: false,
  },
  permis_verso: {
    label: 'Permis de conducere — verso',
    hint: 'Versoul permisului de conducere (categoriile vizibile)',
    target: 'personal',
    acceptsPdf: false,
    companionOf: 'permis_fata',
  },
  company_registration_cert: {
    label: 'Certificat de Înregistrare (firmă)',
    hint: 'Documentul cu CUI-ul firmei, emis de Registrul Comerțului',
    target: 'company',
    acceptsPdf: true,
  },
  company_statement_cert: {
    label: 'Certificat Constatator (firmă)',
    hint: 'Certificat constatator ONRC, în termen de valabilitate',
    target: 'company',
    acceptsPdf: true,
  },
};

export function isKnownReuploadDocType(type: string): boolean {
  return Object.prototype.hasOwnProperty.call(REUPLOAD_DOC_SPECS, type);
}

export function reuploadDocLabel(type: string): string {
  return REUPLOAD_DOC_SPECS[type]?.label ?? type;
}

/**
 * Which documents the SERVICE itself requires, derived from its
 * verification_config — used by the admin "Solicită documente" modal to
 * pre-check the right boxes per service (CI + selfie where personal KYC is
 * on; certificat înregistrare/constatator where company documents are
 * required). The operator can always add/remove anything from the catalog.
 */
export function suggestedDocsForService(verificationConfig: unknown): string[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vc = verificationConfig as any;
  const out: string[] = [];
  const pk = vc?.personalKyc;
  if (pk?.enabled) {
    out.push('act_identitate');
    if (pk.selfieRequired) out.push('selfie');
    // Service-specific extra documents (e.g. cazier auto → permis fata/verso)
    if (Array.isArray(pk.extraDocuments)) {
      for (const t of pk.extraDocuments) {
        if (typeof t === 'string' && isKnownReuploadDocType(t)) out.push(t);
      }
    }
  }
  const ck = vc?.companyKyc;
  if (ck?.enabled && ck?.documentsRequired && Array.isArray(ck.requiredDocuments)) {
    for (const t of ck.requiredDocuments) {
      if (typeof t === 'string' && isKnownReuploadDocType(t)) out.push(t);
    }
  }
  return out;
}

/**
 * Order statuses eligible for the automatic standby park while waiting on the
 * customer. Terminal/pre-payment states are left untouched — pausing the SLA
 * of an unpaid or finished order makes no sense.
 */
export const STANDBY_ELIGIBLE_STATUSES = new Set([
  'paid',
  'processing',
  'documents_generated',
  'submitted_to_institution',
  'document_received',
  'extras_in_progress',
  'pending_documents',
]);
