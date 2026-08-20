/**
 * Native PDF generation for the ANCPI "Cerere pentru eliberare extras de carte
 * funciara pentru informare" (Anexa nr. 6).
 *
 * Why this exists: while the ANCPI ePay portal is down, extras CF orders are
 * fulfilled by our topograph collaborator, who files the paper cerere himself.
 * He is the applicant on the form — his name, address, phone and e-mail are
 * baked into the base PDF — so only the property lines and the date vary per
 * order. We render them, he only signs electronically.
 *
 * Same mechanism as cazier-fiscal-cerere-pdf.ts: a frozen base PDF with the
 * variable lines whited out, plus a segment map that is redrawn here (literals
 * regular, values bold) so a long locality pushes the trailing label right
 * instead of overlapping it.
 *
 * Assets (committed, built by scripts/build-cf-cerere-pdf-template.ts):
 *  - cerere-extras-cf-base.pdf      — the form with the 4 variable lines whited
 *  - cerere-extras-cf-fields.json   — per-line segment map (PDF user space)
 *  - LiberationSerif-{Regular,Bold}.ttf — Times metrics + Romanian diacritics
 *    (Ș/Ț are outside WinAnsi); SIL OFL licensed, bundled with LibreOffice
 */

import { PDFDocument } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fitLine, type FitPiece } from '@/lib/documents/cerere-line-fit';

export interface CerereExtrasCfData {
  /** UAT (comuna/orașul/municipiul) where the property is located */
  uat: string;
  /** Carte funciară number, as filed */
  carteFunciara: string;
  /** Locality the CF belongs to — the UAT when we have nothing finer */
  cfLocalitate: string;
  /** Nr. cadastral / topografic; blank when the client only gave the CF */
  cadastral?: string;
  /** Display date, e.g. "21.08.2026" */
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

const ASSET_DIR = join(process.cwd(), 'src', 'templates', 'ancpi');

/**
 * Right text margin of the form (612pt page, 85pt margins) — every original
 * line ends at ~527. Values longer than the sample ones must not cross it.
 */
const RIGHT_MARGIN = 527.5;

export async function generateCerereExtrasCfPdf(data: CerereExtrasCfData): Promise<Buffer> {
  const basePdf = readFileSync(join(ASSET_DIR, 'cerere-extras-cf-base.pdf'));
  const map = JSON.parse(
    readFileSync(join(ASSET_DIR, 'cerere-extras-cf-fields.json'), 'utf8')
  ) as LineMap;

  const pdf = await PDFDocument.load(basePdf);
  pdf.registerFontkit(fontkit);
  const regular = await pdf.embedFont(
    readFileSync(join(ASSET_DIR, 'LiberationSerif-Regular.ttf')),
    { subset: true }
  );
  const bold = await pdf.embedFont(
    readFileSync(join(ASSET_DIR, 'LiberationSerif-Bold.ttf')),
    { subset: true }
  );

  const values: Record<string, string> = {
    UAT: (data.uat || '').trim(),
    CF_NR: (data.carteFunciara || '').trim(),
    CF_LOCALITATE: (data.cfLocalitate || data.uat || '').trim(),
    CADASTRAL: (data.cadastral || '').trim(),
    DATA: data.date || '',
  };

  const page = pdf.getPages()[0];
  for (const line of map.lines) {
    const pieces: FitPiece[] = line.segments.map(seg => ({
      text: seg.field !== undefined ? values[seg.field] ?? '' : seg.literal ?? '',
      isValue: seg.field !== undefined,
      gapAfter: seg.gapAfter,
    }));

    const fitted = fitLine(pieces, line.startX, RIGHT_MARGIN, (text, isValue) =>
      (isValue ? bold : regular).widthOfTextAtSize(text, line.size)
    );

    let x = line.startX;
    for (const piece of fitted) {
      if (piece.text) {
        page.drawText(piece.text, {
          x,
          y: line.y,
          size: line.size,
          font: piece.isValue ? bold : regular,
        });
        x += (piece.isValue ? bold : regular).widthOfTextAtSize(piece.text, line.size);
      }
      x += piece.gapAfter;
    }
  }

  return Buffer.from(await pdf.save());
}
