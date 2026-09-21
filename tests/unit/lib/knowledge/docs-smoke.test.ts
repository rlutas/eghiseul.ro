import { describe, expect, it } from 'vitest';
import {
  CURATED_GUIDES,
  listDirectory,
  loadAllTeamDocs,
  loadChangelog,
  loadCollaboratorDocs,
  loadPlatformVersion,
  loadTopFolders,
  resolveCollaboratorDoc,
  resolveDoc,
  searchDocs,
} from '@/lib/knowledge/docs';
import { isTeamDoc } from '@/lib/knowledge/corpus';
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

  it('căutarea acoperă tot docs/ și găsește fără diacritice', async () => {
    const folders = await loadTopFolders();
    const total = folders.reduce((s, f) => s + f.count, 0);
    expect(total).toBeGreaterThan(400);
    expect(folders.map((f) => f.name)).toEqual(expect.arrayContaining(['changelog', 'admin', 'technical', 'seo']));

    const r = await searchDocs('asteptare plata');
    expect(r.length).toBeGreaterThan(0);
    expect(r.some((x) => x.slug === 'admin/plata-transfer-bancar')).toBe(true);
    expect(r[0].snippetHtml).toContain('<mark>');
  });

  it('căutarea implicită stă pe corpusul echipei; „all" aduce și specificațiile', async () => {
    // „AWB" există și în docs/technical/specs; implicit nu trebuie să apară.
    const team = await searchDocs('awb');
    expect(team.length).toBeGreaterThan(0);
    expect(team.every((x) => isTeamDoc(x.relPath))).toBe(true);
    const all = await searchDocs('awb', 30, 'all');
    expect(all.some((x) => x.relPath.startsWith('technical/'))).toBe(true);
  });

  it('fișele de servicii sunt în documentele echipei și se găsesc la căutare', async () => {
    const docs = await loadAllTeamDocs();
    const slugs = docs.map((d) => d.slug);
    expect(slugs).toEqual(
      expect.arrayContaining([
        'admin/servicii',
        'admin/servicii/caziere-si-integritate',
        'admin/servicii/stare-civila',
        'admin/servicii/certificat-constatator',
        'admin/servicii/extras-carte-funciara',
        'admin/servicii/imobiliare-topograf',
        'admin/servicii/optiuni-suplimentare',
        'admin/statusuri-comenzi',
        'admin/pagina-comenzii',
      ])
    );
    // README-ul folderului apare o singură dată.
    expect(slugs.filter((s) => s === 'admin/servicii')).toHaveLength(1);
    const r = await searchDocs('permis strainatate');
    expect(r.some((x) => x.slug === 'admin/servicii/caziere-si-integritate')).toBe(true);
  });

  it('colaboratorul vede doar ghidurile marcate pentru el', async () => {
    const docs = await loadCollaboratorDocs();
    const slugs = docs.map((d) => d.slug);
    expect(slugs).toEqual(
      expect.arrayContaining([
        'admin/servicii/imobiliare-topograf',
        'admin/servicii/extras-carte-funciara',
        'admin/identificare-imobil-nereusita',
      ])
    );
    expect(slugs).not.toContain('admin/plata-transfer-bancar');
    expect(await resolveCollaboratorDoc(['admin', 'servicii', 'imobiliare-topograf'])).not.toBeNull();
    expect(await resolveCollaboratorDoc(['admin', 'plata-transfer-bancar'])).toBeNull();
    expect(await resolveCollaboratorDoc(['technical', 'specs', 'railway-workers'])).toBeNull();
    // Linkurile dintre ghiduri rămân în portalul colaboratorului.
    const doc = await resolveCollaboratorDoc(['admin', 'servicii', 'imobiliare-topograf']);
    const html = renderMarkdown(doc!.content, doc!.relPath, '/colaborator/ghid');
    expect(html).toContain('href="/colaborator/ghid/admin/identificare-imobil-nereusita/"');
    expect(html).not.toContain('/admin/ghid/');
  });

  it('folderul changelog se listează cu fișierele cele mai noi primele', async () => {
    const dir = await listDirectory('changelog');
    expect(dir).not.toBeNull();
    expect(dir!.files.length).toBeGreaterThan(100);
    expect(dir!.files[0].relPath >= dir!.files[1].relPath).toBe(true);
    expect(await listDirectory('admin/plata-transfer-bancar')).toBeNull();
  });
});
