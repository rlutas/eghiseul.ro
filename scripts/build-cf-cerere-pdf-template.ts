/**
 * ONE-TIME builder: produces the base PDF + line map for the ANCPI "Cerere
 * pentru eliberare extras de carte funciara pentru informare" (Anexa nr. 6).
 *
 * Source = the exact form our topograph collaborator files at OCPI, with HIS
 * own applicant data already typed in (he is the requester — the client never
 * appears on this cerere). Only the property lines vary per order, so the base
 * keeps his data baked in and we DELETE + redraw just four lines:
 *
 *   y=702  OFICIUL ... IMOBILIARĂ    → OCPI_JUDET   (centrat)
 *   y=676  BIROUL  ... IMOBILIARĂ    → BCPI         (centrat)
 *   y=491  comuna/orașul/municipiul  → UAT
 *   y=478  cartea funciară nr.       → CF_NR (bold) + localitatea → CF_LOCALITATE
 *   y=465  nr. cadastral             → CADASTRAL (bold)
 *   y=329  Data                      → DATA
 *
 * The four lines are removed from the content stream outright (not painted
 * over): a white rectangle still leaves the sample CF number extractable, and
 * a stray "108465" that copy-paste can resurrect on a cerere is exactly the
 * mistake this whole flow exists to prevent. Every text run in this file is its
 * own BT..ET block with a Tm, so dropping the blocks on a baseline is exact.
 *
 * The segment splits below are hand-authored (four lines — a generic
 * placeholder scanner would need a DOCX source we do not have; the collaborator
 * only ever gave us the rendered PDF). Coordinates/gaps come from the source
 * PDF's own text content, so the redrawn lines land where the originals were.
 *
 * Fonts: the source embeds subsetted CID fonts we cannot reuse, but its body
 * font is Times-metric — LiberationSerif measures within 0.3% of it, so the
 * literals reflow to the same positions.
 *
 * Requires `npm i --no-save pdfjs-dist` and the source PDF as an argument.
 */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { PDFArray, PDFDocument, PDFName, PDFRawStream, decodePDFRawStream } from 'pdf-lib';

const DIR = 'src/templates/ancpi';

// The source is the collaborator's own filled-in form. It is NOT committed —
// only the derived base is — so it is passed in when a rebuild is needed:
//   npx tsx --tsconfig tsconfig.json scripts/build-cf-cerere-pdf-template.ts ~/cerere-extras-cf.pdf
const SRC = process.argv[2];
if (!SRC) throw new Error('usage: build-cf-cerere-pdf-template.ts <path-to-source-cerere.pdf>');

interface Seg { literal?: string; field?: string; gapAfter: number }
interface LineSpec {
  y: number;
  segments: Seg[];
  /** Antetul e centrat pe pagină, nu aliniat la stânga ca restul formularului. */
  align?: 'center';
  /** Antetul e integral cu font normal; în corp valorile se scriu bold. */
  valuesBold?: boolean;
}

/**
 * Per line: the ordered segments, with the applicant's sample values replaced
 * by field names. Gaps are measured from the source below (gapAfter is filled
 * in at build time for multi-item lines; splits inside one item get gap 0).
 */
const SPEC: LineSpec[] = [
  {
    y: 702,
    align: 'center',
    valuesBold: false,
    segments: [
      { literal: 'OFICIUL DE CADASTRU ȘI PUBLICITATE IMOBILIARĂ ', gapAfter: 0 },
      { field: 'OCPI_JUDET', gapAfter: 0 },
    ],
  },
  {
    y: 676,
    align: 'center',
    valuesBold: false,
    segments: [
      { literal: 'BIROUL DE CADASTRU ȘI PUBLICITATE IMOBILIARĂ ', gapAfter: 0 },
      { field: 'BCPI', gapAfter: 0 },
    ],
  },
  {
    y: 491,
    segments: [
      { literal: 'comuna/orașul/municipiul … ', gapAfter: 0 },
      { field: 'UAT', gapAfter: 0 },
      { literal: ' … …, str. … … … … … … … …, nr. .... bl……,scara ....,', gapAfter: 0 },
    ],
  },
  {
    y: 478,
    segments: [
      { literal: 'ap. ......, având cartea funciară nr. … …', gapAfter: 3.0 },
      { field: 'CF_NR', gapAfter: 3.1 },
      { literal: '… … a localității … ', gapAfter: 0 },
      { field: 'CF_LOCALITATE', gapAfter: 0 },
      { literal: ' …, cu nr. cadastral …', gapAfter: 0 },
    ],
  },
  {
    y: 465,
    segments: [
      { field: 'CADASTRAL', gapAfter: 2.9 },
      { literal: '. . . , fiindu-mi necesar la … informare …', gapAfter: 0 },
    ],
  },
  {
    y: 329,
    segments: [{ field: 'DATA', gapAfter: 0 }],
  },
];

