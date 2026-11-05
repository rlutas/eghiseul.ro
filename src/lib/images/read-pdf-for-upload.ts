/**
 * Read a scanned ID document sent as PDF.
 *
 * Images get compressed to about 250 KB, a PDF goes as it is, so it needs its own
 * limit. Every autosave sends all documents as base64 (a third larger) and the
 * serverless request limit is 4.5 MB: two PDFs plus a selfie must fit. The largest
 * PDF on a paid order in the last 120 days was 1.33 MB.
 */

export const MAX_PDF_BYTES = 1.5 * 1024 * 1024;

export interface ReadPdf {
  base64: string;
  mimeType: 'application/pdf';
  sizeAfter: number;
}

export function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

/** A renamed file or a picture saved as `.pdf` would reach the team unreadable. */
export async function looksLikePdf(file: File): Promise<boolean> {
  const head = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  return String.fromCharCode(...head) === '%PDF-';
}

export async function readPdfForUpload(file: File): Promise<ReadPdf> {
  if (file.size === 0) {
    throw new Error('Fișierul este gol (0 KB). Încarcă din nou documentul.');
  }
  if (file.size > MAX_PDF_BYTES) {
    throw new Error('PDF-ul este prea mare (limita este 1,5 MB). Încarcă o poză a actului.');
  }
  if (!(await looksLikePdf(file))) {
    throw new Error('Fișierul nu poate fi citit ca PDF. Încarcă o poză a actului.');
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return { base64: btoa(binary), mimeType: 'application/pdf', sizeAfter: file.size };
}
