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
}

export const REUPLOAD_DOC_SPECS: Record<string, ReuploadDocSpec> = {
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
