import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  computePlatformVersion,
  extractSection,
  extractTitle,
  normalizeDocSlug,
  parseChangelogIndex,
  parseQuickNav,
  TEAM_SECTION_RE,
  type ChangelogEntry,
  type PlatformVersion,
  type QuickNavGuide,
} from './parse';
import { categorize, explicitCategory, type CategoryId } from './categories';
import { filterCorpus, isCollaboratorDoc, type SearchScope } from './corpus';
import {
  folderLabel,
  indexDoc,
  searchIndex,
  slugFromRelPath,
  type IndexedDoc,
  type SearchResult,
} from './search';

/**
 * Knowledge Center — citirea de pe disc a `docs/`.
 *
 * Pe Vercel, funcțiile serverless primesc DOAR fișierele urmărite static;
 * `docs/**\/*.md` intră prin `outputFileTracingIncludes` din next.config.ts
 * (≈7 MB de markdown). Fără linia aia pagina merge local și dă 404 pe orice
 * document în producție.
 */

export const DOCS_ROOT = path.join(process.cwd(), 'docs');

export interface ChangelogEntryWithTeam extends ChangelogEntry {
  /** `## Pentru echipă` din fișierul detaliat, dacă există. */
  teamMd: string | null;
  /** Titlul fișierului detaliat (H1). */
  detailTitle: string | null;
  /** Categoria de business (explicită din fișier sau auto după cuvinte-cheie). */
  category: CategoryId;
}

async function readIfExists(abs: string): Promise<string | null> {
  try {
    return await fs.readFile(abs, 'utf8');
  } catch {
    return null;
  }
}

/** Rezolvă o cale relativă la `docs/` (slug normalizat) la fișierul real. */
export async function resolveDoc(
  slug: string
): Promise<{ relPath: string; content: string } | null> {
  const candidates = slug === '' ? ['README.md'] : [`${slug}.md`, `${slug}/README.md`];
  for (const rel of candidates) {
    const abs = path.join(DOCS_ROOT, rel);
    // Gardă suplimentară față de normalizeDocSlug: calea absolută rămâne în docs/.
    if (!abs.startsWith(DOCS_ROOT + path.sep)) return null;
    const content = await readIfExists(abs);
    if (content !== null) return { relPath: rel, content };
  }
  return null;
}

export async function resolveDocFromSlugParts(
  parts: string[]
): Promise<{ relPath: string; content: string } | null> {
  const slug = parts.length === 0 ? '' : normalizeDocSlug(parts);
  if (slug === null) return null;
  return resolveDoc(slug);
}

/** Intrările din changelog, cele mai noi primele, cu „Pentru echipă" atașat. */
export async function loadChangelog(opts: { limit?: number } = {}): Promise<ChangelogEntryWithTeam[]> {
  const index = await readIfExists(path.join(DOCS_ROOT, 'changelog', 'README.md'));
  if (!index) return [];
  let entries = parseChangelogIndex(index);
  if (opts.limit) entries = entries.slice(0, opts.limit);

  return Promise.all(
    entries.map(async (e) => {
      const auto = categorize(e.summaryMd);
      if (!e.detailFile) return { ...e, teamMd: null, detailTitle: null, category: auto };
      const content = await readIfExists(path.join(DOCS_ROOT, 'changelog', e.detailFile));
      if (!content) return { ...e, teamMd: null, detailTitle: null, category: auto };
      return {
        ...e,
        teamMd: extractSection(content, TEAM_SECTION_RE),
        detailTitle: extractTitle(content),
        category: explicitCategory(content) ?? auto,
      };
    })
  );
}

export async function loadPlatformVersion(): Promise<PlatformVersion & {
  commitSha: string | null;
  commitMessage: string | null;
  buildTime: string | null;
}> {
  const index = await readIfExists(path.join(DOCS_ROOT, 'changelog', 'README.md'));
  const base = computePlatformVersion(index ? parseChangelogIndex(index) : []);
  return {
    ...base,
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    commitMessage: process.env.VERCEL_GIT_COMMIT_MESSAGE ?? null,
    buildTime: process.env.NEXT_PUBLIC_BUILD_TIME ?? null,
  };
}

export interface GuideLink {
  title: string;
  /** Slug pentru `/admin/ghid/<slug>/` (relativ la docs/, fără .md). */
  slug: string;
  description: string;
  category: CategoryId;
}

/**
 * Procedurile pentru echipă. Lista curatoriată e ordinea de citit pentru un
 * operator nou; sub ea, tot ce mai există în `docs/admin/` și
 * `docs/registru-central/`, cu titlul din H1.
 */
