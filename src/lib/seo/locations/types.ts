/**
 * Location SEO engine — tipuri.
 *
 * Datele instituționale REALE per oraș (biroul care eliberează documentul:
 * IPJ/DGPMB pentru cazier judiciar) sunt sursa de unicitate care face fiecare
 * pagină de oraș non-thin. Vezi docs/plans/2026-06-19-location-seo-engine.md și
 * contractul anti-thin (`quality.ts`).
 *
 * NB: NU inventa adrese/program. Câmpurile neverificate se lasă `undefined`, iar
 * `assertLocationPageQuality` blochează build-ul dacă lipsesc ancorele minime.
 */

/** Birou public emitent (IPJ / DGPMB / SPCRPCIV / OCPI). */
export interface InstitutionOffice {
  /** Numele complet al serviciului/biroului emitent. */
  name: string;
  /** Adresa fizică (stradă, număr, oraș). Ancora principală anti-thin. */
  address: string;
  postalCode?: string;
  phone?: string;
  /** URL-ul oficial al paginii instituției (politiaromana.ro etc.). */
  website?: string;
  /** Program cu publicul: zi -> interval (ex. { 'Luni': '08:30-12:30' }). */
  schedule?: Record<string, string>;
}

export interface CityFAQ {
  q: string;
  a: string;
}

/** Date per oraș pentru paginile de cazier judiciar/auto pe locație. */
export interface CityData {
  /** Segment URL, ex. "cluj-napoca". */
  slug: string;
  /** Nume afișat, ex. "Cluj-Napoca". */
  name: string;
  /** Județul, ex. "Cluj". */
  judet: string;
  /** Abrevierea subdomeniului poliției, ex. "cj" (cj.politiaromana.ro). */
  judetAbbr: string;
  population?: string;
  /** Biroul IPJ/DGPMB care eliberează cazierul judiciar. */
  ipj: InstitutionOffice;
  /**
   * 2-3 fraze de context local. OBLIGATORIU să conțină `name` — testul
   * anti-swap: dacă schimbi orașul, pagina nu mai e validă.
   */
  localContext: string;
  /** Minimum 2 întrebări specifice orașului. */
  localFaq: CityFAQ[];
  /** Slug-uri orașe apropiate, pentru internal linking spoke↔spoke. */
  nearbyCitySlugs: string[];
}
