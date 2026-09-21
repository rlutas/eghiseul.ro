import { filterCorpus, type SearchScope } from './corpus';
import { normalizeText, type IndexedDoc } from './search';

/**
 * Ce citește chatbotul din Ghid pentru o întrebare — PUR, testabil.
 *
 * Nu punem tot corpusul (~1,7 MB) în fiecare cerere: nucleul (catalogul A→Z,
 * statusurile, pagina comenzii) intră mereu, cu cache, iar peste el vin cele
 * mai relevante documente găsite de aceeași căutare lexicală ca în Ghid.
 * Documentele lungi se taie la `maxChars` ca o întrebare să coste ~30k tokeni.
 */
export const CORE_DOCS: Record<'team' | 'collaborator', readonly string[]> = {
  team: ['admin/servicii/README.md', 'admin/statusuri-comenzi.md', 'admin/pagina-comenzii.md'],
  collaborator: [
    'admin/servicii/imobiliare-topograf.md',
    'admin/servicii/extras-carte-funciara.md',
    'admin/identificare-imobil-nereusita.md',
  ],
};

export type ChatAudience = 'team' | 'collaborator';

export interface ContextDoc {
  relPath: string;
  slug: string;
  title: string;
  text: string;
  truncated: boolean;
}

export function audienceScope(audience: ChatAudience): SearchScope {
  return audience === 'collaborator' ? 'collaborator' : 'team';
}

function toContextDoc(d: IndexedDoc, maxChars: number): ContextDoc {
  const truncated = d.content.length > maxChars;
  return {
    relPath: d.relPath,
    slug: d.slug,
    title: d.title,
    text: truncated ? d.content.slice(0, maxChars) + '\n\n[… document tăiat aici …]' : d.content,
    truncated,
  };
}

/** Nucleul stabil (identic la fiecare cerere → se poate pune în cache). */
export function coreDocs(index: IndexedDoc[], audience: ChatAudience, maxChars = 40_000): ContextDoc[] {
  const wanted = CORE_DOCS[audience];
  return wanted
    .map((rel) => index.find((d) => d.relPath === rel))
    .filter((d): d is IndexedDoc => !!d)
    .map((d) => toContextDoc(d, maxChars));
}

/**
 * Cuvinte care nu spun nimic despre subiect într-o întrebare („cum dau
 * refund la cazier” → contează „refund” și „cazier”). Fără diacritice, ca
 * textul normalizat.
 */
const STOPWORDS = new Set(
  `a al ale ai am ar are as asta astea asa aia acest aceasta aceste acesti acum ce cea cei cel cele ceva cine cu cum ca care cand cat cata cate cati da dau dat de deci din doar dupa e el ea ei ele este esti eu fac face facem faceti fi fie fost i ii il imi in intr iti la le li lui ma mai mea mi mie mult ne nici nu o ori pe pentru poate pot prin sa sau se si sunt sunteti te ti tot toti toate un una unde unei unui unor va voi vor vreau vrea vreti`
    .split(/\s+/)
);

