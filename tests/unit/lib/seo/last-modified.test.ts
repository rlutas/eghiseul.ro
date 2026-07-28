/**
 * Registrul de date pentru `<lastmod>` (lib/seo/last-modified.ts) trebuie să
 * rămână sincronizat cu `DATE_MODIFIED` din fiecare pagină.
 *
 * De ce testul ăsta: un `lastmod` greșit e mai rău decât lipsa lui — Google
 * învață să ignore semnalul dacă îl minți. Registrul e o copie a datelor din
 * pagini, deci singura protecție reală împotriva desincronizării e CI-ul.
 * Dacă schimbi `DATE_MODIFIED` într-un articol, testul îți spune exact ce să
 * actualizezi în registru.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { PAGE_LAST_MODIFIED, pageLastModified } from '@/lib/seo/last-modified';

const APP_DIR = join(process.cwd(), 'src', 'app');

/** Slug → data din `const DATE_MODIFIED = '...'` a paginii, citită de pe disc. */
function datesFromPages(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const entry of readdirSync(APP_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const pagePath = join(APP_DIR, entry.name, 'page.tsx');
    if (!existsSync(pagePath)) continue;
    const source = readFileSync(pagePath, 'utf8');
    const m = source.match(/const DATE_MODIFIED\s*=\s*['"](\d{4}-\d{2}-\d{2})['"]/);
    if (!m) continue;
    out[entry.name] = m[1];
  }
  return out;
}

describe('PAGE_LAST_MODIFIED — sincronizare cu paginile', () => {
  const fromPages = datesFromPages();

  it('găsește pagini cu DATE_MODIFIED (altfel testul e inutil)', () => {
    expect(Object.keys(fromPages).length).toBeGreaterThan(30);
  });

  it('fiecare pagină cu DATE_MODIFIED are intrare în registru, cu aceeași dată', () => {
    const mismatches: string[] = [];
    for (const [slug, date] of Object.entries(fromPages)) {
      const inRegistry = PAGE_LAST_MODIFIED[slug];
      if (!inRegistry) {
        mismatches.push(`${slug}: lipsește din registru (pagina zice ${date})`);
      } else if (inRegistry !== date) {
        mismatches.push(`${slug}: registru ${inRegistry} ≠ pagină ${date}`);
      }
    }
    expect(mismatches, `Actualizează src/lib/seo/last-modified.ts:\n${mismatches.join('\n')}`).toEqual([]);
  });

  it('registrul nu conține slug-uri fără pagină', () => {
    const orphans = Object.keys(PAGE_LAST_MODIFIED).filter(
      (slug) => !existsSync(join(APP_DIR, slug, 'page.tsx'))
    );
    expect(orphans, `Slug-uri din registru fără pagină: ${orphans.join(', ')}`).toEqual([]);
  });

  it('datele sunt ISO valide și nu în viitor', () => {
    const now = Date.now();
    for (const [slug, iso] of Object.entries(PAGE_LAST_MODIFIED)) {
      const d = new Date(iso);
      expect(Number.isNaN(d.getTime()), `${slug}: dată invalidă "${iso}"`).toBe(false);
      expect(d.getTime(), `${slug}: dată în viitor`).toBeLessThanOrEqual(now + 86_400_000);
    }
  });

  it('pageLastModified întoarce Date pentru slug cunoscut, undefined altfel', () => {
    const known = Object.keys(PAGE_LAST_MODIFIED)[0];
    expect(pageLastModified(known)).toBeInstanceOf(Date);
    expect(pageLastModified('slug-care-nu-exista-nicaieri')).toBeUndefined();
  });
});
