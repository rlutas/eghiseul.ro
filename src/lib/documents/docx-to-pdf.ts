/**
 * DOCX → PDF conversion for faithful previews/printing.
 *
 * Why: mammoth's DOCX→HTML preview flattens positioned text boxes, so
 * official forms (e.g. the ANAF cerere cazier fiscal) look broken in the
 * admin preview even though the DOCX is correct. A real rendering engine is
 * required for fidelity:
 *
 *  - Production: CloudConvert sync API (EU processing) when
 *    `CLOUDCONVERT_API_KEY` is set.
 *  - Local dev: LibreOffice (`soffice`) when installed.
 *  - Neither available → returns null and callers fall back to HTML preview.
 *
 * Conversion is meant to be done ONCE per document and cached in S3 next to
 * the DOCX (see the admin preview route) — not on every view.
 */

import { execFileSync } from 'child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const SOFFICE_PATHS = [
  '/opt/homebrew/bin/soffice',
  '/usr/local/bin/soffice',
  '/usr/bin/soffice',
];

function findSoffice(): string | null {
  for (const p of SOFFICE_PATHS) {
    if (existsSync(p)) return p;
  }
  return null;
}

async function convertViaCloudConvert(docx: Buffer, apiKey: string): Promise<Buffer> {
  // Sync API: the request resolves only when the whole job is finished.
  const res = await fetch('https://sync.api.cloudconvert.com/v2/jobs', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tasks: {
        'import-docx': {
          operation: 'import/base64',
          file: docx.toString('base64'),
          filename: 'document.docx',
        },
        'convert-pdf': {
          operation: 'convert',
          input: 'import-docx',
          output_format: 'pdf',
        },
        'export-pdf': {
          operation: 'export/url',
          input: 'convert-pdf',
        },
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`CloudConvert job failed: ${res.status} ${await res.text()}`);
  }

  const job = (await res.json()) as {
    data?: { tasks?: Array<{ name: string; result?: { files?: Array<{ url?: string }> } }> };
  };
  const exportTask = job.data?.tasks?.find((t) => t.name === 'export-pdf');
  const fileUrl = exportTask?.result?.files?.[0]?.url;
  if (!fileUrl) {
    throw new Error('CloudConvert job returned no export URL');
  }

  const pdfRes = await fetch(fileUrl);
  if (!pdfRes.ok) {
    throw new Error(`CloudConvert PDF download failed: ${pdfRes.status}`);
  }
  return Buffer.from(await pdfRes.arrayBuffer());
}

function convertViaSoffice(docx: Buffer, soffice: string): Buffer {
  const dir = mkdtempSync(join(tmpdir(), 'docx2pdf-'));
  try {
    const inPath = join(dir, 'document.docx');
    writeFileSync(inPath, docx);
    execFileSync(soffice, ['--headless', '--convert-to', 'pdf', '--outdir', dir, inPath], {
      timeout: 60_000,
      stdio: 'ignore',
    });
    return readFileSync(join(dir, 'document.pdf'));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** True when at least one conversion backend is available. */
export function isPdfConversionAvailable(): boolean {
  return !!process.env.CLOUDCONVERT_API_KEY || !!findSoffice();
}

/**
 * Convert a DOCX buffer to PDF. Returns null when no backend is available
 * or the conversion fails — callers must fall back gracefully (HTML preview).
 */
export async function convertDocxToPdf(docx: Buffer): Promise<Buffer | null> {
  try {
    const apiKey = process.env.CLOUDCONVERT_API_KEY;
    if (apiKey) {
      return await convertViaCloudConvert(docx, apiKey);
    }
    const soffice = findSoffice();
    if (soffice) {
      return convertViaSoffice(docx, soffice);
    }
    return null;
  } catch (err) {
    console.error('[docx-to-pdf] conversion failed:', err instanceof Error ? err.message : err);
    return null;
  }
}