export const CURATED_GUIDES: GuideLink[] = [
  {
    title: 'Chatbotul din Ghid și raportarea problemelor',
    slug: 'admin/chatbot-si-raportare',
    category: 'admin',
    description:
      '„Întreabă ghidul” răspunde din procedurile scrise, cu link la sursă; „Raportează o problemă” ajunge la Raul în Rapoarte din Ghid; ce nu e documentat se raportează singur.',
  },
  {
    title: 'Serviciile noastre A→Z: catalogul pentru echipă',
    slug: 'admin/servicii',
    category: 'comenzi',
    description:
      'Toate cele 31 de servicii cu preț, termen, cine le lucrează, plus o fișă pe familie: caziere și integritate, stare civilă, constatator, extras CF, imobiliare prin topograf, opțiuni suplimentare.',
  },
  {
    title: 'Statusurile comenzii, de la plată la finalizare',
    slug: 'admin/statusuri-comenzi',
    category: 'comenzi',
    description:
      'Cele trei cozi zilnice (Așteptare plată / Așteptare client / Blocat instituție), fiecare status cu tabul lui, cine îl pune, ce vede clientul și ce apăsați ca să meargă mai departe.',
  },
  {
    title: 'Pagina comenzii în admin: ce face fiecare buton',
    slug: 'admin/pagina-comenzii',
    category: 'admin',
    description:
      'Card cu card: Procesare comandă, documentele generate, Solicită documente, KYC verificat, plata și transferul bancar, AWB, costuri interne, note.',
  },
  {
    title: 'Identificare imobil: procesul complet (topograf, apoi OCPI)',
    slug: 'admin/identificare-imobil-nereusita',
    category: 'comenzi',
    description:
      'Pasul 1: topograful găsește imobilul, extras CF în 1–3 zile. Pasul 2: cerere la OCPI (~10 zile, termenul OCPI văzut de client), documentul OCPI e livrarea, extrasul după el e comandă nouă. Mai multe imobile după proprietar: clientul alege unul. Actele încărcate de client.',
  },
  {
    title: 'Mesajele cu clientul pe comandă',
    slug: 'admin/mesaje-client',
    category: 'clienti',
    description:
      'Echipa și topograful scriu clientului direct pe comandă; clientul primește email, răspunde din pagina comenzii cu poze atașate, iar răspunsul vine pe email la echipă și la topograf.',
  },
  {
    title: 'documentero.ro: al doilea site, doar acte de stare civilă',
    slug: 'admin/documentero',
    category: 'comenzi',
    description:
      'Ce vindem acolo, cum recunoașteți comenzile în admin (badge „documentero”), ce pleacă automat pe brand, cum răspundeți clientului, mesajul pentru WhatsApp.',
  },
  {
    title: 'Contul clientului: ce vede clientul, ce se leagă automat',
    slug: 'admin/contul-clientului',
    category: 'clienti',
    description:
      'Meniul „Datele mele", popup-urile, cuponul de bun-venit, actul cerut doar la comandă, ce trece din comandă în cont și invers, ce spuneți la telefon.',
  },
  {
    title: 'Anulare în 30 min: refund 70% + factura de 30%',
    slug: 'admin/anulare-refund-70',
    category: 'plati',
    description:
      '„Procesează refund" face refundul Stripe, stornoul și factura taxei de anulare; „Am refundat manual" când Stripe refuză; „Reconciliază" când lipsește ceva.',
  },
  {
    title: 'Plata prin transfer bancar (IBAN)',
    slug: 'admin/plata-transfer-bancar',
    category: 'plati',
    description:
      'Tabul „Așteptare plată", „Dovadă verificată — pornește lucrul" înainte să intre banii, „Confirmă plata" cu referința din extras, plăți din străinătate.',
  },
  {
    title: 'Comenzi telefonice (admin A→Z)',
    slug: 'admin/comenzi-telefonice',
    category: 'comenzi',
    description: 'Comandă creată de admin, link de plată sau plată manuală, link de completare pentru client.',
  },
  {
    title: 'Ajutarea clientului blocat + „Solicită documente"',
    slug: 'admin/ghid-echipa-ajutare-client-blocat',
    category: 'comenzi',
    description: 'Ce faci când clientul nu poate termina comanda sau a trimis acte greșite.',
  },
  {
    title: 'Clientul nu își poate face cont',
    slug: 'admin/cont-client-blocat',
    category: 'clienti',
    description:
      'Îi dai linkul de urmărire fără cont, apoi îi creezi contul din Supabase cu „Auto Confirm User"; pentru conturile vechi neconfirmate, butonul „Confirm email".',
  },
  {
    title: 'Modifică o comandă plătită',
    slug: 'admin/modify-order',
    category: 'comenzi',
    description: 'Adaugă sau scoate opțiuni după plată: refund automat sau link de plată extra.',
  },
  {
    title: 'Storno și reemitere factură',
    slug: 'admin/storno-reemite',
    category: 'plati',
    description: 'Când și cum se stornează o factură Oblio și se emite alta.',
  },
  {
    title: 'Coșuri abandonate și recuperare',
    slug: 'admin/abandoned-carts',
    category: 'clienti',
    description: 'Ce e un coș abandonat, emailurile automate, recuperarea telefonică.',
  },
  {
    title: 'Registrul central de numere Barou',
    slug: 'registru-central',
    category: 'documente',
    description: 'Contracte de asistență și împuterniciri: alocare după plată, eliberare la anulare, 3 platforme.',
  },
  {
    title: 'Roluri și permisiuni',
    slug: 'admin/rbac-permissions',
    category: 'admin',
    description: 'Ce vede și ce poate face fiecare rol din admin.',
  },
];

