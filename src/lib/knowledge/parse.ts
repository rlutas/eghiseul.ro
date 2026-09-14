/**
 * Knowledge Center (/admin/ghid) — funcții PURE peste markdown-ul din `docs/`.
 *
 * Sursa unică de adevăr rămâne repo-ul: `docs/changelog/README.md` (ce s-a
 * livrat, pe zile) și `docs/admin/*.md` (proceduri). Pagina din admin doar le
 * citește și le randează, ca echipa să vadă în platformă exact ce s-a
 * schimbat, fără mesaje pe WhatsApp la fiecare livrare (cerere Raul,
 * 14.09.2026).
 *
 * Fișierul e fără `fs` — testabil și importabil de oriunde. Citirea de pe
 * disc e în `docs.ts`, randarea în `render.ts`.
 */

export type ChangelogKind = 'feature' | 'fix' | 'change' | 'refactor' | 'discovery' | 'other';

export interface ChangelogEntry {
  /** YYYY-MM-DD */
  date: string;
  /** Markdown inline (bold, cod, linkuri) — coloana „Ce s-a livrat". */
  summaryMd: string;
  /** Calea relativă la `docs/changelog/` a fișierului detaliat, dacă există. */
  detailFile: string | null;
  kind: ChangelogKind;
}

const KIND_BY_EMOJI: Array<[string, ChangelogKind]> = [
  ['🟣', 'feature'],
  ['🔴', 'fix'],
  ['✅', 'change'],
  ['🔄', 'refactor'],
  ['🔵', 'discovery'],
];

const DATE_RE = /(20\d{2}-\d{2}-\d{2})/;

/** Împarte un rând de tabel markdown în celule, ignorând `|` din linkuri/cod. */
function splitTableRow(line: string): string[] {
  const cells: string[] = [];
  let cur = '';
  let inCode = false;
  let bracket = 0;
  let paren = 0;
  for (const ch of line) {
    if (ch === '`') inCode = !inCode;
    if (!inCode) {
      if (ch === '[') bracket++;
      else if (ch === ']') bracket = Math.max(0, bracket - 1);
      else if (ch === '(') paren++;
      else if (ch === ')') paren = Math.max(0, paren - 1);
    }
    if (ch === '|' && !inCode && bracket === 0 && paren === 0) {
      cells.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  cells.push(cur.trim());
  // Rândul începe și se termină cu `|` → prima și ultima celulă sunt goale.
  if (cells.length && cells[0] === '') cells.shift();
  if (cells.length && cells[cells.length - 1] === '') cells.pop();
  return cells;
}

/**
 * `docs/changelog/README.md` → intrări. Tolerant la rândurile „strâmbe" din
 * istoric: spațiu înainte de `|`, data lipsă din prima coloană (o luăm din
 * numele fișierului), coloana „Detalii" cu `commit \`abc\`` în loc de link.
 */
export function parseChangelogIndex(md: string): ChangelogEntry[] {
  const entries: ChangelogEntry[] = [];
  for (const rawLine of md.split('\n')) {
    const line = rawLine.trim();
    if (!line.startsWith('|')) continue;
    const cells = splitTableRow(line);
    if (cells.length < 2) continue;
    // Header + separator
    if (/^-+$/.test(cells[0].replace(/\s/g, '')) || cells[0] === 'Data') continue;

    const firstDate = cells[0].match(DATE_RE)?.[1] ?? null;
    let summaryMd: string;
    let detailCell: string;
    if (firstDate && !cells[0].includes('](')) {
      summaryMd = cells[1] ?? '';
      detailCell = cells[2] ?? '';
    } else {
      // Rând fără coloana de dată: `| [fisier.md](fisier.md) | rezumat |`
      detailCell = cells[0];
      summaryMd = cells[1] ?? '';
    }
    const fileFromLink = detailCell.match(/\]\(([^)\s]+\.md)\)/)?.[1] ?? null;
    const date = firstDate ?? fileFromLink?.match(DATE_RE)?.[1] ?? null;
    if (!date || !summaryMd) continue;

    let kind: ChangelogKind = 'other';
    for (const [emoji, k] of KIND_BY_EMOJI) {
      if (summaryMd.startsWith(emoji)) {
        kind = k;
        break;
      }
    }

    entries.push({
      date,
      summaryMd,
      detailFile: fileFromLink,
      kind,
    });
  }
  return entries;
}

