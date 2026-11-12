/**
 * Read a scanned ID document sent as PDF.
 *
 * Images get compressed to about 250 KB, a PDF goes as it is, so it needs its own
 * limit. Every autosave sends all documents as base64 (a third larger) and the
 * serverless request limit is 4.5 MB: two PDFs plus a selfie must fit. The largest
 * PDF on a paid order in the last 120 days was 1.33 MB.
 */

import { reportClientError } from '@/lib/client-errors/report';
import { sizeBucket } from '@/lib/client-errors/schema';
import { PdfRenderError, renderPdfToImage, MAX_PDF_PAGES, type RenderedPdf } from './pdf-to-image';

export const MAX_PDF_BYTES = 1.5 * 1024 * 1024;
/** Above `MAX_PDF_BYTES` an identity PDF is turned into a picture; this is the cap for that. */
export const MAX_ID_PDF_BYTES = 10 * 1024 * 1024;

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

export interface PreparedIdPdf {
  base64: string;
  mimeType: 'application/pdf' | 'image/jpeg';
  sizeAfter: number;
  /** Data URL of the picture when the PDF was converted, otherwise empty. */
  dataUrl: string;
  /** File name to store: the original, or `<name>.jpg` after conversion. */
  fileName: string;
  converted: boolean;
  /** Something the customer should know, e.g. only the first pages were used. */
  notice: string | null;
}

export interface IdPdfContext {
  docType?: string;
  step?: string;
  serviceSlug?: string | null;
  orderRef?: string | null;
}

interface IdPdfDeps {
  render: (file: File) => Promise<RenderedPdf>;
  report: typeof reportClientError;
}

const defaultIdPdfDeps: IdPdfDeps = { render: renderPdfToImage, report: reportClientError };

/**
 * An identity document (ID card, passport, licence) sent as PDF.
 *
 * Up to `MAX_PDF_BYTES` the PDF goes as it is, exactly as before. A larger one
 * (up to `MAX_ID_PDF_BYTES`) is rendered to a JPEG in the browser, so the
 * customer is not sent away to take a photo. Not for documents where the PDF
 * itself is the proof (RO CEI Reader): those keep `readPdfForUpload`.
 */
export async function prepareIdPdfForUpload(
  file: File,
  ctx: IdPdfContext = {},
  deps: IdPdfDeps = defaultIdPdfDeps
): Promise<PreparedIdPdf> {
  if (file.size <= MAX_PDF_BYTES) {
    const pdf = await readPdfForUpload(file);
    return { ...pdf, dataUrl: '', fileName: file.name, converted: false, notice: null };
  }
  if (file.size > MAX_ID_PDF_BYTES) {
    throw new Error('PDF-ul este prea mare (limita este 10 MB). Încarcă o poză a actului.');
  }
  if (!(await looksLikePdf(file))) {
    throw new Error('Fișierul nu poate fi citit ca PDF. Încarcă o poză a actului.');
  }

  let image: RenderedPdf;
  try {
    image = await deps.render(file);
  } catch (error) {
    const code = error instanceof PdfRenderError ? error.code : 'UNREADABLE';
    const message =
      error instanceof PdfRenderError ? error.message : 'PDF-ul nu a putut fi procesat. Încarcă o poză a actului.';
    deps.report({
      kind: 'image_decode',
      code: `PDF_${code}`,
      message,
      step: ctx.step,
      serviceSlug: ctx.serviceSlug ?? undefined,
      orderRef: ctx.orderRef ?? undefined,
      meta: {
        mime: 'application/pdf',
        sizeBucket: sizeBucket(file.size),
        ...(ctx.docType ? { docType: ctx.docType } : {}),
      },
    });
    throw new IdPdfError(message);
  }

  return {
    base64: image.base64,
    mimeType: image.mimeType,
    sizeAfter: image.sizeAfter,
    dataUrl: image.dataUrl,
    fileName: `${file.name.replace(/\.[^/.]+$/, '') || 'document'}.jpg`,
    converted: true,
    notice:
      image.pageCount > image.pagesUsed
        ? `PDF-ul are ${image.pageCount} pagini. Am folosit primele ${MAX_PDF_PAGES}. Dacă actul este pe altă pagină, încarcă o poză a lui.`
        : null,
  };
}

/** Already reported to the client error log; callers must not report it again. */
export class IdPdfError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IdPdfError';
  }
}
