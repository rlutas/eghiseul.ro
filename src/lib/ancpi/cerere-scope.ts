import type { CerereTemplate } from '@/lib/documents/cerere-extras-cf-pdf';

/**
 * Which orders the topograph has cereri to file for, and on which template.
 *
 * - extras-carte-funciara → Anexa 6 (his own form, frozen base)
 * - extras-plan-cadastral → the same form with the object swapped to "extras
 *   din planul cadastral, pe ortofotoplan" (ANCPI has no dedicated anexă for
 *   it; the OCPIs use a derivative of Anexa 1.30 with this same body)
 *
 * Identificare imobil (după adresă / după proprietar) stays OUT of this map:
 * the client gives an address or an owner, not a CF — the cerere de extras CF
 * only exists AFTER the collaborator identifies the property and reports the
 * CF number (see the identificare flow), and it is generated from HIS data.
 */
export const CERERE_SLUGS: Record<string, CerereTemplate> = {
  'extras-carte-funciara': 'cf',
  'extras-plan-cadastral': 'plan',
};

export const CERERE_CF_SLUG = 'extras-carte-funciara';

/**
 * Services where the deliverable starts from an address/owner: the collaborator
 * identifies the property first, reports the CF, and only then gets an extras-CF
 * cerere (Anexa 6) generated from his identification.
 */
export const IDENTIFICARE_SLUGS = ['identificare-imobil', 'identificare-imobile-proprietar'] as const;

/**
 * Statuses where the work is finished or dead — no cerere left to file. Kept as
 * a DENY list on purpose: a new intermediate status must not make an order
 * vanish from the collaborator's ZIP (see the admin status allow-list footgun).
 */
export const CERERE_DONE_STATUSES = [
  'document_ready',
  'shipped',
  'delivered',
  'completed',
  'cancelled',
  'refunded',
  'abandoned',
  'draft',
] as const;
