import type { IndexedDoc } from './search';

/**
 * Corpusul echipei — ce citesc căutarea din Knowledge Center și chatbotul
 * (pasul 3), spre deosebire de „toată documentația".
 *
 * `docs/` are ~580 de fișiere markdown, dar echipa are nevoie de ~250:
 * procedurile (`admin/`), ce s-a livrat (`changelog/`) și registrul Barou.
 * Restul — specificații tehnice, arhive, jurnale de sesiune, SEO, ads — e
 * pentru dezvoltare și aduce zgomot: „AWB" dă 40 de rezultate din care 35
 * sunt specs. Căutarea implicită stă pe corpusul echipei; „toată
 * documentația" rămâne o bifă.
 */
export const TEAM_CORPUS_PREFIXES = ['admin/', 'changelog/', 'registru-central/'] as const;

export type SearchScope = 'team' | 'all' | 'collaborator';

export function isTeamDoc(relPath: string): boolean {
  return TEAM_CORPUS_PREFIXES.some((p) => relPath.startsWith(p));
}

/**
 * Audiența declarată în capul documentului: `<!-- audienta: colaborator -->`
 * (sau `audiență`, listă separată prin virgulă). Documentele marcate
 * `colaborator` apar și în portalul topografului (`/colaborator/ghid`), care
 * nu are acces la admin.
 */
export function explicitAudience(md: string): string[] {
  const head = md.split('\n').slice(0, 40).join('\n');
  const m = head.match(/<!--\s*audien(?:ta|ță|ţă)\s*:\s*([^>]+?)\s*-->/i);
  if (!m) return [];
  return m[1]
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isCollaboratorDoc(relPath: string, content: string): boolean {
  return isTeamDoc(relPath) && explicitAudience(content).includes('colaborator');
}

export function filterCorpus(index: IndexedDoc[], scope: SearchScope): IndexedDoc[] {
  switch (scope) {
    case 'all':
      return index;
    case 'collaborator':
      return index.filter((d) => isCollaboratorDoc(d.relPath, d.content));
    case 'team':
    default:
      return index.filter((d) => isTeamDoc(d.relPath));
  }
}

export function parseSearchScope(raw: string | null | undefined): SearchScope {
  const v = (raw ?? '').trim().toLowerCase();
  if (v === 'all' || v === 'collaborator') return v;
  return 'team';
}