async function listMarkdown(dirRel: string): Promise<string[]> {
  const abs = path.join(DOCS_ROOT, dirRel);
  try {
    const entries = await fs.readdir(abs, { withFileTypes: true });
    const out: string[] = [];
    for (const e of entries) {
      if (e.isFile() && e.name.endsWith('.md')) out.push(`${dirRel}/${e.name}`);
      if (e.isDirectory()) {
        const readme = await readIfExists(path.join(abs, e.name, 'README.md'));
        if (readme !== null) out.push(`${dirRel}/${e.name}/README.md`);
      }
    }
    return out.sort();
  } catch {
    return [];
  }
}

export interface DocListing {
  title: string;
  slug: string;
  relPath: string;
}

/** Toate documentele din folderele echipei, cu titlul din H1. */
export async function loadAllTeamDocs(): Promise<DocListing[]> {
  const files = [
    ...(await listMarkdown('admin')),
    // Fișele pe familii de servicii (21.09.2026); README-ul folderului vine
    // deja din listarea lui `admin/`, îl sărim ca să nu apară de două ori.
    ...(await listMarkdown('admin/servicii')).filter((f) => !f.endsWith('/README.md')),
    ...(await listMarkdown('registru-central')),
  ];
  const out: DocListing[] = [];
  for (const rel of files) {
    const content = await readIfExists(path.join(DOCS_ROOT, rel));
    if (content === null) continue;
    const slug = rel.replace(/\.md$/, '').replace(/\/README$/, '');
    out.push({ title: extractTitle(content) ?? rel, slug, relPath: rel });
  }
  return out;
}

/**
 * Ghidurile pe care le vede și colaboratorul (topograful), în portalul lui:
 * documentele echipei marcate `<!-- audienta: colaborator -->`.
 */
export async function loadCollaboratorDocs(): Promise<DocListing[]> {
  const index = await loadSearchIndex();
  return index
    .filter((d) => isCollaboratorDoc(d.relPath, d.content))
    .map((d) => ({ title: d.title, slug: d.slug, relPath: d.relPath }))
    .sort((a, b) => a.title.localeCompare(b.title, 'ro'));
}

/** Un document servit colaboratorului DOAR dacă e marcat pentru el. */
export async function resolveCollaboratorDoc(
  parts: string[]
): Promise<{ relPath: string; content: string } | null> {
  const doc = await resolveDocFromSlugParts(parts);
  if (!doc || !isCollaboratorDoc(doc.relPath, doc.content)) return null;
  return doc;
}

/** Tabelul de navigare din `docs/admin/README.md` (referință secundară). */
export async function loadQuickNav(): Promise<QuickNavGuide[]> {
  const md = await readIfExists(path.join(DOCS_ROOT, 'admin', 'README.md'));
  return md ? parseQuickNav(md) : [];
}

// ── Navigare pe foldere + căutare pe TOT docs/ ─────────────────────────────

/** Foldere fără interes pentru echipă (exporturi brute, artefacte). */
const SKIP_DIRS = new Set(['EXPORT', 'SCREAMINGFROG', 'node_modules', '.git']);

