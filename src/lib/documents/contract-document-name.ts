/**
 * The document the legal-assistance contract is concluded for, in the genitive:
 * „Contractul se încheie pe durata obținerii {{DOCUMENT_GENITIV}}."
 *
 * The sentence used to be fixed text in the template — „cazierului judiciar" —
 * so every lawyer service (celibat, naștere, cazier fiscal…) got a contract
 * that named the wrong document. Reported by the customer on E-261028-LJ9V3
 * (certificat de celibat), 12.11.2026.
 *
 * Every slug in LAWYER_SERVICE_SLUGS must have an entry — a unit test enforces
 * it, so a new lawyer service cannot ship with the wrong document name.
 */

const DOCUMENT_GENITIVE: Record<string, string> = {
  'cazier-judiciar': 'cazierului judiciar',
  'cazier-judiciar-persoana-fizica': 'cazierului judiciar',
  'cazier-judiciar-persoana-juridica': 'cazierului judiciar',
  'cazier-auto': 'cazierului auto',
  'cazier-fiscal': 'cazierului fiscal',
  'certificat-nastere': 'certificatului de naștere',
  'certificat-casatorie': 'certificatului de căsătorie',
  'certificat-celibat': 'certificatului de celibat',
  'certificat-integritate': 'certificatului de integritate comportamentală',
  'extras-multilingv-certificat-nastere': 'extrasului multilingv al actului de naștere',
  'extras-multilingv-certificat-casatorie': 'extrasului multilingv al actului de căsătorie',
};

/** Neutral wording for a service without an entry — never the wrong document. */
export const DOCUMENT_GENITIVE_FALLBACK = 'documentului solicitat';

export function contractDocumentGenitive(serviceSlug: string | null | undefined): string {
  return (serviceSlug && DOCUMENT_GENITIVE[serviceSlug]) || DOCUMENT_GENITIVE_FALLBACK;
}
