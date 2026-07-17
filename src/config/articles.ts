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
    slug: 'ancpi-nu-functioneaza',
    title: 'ANCPI nu funcționează: cădere națională a sistemelor (13–20 iulie 2026)',
    excerpt: 'Sistemele ANCPI sunt picate în toată țara din 13 iulie; revenire estimată: 20 iulie. Comandă extrasul CF acum — îl eliberăm automat la revenire, fără să urmărești tu site-urile.',
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
    slug: 'cat-poti-construi-pe-teren',
    title: 'Cât Poți Construi pe Terenul Tău? POT și CUT explicate simplu',
    excerpt: 'Formula: teren × POT / 100 = suprafața maximă la sol. De unde iei POT-ul, valorile legale pe zone, greșelile frecvente + calculator interactiv.',
    category: 'Cadastru & imobiliare',
  },
  {
    slug: 'extras-carte-funciara-gratuit',
    title: 'Extras de Carte Funciară Gratuit prin MyTerra — Ghid + Limite',
    excerpt: 'Cum obții gratuit extrasul de informare prin MyTerra (ANCPI), ce condiții sunt și când are sens varianta plătită, eliberată instant.',
    category: 'Cadastru & imobiliare',
  },
  {
    slug: 'certificat-constatator-cu-istoric',
    title: 'Certificat Constatator cu Istoric — Ce Conține, Preț, Cum Îl Obții',
    excerpt: 'Toate modificările firmei de la înființare: asociați, sedii, capital. Când ai nevoie de istoric și când ajunge certificatul de bază.',
    category: 'Firme & ONRC',
  },
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
  {
    slug: 'certificat-de-nastere-pierdut',
    title: 'Certificat de Naștere Pierdut: Ce Faci și Cum Obții Duplicatul',
    excerpt: 'Acte necesare, în cât timp se eliberează duplicatul, cât costă și ce faci dacă ai pierdut și buletinul.',
    category: 'Stare civilă',
    image: '/og/services/certificat-nastere.png',
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
    title: 'Acte Necesare Certificat de Naștere: Listă pe Situații',
    excerpt: 'Ce acte îți trebuie pentru duplicat, pentru un nou-născut și pentru eliberarea prin împuternicire.',
    category: 'Stare civilă',
    image: '/og/services/certificat-nastere.png',
  },
  {
    slug: 'transcriere-certificat-de-casatorie',
    title: 'Transcriere Certificat de Căsătorie din Străinătate',
    excerpt: 'Ce este transcrierea, ce acte îți trebuie (apostilă, traducere) și unde se depune cererea.',
    category: 'Stare civilă',
    image: '/og/services/certificat-casatorie.png',
  },
  {
    slug: 'model-certificat-de-casatorie',
    title: 'Model Certificat de Căsătorie: Cum Arată și Ce Conține',
    excerpt: 'Cum arată modelul actual, ce date conține și cum obții un exemplar oficial (duplicat).',
    category: 'Stare civilă',
    image: '/og/services/certificat-casatorie.png',
  },
  {
    slug: 'certificat-constatator-pentru-banca',
    title: 'Certificat Constatator pentru Bancă: De Ce Îl Cere și Cum Îl Obții',
    excerpt: 'Banca cere un certificat emis în ultimele 30 de zile. Vezi ce versiune îți trebuie și cum îl obții online.',
    category: 'Comercial / ONRC',
    image: '/og/services/certificat-constatator.png',
  },
  {
    slug: 'certificat-constatator-pentru-licitatie',
    title: 'Certificat Constatator pentru Licitație (SEAP/SICAP): Ghid Complet',
    excerpt: 'PDF-ul e-semnat este original și acceptat în SEAP. Atenție la termenul de 30 de zile, altfel rămâi descalificat.',
    category: 'Comercial / ONRC',
    image: '/og/services/certificat-constatator.png',
  },
  {
    slug: 'certificat-constatator-pentru-notar',
    title: 'Certificat Constatator pentru Notar: Ce Tip Îți Cere și Cum Îl Obții',
    excerpt: 'La cesiune de părți sociale, vânzare firmă sau acte imobiliare, notarul cere un certificat recent. Vezi care.',
    category: 'Comercial / ONRC',
    image: '/og/services/certificat-constatator.png',
  },
  {
    slug: 'certificat-constatator-pentru-fonduri-europene',
    title: 'Certificat Constatator pentru Fonduri Europene și APIA: Ghid Complet',
    excerpt: 'Necesar la dosarele de finanțare IMM și AFIR/APIA. Dovedește înregistrarea firmei și codul CAEN finanțat.',
    category: 'Comercial / ONRC',
    image: '/og/services/certificat-constatator.png',
  },
  {
    slug: 'certificat-de-celibat',
    title: 'Certificat de Celibat (Anexa 9): Ce Este și Cum Îl Obții',
    excerpt: 'Documentul legal e Anexa 9 (dovada de celibat). Vezi actele necesare, modelul și cum îl obții.',
    category: 'Stare civilă',
    image: '/og/services/certificat-celibat.png',
  },
  {
    slug: 'valabilitate-certificat-de-celibat',
    title: 'Valabilitate Certificat de Celibat: 6 Luni în România, 90 de Zile în Străinătate',
    excerpt: 'Două valori corecte, pentru contexte diferite. Vezi care se aplică la căsătoria în țară vs în străinătate.',
    category: 'Stare civilă',
    image: '/og/services/certificat-celibat.png',
  },
  {
    slug: 'certificat-de-celibat-pentru-casatorie-in-strainatate',
    title: 'Certificat de Celibat pentru Căsătorie în Străinătate: Apostilă și Traducere',
    excerpt: 'Pașii pentru diaspora: Anexa 9, apostilă de la Prefectură și traducere legalizată. Valabilitate 90 de zile.',
    category: 'Stare civilă',
    image: '/og/services/certificat-celibat.png',
  },
  {
    slug: 'duplicat-certificat-de-nastere',
    title: 'Duplicat Certificat de Naștere: Cum Îl Obții de la Orice Primărie',
    excerpt: 'Din 2023 se eliberează la orice primărie, în circa 30 de zile, adesea gratuit. Vezi actele necesare.',
    category: 'Stare civilă',
    image: '/og/services/certificat-nastere.png',
  },
  {
    slug: 'transcriere-certificat-de-nastere',
    title: 'Transcriere Certificat de Naștere din Străinătate: Ghid Complet',
    excerpt: 'Copilul născut în străinătate are nevoie de transcriere pentru CNP și act de identitate. Vezi pașii.',
    category: 'Stare civilă',
    image: '/og/services/certificat-nastere.png',
  },
  {
    slug: 'duplicat-certificat-de-casatorie',
    title: 'Duplicat Certificat de Căsătorie: Acte, Cost și Cum Îl Obții',
    excerpt: 'La pierdere, deteriorare sau schimbare de nume. Se obține de la starea civilă, online prin împuternicit.',
    category: 'Stare civilă',
    image: '/og/services/certificat-casatorie.png',
  },
  {
    slug: 'acte-necesare-casatorie',
    title: 'Acte Necesare Căsătorie: Dosarul Complet la Starea Civilă',
    excerpt: 'Declarația cu 10 zile înainte, certificatele medicale (valabile 14 zile) și restul actelor. Vezi lista completă.',
    category: 'Stare civilă',
    image: '/og/services/certificat-casatorie.png',
  },
  {
    slug: 'inregistrare-nastere-copil-nou-nascut',
    title: 'Înregistrarea Nașterii Copilului: Termen, Acte și Primul Certificat',
    excerpt: 'Termen legal de 30 de zile, actele necesare și cum obții primul certificat de naștere (gratuit) + CNP-ul.',
    category: 'Stare civilă',
    image: '/og/services/certificat-nastere.png',
  },
];