async function walkMarkdown(dirRel: string): Promise<string[]> {
  const abs = path.join(DOCS_ROOT, dirRel);
  let entries: import('node:fs').Dirent[];
  try {
    entries = await fs.readdir(abs, { withFileTypes: true });
  } catch {
    return [];
  }
  const out: string[] = [];
  for (const e of entries) {
    if (e.name.startsWith('.') || SKIP_DIRS.has(e.name)) continue;
    const rel = dirRel ? `${dirRel}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...(await walkMarkdown(rel)));
    else if (e.isFile() && e.name.endsWith('.md')) out.push(rel);
  }
  return out;
}

let searchIndexCache: Promise<IndexedDoc[]> | null = null;

/**
 * Indexul de căutare peste toate fișierele markdown din docs/ (~500, ~7 MB).
 * Se construiește o dată per instanță de funcție; docs/ se schimbă doar la
 * deploy, iar deploy-ul pornește instanțe noi.
 */
export function loadSearchIndex(): Promise<IndexedDoc[]> {
  if (!searchIndexCache) {
    searchIndexCache = (async () => {
      const files = await walkMarkdown('');
      const docs: IndexedDoc[] = [];
      for (const rel of files) {
        const content = await readIfExists(path.join(DOCS_ROOT, rel));
        if (content === null) continue;
        docs.push(indexDoc(rel, content, extractTitle(content) ?? rel));
      }
      return docs;
    })().catch((err) => {
      searchIndexCache = null;
      throw err;
    });
  }
  return searchIndexCache;
}

/**
 * Căutare pe corpusul echipei (implicit), pe toată documentația (`all`) sau
 * doar pe ghidurile colaboratorului (`collaborator`).
 */
export async function searchDocs(query: string, limit = 30, scope: SearchScope = 'team'): Promise<SearchResult[]> {
  const index = await loadSearchIndex();
  return searchIndex(filterCorpus(index, scope), query, limit);
}

export interface FolderSummary {
  name: string;
  label: string;
  slug: string;
  count: number;
  hasReadme: boolean;
}

/** Folderele de nivel 1 din docs/, cu numărul de documente din fiecare. */
export async function loadTopFolders(): Promise<FolderSummary[]> {
  const index = await loadSearchIndex();
  const counts = new Map<string, number>();
  for (const d of index) {
    const top = d.relPath.includes('/') ? d.relPath.split('/')[0] : null;
    if (!top) continue;
    counts.set(top, (counts.get(top) ?? 0) + 1);
  }
  const out: FolderSummary[] = [];
  for (const [name, count] of counts) {
    out.push({
      name,
      label: folderLabel(name),
      slug: name,
      count,
      hasReadme: index.some((d) => d.relPath === `${name}/README.md`),
    });
  }
  return out.sort((a, b) => b.count - a.count);
}

export interface DirectoryListing {
  slug: string;
  subdirs: Array<{ name: string; slug: string; count: number }>;
  files: Array<{ title: string; slug: string; relPath: string }>;
}

/**
 * Conținutul unui folder din docs/ (pentru viewer: sub README-ul folderului,
 * sau singur când folderul n-are README). Null dacă nu e folder.
 */
export async function listDirectory(slug: string): Promise<DirectoryListing | null> {
  const abs = slug ? path.join(DOCS_ROOT, slug) : DOCS_ROOT;
  if (!abs.startsWith(DOCS_ROOT)) return null;
  let entries: import('node:fs').Dirent[];
  try {
    const stat = await fs.stat(abs);
    if (!stat.isDirectory()) return null;
    entries = await fs.readdir(abs, { withFileTypes: true });
  } catch {
    return null;
  }
  const index = await loadSearchIndex();
  const prefix = slug ? `${slug}/` : '';
  const subdirs: DirectoryListing['subdirs'] = [];
  const files: DirectoryListing['files'] = [];
  for (const e of entries) {
    if (e.name.startsWith('.') || SKIP_DIRS.has(e.name)) continue;
    if (e.isDirectory()) {
      const sub = `${prefix}${e.name}`;
      const count = index.filter((d) => d.relPath.startsWith(`${sub}/`)).length;
      if (count > 0) subdirs.push({ name: e.name, slug: sub, count });
    } else if (e.isFile() && e.name.endsWith('.md') && e.name !== 'README.md') {
      const rel = `${prefix}${e.name}`;
      const doc = index.find((d) => d.relPath === rel);
      files.push({ title: doc?.title ?? e.name, slug: slugFromRelPath(rel), relPath: rel });
    }
  }
  subdirs.sort((a, b) => a.name.localeCompare(b.name));
  // Fișierele datate (changelog, session-logs) — cele mai noi primele.
  files.sort((a, b) => b.relPath.localeCompare(a.relPath));
  return { slug, subdirs, files };
}