(async () => {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const data = new Uint8Array(readFileSync(SRC));
  const page1 = await (await pdfjs.getDocument({ data }).promise).getPage(1);
  const tc = await page1.getTextContent();
  const items = (tc.items as Array<{ str: string; width: number; transform: number[] }>)
    .filter(i => i.str.trim().length > 0)
    .map(i => ({
      str: i.str,
      width: i.width,
      x: i.transform[4],
      y: i.transform[5],
      size: Math.hypot(i.transform[0], i.transform[1]),
    }));

  const pdf = await PDFDocument.load(readFileSync(SRC));
  const page = pdf.getPages()[0];

  const lines = SPEC.map(spec => {
    const lineItems = items.filter(i => Math.abs(i.y - spec.y) < 1.5).sort((a, b) => a.x - b.x);
    if (lineItems.length === 0) throw new Error(`no text found on line y=${spec.y}`);
    console.log(
      `line y=${spec.y}: ` + lineItems.map(i => JSON.stringify(i.str)).join(' + ')
    );
    const x1 = Math.min(...lineItems.map(i => i.x));
    const x2 = Math.max(...lineItems.map(i => i.x + i.width));

    return {
      y: spec.y,
      size: Math.max(...lineItems.map(i => i.size)),
      startX: lineItems[0].x,
      // Pentru liniile centrate contează centrul originalului, nu startul:
      // „CARAȘ-SEVERIN" e mult mai lung decât „SATU MARE".
      ...(spec.align === 'center' ? { centerX: (x1 + x2) / 2 } : {}),
      ...(spec.valuesBold === false ? { valuesBold: false } : {}),
      segments: spec.segments,
    };
  });

  // Strip the original text of those lines from the content stream. The page
  // CTM is `0.75 0 0 -0.75 0 792 cm`, so a baseline at PDF y maps to text-space
  // Tm y = (792 - y) / 0.75.
  const CTM_SCALE = 0.75;
  const PAGE_H = page.getHeight();
  const targets = lines.map(l => (PAGE_H - l.y) / CTM_SCALE);

  // Contents may be one stream or an array of them; concatenating is what a
  // PDF viewer does anyway, and this file's text blocks never straddle parts.
  const contents = pdf.context.lookup(page.node.get(PDFName.of('Contents')));
  const parts = contents instanceof PDFArray
    ? contents.asArray().map(r => pdf.context.lookup(r))
    : [contents];
  const source = parts
    .map(part => {
      if (!(part instanceof PDFRawStream)) throw new Error('unexpected Contents entry: not a raw stream');
      return Buffer.from(decodePDFRawStream(part).decode()).toString('latin1');
    })
    .join('\n');

  let dropped = 0;
  const stripped = source.replace(/BT\n[\s\S]*?\nET/g, block => {
    const tm = /\bTm\b/.test(block)
      ? block.match(/([-\d.]+)\s+([-\d.]+)\s+Tm/)
      : null;
    if (!tm) return block;
    const ty = parseFloat(tm[2]);
    if (!targets.some(t => Math.abs(ty - t) < 2)) return block;
    dropped++;
    return 'BT\nET';
  });
  if (dropped === 0) throw new Error('no text blocks matched the target baselines');
  console.log(`stripped ${dropped} text blocks from the content stream`);

  const newStream = pdf.context.flateStream(Buffer.from(stripped, 'latin1'));
  page.node.set(PDFName.of('Contents'), pdf.context.register(newStream));
  console.log(`content stream rewritten (${parts.length} part(s) merged)`);

  writeFileSync(join(DIR, 'cerere-extras-cf-base.pdf'), Buffer.from(await pdf.save()));
  writeFileSync(join(DIR, 'cerere-extras-cf-fields.json'), JSON.stringify({ lines }, null, 2));
  console.log('base + line map written:', lines.length, 'lines');
})();
