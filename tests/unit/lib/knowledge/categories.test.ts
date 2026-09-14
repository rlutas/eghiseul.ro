import { describe, expect, it } from 'vitest';
import { categorize, CATEGORY_IDS, explicitCategory, isCategoryId } from '@/lib/knowledge/categories';

// Categoriile din Knowledge Center: auto după cuvinte-cheie, override explicit.

describe('categorize', () => {
  it('plăți bate comenzi când apar ambele („comandă" e peste tot)', () => {
    expect(categorize('🟣 **Transfer bancar: lucrul pornește pe dovada de plată** — comanda E-1 pe „Așteptare plată", factura Oblio')).toBe('plati');
  });
  it('livrare', () => {
    expect(categorize('🔴 AWB Sameday easybox cere lockerId — livrarea la client')).toBe('livrare');
  });
  it('documente & Barou', () => {
    expect(categorize('🔴 Împuterniciri pe serviciile secundare — cererea se genera, împuternicirea nu; onorariu avocat')).toBe('documente');
  });
  it('automatizări', () => {
    expect(categorize('🔴 Botul ONRC a picat pe 2 comenzi plătite — worker Railway, Playwright')).toBe('automatizari');
  });
  it('seo', () => {
    expect(categorize('🔴 Conținutul paginilor era invizibil pentru crawlerii AI — loading.tsx, robots.txt')).toBe('seo');
  });
  it('admin', () => {
    expect(categorize('🟣 Knowledge Center în admin: „Ghid & noutăți" — badge în meniu, echipa')).toBe('admin');
  });
  it('fără potriviri → altele', () => {
    expect(categorize('lorem ipsum dolor')).toBe('altele');
  });
});

describe('explicitCategory', () => {
  it('citește comentariul din capul fișierului', () => {
    expect(explicitCategory('# T\n<!-- categorie: livrare -->\n\ntext')).toBe('livrare');
    expect(explicitCategory('# T\n<!-- category: SEO -->')).toBe('seo');
  });
  it('ignoră valori necunoscute și comentarii adânci în fișier', () => {
    expect(explicitCategory('# T\n<!-- categorie: nimic -->')).toBeNull();
    expect(explicitCategory('# T\n' + '\n'.repeat(60) + '<!-- categorie: plati -->')).toBeNull();
  });
});

describe('isCategoryId', () => {
  it('acceptă doar id-urile cunoscute', () => {
    for (const id of CATEGORY_IDS) expect(isCategoryId(id)).toBe(true);
    expect(isCategoryId('x')).toBe(false);
    expect(isCategoryId(null)).toBe(false);
  });
});
