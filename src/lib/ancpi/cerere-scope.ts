/**
 * Which orders the topograph still has cereri to file for.
 *
 * Only extras carte funciară for now — plan cadastral and identificare imobil
 * use different ANCPI forms we have not been given, so they are deliberately
 * out of scope (an order of those types must not silently get an Anexa 6).
 */
export const CERERE_CF_SLUG = 'extras-carte-funciara';

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
