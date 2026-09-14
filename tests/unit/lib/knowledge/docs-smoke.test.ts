import { describe, expect, it } from 'vitest';
import { CURATED_GUIDES, loadAllTeamDocs, loadChangelog, loadPlatformVersion, resolveDoc } from '@/lib/knowledge/docs';
import { renderMarkdown } from '@/lib/knowledge/render';

// Smoke test pe docs/ REAL (fără rețea): dacă cineva strică formatul tabelului
// din docs/changelog/README.md sau mută un ghid curatoriat, Knowledge Center-ul
// din admin rămâne gol sau dă 404 — prindem aici, la CI, nu în producție.

describe('Knowledge Center peste docs/ real', () => {
  it('changelog-ul se parsează și are livrări recente', async () => {
    const entries = await loadChangelog();
    expect(entries.length).toBeGreaterThan(100);
    expect(entries[0].date >= '2026-09-14').toBe(true);
    // Cel puțin intrarea din 14.09 (transfer bancar) are secțiunea „Pentru echipă".
    expect(entries.some((e) => e.teamMd)).toBe(true);
  });

  it('versiunea derivă din changelog', async () => {
    const v = await loadPlatformVersion();
    expect(v.releases).toBeGreaterThan(100);
    expect(v.label).toMatch(/^v\d+ · \d{2}\.\d{2}\.\d{4}$/);
  });

  it('toate ghidurile curatoriate există pe disc', async () => {
    for (const g of CURATED_GUIDES) {
      const doc = await resolveDoc(g.slug);
      expect(doc, `ghid lipsă: ${g.slug}`).not.toBeNull();
    }
  });

  it('documentele echipei au titlu și se randează cu linkuri interne rescrise', async () => {
    const docs = await loadAllTeamDocs();
    expect(docs.length).toBeGreaterThan(10);
    const plata = await resolveDoc('admin/plata-transfer-bancar');
    const html = renderMarkdown(plata!.content, plata!.relPath);
    expect(html).toContain('<h1');
    // Linkul relativ către changelog e rescris în admin, nu lăsat ca ../changelog/...
    expect(html).toContain('href="/admin/ghid/changelog/2026-09-10-plata-transfer-bancar-reparata/"');
    expect(html).not.toContain('href="../');
  });

  it('nu servește nimic din afara docs/', async () => {
    expect(await resolveDoc('../package')).toBeNull();
  });
});
