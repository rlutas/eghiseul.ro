import { BASE_URL } from './constants';

/**
 * Autorul editorial al site-ului — o persoană reală, cu pagină proprie.
 *
 * Înainte, schema conținea un nod `Person` numit „Departamentul Juridic
 * eGhișeul.ro" (jobTitle „Echipă de specialiști drept administrativ"), pus ca
 * `reviewedBy` pe 30 de pagini, fără pagină de autor și, pe 29 dintre ele, fără
 * nimic vizibil în pagină. Un departament nu e o persoană, iar un autor pe care
 * nu-l poți deschide nu e un semnal de încredere — e fix opusul. Scos pe
 * 09.09.2026 și înlocuit cu asta.
 *
 * ⚠️ Regula: aici intră DOAR ce se poate verifica. Fără titluri inventate,
 * fără „expert" nesusținut. Google (și cititorul) verifică.
 */
export const SITE_AUTHOR = {
  name: 'Luțaș Raul Cătălin',
  /** Rolul real în firmă. */
  jobTitle: 'Fondator eGhișeul.ro',
  /** Calificarea, exact cum e — fără înflorituri. */
  credential: 'BSc Computing Technologies, University of Roehampton',
  path: '/despre-noi/raul-lutas/',
  /**
   * Profil public, pentru `sameAs`. Gol = nu se emite nimic în schema; NU pune
   * un URL pe care nu l-ai verificat că există și că e al persoanei.
   */
  linkedin: 'https://www.linkedin.com/in/raul-lutas-579045145',
  /**
   * Poză de profil, din `public/`. Gol = pagina afișează monograma cu inițiale.
   * Nu punem un avatar generic: o poză de stoc pe o pagină de autor e exact
   * semnalul artificial pe care îl scoatem de pe site.
   */
  photo: '/images/echipa/raul-lutas.webp',
  initials: 'RL',
  get url(): string {
    return `${BASE_URL}${this.path}`;
  },
  get schemaId(): string {
    return `${BASE_URL}/#autor-raul-lutas`;
  },
} as const;

export interface AuthorRef {
  name: string;
  url?: string;
}

/**
 * `@id`-ul nodului `Person` pentru un autor. Autorul site-ului își păstrează
 * id-ul stabil; oricine altcineva primește unul derivat din nume, ca nodul din
 * graf și referința din `Article.author` să indice mereu același lucru.
 */
export function authorSchemaId(author?: AuthorRef): string {
  if (!author || author.name === SITE_AUTHOR.name) return SITE_AUTHOR.schemaId;
  const slug = author.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${BASE_URL}/#autor-${slug}`;
}

/** Nodul `Person` pentru schema — legat de pagina de autor, care chiar există. */
export function authorNode(author?: AuthorRef) {
  if (!author || author.name === SITE_AUTHOR.name) {
    return {
      '@type': 'Person',
      '@id': SITE_AUTHOR.schemaId,
      name: SITE_AUTHOR.name,
      jobTitle: SITE_AUTHOR.jobTitle,
      url: SITE_AUTHOR.url,
      worksFor: { '@id': `${BASE_URL}/#organization` },
    };
  }
  return {
    '@type': 'Person',
    '@id': authorSchemaId(author),
    name: author.name,
    ...(author.url ? { url: author.url } : {}),
  };
}
