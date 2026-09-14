import { describe, expect, it } from 'vitest';
import {
  highlight,
  indexDoc,
  normalizeText,
  searchIndex,
  slugFromRelPath,
  stripMarkdown,
  tokenizeQuery,
} from '@/lib/knowledge/search';

// Căutarea din Knowledge Center: echipa tastează fără diacritice, documentele
// au diacritice (și, din ANAF, cedille legacy). Trebuie să se găsească oricum.

describe('normalizeText', () => {
  it('aruncă diacriticele comma-below și cedilla și ghilimelele românești', () => {
    expect(normalizeText('Așteptare plată')).toBe('asteptare plata');
    expect(normalizeText('Şedinţă')).toBe('sedinta');
    expect(normalizeText('„Confirmă plata”')).toBe('"confirma plata"');
  });
});

describe('stripMarkdown', () => {
  it('scoate headinguri, linkuri, cod și barele de tabel', () => {
    const md = '# Titlu\n\n| a | b |\n|---|---|\n| [x](y.md) | `cod` |\n\n**bold** text';
    expect(stripMarkdown(md)).toBe('Titlu a b x cod bold text');
  });
});

describe('slugFromRelPath', () => {
  it('scoate .md și README', () => {
    expect(slugFromRelPath('admin/plata-transfer-bancar.md')).toBe('admin/plata-transfer-bancar');
    expect(slugFromRelPath('registru-central/README.md')).toBe('registru-central');
    expect(slugFromRelPath('README.md')).toBe('');
  });
});

describe('searchIndex', () => {
  const index = [
    indexDoc('admin/plata-transfer-bancar.md', '# Plata prin transfer bancar\n\nTabul „Așteptare plată”. Apasă „Confirmă plata”.', 'Plata prin transfer bancar'),
    indexDoc('changelog/2026-09-14-x.md', '# Lucru pe dovadă\n\nComanda trece pe În procesare când operatorul confirmă dovada.', 'Lucru pe dovadă'),
    indexDoc('seo/plan.md', '# Plan SEO\n\nClustere și cuvinte cheie.', 'Plan SEO'),
  ];

  it('găsește fără diacritice și pune titlul potrivit primul', () => {
    const r = searchIndex(index, 'transfer bancar');
    expect(r.map((x) => x.slug)).toEqual(['admin/plata-transfer-bancar']);
    expect(r[0].snippetHtml).toContain('<mark>transfer</mark>');
  });

  it('toate cuvintele trebuie să apară', () => {
    expect(searchIndex(index, 'asteptare plata').map((x) => x.slug)).toEqual(['admin/plata-transfer-bancar']);
    expect(searchIndex(index, 'asteptare seo')).toEqual([]);
  });

  it('marchează termenul cu diacritice când interogarea e fără', () => {
    const r = searchIndex(index, 'confirma');
    expect(r).toHaveLength(2);
    expect(r.some((x) => x.snippetHtml.includes('<mark>Confirmă</mark>'))).toBe(true);
    expect(r.some((x) => x.snippetHtml.includes('<mark>confirmă</mark>'))).toBe(true);
  });

  it('interogare goală sau prea scurtă → nimic', () => {
    expect(searchIndex(index, '')).toEqual([]);
    expect(searchIndex(index, 'a')).toEqual([]);
    expect(tokenizeQuery('  a  ')).toEqual([]);
  });

  it('escapează HTML-ul din fragment', () => {
    const idx = [indexDoc('x.md', '# T\n\n<script>alert(1)</script> cuvant', 'T')];
    const r = searchIndex(idx, 'cuvant');
    expect(r[0].snippetHtml).toContain('&lt;script');
    expect(r[0].snippetHtml).not.toContain('<script');
  });
});

describe('highlight', () => {
  it('nu marchează nimic fără termeni și escapează', () => {
    expect(highlight('a < b', [])).toBe('a &lt; b');
  });
});
