/**
 * Fully-automated services with NO lawyer involvement (ANCPI carte funciară /
 * plan cadastral / identificare imobil, ONRC certificat constatator).
 *
 * These get ONLY a "contract-prestari" (service-provision) document — never a
 * legal-assistance contract, împuternicire avocațială, cerere de eliberare, or
 * an allocated Barou delegation number.
 *
 * Single source of truth: both the auto-generation at submit
 * (`auto-generate.ts`) and the admin "Procesare comanda" UI
 * (`admin/orders/[id]/page.tsx`) read this list, so they cannot drift apart.
 *
 * NB: values are the exact DB `services.slug`. `extras-de-carte-funciara` is
 * kept as a safety alias for any caller that passes the route slug (with "de")
 * instead of the DB slug.
 */
export const NO_LAWYER_SERVICE_SLUGS = [
  'certificat-constatator', // ONRC certificat constatator
  'extras-carte-funciara', // ANCPI extras de carte funciară (DB slug)
  'extras-de-carte-funciara', // alias (route slug variant)
  'extras-plan-cadastral', // ANCPI extras de plan cadastral
  'identificare-imobil', // ANCPI identificare imobil după adresă
] as const;

export function isNoLawyerService(slug: string | null | undefined): boolean {
  return !!slug && (NO_LAWYER_SERVICE_SLUGS as readonly string[]).includes(slug);
}
