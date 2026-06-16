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
}

export const ARTICLES: ArticleMeta[] = [
  {
    slug: 'tabel-varsta-pensionare-anticipata-femei',
    title: 'Tabel Vârstă Pensionare Anticipată Femei',
    excerpt: 'Tabelul complet cu vârsta de pensionare anticipată pentru femei, în funcție de stagiul de cotizare.',
    category: 'Pensii',
  },
  {
    slug: 'cum-aflam-numarul-carte-functionara-si-nr-cadastral',
    title: 'Cum Afli Numărul de Carte Funciară și Numărul Cadastral',
    excerpt: 'Din actul de proprietate, dintr-un extras vechi sau după adresă — unde apar aceste numere și cum le obții.',
    category: 'Cadastru & imobiliare',
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
    excerpt: 'Ce este, în ce diferă de cazierul judiciar, cine are nevoie de el (lucrul cu minori) și cum îl obții.',
    category: 'Juridice',
  },
  {
    slug: 'informatii-cazier-auto-online',
    title: 'Cazier Auto Online: Tot Ce Trebuie Să Știi',
    excerpt: 'Ce conține cazierul auto, cât se păstrează în evidență și cum îl obții online.',
    category: 'Auto',
  },
  {
    slug: 'amenda-rovinieta-2025-tarife-plata-online-ghid-complet',
    title: 'Amendă Rovinietă 2025: Tarife, Plată Online și Contestație',
    excerpt: 'Cuantumul amenzii pe categorii de vehicule, reducerea de 50% și modalitățile de plată online.',
    category: 'Auto',
  },
  {
    slug: 'cum-vor-arata-documentele-de-stare-civila-2025',
    title: 'Cum Vor Arăta Noile Documente de Stare Civilă',
    excerpt: 'Certificatele de naștere, căsătorie și deces în format electronic prin sistemul SIIEASC.',
    category: 'Stare civilă',
  },
  {
    slug: 'taxa-cazier-judiciar',
    title: 'Taxa Cazier Judiciar: Cost, Plată și Obținere',
    excerpt: 'Cât costă cazierul judiciar, unde se plătește și ce acte sunt necesare.',
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
    title: 'Cele 4 Tipuri de Certificat Constatator Online',
    excerpt: 'Furnizare informații, de bază, pentru fonduri IMM și pentru insolvență — ce conține fiecare și când îl folosești.',
    category: 'Comercial / ONRC',
  },
  {
    slug: 'totul-despre-cartea-funciara-colectiva',
    title: 'Tot Ce Trebuie Să Știi Despre Cartea Funciară Colectivă',
    excerpt: 'Ce este CF colectivă, ce conține extrasul, rolul asociației de proprietari și cotele indivize.',
    category: 'Cadastru & imobiliare',
  },
  {
    slug: 'cazier-judiciar-vs-certificat-integritate-comportamentala',
    title: 'Cazier Judiciar vs Certificat de Integritate Comportamentală',
    excerpt: 'Diferențele dintre cele două documente: ce conțin, când sunt necesare și pentru ce tip de angajare.',
    category: 'Juridice',
  },
  {
    slug: 'importanta-extras-de-carte-funciara-colectiva',
    title: 'De Ce Este Esențial un Extras de Carte Funciară Colectivă',
    excerpt: 'Situația tehnică, economică și juridică a imobilelor dintr-un condominiu și când îți trebuie.',
    category: 'Cadastru & imobiliare',
  },
  {
    slug: 'extras-de-carte-funciara-pentru-casa-verde',
    title: 'Extras de Carte Funciară pentru Casa Verde',
    excerpt: 'De ce ai nevoie de extrasul CF la dosarul Casa Verde, ce condiții îndeplinește și cum îl obții rapid.',
    category: 'Cadastru & imobiliare',
  },
  {
    slug: 'rolul-si-atributiile-onrc-romania',
    title: 'Rolul și Atribuțiile ONRC în România',
    excerpt: 'Ce este Registrul Comerțului, ce atribuții are și ce documente eliberează.',
    category: 'Comercial / ONRC',
  },
];
