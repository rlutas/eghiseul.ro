import { filterCorpus, type SearchScope } from './corpus';
import { searchIndex, type IndexedDoc } from './search';

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
 * Documentele relevante pentru întrebare, din corpusul audienței, fără cele
 * din nucleu (ar fi duplicate). Cel mult `max`, fiecare tăiat la `maxChars`.
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
  const corpus = filterCorpus(index, audienceScope(audience));
  const byPath = new Map(corpus.map((d) => [d.relPath, d]));
  const hits = searchIndex(corpus, question, max * 3).filter((h) => !core.has(h.relPath));
  const out: ContextDoc[] = [];
  for (const h of hits) {
    const d = byPath.get(h.relPath);
    if (!d) continue;
    out.push(toContextDoc(d, maxChars));
    if (out.length >= max) break;
  }
  return out;
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
