import { describe, expect, it } from 'vitest';
import {
  computePlatformVersion,
  extractSection,
  extractTitle,
  normalizeDocSlug,
  parseChangelogIndex,
  parseQuickNav,
  rewriteDocLink,
  TEAM_SECTION_RE,
} from '@/lib/knowledge/parse';

// Knowledge Center (/admin/ghid) citește docs/ direct. Parserul trebuie să
// suporte rândurile „strâmbe" acumulate în 135 de livrări.

const CHANGELOG = `# Changelog

| Data | Ce s-a livrat | Detalii |
|---|---|---|
| 2026-09-14 | 🟣 **Transfer bancar: lucrul pornește pe dovadă** — text cu \`cod | cu bară\` | [2026-09-14-x.md](2026-09-14-x.md) |
| 2026-09-14 | 🔴 **Botul ONRC a picat** | [2026-09-14-onrc.md](2026-09-14-onrc.md) |
| [2026-09-02-chatgpt-ads-lansare.md](2026-09-02-chatgpt-ads-lansare.md) | ChatGPT Ads: evaluare politică |
 | 2026-07-17 | ✅ **Articol optimizat** | commit \`5eca8b0\` |
| 2026-07-01 | 🔄 **Refactor** | [a.md](a.md) · [spec](../technical/specs/b.md) |
`;

describe('parseChangelogIndex', () => {
  const entries = parseChangelogIndex(CHANGELOG);

  it('sare header-ul și separatorul, păstrează toate rândurile de date', () => {
    expect(entries).toHaveLength(5);
  });

  it('bara din cod inline nu sparge coloanele', () => {
    expect(entries[0].summaryMd).toContain('`cod | cu bară`');
    expect(entries[0].detailFile).toBe('2026-09-14-x.md');
  });

  it('clasifică după emoji', () => {
    expect(entries.map((e) => e.kind)).toEqual(['feature', 'fix', 'other', 'change', 'refactor']);
  });

  it('rând fără coloana de dată: data vine din numele fișierului', () => {
    expect(entries[2]).toMatchObject({
      date: '2026-09-02',
      detailFile: '2026-09-02-chatgpt-ads-lansare.md',
      summaryMd: 'ChatGPT Ads: evaluare politică',
    });
  });

  it('rând cu spațiu înainte și cu commit în loc de link', () => {
    expect(entries[3]).toMatchObject({ date: '2026-07-17', detailFile: null });
  });

  it('coloana Detalii cu mai multe linkuri ia primul .md', () => {
    expect(entries[4].detailFile).toBe('a.md');
  });
});

describe('extractTitle / extractSection', () => {
  const doc = `# Titlul **meu**

intro

## Pentru echipă

Apasă butonul X.
- pas 1

## Ce s-a livrat

tehnic
`;
  it('titlul din H1 fără markdown', () => {
    expect(extractTitle(doc)).toBe('Titlul meu');
  });
  it('secțiunea „Pentru echipă" până la următorul heading', () => {
    expect(extractSection(doc, TEAM_SECTION_RE)).toBe('Apasă butonul X.\n- pas 1');
  });
  it('null când secțiunea lipsește', () => {
    expect(extractSection('# X\n\ntext', TEAM_SECTION_RE)).toBeNull();
  });
});

describe('normalizeDocSlug', () => {
  it('acceptă căi normale și scoate .md', () => {
    expect(normalizeDocSlug(['changelog', '2026-09-14-x.md'])).toBe('changelog/2026-09-14-x');
    expect(normalizeDocSlug(['admin', 'comenzi-telefonice'])).toBe('admin/comenzi-telefonice');
  });
  it('refuză ieșirea din docs/ și caracterele dubioase', () => {
    expect(normalizeDocSlug(['..', 'package.json'])).toBeNull();
    expect(normalizeDocSlug(['admin', '..%2F..', 'x'])).toBeNull();
    expect(normalizeDocSlug(['a;rm -rf'])).toBeNull();
    expect(normalizeDocSlug([])).toBeNull();
  });
});

describe('rewriteDocLink', () => {
  const cur = 'changelog/2026-09-14-x.md';
  it('lasă linkurile externe și ancorele', () => {
    expect(rewriteDocLink('https://eghiseul.ro/', cur)).toBe('https://eghiseul.ro/');
    expect(rewriteDocLink('#sectiune', cur)).toBe('#sectiune');
  });
  it('rezolvă relativ la documentul curent', () => {
    expect(rewriteDocLink('../admin/plata-transfer-bancar.md', cur)).toBe('/admin/ghid/admin/plata-transfer-bancar/');
    expect(rewriteDocLink('2026-09-10-y.md#cap', cur)).toBe('/admin/ghid/changelog/2026-09-10-y/#cap');
  });
  it('README.md → directorul', () => {
    expect(rewriteDocLink('../registru-central/README.md', cur)).toBe('/admin/ghid/registru-central/');
    expect(rewriteDocLink('../seo/', cur)).toBe('/admin/ghid/seo/');
  });
  it('nu servește fișiere non-markdown și nu iese din docs/', () => {
    expect(rewriteDocLink('poza.png', cur)).toBeNull();
    expect(rewriteDocLink('../../package.json', cur)).toBeNull();
    expect(rewriteDocLink('../../../etc/x.md', cur)).toBeNull();
  });
});

describe('parseQuickNav', () => {
  it('citește tabelul din docs/admin/README.md', () => {
    const md = `| Document | Description | Status |
|---|---|---|
| [Plată IBAN](./plata-transfer-bancar.md) | Cum confirmi | Implemented |
| [Comenzi telefonice](./comenzi-telefonice/README.md) | A→Z | Implemented (2026-07-15) |
| nu e link | x | y |`;
    expect(parseQuickNav(md)).toEqual([
      { title: 'Plată IBAN', file: 'plata-transfer-bancar.md', description: 'Cum confirmi', status: 'Implemented' },
      { title: 'Comenzi telefonice', file: 'comenzi-telefonice/README.md', description: 'A→Z', status: 'Implemented (2026-07-15)' },
    ]);
  });
});

describe('computePlatformVersion', () => {
  it('v<număr livrări> · ultima dată', () => {
    const v = computePlatformVersion(parseChangelogIndex(CHANGELOG));
    expect(v).toEqual({ releases: 5, latestDate: '2026-09-14', label: 'v5 · 14.09.2026' });
  });
  it('fără intrări', () => {
    expect(computePlatformVersion([]).label).toBe('v0');
  });
});
