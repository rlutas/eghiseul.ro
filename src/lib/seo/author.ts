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
  get url(): string {
    return `${BASE_URL}${this.path}`;
  },
  get schemaId(): string {
    return `${BASE_URL}/#autor-raul-lutas`;
  },
} as const;

/** Nodul `Person` pentru schema — legat de pagina de autor, care chiar există. */
export function authorNode() {
  return {
    '@type': 'Person',
    '@id': SITE_AUTHOR.schemaId,
    name: SITE_AUTHOR.name,
    jobTitle: SITE_AUTHOR.jobTitle,
    url: SITE_AUTHOR.url,
    worksFor: { '@id': `${BASE_URL}/#organization` },
  };
}
