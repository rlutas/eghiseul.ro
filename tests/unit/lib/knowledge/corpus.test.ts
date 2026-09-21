import { describe, expect, it } from 'vitest';
import {
  explicitAudience,
  filterCorpus,
  isTeamDoc,
  parseSearchScope,
  TEAM_CORPUS_PREFIXES,
} from '@/lib/knowledge/corpus';
import { indexDoc } from '@/lib/knowledge/search';

// Corpusul echipei: căutarea din Knowledge Center și (mai târziu) chatbotul
// citesc DOAR ghidurile pentru echipă + changelog + registru, nu și cele
// ~400 de specificații tehnice, arhive și jurnale de sesiune. Un operator
// care caută „AWB" nu trebuie să primească 35 de rezultate din docs/technical.

describe('isTeamDoc', () => {
  it('acceptă doar folderele echipei', () => {
    expect(TEAM_CORPUS_PREFIXES).toEqual(['admin/', 'changelog/', 'registru-central/']);
    expect(isTeamDoc('admin/plata-transfer-bancar.md')).toBe(true);
    expect(isTeamDoc('admin/servicii/caziere-si-integritate.md')).toBe(true);
    expect(isTeamDoc('changelog/2026-09-14-x.md')).toBe(true);
    expect(isTeamDoc('registru-central/README.md')).toBe(true);
  });

  it('respinge specificațiile tehnice, arhiva și jurnalele', () => {
    expect(isTeamDoc('technical/specs/awb-generation-tracking.md')).toBe(false);
    expect(isTeamDoc('archive/admin/old.md')).toBe(false);
    expect(isTeamDoc('session-logs/2026-07-01.md')).toBe(false);
    expect(isTeamDoc('README.md')).toBe(false);
    // Prefixul e pe folder, nu pe șir: `administrare/x.md` nu e `admin/`.
    expect(isTeamDoc('administrare/x.md')).toBe(false);
  });
});

describe('explicitAudience', () => {
  it('citește markerul de audiență din capul documentului', () => {
    expect(explicitAudience('# T\n<!-- audienta: colaborator -->\n\ntext')).toEqual(['colaborator']);
    expect(explicitAudience('# T\n<!-- audiență: echipa, colaborator -->')).toEqual(['echipa', 'colaborator']);
    expect(explicitAudience('# T\n\nfără marker')).toEqual([]);
  });

  it('ignoră markerul dacă e după primele 40 de rânduri', () => {
    const late = '# T\n' + '\n'.repeat(45) + '<!-- audienta: colaborator -->';
    expect(explicitAudience(late)).toEqual([]);
  });
});

describe('filterCorpus', () => {
  const index = [
    indexDoc('admin/a.md', '# A\n<!-- audienta: colaborator -->\n\ncuvant', 'A'),
    indexDoc('admin/b.md', '# B\n\ncuvant', 'B'),
    indexDoc('changelog/c.md', '# C\n\ncuvant', 'C'),
    indexDoc('technical/specs/d.md', '# D\n<!-- audienta: colaborator -->\n\ncuvant', 'D'),
  ];

  it('„team" păstrează doar folderele echipei', () => {
    expect(filterCorpus(index, 'team').map((d) => d.relPath)).toEqual(['admin/a.md', 'admin/b.md', 'changelog/c.md']);
  });

  it('„all" nu filtrează nimic', () => {
    expect(filterCorpus(index, 'all')).toHaveLength(4);
  });

  it('„collaborator" = doar documentele echipei marcate pentru colaborator', () => {
    // D e marcat, dar e în technical/ — colaboratorul nu vede specificații.
    expect(filterCorpus(index, 'collaborator').map((d) => d.relPath)).toEqual(['admin/a.md']);
  });
});

describe('parseSearchScope', () => {
  it('implicit „team"; „all" explicit; orice altceva cade pe team', () => {
    expect(parseSearchScope(undefined)).toBe('team');
    expect(parseSearchScope(null)).toBe('team');
    expect(parseSearchScope('all')).toBe('all');
    expect(parseSearchScope('collaborator')).toBe('collaborator');
    expect(parseSearchScope('ALL')).toBe('all');
    expect(parseSearchScope('x')).toBe('team');
  });
});
