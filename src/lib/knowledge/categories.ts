/**
 * Categorii de business pentru Knowledge Center (cerere Raul, 14.09.2026:
 * „să fie pe categorii — comenzi, servicii etc."). PUR.
 *
 * Fiecare livrare din changelog primește o categorie:
 *   1. explicit, dintr-un comentariu în fișierul detaliat, oriunde în primele
 *      linii: `<!-- categorie: plati -->` (invizibil la randare);
 *   2. altfel automat, după cuvintele-cheie din titlu + rezumat.
 *
 * Nu e taxonomie perfectă — e ca operatorul să găsească rapid „ce s-a schimbat
 * la plăți". Când auto-clasificarea greșește, se fixează cu comentariul.
 */

export type CategoryId =
  | 'comenzi'
  | 'plati'
  | 'livrare'
  | 'documente'
  | 'automatizari'
  | 'clienti'
  | 'seo'
  | 'admin'
  | 'infrastructura'
  | 'altele';

export interface Category {
  id: CategoryId;
  label: string;
  /** Cuvinte-cheie normalizate (minuscule, fără diacritice), potrivite ca substring. */
  keywords: string[];
}

export const CATEGORIES: Category[] = [
  {
    id: 'plati',
    label: 'Plăți & facturare',
    keywords: [
      'plata', 'plati', 'platit', 'factur', 'oblio', 'stripe', 'transfer bancar', 'iban', 'refund',
      'rambursa', 'storno', 'decont', 'tva', 'cupon', 'incasar', 'payout', 'proforma', 'spv',
      'pret', 'tarif', 'onorariu',
    ],
  },
  {
    id: 'livrare',
    label: 'Livrare & curieri',
    keywords: ['livrare', 'awb', 'curier', 'sameday', 'fan courier', 'dhl', 'posta', 'easybox', 'colet', 'tracking', 'expedi'],
  },
  {
    id: 'documente',
    label: 'Documente & Barou',
    keywords: [
      'document', 'contract', 'imputernicir', 'cerere', 'barou', 'registru', 'semnatur', 'kyc', 'ocr',
      'apostil', 'traducer', 'legaliz', 'delegati', 'template', 'sablon', 'docx', 'pdf', 'cnp', 'mrz',
    ],
  },
  {
    id: 'automatizari',
    label: 'Automatizări ONRC / ANCPI / topograf',
    keywords: ['onrc', 'ancpi', 'ocpi', 'worker', 'railway', 'bot', 'portal', 'extras cf', 'constatator', 'cadastr', 'topograf', 'colaborator', 'plan cadastral', 'identificare imobil', 'carte funciar'],
  },
  {
    id: 'clienti',
    label: 'Clienți, email & marketing',
    keywords: ['email', 'client', 'contact', 'marketing', 'campanie', 'warm-up', 'warmup', 'recenzie', 'lifecycle', 'whatsapp', 'ads', 'reclam', 'meta', 'google ads', 'chatgpt', 'newsletter', 'dezabon', 'recuperare'],
  },
  {
    id: 'seo',
    label: 'SEO & site public',
    keywords: ['seo', 'pagin', 'index', 'sitemap', 'articol', 'blog', 'spam update', 'crawler', 'landing', 'homepage', 'performan', 'gsc', 'search console', 'meta-titlu', 'schema', 'redirect', '301', 'humanizer', 'continut'],
  },
  {
    id: 'comenzi',
    label: 'Comenzi & wizard',
    keywords: ['comand', 'comenzi', 'wizard', 'checkout', 'cos', 'abandon', 'status', 'telefonic', 'pas', 'formular', 'validare', 'draft', 'nu stiu', 'handoff', 'servici'],
  },
  {
    id: 'admin',
    label: 'Admin & echipă',
    keywords: ['admin', 'permisiun', 'rol', 'echipa', 'ghid', 'dashboard', 'tab', 'lista', 'operator', 'knowledge', 'utilizator', 'invit'],
  },
  {
    id: 'infrastructura',
    label: 'Infrastructură & securitate',
    keywords: ['deploy', 'vercel', 'migrar', 'cron', 'supabase', 'baza de date', 'securitate', 'rls', 'build', 'ci ', 's3', 'dns', 'resend', 'zoho', 'cookie', 'gdpr', 'backup', 'log'],
  },
];

export const CATEGORY_LABEL: Record<CategoryId, string> = Object.fromEntries([
  ...CATEGORIES.map((c) => [c.id, c.label]),
  ['altele', 'Altele'],
]) as Record<CategoryId, string>;

export const CATEGORY_IDS: CategoryId[] = [...CATEGORIES.map((c) => c.id), 'altele'];

export function isCategoryId(v: string | null | undefined): v is CategoryId {
  return !!v && (CATEGORY_IDS as string[]).includes(v);
}

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[șş]/g, 's')
    .replace(/[țţ]/g, 't');
}

/** `<!-- categorie: plati -->` (sau `category:`) din primele 40 de linii. */
export function explicitCategory(md: string): CategoryId | null {
  const head = md.split('\n').slice(0, 40).join('\n');
  const m = head.match(/<!--\s*categor(?:ie|y)\s*:\s*([a-z-]+)\s*-->/i);
  const id = m?.[1]?.toLowerCase();
  return isCategoryId(id) ? id : null;
}

/**
 * Categoria cu cele mai multe potriviri; la egalitate câștigă ordinea din
 * `CATEGORIES` (plăți înaintea comenzilor — „comandă" apare peste tot, deci
 * e semnal slab; „factură" e semnal tare). Titlul (primele ~120 caractere,
 * de regulă textul bold) cântărește dublu.
 */
export function categorize(text: string): CategoryId {
  const n = norm(text);
  const title = n.slice(0, 120);
  let best: CategoryId = 'altele';
  let bestScore = 0;
  for (const c of CATEGORIES) {
    let score = 0;
    for (const k of c.keywords) {
      if (n.includes(k)) score += 1;
      if (title.includes(k)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = c.id;
    }
  }
  return best;
}
