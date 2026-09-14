/**
 * Căutare full-text pentru Knowledge Center — PUR, peste conținutul deja citit.
 *
 * Fără motor extern: ~500 de fișiere markdown (~7 MB) încap în memorie, iar
 * căutarea e un `includes` pe text normalizat. Normalizarea aruncă
 * diacriticele (ș/ş/s, ț/ţ/t, ă/â/a, î/i) în ambele părți, ca „asteptare
 * plata" să găsească „Așteptare plată" — echipa tastează des fără diacritice.
 */

export interface IndexedDoc {
  /** Cale relativă la docs/, ex. `admin/plata-transfer-bancar.md`. */
  relPath: string;
  /** Slug pentru `/admin/ghid/<slug>/`. */
  slug: string;
  title: string;
  /** Textul original (pentru fragmente). */
  content: string;
  /** Titlu + conținut normalizate (minuscule, fără diacritice). */
  normTitle: string;
  normContent: string;
}

export interface SearchResult {
  relPath: string;
  slug: string;
  title: string;
  /** Fragment în jurul primei potriviri, HTML escapat cu <mark>. */
  snippetHtml: string;
  score: number;
}

export function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    // Cedilla legacy (ANAF) și comma-below ajung ambele la litera de bază prin
    // NFD, dar unele fonturi/copy-paste aduc caractere precompuse fără
    // descompunere — le prindem explicit.
    .replace(/[șşȿ]/g, 's')
    .replace(/[țţ]/g, 't')
    .replace(/[„”"«»]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ');
}

export function slugFromRelPath(relPath: string): string {
  return relPath.replace(/\.md$/i, '').replace(/\/README$/i, '').replace(/^README$/i, '');
}

export function indexDoc(relPath: string, content: string, title: string): IndexedDoc {
  return {
    relPath,
    slug: slugFromRelPath(relPath),
    title,
    content,
    normTitle: normalizeText(title),
    normContent: normalizeText(stripMarkdown(content)),
  };
}

/** Scoate zgomotul de markdown ca fragmentele să fie citibile. */
export function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s*\|?\s*-{3,}[-|\s]*$/gm, ' ')
    .replace(/\|/g, ' ')
    .replace(/[*_>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenizeQuery(q: string): string[] {
  return normalizeText(q)
    .split(' ')
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);
}

/**
 * Toate cuvintele trebuie să apară (în titlu sau în conținut). Scor: titlul
 * cântărește mult, apoi numărul de apariții; documentele din `admin/` și
 * `changelog/` primesc un mic bonus fiindcă sunt cele pe care echipa le caută.
 */
export function searchIndex(index: IndexedDoc[], query: string, limit = 30): SearchResult[] {
  const terms = tokenizeQuery(query);
  if (terms.length === 0) return [];

  const results: SearchResult[] = [];
  for (const doc of index) {
    let score = 0;
    let firstPos = -1;
    let ok = true;
    for (const term of terms) {
      const inTitle = doc.normTitle.includes(term);
      const pos = doc.normContent.indexOf(term);
      if (!inTitle && pos < 0) {
        ok = false;
        break;
      }
      if (inTitle) score += 50;
      if (pos >= 0) {
        score += Math.min(20, countOccurrences(doc.normContent, term));
        if (firstPos < 0 || pos < firstPos) firstPos = pos;
      }
    }
    if (!ok) continue;
    if (doc.relPath.startsWith('admin/') || doc.relPath.startsWith('changelog/')) score += 5;
    results.push({
      relPath: doc.relPath,
      slug: doc.slug,
      title: doc.title,
      snippetHtml: buildSnippet(doc, terms, firstPos),
      score,
    });
  }
  results.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, 'ro'));
  return results.slice(0, limit);
}

function countOccurrences(hay: string, needle: string): number {
  let n = 0;
  let i = hay.indexOf(needle);
  while (i >= 0 && n < 50) {
    n++;
    i = hay.indexOf(needle, i + needle.length);
  }
  return n;
}

const SNIPPET_RADIUS = 110;

/**
 * Fragment din textul original în jurul primei potriviri. Textul normalizat
 * are aceeași lungime cu cel original doar dacă NFD n-a schimbat numărul de
 * code units — nu e garantat, deci căutăm poziția în originalul curățat și
 * normalizat pe bucăți: luăm fereastra din `normContent`, apoi marcăm
 * termenii pe fereastra ORIGINALĂ echivalentă căutându-i fără diacritice.
 */
function buildSnippet(doc: IndexedDoc, terms: string[], firstPos: number): string {
  const plain = stripMarkdown(doc.content);
  // Aliniere aproximativă: normalizarea poate scurta textul cu câteva
  // caractere; căutăm fereastra în originalul normalizat caracter cu caracter.
  const startNorm = Math.max(0, (firstPos < 0 ? 0 : firstPos) - SNIPPET_RADIUS);
  const start = alignToOriginal(plain, startNorm);
  const end = Math.min(plain.length, start + SNIPPET_RADIUS * 2 + 20);
  let window = plain.slice(start, end);
  if (start > 0) window = '…' + window;
  if (end < plain.length) window = window + '…';
  return highlight(window, terms);
}

/** Poziția din textul normalizat → poziția în original (avans în paralel). */
function alignToOriginal(original: string, normPos: number): number {
  let n = 0;
  for (let i = 0; i < original.length; i++) {
    if (n >= normPos) return i;
    n += normalizeText(original[i]).length || 0;
  }
  return original.length;
}

/** Escapare HTML + <mark> pe fiecare termen, potrivit fără diacritice. */
export function highlight(text: string, terms: string[]): string {
  const out: string[] = [];
  let i = 0;
  while (i < text.length) {
    let matched = 0;
    for (const term of terms) {
      // Comparăm fereastra normalizată de lungimea termenului (+ toleranță
      // pentru caractere care se descompun).
      for (let len = term.length; len <= term.length + 2 && i + len <= text.length; len++) {
        if (normalizeText(text.slice(i, i + len)) === term) {
          matched = len;
          break;
        }
      }
      if (matched) break;
    }
    if (matched) {
      out.push(`<mark>${escapeHtml(text.slice(i, i + matched))}</mark>`);
      i += matched;
    } else {
      out.push(escapeHtml(text[i]));
      i++;
    }
  }
  return out.join('');
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Numele afișat al unui folder de nivel 1 din docs/. */
export const FOLDER_LABELS: Record<string, string> = {
  changelog: 'Ce s-a livrat (changelog)',
  admin: 'Proceduri admin',
  'registru-central': 'Registru central Barou',
  technical: 'Specificații tehnice',
  seo: 'SEO',
  ads: 'Reclame (Google / Meta / ChatGPT)',
  deployment: 'Deploy și infrastructură',
  security: 'Securitate',
  agents: 'Agenți și automatizări',
  prd: 'Cerințe produs (PRD)',
  archive: 'Arhivă',
  'session-logs': 'Jurnale de sesiune',
  plans: 'Planuri',
  marketing: 'Marketing',
};

export function folderLabel(name: string): string {
  return FOLDER_LABELS[name] ?? name;
}