/** Primul `# Titlu` din document, fără markdown inline. */
export function extractTitle(md: string): string | null {
  const m = md.match(/^#\s+(.+?)\s*$/m);
  if (!m) return null;
  return m[1].replace(/[*`_]/g, '').trim();
}

/**
 * Conținutul unei secțiuni `## Titlu` (până la următorul `##`/`#`). Folosit
 * pentru „## Pentru echipă" din changelog — rezumatul în limbaj de operator
 * pe care îl arată cardul din Knowledge Center.
 */
export function extractSection(md: string, heading: RegExp): string | null {
  const lines = md.split('\n');
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(#{1,6})\s+(.+?)\s*$/);
    if (m && m[1].length === 2 && heading.test(m[2])) {
      start = i + 1;
      break;
    }
  }
  if (start < 0) return null;
  const out: string[] = [];
  for (let i = start; i < lines.length; i++) {
    if (/^#{1,2}\s+/.test(lines[i])) break;
    out.push(lines[i]);
  }
  const body = out.join('\n').trim();
  return body || null;
}

export const TEAM_SECTION_RE = /^pentru\s+echip[ăa]/i;

/**
 * Slug din URL (`/admin/ghid/changelog/2026-09-14-x`) → cale relativă la
 * `docs/`, sau null dacă iese din `docs/` ori conține caractere dubioase.
 * Nu adaugă `.md` — `docs.ts` încearcă `<cale>.md` și `<cale>/README.md`.
 */
export function normalizeDocSlug(parts: string[]): string | null {
  const clean = parts.map((p) => decodeURIComponent(p).trim()).filter(Boolean);
  if (clean.length === 0) return null;
  for (const p of clean) {
    if (p === '.' || p === '..') return null;
    if (!/^[A-Za-z0-9._()\-À-ɏ ]+$/.test(p)) return null;
  }
  const joined = clean.join('/');
  return joined.endsWith('.md') ? joined.slice(0, -3) : joined;
}

/**
 * Rescrie un link din markdown relativ la documentul curent:
 *   - `http(s)://…`, `mailto:`, `#ancora` → neatinse;
 *   - `../admin/x.md`, `./y.md`, `z.md#sec` → `/admin/ghid/<cale>/` (+ancoră);
 *   - `README.md` → directorul lui;
 *   - alte fișiere (png, pdf, csv) → null (nu le servim; apelantul lasă
 *     textul simplu).
 * `currentDoc` = calea relativă la `docs/` a fișierului randat, ex.
 * `changelog/2026-09-14-x.md`.
 */
export function rewriteDocLink(href: string, currentDoc: string): string | null {
  if (/^(https?:|mailto:|tel:|#)/i.test(href)) return href;
  const [pathPart, hash] = href.split('#');
  if (!pathPart) return href;
  const isMd = /\.md$/i.test(pathPart);
  if (!isMd) {
    // Link către un director (`../seo/`) → README-ul lui.
    if (!/\.[a-z0-9]{2,5}$/i.test(pathPart)) {
      const dir = resolveRelative(currentDoc, pathPart);
      return dir === null ? null : `/admin/ghid/${dir.replace(/\/$/, '')}/${hash ? `#${hash}` : ''}`;
    }
    return null;
  }
  const resolved = resolveRelative(currentDoc, pathPart);
  if (resolved === null) return null;
  let slug = resolved.replace(/\.md$/i, '');
  slug = slug.replace(/\/README$/i, '').replace(/^README$/i, '');
  const base = slug ? `/admin/ghid/${slug}/` : '/admin/ghid/';
  return hash ? `${base}#${hash}` : base;
}

/** Rezolvă `target` relativ la directorul lui `currentDoc`, fără a ieși din rădăcină. */
function resolveRelative(currentDoc: string, target: string): string | null {
  const baseParts = currentDoc.split('/').slice(0, -1);
  const parts = target.startsWith('/') ? [] : [...baseParts];
  for (const seg of target.split('/')) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') {
      if (parts.length === 0) return null;
      parts.pop();
    } else {
      parts.push(seg);
    }
  }
  return parts.join('/');
}

export interface QuickNavGuide {
  title: string;
  /** Cale relativă la `docs/admin/` (ex. `plata-transfer-bancar.md`). */
  file: string;
  description: string;
  status: string;
}

/** Tabelul „Quick Navigation" din `docs/admin/README.md`. */
export function parseQuickNav(md: string): QuickNavGuide[] {
  const out: QuickNavGuide[] = [];
  for (const rawLine of md.split('\n')) {
    const line = rawLine.trim();
    if (!line.startsWith('|')) continue;
    const cells = splitTableRow(line);
    if (cells.length < 2) continue;
    const link = cells[0].match(/^\[([^\]]+)\]\(\.?\/?([^)]+\.md)\)$/);
    if (!link) continue;
    out.push({
      title: link[1].trim(),
      file: link[2].trim(),
      description: cells[1] ?? '',
      status: cells[2] ?? '',
    });
  }
  return out;
}

/** Versiunea platformei, derivată — nu ținem un număr de mână. */
export interface PlatformVersion {
  /** Numărul de livrări din changelog. */
  releases: number;
  /** Data ultimei livrări (YYYY-MM-DD). */
  latestDate: string | null;
  /** Eticheta afișată, ex. `v135 · 14.09.2026`. */
  label: string;
}

export function computePlatformVersion(entries: ChangelogEntry[]): PlatformVersion {
  const dates = entries.map((e) => e.date).sort();
  const latestDate = dates.length ? dates[dates.length - 1] : null;
  const label = `v${entries.length}` + (latestDate ? ` · ${formatRoDate(latestDate)}` : '');
  return { releases: entries.length, latestDate, label };
}

export function formatRoDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}
