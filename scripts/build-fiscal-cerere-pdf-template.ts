/**
 * ONE-TIME builder: regenerates the ANAF cerere base PDF + line map after
 * the DOCX template changes. Requires macOS LibreOffice + `npm i --no-save
 * pdfjs-dist`. Run: npx tsx --tsconfig tsconfig.json scripts/build-fiscal-cerere-pdf-template.ts
 * Base = {{PLACEHOLDER}} render with every placeholder-bearing LINE whited
 * out. JSON stores, per line, the ordered segments (literal label text vs
 * placeholder fields) with original gaps, so runtime redraws the whole line
 * with natural flow — long values push following labels right, like in DOCX.
 */
import { readFileSync, writeFileSync, mkdtempSync, copyFileSync } from 'fs';
import { execFileSync } from 'child_process';
import { tmpdir } from 'os';
import { join } from 'path';
import { PDFDocument, rgb } from 'pdf-lib';

const TPL = 'src/templates/cazier-fiscal/cerere-eliberare-pf.docx';
const OUT = 'src/templates/cazier-fiscal';

const dir = mkdtempSync(join(tmpdir(), 'fiscal-tpl3-'));
copyFileSync(TPL, join(dir, 'ph.docx'));
execFileSync('/opt/homebrew/bin/soffice', ['--headless','--convert-to','pdf','--outdir', dir, join(dir,'ph.docx')], { stdio: 'ignore' });

type Item = { str: string; width: number; x: number; y: number; size: number };

(async () => {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const data = new Uint8Array(readFileSync(join(dir, 'ph.pdf')));
  const src = await pdfjs.getDocument({ data }).promise;
  const page = await src.getPage(1);
  const tc = await page.getTextContent();
  const items: Item[] = (tc.items as Array<{ str: string; width: number; transform: number[] }>)
    .filter(i => i.str.trim().length > 0)
    .map(i => ({ str: i.str, width: i.width, x: i.transform[4], y: i.transform[5], size: Math.hypot(i.transform[0], i.transform[1]) }));

  // group items by baseline (y within 1.5pt)
  const phYs = [...new Set(items.filter(i => /\{\{/.test(i.str)).map(i => Math.round(i.y)))];
  const lines: Array<{ y: number; size: number; startX: number; coverX1: number; coverX2: number; segments: Array<{ literal?: string; field?: string; gapAfter: number }> }> = [];

  for (const y of phYs) {
    const lineItems = items.filter(i => Math.abs(i.y - y) < 1.5).sort((a, b) => a.x - b.x);
    const segments: Array<{ literal?: string; field?: string; gapAfter: number }> = [];
    let coverX1 = Infinity, coverX2 = -Infinity, size = 0;
    for (let k = 0; k < lineItems.length; k++) {
      const it = lineItems[k];
      const next = lineItems[k + 1];
      const gapAfter = next ? Math.max(0, next.x - (it.x + it.width)) : 0;
      coverX1 = Math.min(coverX1, it.x); coverX2 = Math.max(coverX2, it.x + it.width);
      size = Math.max(size, it.size);
      // split item into literal / placeholder segments
      const parts = it.str.split(/(\{\{[A-Z_]+\}\})/).filter(Boolean);
      const charW = it.width / it.str.length;
      parts.forEach((p, idx) => {
        const isPh = /^\{\{[A-Z_]+\}\}$/.test(p);
        const isLast = idx === parts.length - 1;
        segments.push(isPh
          ? { field: p.slice(2, -2), gapAfter: isLast ? gapAfter : 0 }
          : { literal: p, gapAfter: isLast ? gapAfter : 0 });
        void charW;
      });
    }
    lines.push({ y, size, startX: lineItems[0].x, coverX1, coverX2, segments });
    console.log(`line y=${y}: ${lineItems.map(i => JSON.stringify(i.str)).join(' + ')}`);
  }

  // white out each line fully in the base
  const pdf = await PDFDocument.load(readFileSync(join(dir, 'ph.pdf')));
  const p0 = pdf.getPages()[0];
  for (const ln of lines) {
    p0.drawRectangle({ x: ln.coverX1 - 1, y: ln.y - 3, width: ln.coverX2 - ln.coverX1 + 4, height: ln.size + 4.5, color: rgb(1, 1, 1) });
  }
  writeFileSync(join(OUT, 'cerere-cazier-fiscal-base.pdf'), Buffer.from(await pdf.save()));
  writeFileSync(join(OUT, 'cerere-cazier-fiscal-fields.json'), JSON.stringify({ lines: lines.map(({ coverX1, coverX2, ...l }) => l) }, null, 2));
  console.log('v3 base + line map written:', lines.length, 'lines');
})();
