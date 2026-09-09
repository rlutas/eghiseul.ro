/**
 * Blog/articles manifest — single source for the /blog archive index and any
 * "related articles" listing. Each entry maps to a page at root path
 * `/<slug>/` (WP URL parity) and a featured image at
 * `/images/articole/<slug>.webp`. Ordered by organic traffic (highest first).
 *
 * Keep `slug` in sync with HARDCODED_ARTICLE_SLUGS (sitemap source) in
 * `lib/seo/constants.ts`.
 */

export interface ArticleMeta {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  /** Override imaginea featured; fallback la /images/articole/<slug>.webp. */
  image?: string;
}

export const ARTICLES: ArticleMeta[] = [
  {
    slug: 'cazier-si-certificat-de-integritate-pentru-profesori',
    title: 'Cazier și certificat de integritate pentru profesori: ghid pentru începutul anului școlar',
    excerpt:
      'Cine trebuie să le prezinte la angajarea în învățământ, de ce nu se depun din nou la fiecare 6 luni și când să le ceri ca să le ai la 1 septembrie. Plus rutele gratuite.',
    category: 'Juridice',
  },
  {
    slug: 'tva-9-locuinte-31-iulie-2026',
    title: 'TVA 9% Locuințe: Termen 30 Septembrie 2026 (Legea 161/2026)',
    excerpt:
      'Legea 161/2026 (M. Of. 642/4.08.2026) a mutat termenul de livrare cu TVA 9% la 30 septembrie 2026. Condițiile nu s-au schimbat: antecontract până la 1 august 2025, 120 mp, 600.000 lei. Cine a plătit 21% între 1 și 6 august poate cere diferența din 1 octombrie.',
    category: 'Cadastru & imobiliare',
  },
  {
    slug: 'ancpi-nu-functioneaza',
    title: 'ANCPI și e-Terra nu funcționează: atac ransomware, sisteme picate național (din 13 iulie 2026)',
    excerpt: 'Guvernul a confirmat atac ransomware: infrastructură de virtualizare criptată și ștearsă, fără dată de repornire pentru e-Terra. Comandă extrasul CF acum — îl eliberăm automat la revenire.',
    category: 'Cadastru & imobiliare',
  },
  {
    slug: 'verificare-proprietar-imobil',
    title: 'Cum Afli Cine e Proprietarul unui Imobil (după Adresă sau CF)',
    excerpt: 'Numele proprietarului apare într-un singur document: extrasul de carte funciară — și îl poate cere oricine, legal. Metodele reale, cu costuri, plus ce NU îți arată geoportalul și primăria.',
    category: 'Cadastru & imobiliare',
  },
  {
    slug: 'sms-fals-amenda-ghiseul-ro',
    title: 'SMS Fals cu Amendă de la „Ministerul Transporturilor”: frauda care imită Ghișeul.ro',
    excerpt: 'DNSC avertizează: SMS-uri cu amenzi false trimit șoferii pe ghiiseul.cc, clonă care fură datele cardului. Cum recunoști mesajul și ce faci dacă ai introdus cardul.',
    category: 'Auto & amenzi',
  },
  {
    slug: 'cat-costa-cadastrul-si-intabularea',
    title: 'Cât Costă Cadastrul și Intabularea în 2026? Prețuri reale + acte necesare',
    excerpt: 'Apartament 820–1.220 lei, casă cu teren 1.520–2.620 lei, intabulare după cumpărare 0,15% din preț. Taxele ANCPI exacte, actele pe scenarii + checklist descărcabil.',
    category: 'Cadastru & imobiliare',
  },
  {
    slug: 'extras-carte-funciara-gratuit',
    title: 'Extras de Carte Funciară Gratuit prin MyTerra — Ghid + Limite',
    excerpt: 'Cum obții gratuit extrasul de informare prin MyTerra (ANCPI), ce condiții sunt și când are sens varianta plătită, eliberată instant.',
    category: 'Cadastru & imobiliare',
  },
  {
    slug: 'tabel-varsta-pensionare-anticipata-femei',
    title: 'Tabel Vârstă Pensionare Anticipată Femei',
    excerpt: 'Tabelul complet cu vârsta de pensionare anticipată pentru femei, în funcție de stagiul de cotizare.',
    category: 'Pensii',
  },
  {
    slug: 'cum-aflam-numarul-carte-functionara-si-nr-cadastral',
    title: 'Numărul cadastral și numărul de carte funciară: cum le afli',
    excerpt: 'Din actul de proprietate, dintr-un extras vechi sau după adresă. De ce niciun număr nu e unic la nivel național și cum localizezi terenul pe hartă.',
    category: 'Cadastru & imobiliare',
  },
  {
    slug: 'cazier-fiscal-fara-spv',
    title: 'Cazier fiscal din SPV: cum îl ceri online și ce faci fără cont',
    excerpt:
      'Pașii din Spațiul Privat Virtual, formularele 502 și 504, și alternativele când nu poți trece de activarea contului.',
    category: 'Documente fiscale',
  },
  {
    slug: 'anii-lucrati-in-strainatate-se-pun-la-pensie-in-romania',
    title: 'Anii Lucrați în Străinătate se Pun la Pensie în România?',
    excerpt: 'Cum se iau în calcul perioadele lucrate în UE/SEE la pensia din România: totalizare și pro rata temporis.',
    category: 'Pensii',
  },
  {
    slug: 'ghid-complet-certificat-de-integritate-comportamentala',
    title: 'Certificat de Integritate Comportamentală: Ghid Complet',
    excerpt: 'Ce verifică efectiv (Legea 118/2019), de ce reabilitarea nu îl curăță, ce a schimbat Legea 38/2026 pentru angajatori și cum îl obții gratuit.',
    category: 'Juridice',
  },
  {
    slug: 'informatii-cazier-auto-online',
    title: 'Cazier Auto Online: Tot Ce Trebuie Să Știi',
    excerpt: 'Cum se numește oficial, ce conține, cât rămân sancțiunile în evidență (5 ani, nu 6 luni) și de ce nu îți schimbă prima RCA.',
    category: 'Auto',
  },
  {
    slug: 'amenda-rovinieta-2025-tarife-plata-online-ghid-complet',
    title: 'Amendă Rovinietă 2026: Tarife, Plată Online și Contestație',
    excerpt: 'Cuantumul pe categorii, de când curg cele 15 zile pentru jumătate din minim, cine răspunde la mașina vândută sau în leasing și ce se schimbă de la 1 octombrie 2026.',
    category: 'Auto',
  },
  {
    slug: 'cum-vor-arata-documentele-de-stare-civila-2025',
    title: 'Cum Arată Noile Documente de Stare Civilă (din 2025)',
    excerpt: 'Culorile, filigranul și codul unic de pe noile certificate, plus schimbarea care contează după SIIEASC: le poți cere de la orice primărie din țară.',
    category: 'Stare civilă',
  },
  {
    slug: 'taxa-cazier-judiciar',
    title: 'Taxa pentru cazier judiciar: cât e de fapt',
    excerpt: 'La ghișeu, cazierul e gratuit din 2017. Ce plătești când îl obții online și ce acte îți trebuie.',
    category: 'Juridice',
  },
  {
    slug: 'eliberare-certificat-constatator-onrc-ghid',
    title: 'Eliberare Certificat Constatator de la ONRC: Ghid Complet',
    excerpt: 'Actele necesare, procedura, ce informații conține și valabilitatea certificatului constatator.',
    category: 'Comercial / ONRC',
  },
  {
    slug: 'valabilitate-extras-de-carte-funciara',
    title: 'Valabilitate Extras de Carte Funciară: Cât Este Valabil',
    excerpt: 'Cât timp este valabil extrasul de carte funciară emis de ANCPI și când trebuie reînnoit.',
    category: 'Cadastru & imobiliare',
  },
  {
    slug: 'cele-4-tipuri-de-certificat-constatator-online',
    title: 'Tipurile de Certificat Constatator Online',
    excerpt: 'De bază, fonduri IMM, insolvență, pe persoană fizică și cu istoric — ce conține fiecare, când îl folosești și când merită luat direct de la ONRC prin InfoCert.',
    category: 'Comercial / ONRC',
  },
  {
    slug: 'totul-despre-cartea-funciara-colectiva',
    title: 'Cartea funciară colectivă, pe înțeles',
    excerpt: 'Ce descrie cartea colectivă a blocului, ce găsești în părțile A, B și C și cum obții extrasul.',
    category: 'Cadastru & imobiliare',
  },
  {
    slug: 'cazier-judiciar-vs-certificat-integritate-comportamentala',
    title: 'Cazier Judiciar vs Certificat de Integritate Comportamentală',
    excerpt: 'Diferențele dintre cele două documente: ce conțin, când sunt necesare și pentru ce tip de angajare.',
    category: 'Juridice',
  },
  {
    slug: 'rolul-si-atributiile-onrc-romania',
    title: 'Ce face ONRC, de fapt',
    excerpt: 'Registrul Comerțului, înmatriculările, mențiunile și certificatul constatator — pe scurt.',
    category: 'Comercial / ONRC',
  },
  {
    slug: 'schimbare-certificat-de-nastere-vechi',
    title: 'Schimbare Certificat de Naștere Vechi cu Unul Nou',
    excerpt: 'Când trebuie schimbat cu modelul actual, ce acte îți trebuie și cum obții duplicatul online.',
    category: 'Stare civilă',
    image: '/og/services/certificat-nastere.png',
  },
  {
    slug: 'acte-necesare-certificat-de-nastere',
    title: 'Certificatul de Naștere: Ghid Complet pe Situații',
    excerpt: 'Înregistrarea nou-născutului și ce se întâmplă după termen, exemplar nou după pierdere, copilul născut în străinătate și unde ți se cere certificatul. Cu articolele din Legea 119/1996 și HG 255/2024.',
    category: 'Stare civilă',
    image: '/og/services/certificat-nastere.png',
  },
  {
    slug: 'acte-necesare-casatorie',
    title: 'Acte Necesare Căsătorie: Dosarul, Termenele și Certificatul',
    excerpt: 'Dosarul de căsătorie (certificatul medical e valabil 30 de zile, nu 14), cum curg cele 10 zile de publicare, martorii, minorii, soțul străin. Plus duplicatul și transcrierea unei căsătorii din străinătate.',
    category: 'Stare civilă',
    image: '/og/services/certificat-casatorie.png',
  },
];
