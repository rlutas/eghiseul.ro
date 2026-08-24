/**
 * ONE-TIME builder: derives the "Cerere pentru eliberare extras din planul
 * cadastral, pe ortofotoplan" assets from the extras-CF base.
 *
 * Context: ANCPI has no dedicated anexă for the ortofotoplan extract (ODG
 * 700/2014 — the OCPIs publish a derivative of Anexa 1.30 "Cerere de
 * informații"), and the request body the OCPIs use is the same as the extras-CF
 * cerere with a different object. The collaborator's own extras-CF form is
 * already our frozen base, so the plan-cadastral cerere is that base with the
 * object swapped — HIS applicant data stays baked in, identical mechanism.
 *
 * Input is the COMMITTED extras-CF base (not his source PDF), so this build is
 * reproducible by anyone. It deletes three more lines from the content stream
 * (same exact-line deletion as build-cf-cerere-pdf-template.ts — each text run
 * is its own BT..ET block):
 *
 *   y=749    ANEXA NR. 6                    → dropped, no replacement (the
 *            ortofotoplan cerere is NOT Anexa 6; a wrong label on a filed
 *            request is worse than none)
 *   y=604.9  "pentru eliberare extras de carte funciara pentru informare"
 *            → "pentru eliberare extras din planul cadastral, pe ortofotoplan"
 *   y=503.5  "eliberați un extras de carte funciara pentru informare, ..."
 *            → "eliberați un extras din planul cadastral, pe ortofotoplan, ..."
 *
 * The two replacement lines join the field map as literal-only lines: they are
 * static text, but they have to be REDRAWN (their originals are gone from the
 * stream), and the map is where redrawing lives. The title keeps its bold
 * weight via the segment-level `bold` flag.
 *
 * Run: npx tsx --tsconfig tsconfig.json scripts/build-plan-cadastral-cerere-template.ts
 * Requires `npm i --no-save pdfjs-dist` (same as the CF builder).
 */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { PDFArray, PDFDocument, PDFName, PDFRawStream, decodePDFRawStream } from 'pdf-lib';

const DIR = 'src/templates/ancpi';
const SRC = join(DIR, 'cerere-extras-cf-base.pdf');
const SRC_MAP = join(DIR, 'cerere-extras-cf-fields.json');

/** Baselines (PDF user space) of the lines that differ from the CF cerere. */
const DROP_ONLY_Y = [749]; // ANEXA NR. 6
const TITLE_Y = 604.9;
const OBJECT_Y = 503.5;

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

  const lineAt = (y: number) => {
    const lineItems = items.filter(i => Math.abs(i.y - y) < 1.5).sort((a, b) => a.x - b.x);
    if (lineItems.length === 0) throw new Error(`no text found on line y=${y}`);
    console.log(`line y=${y}: ` + lineItems.map(i => JSON.stringify(i.str)).join(' + '));
    const x1 = Math.min(...lineItems.map(i => i.x));
    const x2 = Math.max(...lineItems.map(i => i.x + i.width));
    return {
      y: lineItems[0].y,
      size: Math.max(...lineItems.map(i => i.size)),
      startX: lineItems[0].x,
      centerX: (x1 + x2) / 2,
    };
  };

  const title = lineAt(TITLE_Y);
  const object = lineAt(OBJECT_Y);
  lineAt(DROP_ONLY_Y[0]); // assert it exists before we promise to delete it

  // Strip the three lines from the content stream — same mechanics and CTM as
  // the CF builder (`0.75 0 0 -0.75 0 792 cm`).
  const pdf = await PDFDocument.load(readFileSync(SRC));
  const page = pdf.getPages()[0];
  const CTM_SCALE = 0.75;
  const PAGE_H = page.getHeight();
  const targets = [...DROP_ONLY_Y, title.y, object.y].map(y => (PAGE_H - y) / CTM_SCALE);

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
    const tm = /\bTm\b/.test(block) ? block.match(/([-\d.]+)\s+([-\d.]+)\s+Tm/) : null;
    if (!tm) return block;
    const ty = parseFloat(tm[2]);
    if (!targets.some(t => Math.abs(ty - t) < 2)) return block;
    dropped++;
    return 'BT\nET';
  });
  if (dropped < 3) throw new Error(`expected to strip at least 3 text blocks, got ${dropped}`);
  console.log(`stripped ${dropped} text blocks from the content stream`);

  const newStream = pdf.context.flateStream(Buffer.from(stripped, 'latin1'));
  page.node.set(PDFName.of('Contents'), pdf.context.register(newStream));

  // Field map = the CF map (the shared variable lines) + the two replacement
  // literal lines. Sorted by y so a human diff of the JSON stays readable.
  const cfMap = JSON.parse(readFileSync(SRC_MAP, 'utf8')) as { lines: unknown[] };
  const lines = [
    ...cfMap.lines,
    {
      y: title.y,
      size: title.size,
      startX: title.startX,
      centerX: title.centerX,
      valuesBold: false,
      segments: [
        // The original title is bold; literals default to regular, so the
        // weight is carried by the segment-level flag.
        { literal: 'pentru eliberare extras din planul cadastral, pe ortofotoplan', gapAfter: 0, bold: true },
      ],
    },
    {
      y: object.y,
      size: object.size,
      startX: object.startX,
      segments: [
        {
          literal: 'eliberați un extras din planul cadastral, pe ortofotoplan, privind imobilul situat în',
          gapAfter: 0,
        },
      ],
    },
  ];

  writeFileSync(join(DIR, 'cerere-extras-plan-base.pdf'), Buffer.from(await pdf.save()));
  writeFileSync(join(DIR, 'cerere-extras-plan-fields.json'), JSON.stringify({ lines }, null, 2));
  console.log('plan-cadastral base + line map written:', lines.length, 'lines');
})();
