/**
 * Copy shared by more than one documentero page (FAQ on the home, the guide
 * list). Page-specific copy stays in the page. Written to the rules in
 * docs/documentero/continut-si-seo.md: short sentences, second person, what
 * happens at the counter, prices at the counter next to ours.
 */

export const HOME_FAQ = [
  {
    q: 'Cât durează?',
    a: 'Legal, până la 30 de zile de la depunere. În practică, multe primării eliberează în câteva zile. Adaugă curierul: 1–2 zile în România, 3–7 în străinătate.',
  },
  {
    q: 'Trebuie să merg la notar pentru împuternicire?',
    a: 'Nu. Împuternicirea avocațială se semnează electronic în formular și e recunoscută de starea civilă în temeiul Legii 119/1996.',
  },
  {
    q: 'Pot cere duplicatul pentru altcineva?',
    a: 'Pentru copilul tău minor, da. Pentru un adult, doar el poate semna împuternicirea, chiar dacă plătești tu.',
  },
  {
    q: 'Ce se întâmplă dacă primăria refuză?',
    a: 'Te sunăm, îți explicăm motivul și, dacă nu se poate rezolva, returnăm banii conform politicii de anulare.',
  },
  {
    q: 'Sunteți instituție de stat?',
    a: 'Nu. documentero.ro este un serviciu privat al eDigitalizare SRL. Certificatul îl eliberează exclusiv oficiul de stare civilă; noi facem drumul și dosarul în locul tău.',
  },
];

/**
 * The lawyer who files every documentero request. Facts from avocat-tarta.ro
 * (19.09.2026); shown on /despre/ and, as one line, on every service page.
 */
export const LAWYER = {
  name: 'Tarța Ana Gabriela',
  title: 'avocat, Baroul Satu Mare',
  experience: 'peste 8 ani de practică',
  office: 'Str. Mihai Viteazu nr. 20A, biroul 3, Satu Mare',
  areas: ['Drept civil', 'Dreptul familiei', 'Drept comercial', 'Drept imobiliar'],
  site: 'https://www.avocat-tarta.ro/',
  photo: '/images/documentero/avocat-tarta-ana-gabriela.webp',
} as const;

/**
 * Legal basis, spelled the same way on every page (and in the FAQ answer
 * about the lawyer). Hub MAI cites the same three when it says a request may
 * be filed by "avocați împuterniciți".
 */
export const LEGAL_BASIS = {
  short: 'Legea 119/1996, Legea 51/1995 și H.G. 255/2024',
  /** Genitive, for "în temeiul …". */
  shortGen: 'Legii 119/1996, Legii 51/1995 și H.G. 255/2024',
  long: 'Legea 119/1996 privind actele de stare civilă (art. 10), Legea 51/1995 privind profesia de avocat și Normele metodologice aprobate prin H.G. 255/2024',
  longGen: 'Legii 119/1996 privind actele de stare civilă (art. 10), al Legii 51/1995 privind profesia de avocat și al Normelor metodologice aprobate prin H.G. 255/2024',
} as const;

/**
 * Our own delivery figures: paid civil-status orders on this platform,
 * 07.07.2026 → 21.09.2026, days from payment to completion (courier
 * included). Median and 80th percentile; the sample is small and says so on
 * the page. Recompute by hand when the numbers move (query in
 * docs/documentero/analiza-competitori-seo.md §6.B).
 */
export const PROCESSING_STATS = {
  asOf: '2026-09-21',
  since: '7 iulie 2026',
  byService: {
    'certificat-nastere': { done: 11, medianDays: 19, p80Days: 23 },
    'certificat-casatorie': { done: 4, medianDays: 22, p80Days: 30 },
    'certificat-celibat': { done: 5, medianDays: 19, p80Days: 24 },
    'extras-multilingv-certificat-nastere': { done: 12, medianDays: 19, p80Days: 24 },
    'extras-multilingv-certificat-casatorie': { done: 3, medianDays: 12, p80Days: 12 },
  },
} as const;

const RO_MONTHS = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'];

/** '2026-09-21' → '21 septembrie 2026'. */
export function fmtDateRo(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${RO_MONTHS[m - 1]} ${y}`;
}

export interface GuideMeta {
  slug: string;
  title: string;
  desc: string;
  category: 'Naștere' | 'Căsătorie' | 'Celibat' | 'Diaspora';
  minutes: number;
  /** Only published guides have a page; the rest are the writing queue. */
  published: boolean;
}

export const GUIDES: GuideMeta[] = [
  { slug: 'certificat-de-nastere-pierdut', title: 'Certificat de naștere pierdut: ce faci în 2026', desc: 'Fără declarație la poliție, fără drum la primăria natală. Pașii, actele, termenul real.', category: 'Naștere', minutes: 7, published: true },
  { slug: 'acte-necesare-duplicat-certificat-de-nastere', title: 'Acte necesare pentru duplicatul certificatului de naștere (2026)', desc: 'Lista scurtă, pe cazuri: pentru tine, pentru copil, prin avocat, din străinătate. Plus sectoarele din București.', category: 'Naștere', minutes: 6, published: true },
  { slug: 'certificat-de-nastere-model-vechi', title: 'Certificatul vechi, tipizat, mai e valabil?', desc: 'Da în țară, cu limite la pașaport și în străinătate. Când merită schimbat.', category: 'Naștere', minutes: 4, published: false },
  { slug: 'procura-din-strainatate-notar-consulat-avocat', title: 'Procură din străinătate pentru acte de stare civilă: notar, consulat sau avocat', desc: 'Trei căi ca să ceară cineva în locul tău: ce costă, cât durează, ce poate merge prost.', category: 'Diaspora', minutes: 7, published: true },
  { slug: 'transcriere-certificat-de-nastere-strainatate', title: 'Transcrierea certificatului de naștere emis în străinătate', desc: 'Copil născut în Italia sau Spania: cum intră în registrele din România.', category: 'Diaspora', minutes: 8, published: false },
  { slug: 'apostila-acte-stare-civila', title: 'Apostila de la Haga pe acte de stare civilă: când e nevoie și când nu', desc: 'În UE o înlocuiește extrasul multilingv; în afara UE o pune Prefectura, pe original. Cine, cât durează, cât costă.', category: 'Diaspora', minutes: 6, published: true },
  { slug: 'valabilitate-certificat-de-celibat', title: 'Certificatul de celibat: valabilitate 6 luni sau 90 de zile?', desc: 'Amândouă sunt corecte, în contexte diferite. Când să-l comanzi.', category: 'Celibat', minutes: 4, published: false },
  { slug: 'acte-casatorie-in-strainatate', title: 'Acte pentru căsătoria în străinătate, pe țări', desc: 'Italia, Spania, Germania, Franța, UK: ce cer fiecare de la un cetățean român.', category: 'Celibat', minutes: 10, published: false },
  { slug: 'duplicat-certificat-de-casatorie-divort', title: 'Duplicat certificat de căsătorie cu mențiunea de divorț', desc: 'Când ai nevoie de el și de ce nu e același lucru cu sentința.', category: 'Căsătorie', minutes: 5, published: false },
];

/** Public path of a PUBLISHED guide; null for the queue (never link a card to the index). */
export function guideHref(g: GuideMeta): string | null {
  return g.published ? `/ghiduri/${g.slug}/` : null;
}

export function publishedGuides(): GuideMeta[] {
  return GUIDES.filter((g) => g.published);
}
