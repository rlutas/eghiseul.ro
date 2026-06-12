/**
 * Native PDF generation for the ANAF "Cerere de eliberare a certificatului
 * de cazier fiscal" (form 502).
 *
 * Why: the DOCX version of this form is built from positioned text boxes, so
 * HTML previews (mammoth) mangle it and a faithful DOCX→PDF render would need
 * an external conversion engine. Instead we fill a frozen base PDF directly
 * with pdf-lib — pure JS, runs on Vercel, pixel-identical layout.
 *
 * Model: every line that contains placeholders is whited out in the base PDF
 * (at build time) and fully REDRAWN here — literal label text in regular,
 * values in bold — preserving the original inter-segment gaps. Long values
 * push the following labels right, exactly like the DOCX text-box reflow.
 *
 * Assets (committed, built once from the DOCX template via LibreOffice +
 * pdfjs coordinate extraction):
 *  - cerere-cazier-fiscal-base.pdf    — rendered form, placeholder lines whited
 *  - cerere-cazier-fiscal-fields.json — per-line segment map (PDF user space)
 *  - LiberationSans-{Regular,Bold}.ttf — embedded for Romanian diacritics
 *    (Ș/Ț are outside WinAnsi); SIL OFL licensed, bundled with LibreOffice
 *
 * The DOCX remains the editable source of truth; this PDF is the
 * preview/print artifact uploaded alongside it.
 */

import { PDFDocument } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface FiscalCerereData {
  cnp: string;
  /** Family name (NUME) */
  lastName: string;
  /** Given name (PRENUME) */
  firstName: string;
  county: string;
  city: string;
  street: string;
  number: string;
  building: string;
  staircase: string;
  apartment: string;
  /** Request reason, e.g. "Informare" */
  motiv: string;
  /** Display date, e.g. "12.06.2026" */
  date: string;
}

interface LineSegment {
  literal?: string;
  field?: string;
  gapAfter: number;
}

interface LineMap {
  lines: Array<{ y: number; size: number; startX: number; segments: LineSegment[] }>;
}

const ASSET_DIR = join(process.cwd(), 'src', 'templates', 'cazier-fiscal');

export async function generateFiscalCererePdf(data: FiscalCerereData): Promise<Buffer> {
  const basePdf = readFileSync(join(ASSET_DIR, 'cerere-cazier-fiscal-base.pdf'));
  const map = JSON.parse(
    readFileSync(join(ASSET_DIR, 'cerere-cazier-fiscal-fields.json'), 'utf8')
  ) as LineMap;

  const pdf = await PDFDocument.load(basePdf);
  pdf.registerFontkit(fontkit);
  const regular = await pdf.embedFont(
    readFileSync(join(ASSET_DIR, 'LiberationSans-Regular.ttf')),
    { subset: true }
  );
  const bold = await pdf.embedFont(
    readFileSync(join(ASSET_DIR, 'LiberationSans-Bold.ttf')),
    { subset: true }
  );

  const up = (s: string) => (s || '').toUpperCase();
  const values: Record<string, string> = {
    CNP: data.cnp || '',
    NUME: up(data.lastName),
    PRENUME: up(data.firstName),
    JUDETUL: up(data.county),
    LOCALITATEA: up(data.city),
    STR: up(data.street),
    NR: data.number || '',
    BL: data.building || '',
    SC: data.staircase || '',
    AP: data.apartment || '',
    MOTIV: data.motiv || 'Informare',
    DATA: data.date || '',
  };

  const page = pdf.getPages()[0];
  for (const line of map.lines) {
    let x = line.startX;
    for (const seg of line.segments) {
      const isField = seg.field !== undefined;
      const text = isField ? values[seg.field!] ?? '' : seg.literal ?? '';
      const font = isField ? bold : regular;
      if (text) {
        page.drawText(text, { x, y: line.y, size: line.size, font });
        x += font.widthOfTextAtSize(text, line.size);
      }
      x += seg.gapAfter;
    }
  }

  return Buffer.from(await pdf.save());
}
