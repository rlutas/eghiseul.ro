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
  { slug: 'acte-necesare-duplicat-certificat-de-nastere', title: 'Acte necesare pentru duplicatul certificatului de naștere', desc: 'Ce aduci tu, ce facem noi, ce cere primăria pentru minor și pentru adult.', category: 'Naștere', minutes: 5, published: false },
  { slug: 'certificat-de-nastere-model-vechi', title: 'Certificatul vechi, tipizat, mai e valabil?', desc: 'Da în țară, cu limite la pașaport și în străinătate. Când merită schimbat.', category: 'Naștere', minutes: 4, published: false },
  { slug: 'transcriere-certificat-de-nastere-strainatate', title: 'Transcrierea certificatului de naștere emis în străinătate', desc: 'Copil născut în Italia sau Spania: cum intră în registrele din România.', category: 'Diaspora', minutes: 8, published: false },
  { slug: 'apostila-acte-stare-civila', title: 'Apostila de la Haga pe acte de stare civilă', desc: 'Cine o pune, cât durează, când nu e nevoie (extras multilingv).', category: 'Diaspora', minutes: 6, published: false },
  { slug: 'valabilitate-certificat-de-celibat', title: 'Certificatul de celibat: valabilitate 6 luni sau 90 de zile?', desc: 'Amândouă sunt corecte, în contexte diferite. Când să-l comanzi.', category: 'Celibat', minutes: 4, published: false },
  { slug: 'acte-casatorie-in-strainatate', title: 'Acte pentru căsătoria în străinătate, pe țări', desc: 'Italia, Spania, Germania, Franța, UK: ce cer fiecare de la un cetățean român.', category: 'Celibat', minutes: 10, published: false },
  { slug: 'duplicat-certificat-de-casatorie-divort', title: 'Duplicat certificat de căsătorie cu mențiunea de divorț', desc: 'Când ai nevoie de el și de ce nu e același lucru cu sentința.', category: 'Căsătorie', minutes: 5, published: false },
];

export function guideHref(g: GuideMeta): string {
  return g.published ? `/ghiduri/${g.slug}/` : '/ghiduri/';
}
