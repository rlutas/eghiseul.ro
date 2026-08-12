/**
 * Which services involve the lawyer (avocat) — and which do NOT.
 *
 * ONLY services handled THROUGH the lawyer get the full legal document set:
 * contract de asistență juridică (with an allocated Barou number), împuternicire
 * avocațială (Barou delegation number) and cerere de eliberare.
 *
 * Everything else — fully-automated services (ONRC certificat constatator,
 * ANCPI carte funciară / plan cadastral / identificare imobil) and all the
 * imobiliare services fulfilled by the topograf collaborator — gets ONLY a
 * "contract-prestari" (service-provision) document + the invoice. No Barou
 * number is ever burned on them.
 *
 * The list is INVERTED on purpose (whitelist of lawyer services, everything
 * else = no lawyer): the imobiliare/automated catalogue keeps growing, and a
 * new service silently inheriting the lawyer document set is exactly the bug
 * this file exists to prevent (E-260810-EP896 — Plan de Amplasament got a
 * contract de asistență + Barou number 006024).
 *
 * Single source of truth: auto-generation at submit/post-payment
 * (`auto-generate.ts`), the Barou sweep (`ensure-barou-documents.ts`), the
 * manual generator (`api/admin/orders/[id]/generate-document`), the admin
 * "Procesare comandă" UI and the avocat order scoping all read from here.
 *
 * Values are the exact DB `services.slug`.
 */
export const LAWYER_SERVICE_SLUGS = [
  'cazier-judiciar', // legacy/generic cazier judiciar
  'cazier-judiciar-persoana-fizica',
  'cazier-judiciar-persoana-juridica',
  'cazier-auto',
  'cazier-fiscal',
  'certificat-nastere',
  'certificat-casatorie',
  'certificat-celibat',
  'certificat-integritate',
  'extras-multilingv-certificat-nastere',
  'extras-multilingv-certificat-casatorie',
] as const;

export function isLawyerService(slug: string | null | undefined): boolean {
  return !!slug && (LAWYER_SERVICE_SLUGS as readonly string[]).includes(slug);
}

/**
 * True for every service that does NOT go through the lawyer.
 *
 * A missing/empty slug is deliberately NOT treated as "no lawyer": the caller
 * failed to resolve the service, and skipping the legal documents would be the
 * damaging direction of the error.
 */
export function isNoLawyerService(slug: string | null | undefined): boolean {
  if (!slug) return false;
  return !isLawyerService(slug);
}