/** Termenii cu greutate din întrebare (fără stopwords, minimum 3 litere). */
export function questionTerms(question: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of normalizeText(question).split(/[^a-z0-9]+/)) {
    const t = raw.trim();
    if (t.length < 3 || STOPWORDS.has(t) || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

/**
 * Scor „larg” pentru chat: NU cere toate cuvintele (întrebările sunt în
 * limbaj natural: „cât durează”, „cum dau refund”). Fiecare termen contează
 * dacă apare exact (titlu 40, conținut până la 15 pe apariții) sau doar ca
 * prefix de 5 litere pe un cuvânt („durea” → „durează”, „durata”; jumătate
 * din puncte). Documentele cu mai mulți termeni distincți urcă primele.
 */
export function looseScore(doc: IndexedDoc, terms: string[]): number {
  let score = 0;
  let matched = 0;
  for (const term of terms) {
    let s = 0;
    if (doc.normTitle.includes(term)) s += 40;
    const exact = countOccurrences(doc.normContent, term);
    if (exact > 0) s += Math.min(15, exact);
    if (s === 0 && term.length >= 6) {
      const prefix = term.slice(0, 5);
      const re = new RegExp(`\\b${prefix}[a-z]*`, 'g');
      const m = doc.normContent.match(re);
      if (m && m.length > 0) s += Math.min(7, m.length) / 2;
      if (doc.normTitle.match(re)) s += 20;
    }
    if (s > 0) matched++;
    score += s;
  }
  // Acoperirea (câți termeni distincți) contează mai mult decât repetiția.
  return matched === 0 ? 0 : score + matched * 30;
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

/**
 * Documentele relevante pentru întrebare, din corpusul audienței, fără cele
 * din nucleu (ar fi duplicate). Cel mult `max`, fiecare tăiat la `maxChars`.
 * Procedurile (`admin/`) au prioritate față de changelog la scor egal.
 */
export function retrievedDocs(
  index: IndexedDoc[],
  question: string,
  audience: ChatAudience,
  opts: { max?: number; maxChars?: number } = {}
): ContextDoc[] {
  const max = opts.max ?? 6;
  const maxChars = opts.maxChars ?? 14_000;
  const core = new Set(CORE_DOCS[audience]);
  const terms = questionTerms(question);
  if (terms.length === 0) return [];
  const corpus = filterCorpus(index, audienceScope(audience)).filter((d) => !core.has(d.relPath));
  const scored = corpus
    .map((d) => {
      const base = looseScore(d, terms);
      return { d, score: base > 0 ? base + (d.relPath.startsWith('admin/') ? 10 : 0) : 0 };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.d.title.localeCompare(b.d.title, 'ro'));
  return scored.slice(0, max).map((x) => toContextDoc(x.d, maxChars));
}

/** Textul documentelor pentru prompt, cu delimitatori pe care modelul îi citează. */
export function renderDocsForPrompt(docs: ContextDoc[]): string {
  return docs
    .map((d) => `<document slug="${d.slug}" titlu="${d.title.replace(/"/g, '”')}">\n${d.text}\n</document>`)
    .join('\n\n');
}

export function guideHref(slug: string, audience: ChatAudience): string {
  const base = audience === 'collaborator' ? '/colaborator/ghid' : '/admin/ghid';
  return `${base}/${slug}/`;
}

/**
 * Răspunsul vine ca text simplu (ca să poată fi transmis pe măsură ce se
 * generează) și se termină cu un subsol fix:
 *
 *   SURSE: slug1, slug2
 *   DOCUMENTAT: da | nu
 *   DE_DOCUMENTAT: ce lipsește (doar la „nu”)
 *
 * Parserul e tolerant: fără subsol → documentat=true, fără surse.
 */
export interface ParsedAnswer {
  body: string;
  sources: string[];
  documented: boolean;
  followUp: string | null;
}

export function parseAnswerFooter(text: string): ParsedAnswer {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  let start = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (/^\s*SURSE\s*:/i.test(lines[i])) {
      start = i;
      break;
    }
  }
  if (start < 0) return { body: text.trim(), sources: [], documented: true, followUp: null };
  let body = lines.slice(0, start).join('\n').replace(/\n\s*-{3,}\s*$/, '').trim();
  body = body.replace(/\n\s*-{3,}\s*$/, '').trim();
  let sources: string[] = [];
  let documented = true;
  let followUp: string | null = null;
  for (const raw of lines.slice(start)) {
    const line = raw.trim();
    const m = line.match(/^([A-ZĂÂÎȘȚ_]+)\s*:\s*(.*)$/i);
    if (!m) continue;
    const key = m[1].toUpperCase();
    const val = m[2].trim();
    if (key === 'SURSE') {
      sources = val
        .split(/[,;]/)
        .map((s) => s.trim().replace(/^[`"'«„]+|[`"'»”]+$/g, '').replace(/\.md$/i, '').replace(/^\/+|\/+$/g, ''))
        .filter((s) => s && !/^(niciuna|none|-)$/i.test(s));
    } else if (key === 'DOCUMENTAT') {
      documented = !/^(nu|no|false)\b/i.test(val);
    } else if (key === 'DE_DOCUMENTAT') {
      followUp = val || null;
    }
  }
  return { body, sources, documented, followUp: documented ? null : followUp };
}

/** Câte caractere din text sunt „încă subsol în curs” (ca UI-ul să nu afișeze SURSE: pe măsură ce vine). */
export function visibleAnswerPrefix(partial: string): string {
  const idx = partial.search(/\n\s*(-{3,}\s*\n\s*)?SURSE\s*:/i);
  if (idx >= 0) return partial.slice(0, idx).replace(/\n\s*-{3,}\s*$/, '').trimEnd();
  // Ultimul rând poate fi un subsol pe jumătate scris („SUR”): îl ascundem până se decide.
  const lastNl = partial.lastIndexOf('\n');
  const tail = partial.slice(lastNl + 1);
  if (/^\s*(-{1,3}|S|SU|SUR|SURS|SURSE)\s*:?\s*$/i.test(tail) && tail.length > 0) return partial.slice(0, lastNl + 1).trimEnd();
  return partial;
}
